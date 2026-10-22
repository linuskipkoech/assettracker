import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { consultationStatusUpdateSchema } from "@/lib/validation";
import { updateConsultationStatus } from "@/lib/repositories/advisors";

type Params = { params: Promise<{ id: string }> };

// Only the advisor assigned to a consultation request can update its status
// (accept / decline / mark complete). Ownership is enforced inside
// updateConsultationStatus, which scopes the lookup to the caller's own
// advisor profile.
export async function PATCH(req: Request, { params }: Params) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const input = consultationStatusUpdateSchema.parse(body);
    const consultation = await updateConsultationStatus(
      id,
      user.id,
      input.status,
      input.advisorNote,
    );
    if (!consultation) {
      return NextResponse.json(
        { error: "Consultation not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ consultation });
  });
}
