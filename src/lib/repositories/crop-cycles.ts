import { db } from "@/db";
import { cropCycles, cropExpenses, liabilities, assets } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import type {
  cropCycleInputSchema,
  cropCycleUpdateSchema,
  cropExpenseInputSchema,
} from "@/lib/validation";

type CropCycleInput = z.infer<typeof cropCycleInputSchema>;
type CropCycleUpdate = z.infer<typeof cropCycleUpdateSchema>;
type CropExpenseInput = z.infer<typeof cropExpenseInputSchema>;

export type CropCycleRow = typeof cropCycles.$inferSelect;
export type CropExpenseRow = typeof cropExpenses.$inferSelect;
export type CropCycleWithExpenses = CropCycleRow & { expenses: CropExpenseRow[] };

// ---------------------------------------------------------------------------
// Pure summaries — the numbers a farmer actually wants from a season.
// Kept free of any DB access so they can be unit-tested directly.
// ---------------------------------------------------------------------------

export interface CropCycleSummary {
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  expenseCount: number;
  /** Money still owed for this cycle's on-credit expenses is NOT included
   *  here — that's the liabilities view. This is season cost, once. */
  costPerAcre: number | null;
  saleRevenue: number;
  /** saleRevenue - totalExpenses. Negative while a crop is still growing
   *  and nothing has been sold — callers should present it as profit only
   *  once revenue exists; see `hasRevenue`. */
  grossProfit: number;
  profitPerAcre: number | null;
  hasRevenue: boolean;
}

export function summarizeCropCycle(
  cycle: Pick<CropCycleRow, "acreage" | "saleRevenue">,
  expenses: Pick<CropExpenseRow, "category" | "amount">[],
): CropCycleSummary {
  let totalExpenses = 0;
  const expensesByCategory: Record<string, number> = {};
  for (const e of expenses) {
    totalExpenses += e.amount;
    expensesByCategory[e.category] = (expensesByCategory[e.category] ?? 0) + e.amount;
  }
  const saleRevenue = cycle.saleRevenue ?? 0;
  const acreage = cycle.acreage && cycle.acreage > 0 ? cycle.acreage : null;
  return {
    totalExpenses,
    expensesByCategory,
    expenseCount: expenses.length,
    costPerAcre: acreage ? totalExpenses / acreage : null,
    saleRevenue,
    grossProfit: saleRevenue - totalExpenses,
    profitPerAcre: acreage ? (saleRevenue - totalExpenses) / acreage : null,
    hasRevenue: (cycle.saleRevenue ?? 0) > 0,
  };
}

// ---------------------------------------------------------------------------
// Queries — every one is ownership-scoped to userId, like the rest of the
// app. A cycle additionally belongs to a FARM asset the user owns.
// ---------------------------------------------------------------------------

async function getOwnedFarmAsset(assetId: string, userId: string) {
  const asset = await db.query.assets.findFirst({
    where: and(eq(assets.id, assetId), eq(assets.userId, userId)),
  });
  if (!asset) return { error: "asset_not_found" as const };
  if (asset.type !== "FARM") return { error: "asset_not_farm" as const };
  return { asset };
}

async function getCycleForUser(id: string, userId: string) {
  return db.query.cropCycles.findFirst({
    where: and(eq(cropCycles.id, id), eq(cropCycles.userId, userId)),
  });
}

async function listExpensesForCycle(cycleId: string, userId: string) {
  return db
    .select()
    .from(cropExpenses)
    .where(and(eq(cropExpenses.cycleId, cycleId), eq(cropExpenses.userId, userId)))
    .orderBy(asc(cropExpenses.expenseDate), asc(cropExpenses.createdAt));
}

export async function listCropCyclesForUser(
  userId: string,
  assetId?: string,
): Promise<CropCycleWithExpenses[]> {
  const rows = await db
    .select()
    .from(cropCycles)
    .where(
      assetId
        ? and(eq(cropCycles.userId, userId), eq(cropCycles.assetId, assetId))
        : eq(cropCycles.userId, userId),
    )
    .orderBy(desc(cropCycles.createdAt));

  const withExpenses: CropCycleWithExpenses[] = [];
  for (const cycle of rows) {
    withExpenses.push({ ...cycle, expenses: await listExpensesForCycle(cycle.id, userId) });
  }
  return withExpenses;
}

export async function getCropCycleForUser(
  id: string,
  userId: string,
): Promise<CropCycleWithExpenses | null> {
  const cycle = await getCycleForUser(id, userId);
  if (!cycle) return null;
  return { ...cycle, expenses: await listExpensesForCycle(cycle.id, userId) };
}

