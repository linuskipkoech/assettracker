import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { cropCycleUpdateSchema } from "@/lib/validation";
import {
  getCropCycleForUser,
  updateCropCycleForUser,
  deleteCropCycleForUser,
  summarizeCropCycle,
} from "@/lib/repositories/crop-cycles";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const cycle = await getCropCycleForUser(id, user.id);
    if (!cycle) {
      return NextResponse.json({ error: "Crop cycle not found" }, { status: 404 });
    }
    return NextResponse.json({
      cropCycle: { ...cycle, summary: summarizeCropCycle(cycle, cycle.expenses) },
    });
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const input = cropCycleUpdateSchema.parse(body);
    const result = await updateCropCycleForUser(id, user.id, input);

    if ("error" in result) {
      return NextResponse.json({ error: "Crop cycle not found" }, { status: 404 });
    }
    return NextResponse.json({
      cropCycle: {
        ...result.cycle,
        summary: summarizeCropCycle(result.cycle, result.cycle.expenses),
      },
    });
  });
}

export async function DELETE(req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const deleted = await deleteCropCycleForUser(id, user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Crop cycle not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  });
}
