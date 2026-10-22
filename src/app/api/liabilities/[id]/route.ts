import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { liabilityInputSchema } from "@/lib/validation";
import { updateLiabilityForUser, deleteLiabilityForUser } from "@/lib/repositories/liabilities";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const input = liabilityInputSchema.parse(body);
    const result = await updateLiabilityForUser(id, user.id, input);

    if ("error" in result) {
      const message = result.error === "not_found" ? "Liability not found" : "That asset could not be found.";
      return NextResponse.json({ error: message }, { status: result.error === "not_found" ? 404 : 400 });
    }
    return NextResponse.json({ liability: result.liability });
  });
}

export async function DELETE(req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const deleted = await deleteLiabilityForUser(id, user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Liability not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  });
}
