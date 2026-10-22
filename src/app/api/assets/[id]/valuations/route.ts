import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { valuationEntrySchema } from "@/lib/validation";
import { addValuationEntry } from "@/lib/repositories/assets";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const input = valuationEntrySchema.parse(body);
    const entry = await addValuationEntry(id, user.id, input.value, input.note);
    if (!entry) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    return NextResponse.json({ entry }, { status: 201 });
  });
}
