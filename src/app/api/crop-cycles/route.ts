import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { cropCycleInputSchema } from "@/lib/validation";
import {
  listCropCyclesForUser,
  createCropCycleForUser,
  summarizeCropCycle,
} from "@/lib/repositories/crop-cycles";

export async function GET(req: Request) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const assetId = new URL(req.url).searchParams.get("assetId") ?? undefined;
    const cycles = await listCropCyclesForUser(user.id, assetId);
    return NextResponse.json({
      cropCycles: cycles.map((cycle) => ({
        ...cycle,
        summary: summarizeCropCycle(cycle, cycle.expenses),
      })),
    });
  });
}

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json();
    const input = cropCycleInputSchema.parse(body);
    const result = await createCropCycleForUser(user.id, input);

    if ("error" in result) {
      const message =
        result.error === "asset_not_farm"
          ? "Crop cycles can only be tracked on a farm asset."
          : "That farm could not be found.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ cropCycle: result.cycle }, { status: 201 });
  });
}
