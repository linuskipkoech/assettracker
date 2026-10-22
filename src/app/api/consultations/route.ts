import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { consultationRequestSchema } from "@/lib/validation";
import {
  createConsultationRequest,
  listConsultationsForRequester,
} from "@/lib/repositories/advisors";
import { isRateLimited } from "@/lib/rate-limit";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const consultations = await listConsultationsForRequester(user.id);
    return NextResponse.json({ consultations });
  });
}

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    const user = await requireUser();

    // Prevents a single account from spamming advisors with requests.
    if (isRateLimited(`consultation-request:${user.id}`, { windowMs: 10 * 60 * 1000, max: 20 })) {
      return NextResponse.json(
        { error: "You're sending requests too quickly. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const input = consultationRequestSchema.parse(body);
    const consultation = await createConsultationRequest(user.id, input);
    return NextResponse.json({ consultation }, { status: 201 });
  });
}
