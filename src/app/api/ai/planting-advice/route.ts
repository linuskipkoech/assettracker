import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { plantingAdviceSchema } from "@/lib/validation";
import { getAnthropicClient, isAiConfigured, AI_MODEL } from "@/lib/ai/client";
import {
  resolveZoneForCounty,
  resolveCropProfile,
} from "@/lib/ai/kenya-agro-calendar";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    const user = await requireUser();

    // The AI call is paid per-request, so this is keyed by user (not IP)
    // to cap cost exposure from any single account.
    if (isRateLimited(`ai-planting-advice:${user.id}`, { windowMs: 60 * 1000, max: 15 })) {
      return NextResponse.json(
        { error: "You're sending requests too quickly. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const input = plantingAdviceSchema.parse(body);

    const zone = resolveZoneForCounty(input.county);
    const crop = resolveCropProfile(input.crop);

    const reference = {
      county: input.county,
      crop: input.crop,
      zone: zone
        ? { label: zone.label, longRains: zone.longRains, shortRains: zone.shortRains, notes: zone.notes }
        : null,
      cropProfile: crop
        ? {
            name: crop.name,
            waterNeed: crop.waterNeed,
            maturityDays: crop.maturityDays,
            recommendedForZone: zone ? crop.bestZones.includes(zone.key) : null,
            notes: crop.notes,
          }
        : null,
    };

    if (!zone && !crop) {
      return NextResponse.json({
        reference,
        advice:
          "We don't have reference data for that county or crop yet. As a general rule in Kenya: the long rains typically run March–May and the short rains October–December, but timing varies a lot by region — check the latest seasonal forecast from the Kenya Meteorological Department, or book an advisor in the app who covers your area.",
        aiConfigured: isAiConfigured(),
      });
    }

    let advice: string;
    if (isAiConfigured()) {
      const anthropic = getAnthropicClient();
      const response = await anthropic.messages.create({
        model: AI_MODEL,
        max_tokens: 500,
        system:
          "You are an agricultural assistant for Kenyan farmers. You are given structured reference data about a region's rainy seasons and a crop's water needs and maturity period. Write a short, practical planting recommendation (150-220 words) using ONLY the facts given — do not invent rainfall dates or statistics not in the data. Mention both rainy seasons if relevant, note irrigation if the crop has high water needs and the user has none, and end by recommending they confirm timing against the current season's forecast or a local advisor for site-specific advice. No markdown headers, plain prose and at most one short bullet list.",
        messages: [
          {
            role: "user",
            content: `Reference data (JSON):\n${JSON.stringify(reference, null, 2)}\n\nUser context: farm size ${input.sizeAcres ?? "not specified"} acres, soil type ${input.soilType || "not specified"}, has irrigation: ${input.irrigation ? "yes" : "no"}.`,
          },
        ],
      });
      advice =
        response.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim() || fallbackAdvice(reference, input.irrigation);
    } else {
      advice = fallbackAdvice(reference, input.irrigation);
    }

    return NextResponse.json({ reference, advice, aiConfigured: isAiConfigured() });
  });
}

function fallbackAdvice(
  reference: {
    zone: { label: string; longRains: string; shortRains: string } | null;
    cropProfile: { name: string; waterNeed: string; maturityDays: string } | null;
  },
  hasIrrigation?: boolean,
): string {
  const parts: string[] = [];
  if (reference.zone) {
    parts.push(
      `In ${reference.zone.label}, the long rains typically run ${reference.zone.longRains} and the short rains ${reference.zone.shortRains}.`,
    );
  }
  if (reference.cropProfile) {
    parts.push(
      `${reference.cropProfile.name} has ${reference.cropProfile.waterNeed} water needs and typically matures in ${reference.cropProfile.maturityDays}.`,
    );
    if (reference.cropProfile.waterNeed === "high" && !hasIrrigation) {
      parts.push(
        "Since this crop needs a lot of water and you don't have irrigation, plant right at the start of the heavier rainy season rather than the shorter one.",
      );
    }
  }
  parts.push(
    "This is general guidance — confirm against the current season's forecast (Kenya Meteorological Department) or a local advisor before planting.",
  );
  return parts.join(" ");
}
