import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { listAdvisors } from "@/lib/repositories/advisors";

export async function GET(req: Request) {
  return withErrorHandling(async () => {
    await requireUser();
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get("specialty") ?? undefined;
    const county = searchParams.get("county") ?? undefined;
    const advisors = await listAdvisors({ specialty, county });
    return NextResponse.json({ advisors });
  });
}
