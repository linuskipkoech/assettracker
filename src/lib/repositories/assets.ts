import { db } from "@/db";
import {
  assets,
  valuationHistory,
  farmDetails,
  livestockDetails,
  businessDetails,
  stockDetails,
  landDetails,
  propertyDetails,
} from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import type { assetInputSchema } from "@/lib/validation";
import type { AssetType } from "@/lib/constants";

type AssetInput = z.infer<typeof assetInputSchema>;

const detailsTableByType = {
  FARM: farmDetails,
  LIVESTOCK: livestockDetails,
  BUSINESS: businessDetails,
  STOCK: stockDetails,
  LAND: landDetails,
  PROPERTY: propertyDetails,
} as const;

const detailsKeyByType: Record<AssetType, keyof AssetInput | null> = {
  FARM: "farmDetails",
  LIVESTOCK: "livestockDetails",
  BUSINESS: "businessDetails",
  STOCK: "stockDetails",
  LAND: "landDetails",
  PROPERTY: "propertyDetails",
  OTHER: null,
};

/** Fetches every detail-table row for a batch of assets, keyed by assetId. */
async function loadDetailsForAssets(assetIds: string[]) {
  if (assetIds.length === 0) {
    return {} as Record<string, Record<string, unknown>>;
  }

  const result: Record<string, Record<string, unknown>> = {};
  for (const [type, table] of Object.entries(detailsTableByType)) {
    const rows = await db.select().from(table);
    for (const row of rows) {
      if (assetIds.includes(row.assetId)) {
        result[row.assetId] = { ...result[row.assetId], [type]: row };
      }
    }
  }
  return result;
}

export async function listAssetsForUser(userId: string) {
  const rows = await db
    .select()
    .from(assets)
    .where(and(eq(assets.userId, userId), eq(assets.archived, false)))
    .orderBy(desc(assets.updatedAt));

  const detailsByAsset = await loadDetailsForAssets(rows.map((r) => r.id));

  return rows.map((asset) => ({
    ...asset,
    details: detailsByAsset[asset.id] ?? {},
  }));
}

export async function getAssetForUser(assetId: string, userId: string) {
  const asset = await db.query.assets.findFirst({
    where: and(eq(assets.id, assetId), eq(assets.userId, userId)),
  });
  if (!asset) return null;

  let details: Record<string, unknown> | null = null;
  const table = detailsTableByType[asset.type as keyof typeof detailsTableByType];
  if (table) {
    const rows = await db.select().from(table).where(eq(table.assetId, assetId));
    details = rows[0] ?? null;
  }

  const history = await db
    .select()
    .from(valuationHistory)
    .where(eq(valuationHistory.assetId, assetId))
    .orderBy(desc(valuationHistory.recordedAt));

  return { ...asset, details, history };
}

export async function createAssetForUser(userId: string, input: AssetInput) {
  const [asset] = await db
    .insert(assets)
    .values({
      userId,
      type: input.type,
      name: input.name,
      description: input.description || null,
      currentValue: input.currentValue,
      currency: input.currency || "KES",
      acquisitionValue: input.acquisitionValue ?? null,
      acquisitionDate: input.acquisitionDate ?? null,
      location: input.location || null,
      county: input.county || null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    })
    .returning();

  const detailsKey = detailsKeyByType[input.type];
  if (detailsKey) {
    const table = detailsTableByType[input.type as keyof typeof detailsTableByType];
    const detailsInput = input[detailsKey] as Record<string, unknown> | undefined;
    if (table && detailsInput) {
      await db.insert(table).values({ assetId: asset.id, ...detailsInput });
    }
  }

  // Seed the valuation history with the asset's opening value.
  await db.insert(valuationHistory).values({
    assetId: asset.id,
    value: input.currentValue,
    note: "Initial value",
  });

  return asset;
}

export async function updateAssetForUser(
  assetId: string,
  userId: string,
  input: AssetInput,
) {
  const existing = await db.query.assets.findFirst({
    where: and(eq(assets.id, assetId), eq(assets.userId, userId)),
  });
  if (!existing) return null;

  const valueChanged = existing.currentValue !== input.currentValue;

  const [updated] = await db
    .update(assets)
    .set({
      name: input.name,
      description: input.description || null,
      currentValue: input.currentValue,
      currency: input.currency || "KES",
      acquisitionValue: input.acquisitionValue ?? null,
      acquisitionDate: input.acquisitionDate ?? null,
      location: input.location || null,
      county: input.county || null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      updatedAt: new Date(),
    })
    .where(eq(assets.id, assetId))
    .returning();

  const detailsKey = detailsKeyByType[existing.type as AssetType];
  if (detailsKey) {
    const table = detailsTableByType[existing.type as keyof typeof detailsTableByType];
    const detailsInput = input[detailsKey] as Record<string, unknown> | undefined;
    if (table && detailsInput) {
      const existingDetails = await db
        .select()
        .from(table)
        .where(eq(table.assetId, assetId));
      if (existingDetails.length > 0) {
        await db.update(table).set(detailsInput).where(eq(table.assetId, assetId));
      } else {
        await db.insert(table).values({ assetId, ...detailsInput });
      }
    }
  }

  if (valueChanged) {
    await db.insert(valuationHistory).values({
      assetId,
      value: input.currentValue,
      note: "Updated value",
    });
  }

  return updated;
}

export async function archiveAssetForUser(assetId: string, userId: string) {
  const existing = await db.query.assets.findFirst({
    where: and(eq(assets.id, assetId), eq(assets.userId, userId)),
  });
  if (!existing) return false;

  await db
    .update(assets)
    .set({ archived: true, updatedAt: new Date() })
    .where(eq(assets.id, assetId));
  return true;
}

export async function addValuationEntry(
  assetId: string,
  userId: string,
  value: number,
  note?: string,
) {
  const existing = await db.query.assets.findFirst({
    where: and(eq(assets.id, assetId), eq(assets.userId, userId)),
  });
  if (!existing) return null;

  const [entry] = await db
    .insert(valuationHistory)
    .values({ assetId, value, note: note || null })
    .returning();

  await db
    .update(assets)
    .set({ currentValue: value, updatedAt: new Date() })
    .where(eq(assets.id, assetId));

  return entry;
}

export function summarizeNetWorth(
  userAssets: Awaited<ReturnType<typeof listAssetsForUser>>,
) {
  const byType: Record<string, number> = {};
  let total = 0;

  for (const asset of userAssets) {
    total += asset.currentValue;
    byType[asset.type] = (byType[asset.type] ?? 0) + asset.currentValue;
  }

  return {
    total,
    byType,
    assetCount: userAssets.length,
  };
}