export async function createCropCycleForUser(
  userId: string,
  input: CropCycleInput,
): Promise<
  | { cycle: CropCycleWithExpenses }
  | { error: "asset_not_found" | "asset_not_farm" }
> {
  const check = await getOwnedFarmAsset(input.assetId, userId);
  if ("error" in check && check.error) return { error: check.error };

  const [cycle] = await db
    .insert(cropCycles)
    .values({
      userId,
      assetId: input.assetId,
      name: input.name,
      crop: input.crop,
      status: input.status,
      acreage: input.acreage ?? null,
      plantingDate: input.plantingDate ?? null,
      expectedHarvestDate: input.expectedHarvestDate ?? null,
      harvestedDate: input.harvestedDate ?? null,
      harvestQuantity: input.harvestQuantity ?? null,
      harvestUnit: input.harvestUnit || null,
      saleRevenue: input.saleRevenue ?? null,
      notes: input.notes || null,
    })
    .returning();

  return { cycle: { ...cycle, expenses: [] as CropExpenseRow[] } };
}

export async function updateCropCycleForUser(id: string, userId: string, input: CropCycleUpdate) {
  const existing = await getCycleForUser(id, userId);
  if (!existing) return { error: "not_found" as const };

  const [updated] = await db
    .update(cropCycles)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.crop !== undefined ? { crop: input.crop } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.acreage !== undefined ? { acreage: input.acreage } : {}),
      ...(input.plantingDate !== undefined ? { plantingDate: input.plantingDate } : {}),
      ...(input.expectedHarvestDate !== undefined
        ? { expectedHarvestDate: input.expectedHarvestDate }
        : {}),
      ...(input.harvestedDate !== undefined ? { harvestedDate: input.harvestedDate } : {}),
      ...(input.harvestQuantity !== undefined ? { harvestQuantity: input.harvestQuantity } : {}),
      ...(input.harvestUnit !== undefined ? { harvestUnit: input.harvestUnit || null } : {}),
      ...(input.saleRevenue !== undefined ? { saleRevenue: input.saleRevenue } : {}),
      ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(cropCycles.id, id))
    .returning();

  return { cycle: { ...updated, expenses: await listExpensesForCycle(id, userId) } };
}

export async function deleteCropCycleForUser(id: string, userId: string) {
  const existing = await getCycleForUser(id, userId);
  if (!existing) return false;
  await db.delete(cropCycles).where(eq(cropCycles.id, id));
  return true;
}

export async function addCropExpenseForUser(
  cycleId: string,
  userId: string,
  input: CropExpenseInput,
) {
  const cycle = await getCycleForUser(cycleId, userId);
  if (!cycle) return { error: "not_found" as const };

  let liabilityId: string | null = null;
  if (input.onCredit) {
    // The same shilling, seen from the other side: the season records the
    // cost, and the farm carries the debt until it's settled. Net worth
    // only ever subtracts the liability — the expense itself is a
    // crop-profit figure, never a second deduction.
    const [liability] = await db
      .insert(liabilities)
      .values({
        userId,
        assetId: cycle.assetId,
        name: input.description,
        type: "OTHER",
        frequency: "ONE_TIME",
        amount: input.amount,
        currency: "KES",
        outstandingBalance: input.amount,
        nextDueDate: input.creditDueDate ?? cycle.expectedHarvestDate ?? null,
        notes: `Crop cycle: ${cycle.name} (bought on credit)`,
        status: "ACTIVE",
      })
      .returning();
    liabilityId = liability.id;
  }

  const [expense] = await db
    .insert(cropExpenses)
    .values({
      userId,
      cycleId,
      category: input.category,
      description: input.description,
      amount: input.amount,
      expenseDate: input.expenseDate ?? new Date(),
      liabilityId,
    })
    .returning();

  return { expense };
}

export async function deleteCropExpenseForUser(
  cycleId: string,
  expenseId: string,
  userId: string,
) {
  const cycle = await getCycleForUser(cycleId, userId);
  if (!cycle) return false;
  const existing = await db.query.cropExpenses.findFirst({
    where: and(
      eq(cropExpenses.id, expenseId),
      eq(cropExpenses.cycleId, cycleId),
      eq(cropExpenses.userId, userId),
    ),
  });
  if (!existing) return false;
  await db.delete(cropExpenses).where(eq(cropExpenses.id, expenseId));
  return true;
}
