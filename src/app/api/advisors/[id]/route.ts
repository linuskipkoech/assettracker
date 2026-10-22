import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { getAdvisorById } from "@/lib/repositories/advisors";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    await requireUser();
    const { id } = await params;
    const advisor = await getAdvisorById(id);
    if (!advisor) {
      return NextResponse.json({ error: "Advisor not found" }, { status: 404 });
    }
    return NextResponse.json({ advisor });
  });
}
