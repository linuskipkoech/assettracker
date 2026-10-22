import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { advisorProfileSchema } from "@/lib/validation";
import {
  getAdvisorProfileForUser,
  upsertAdvisorProfile,
  listConsultationsForAdvisor,
} from "@/lib/repositories/advisors";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const profile = await getAdvisorProfileForUser(user.id);
    const consultations = profile ? await listConsultationsForAdvisor(user.id) : [];
    return NextResponse.json({ profile, consultations });
  });
}

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json();
    const input = advisorProfileSchema.parse(body);
    const profile = await upsertAdvisorProfile(user.id, input);
    return NextResponse.json({ profile }, { status: 201 });
  });
}
