import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { activitySettingsSchema } from "@/lib/validation";
import { getActivitySettings, updateActivitySettings, listRecentEvents } from "@/lib/repositories/escalation";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const settings = await getActivitySettings(user.id);
    const events = await listRecentEvents(user.id);
    return NextResponse.json({ settings, events });
  });
}

export async function PATCH(req: Request) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json();
    const input = activitySettingsSchema.parse(body);
    await updateActivitySettings(user.id, input);
    return NextResponse.json({ ok: true });
  });
}
