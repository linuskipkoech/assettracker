import { db } from "@/db";
import { users, checkinTokens, escalationEvents } from "@/db/schema";
import { eq, and, lt, desc } from "drizzle-orm";
import type { z } from "zod";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendEmail } from "@/lib/email/client";
import { checkinRequestEmail, beneficiaryNotificationEmail } from "@/lib/email/templates";
import { getAppUrl } from "@/lib/app-url";
import { listBeneficiariesForUser, type BeneficiaryWithHeirs, type BeneficiaryRow } from "./beneficiaries";
import { firstInChain, nextInChain } from "@/lib/escalation/chain";
import type { activitySettingsSchema } from "@/lib/validation";
import type { EscalationStatus } from "@/lib/constants";

type ActivitySettingsInput = z.infer<typeof activitySettingsSchema>;

const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Settings & status
// ---------------------------------------------------------------------------

export async function getActivitySettings(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return null;
  return {
    inactivityThresholdDays: user.inactivityThresholdDays,
    checkinGraceDays: user.checkinGraceDays,
    beneficiaryGraceDays: user.beneficiaryGraceDays,
    escalationStatus: user.escalationStatus as EscalationStatus,
    escalationDeadlineAt: user.escalationDeadlineAt,
    currentBeneficiaryId: user.currentBeneficiaryId,
    lastLoginAt: user.lastLoginAt,
  };
}

export async function updateActivitySettings(userId: string, input: ActivitySettingsInput) {
  await db
    .update(users)
    .set({
      inactivityThresholdDays: input.inactivityThresholdDays,
      checkinGraceDays: input.checkinGraceDays,
      beneficiaryGraceDays: input.beneficiaryGraceDays,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

/** Call on every successful login. Resets any in-progress escalation, since a login proves the user is fine. */
export async function recordLogin(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return;

  const wasEscalating = user.escalationStatus !== "ACTIVE";

  await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
      escalationStatus: "ACTIVE",
      escalationDeadlineAt: null,
      currentBeneficiaryId: null,
    })
    .where(eq(users.id, userId));

  if (wasEscalating) {
    await logEvent(userId, null, "RESOLVED_BY_LOGIN");
  }
}

export async function listRecentEvents(userId: string, limit = 20) {
  return db
    .select()
    .from(escalationEvents)
    .where(eq(escalationEvents.userId, userId))
    .orderBy(desc(escalationEvents.createdAt))
    .limit(limit);
}

async function logEvent(userId: string, beneficiaryId: string | null, type: string, message?: string) {
  await db.insert(escalationEvents).values({ userId, beneficiaryId, type, message: message || null });
}

// ---------------------------------------------------------------------------
// Token confirmation (public, unauthenticated — the token IS the auth)
// ---------------------------------------------------------------------------

export async function confirmUserCheckinToken(rawToken: string) {
  const row = await db.query.checkinTokens.findFirst({
    where: and(eq(checkinTokens.tokenHash, hashToken(rawToken)), eq(checkinTokens.purpose, "USER_CHECKIN")),
  });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return { ok: false as const };
  }

  await db.update(checkinTokens).set({ usedAt: new Date() }).where(eq(checkinTokens.id, row.id));
  await db
    .update(users)
    .set({ escalationStatus: "ACTIVE", lastLoginAt: new Date(), escalationDeadlineAt: null, currentBeneficiaryId: null })
    .where(eq(users.id, row.userId));
  await logEvent(row.userId, null, "CHECKIN_CONFIRMED");

  return { ok: true as const };
}

