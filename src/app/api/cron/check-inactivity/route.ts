import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { runInactivityCheck } from "@/lib/repositories/escalation";
import { isRateLimited, clientKey } from "@/lib/rate-limit";

/**
 * Runs the inactivity-check engine once. Meant to be called periodically by
 * an external scheduler (cron, Vercel Cron, a GitHub Actions schedule, …) —
 * see README.md for setup examples. Safe to call more often than needed;
 * it only acts on accounts whose deadline has actually passed.
 *
 * Protected by a shared secret rather than a user session, since the
 * caller is a scheduler, not a logged-in user. Set CRON_SECRET in .env and
 * send it as `Authorization: Bearer <CRON_SECRET>`.
 */
export async function POST(req: Request) {
  return withErrorHandling(async () => {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "CRON_SECRET is not configured on the server. Add it to .env to enable this endpoint." },
        { status: 503 },
      );
    }

    // Slows down guessing attempts against the secret itself.
    if (isRateLimited(`cron-auth:${clientKey(req)}`, { windowMs: 60 * 1000, max: 10 })) {
      return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
    }

    const authHeader = req.headers.get("authorization") || "";
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await runInactivityCheck();
    return NextResponse.json({ ok: true, ...summary });
  });
}
