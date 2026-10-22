import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { reorderBeneficiaryForUser } from "@/lib/repositories/beneficiaries";

type Params = { params: Promise<{ id: string }> };

const reorderSchema = z.object({ direction: z.enum(["up", "down"]) });

export async function POST(req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const { direction } = reorderSchema.parse(await req.json());
    const moved = await reorderBeneficiaryForUser(id, user.id, direction);
    if (!moved) {
      return NextResponse.json({ error: "Could not reorder (already at the edge, or not found)." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  });
}
