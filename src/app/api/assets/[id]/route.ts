import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { assetInputSchema } from "@/lib/validation";
import {
  getAssetForUser,
  updateAssetForUser,
  archiveAssetForUser,
} from "@/lib/repositories/assets";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const asset = await getAssetForUser(id, user.id);
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    return NextResponse.json({ asset });
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const input = assetInputSchema.parse(body);
    const asset = await updateAssetForUser(id, user.id, input);
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    return NextResponse.json({ asset });
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const ok = await archiveAssetForUser(id, user.id);
    if (!ok) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  });
}
