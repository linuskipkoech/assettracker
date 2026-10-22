import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { deleteCropExpenseForUser } from "@/lib/repositories/crop-cycles";

type Params = { params: Promise<{ id: string; expenseId: string }> };

export async function DELETE(req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id, expenseId } = await params;
    const deleted = await deleteCropExpenseForUser(id, expenseId, user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  });
}
