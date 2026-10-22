import { db } from "@/db";
import { liabilities, assets } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import type { liabilityInputSchema } from "@/lib/validation";
import { LIABILITY_FREQUENCY_MONTHLY_FACTOR, type LiabilityFrequency } from "@/lib/constants";

type LiabilityInput = z.infer<typeof liabilityInputSchema>;
export type LiabilityRow = typeof liabilities.$inferSelect;

async function assertAssetOwnership(assetId: string, userId: string) {
  const asset = await db.query.assets.findFirst({
    where: and(eq(assets.id, assetId), eq(assets.userId, userId)),
  });
  return Boolean(asset);
}

export async function listLiabilitiesForUser(userId: string): Promise<LiabilityRow[]> {
  return db
    .select()
    .from(liabilities)
    .where(eq(liabilities.userId, userId))
    .orderBy(desc(liabilities.updatedAt));
}

export async function listLiabilitiesForAsset(assetId: string, userId: string): Promise<LiabilityRow[]> {
  return db
    .select()
    .from(liabilities)
    .where(and(eq(liabilities.userId, userId), eq(liabilities.assetId, assetId)))
    .orderBy(desc(liabilities.updatedAt));
}

async function getLiabilityForUser(id: string, userId: string) {
  return db.query.liabilities.findFirst({
    where: and(eq(liabilities.id, id), eq(liabilities.userId, userId)),
  });
}

export async function createLiabilityForUser(userId: string, input: LiabilityInput) {
  if (input.assetId) {
    const owns = await assertAssetOwnership(input.assetId, userId);
    if (!owns) return { error: "asset_not_found" as const };
  }

  const [row] = await db
    .insert(liabilities)
    .values({
      userId,
      assetId: input.assetId || null,
      name: input.name,
      type: input.type,
      frequency: input.frequency,
      amount: input.amount,
      currency: input.currency || "KES",
      outstandingBalance: input.outstandingBalance ?? null,
      interestRatePercent: input.interestRatePercent ?? null,
      startDate: input.startDate ?? null,
      nextDueDate: input.nextDueDate ?? null,
      notes: input.notes || null,
      status: input.status,
    })
    .returning();

  return { liability: row };
}

export async function updateLiabilityForUser(id: string, userId: string, input: LiabilityInput) {
  const existing = await getLiabilityForUser(id, userId);
  if (!existing) return { error: "not_found" as const };

  if (input.assetId) {
    const owns = await assertAssetOwnership(input.assetId, userId);
    if (!owns) return { error: "asset_not_found" as const };
  }

  const [updated] = await db
    .update(liabilities)
    .set({
      assetId: input.assetId || null,
      name: input.name,
      type: input.type,
      frequency: input.frequency,
      amount: input.amount,
      currency: input.currency || "KES",
      outstandingBalance: input.outstandingBalance ?? null,
      interestRatePercent: input.interestRatePercent ?? null,
      startDate: input.startDate ?? null,
      nextDueDate: input.nextDueDate ?? null,
      notes: input.notes || null,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(liabilities.id, id))
    .returning();

  return { liability: updated };
}

export async function deleteLiabilityForUser(id: string, userId: string) {
  const existing = await getLiabilityForUser(id, userId);
  if (!existing) return false;
  await db.delete(liabilities).where(eq(liabilities.id, id));
  return true;
}

export interface LiabilitiesSummary {
  totalOutstandingBalance: number;
  totalMonthlyOutgoings: number;
  activeCount: number;
}

/** Only ACTIVE liabilities count toward the running totals — paid-off/cancelled ones are kept for history but don't affect them. */
export function summarizeLiabilities(rows: LiabilityRow[]): LiabilitiesSummary {
  let totalOutstandingBalance = 0;
  let totalMonthlyOutgoings = 0;
  let activeCount = 0;

  for (const row of rows) {
    if (row.status !== "ACTIVE") continue;
    activeCount += 1;
    totalOutstandingBalance += row.outstandingBalance ?? 0;
    const factor = LIABILITY_FREQUENCY_MONTHLY_FACTOR[row.frequency as LiabilityFrequency] ?? 0;
    totalMonthlyOutgoings += row.amount * factor;
  }

  return { totalOutstandingBalance, totalMonthlyOutgoings, activeCount };
}
