import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { cropExpenseInputSchema } from "@/lib/validation";
import { addCropExpenseForUser } from "@/lib/repositories/crop-cycles";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const input = cropExpenseInputSchema.parse(body);
    const result = await addCropExpenseForUser(id, user.id, input);

    if ("error" in result) {
      return NextResponse.json({ error: "Crop cycle not found" }, { status: 404 });
    }
    return NextResponse.json({ expense: result.expense }, { status: 201 });
  });
}
