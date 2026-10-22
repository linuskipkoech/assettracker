import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { assetInputSchema } from "@/lib/validation";
import { listAssetsForUser, createAssetForUser } from "@/lib/repositories/assets";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const assets = await listAssetsForUser(user.id);
    return NextResponse.json({ assets });
  });
}

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json();
    const input = assetInputSchema.parse(body);
    const asset = await createAssetForUser(user.id, input);
    return NextResponse.json({ asset }, { status: 201 });
  });
}
