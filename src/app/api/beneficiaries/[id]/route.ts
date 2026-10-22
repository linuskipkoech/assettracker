import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { beneficiaryInputSchema } from "@/lib/validation";
import { updateBeneficiaryForUser, deleteBeneficiaryForUser } from "@/lib/repositories/beneficiaries";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const input = beneficiaryInputSchema.parse(body);
    const beneficiary = await updateBeneficiaryForUser(id, user.id, input);
    if (!beneficiary) {
      return NextResponse.json({ error: "Beneficiary not found" }, { status: 404 });
    }
    return NextResponse.json({ beneficiary });
  });
}

export async function DELETE(req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const deleted = await deleteBeneficiaryForUser(id, user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Beneficiary not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  });
}
