import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { beneficiaryInputSchema } from "@/lib/validation";
import { listBeneficiariesForUser, createBeneficiaryForUser } from "@/lib/repositories/beneficiaries";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const beneficiaries = await listBeneficiariesForUser(user.id);
    return NextResponse.json({ beneficiaries });
  });
}

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json();
    const input = beneficiaryInputSchema.parse(body);
    const result = await createBeneficiaryForUser(user.id, input);

    if ("error" in result) {
      const message =
        result.error === "too_deep"
          ? "An heir can't have their own heirs — add them as a top-level beneficiary instead."
          : "That beneficiary could not be found.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ beneficiary: result.beneficiary }, { status: 201 });
  });
}