export async function confirmBeneficiaryAckToken(rawToken: string) {
  const row = await db.query.checkinTokens.findFirst({
    where: and(eq(checkinTokens.tokenHash, hashToken(rawToken)), eq(checkinTokens.purpose, "BENEFICIARY_ACK")),
  });
  if (!row || row.usedAt || row.expiresAt < new Date() || !row.beneficiaryId) {
    return { ok: false as const };
  }

  await db.update(checkinTokens).set({ usedAt: new Date() }).where(eq(checkinTokens.id, row.id));
  await db
    .update(users)
    .set({ escalationStatus: "ESCALATION_RESOLVED", escalationDeadlineAt: null })
    .where(eq(users.id, row.userId));
  await logEvent(row.userId, row.beneficiaryId, "BENEFICIARY_CONFIRMED");

  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// The inactivity-check engine. Meant to be called periodically (e.g. once a
// day) by an external scheduler hitting POST /api/cron/check-inactivity —
// see that route and README.md for how to set that up. Safe to call more
// often than needed; it only acts on users whose deadline has actually passed.
// ---------------------------------------------------------------------------

function findInTree(tree: BeneficiaryWithHeirs[], id: string): BeneficiaryRow | null {
  for (const b of tree) {
    if (b.id === id) return b;
    const heir = b.heirs.find((h) => h.id === id);
    if (heir) return heir;
  }
  return null;
}

async function issueToken(
  userId: string,
  beneficiaryId: string | null,
  purpose: "USER_CHECKIN" | "BENEFICIARY_ACK",
  expiresAt: Date,
) {
  const { token, hash } = generateToken();
  await db.insert(checkinTokens).values({ userId, beneficiaryId, purpose, tokenHash: hash, expiresAt });
  return token;
}

async function notifyNextContact(
  userId: string,
  userName: string,
  tree: BeneficiaryWithHeirs[],
  contactId: string,
  beneficiaryGraceDays: number,
  eventType: "BENEFICIARY_NOTIFIED" | "ESCALATED_TO_NEXT",
) {
  const contact = findInTree(tree, contactId);
  if (!contact) return false;

  const deadline = new Date(Date.now() + beneficiaryGraceDays * DAY_MS);
  const token = await issueToken(userId, contactId, "BENEFICIARY_ACK", deadline);
  const ackUrl = `${getAppUrl()}/beneficiary/confirm?token=${token}`;
  const email = beneficiaryNotificationEmail({ userName, contactName: contact.name, confirmUrl: ackUrl, deadline });
  await sendEmail({ to: contact.email, ...email });

  await db
    .update(users)
    .set({ escalationStatus: "ESCALATING", currentBeneficiaryId: contactId, escalationDeadlineAt: deadline })
    .where(eq(users.id, userId));
  await logEvent(userId, contactId, eventType);
  return true;
}

export interface InactivityCheckSummary {
  checkinsSent: number;
  escalated: number;
  exhausted: number;
}

export async function runInactivityCheck(): Promise<InactivityCheckSummary> {
  const summary: InactivityCheckSummary = { checkinsSent: 0, escalated: 0, exhausted: 0 };
  const now = new Date();

  // --- Step 1: ACTIVE users who have gone quiet for too long ---------------
  const activeUsers = await db.select().from(users).where(eq(users.escalationStatus, "ACTIVE"));
  for (const user of activeUsers) {
    const lastActive = user.lastLoginAt ?? user.createdAt;
    const thresholdMs = user.inactivityThresholdDays * DAY_MS;
    if (now.getTime() - lastActive.getTime() < thresholdMs) continue;

    const deadline = new Date(now.getTime() + user.checkinGraceDays * DAY_MS);
    const token = await issueToken(user.id, null, "USER_CHECKIN", deadline);
    const confirmUrl = `${getAppUrl()}/checkin/confirm?token=${token}`;
    const email = checkinRequestEmail({ userName: user.name, confirmUrl, deadline });
    await sendEmail({ to: user.email, ...email });

    await db
      .update(users)
      .set({ escalationStatus: "AWAITING_CHECKIN", escalationDeadlineAt: deadline })
      .where(eq(users.id, user.id));
    await logEvent(user.id, null, "CHECKIN_EMAIL_SENT");
    summary.checkinsSent += 1;
  }

  // --- Step 2: users who didn't confirm in time — start the beneficiary chain
  const awaitingCheckin = await db
    .select()
    .from(users)
    .where(and(eq(users.escalationStatus, "AWAITING_CHECKIN"), lt(users.escalationDeadlineAt, now)));
  for (const user of awaitingCheckin) {
    const tree = await listBeneficiariesForUser(user.id);
    const firstId = firstInChain(tree);
    if (!firstId) {
      await db
        .update(users)
        .set({ escalationStatus: "EXHAUSTED", escalationDeadlineAt: null })
        .where(eq(users.id, user.id));
      await logEvent(user.id, null, "ESCALATION_EXHAUSTED", "No beneficiaries configured.");
      summary.exhausted += 1;
      continue;
    }
    const ok = await notifyNextContact(
      user.id,
      user.name,
      tree,
      firstId,
      user.beneficiaryGraceDays,
      "BENEFICIARY_NOTIFIED",
    );
    if (ok) summary.escalated += 1;
  }

  // --- Step 3: current contact didn't ack in time — move to the next one ---
  const escalating = await db
    .select()
    .from(users)
    .where(and(eq(users.escalationStatus, "ESCALATING"), lt(users.escalationDeadlineAt, now)));
  for (const user of escalating) {
    const tree = await listBeneficiariesForUser(user.id);
    const nextId = user.currentBeneficiaryId ? nextInChain(tree, user.currentBeneficiaryId) : firstInChain(tree);
    if (!nextId) {
      await db
        .update(users)
        .set({ escalationStatus: "EXHAUSTED", escalationDeadlineAt: null, currentBeneficiaryId: null })
        .where(eq(users.id, user.id));
      await logEvent(user.id, user.currentBeneficiaryId, "ESCALATION_EXHAUSTED");
      summary.exhausted += 1;
      continue;
    }
    const ok = await notifyNextContact(
      user.id,
      user.name,
      tree,
      nextId,
      user.beneficiaryGraceDays,
      "ESCALATED_TO_NEXT",
    );
    if (ok) summary.escalated += 1;
  }

  return summary;
}
