import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { liabilityInputSchema } from "@/lib/validation";
import {
  listLiabilitiesForUser,
  listLiabilitiesForAsset,
  createLiabilityForUser,
} from "@/lib/repositories/liabilities";

export async function GET(req: Request) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const assetId = new URL(req.url).searchParams.get("assetId");
    const rows = assetId
      ? await listLiabilitiesForAsset(assetId, user.id)
      : await listLiabilitiesForUser(user.id);
    return NextResponse.json({ liabilities: rows });
  });
}

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json();
    const input = liabilityInputSchema.parse(body);
    const result = await createLiabilityForUser(user.id, input);

    if ("error" in result) {
      return NextResponse.json({ error: "That asset could not be found." }, { status: 400 });
    }
    return NextResponse.json({ liability: result.liability }, { status: 201 });
  });
}
