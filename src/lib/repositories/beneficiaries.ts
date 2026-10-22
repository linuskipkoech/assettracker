import { db } from "@/db";
import { beneficiaries } from "@/db/schema";
import { and, eq, isNull, max } from "drizzle-orm";
import type { z } from "zod";
import type { beneficiaryInputSchema } from "@/lib/validation";

type BeneficiaryInput = z.infer<typeof beneficiaryInputSchema>;

export type BeneficiaryRow = typeof beneficiaries.$inferSelect;
export type BeneficiaryWithHeirs = BeneficiaryRow & { heirs: BeneficiaryRow[] };

/** Top-level beneficiaries (priority order), each with their own heirs (priority order). */
export async function listBeneficiariesForUser(userId: string): Promise<BeneficiaryWithHeirs[]> {
  const all = await db
    .select()
    .from(beneficiaries)
    .where(eq(beneficiaries.userId, userId))
    .orderBy(beneficiaries.priority);

  const topLevel = all.filter((b) => !b.parentBeneficiaryId);
  const heirsByParent = new Map<string, BeneficiaryRow[]>();
  for (const b of all) {
    if (b.parentBeneficiaryId) {
      const list = heirsByParent.get(b.parentBeneficiaryId) ?? [];
      list.push(b);
      heirsByParent.set(b.parentBeneficiaryId, list);
    }
  }

  return topLevel.map((b) => ({ ...b, heirs: heirsByParent.get(b.id) ?? [] }));
}

async function getBeneficiaryForUser(id: string, userId: string) {
  return db.query.beneficiaries.findFirst({
    where: and(eq(beneficiaries.id, id), eq(beneficiaries.userId, userId)),
  });
}

async function nextPriority(userId: string, parentBeneficiaryId: string | null) {
  const [row] = await db
    .select({ max: max(beneficiaries.priority) })
    .from(beneficiaries)
    .where(
      and(
        eq(beneficiaries.userId, userId),
        parentBeneficiaryId
          ? eq(beneficiaries.parentBeneficiaryId, parentBeneficiaryId)
          : isNull(beneficiaries.parentBeneficiaryId),
      ),
    );
  return (row?.max ?? -1) + 1;
}

export async function createBeneficiaryForUser(userId: string, input: BeneficiaryInput) {
  const parentBeneficiaryId = input.parentBeneficiaryId || null;

  // An heir's parent must belong to this user and must itself be a
  // top-level beneficiary — this keeps the tree exactly two levels deep.
  if (parentBeneficiaryId) {
    const parent = await getBeneficiaryForUser(parentBeneficiaryId, userId);
    if (!parent) return { error: "not_found" as const };
    if (parent.parentBeneficiaryId) return { error: "too_deep" as const };
  }

  const priority = await nextPriority(userId, parentBeneficiaryId);

  const [row] = await db
    .insert(beneficiaries)
    .values({
      userId,
      parentBeneficiaryId,
      name: input.name,
      relationship: input.relationship,
      email: input.email,
      phone: input.phone || null,
      notes: input.notes || null,
      priority,
    })
    .returning();

  return { beneficiary: row };
}

export async function updateBeneficiaryForUser(
  id: string,
  userId: string,
  input: BeneficiaryInput,
) {
  const existing = await getBeneficiaryForUser(id, userId);
  if (!existing) return null;

  const [updated] = await db
    .update(beneficiaries)
    .set({
      name: input.name,
      relationship: input.relationship,
      email: input.email,
      phone: input.phone || null,
      notes: input.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(beneficiaries.id, id))
    .returning();

  return updated;
}

/** Deletes a beneficiary. Deleting a top-level beneficiary also deletes their heirs (FK cascade). */
export async function deleteBeneficiaryForUser(id: string, userId: string) {
  const existing = await getBeneficiaryForUser(id, userId);
  if (!existing) return false;
  await db.delete(beneficiaries).where(eq(beneficiaries.id, id));
  return true;
}

/** Moves a beneficiary up/down among its siblings (other top-level entries, or other heirs of the same parent). */
export async function reorderBeneficiaryForUser(
  id: string,
  userId: string,
  direction: "up" | "down",
) {
  const existing = await getBeneficiaryForUser(id, userId);
  if (!existing) return false;

  const siblings = await db
    .select()
    .from(beneficiaries)
    .where(
      and(
        eq(beneficiaries.userId, userId),
        existing.parentBeneficiaryId
          ? eq(beneficiaries.parentBeneficiaryId, existing.parentBeneficiaryId)
          : isNull(beneficiaries.parentBeneficiaryId),
      ),
    )
    .orderBy(beneficiaries.priority);

  const index = siblings.findIndex((s) => s.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= siblings.length) return false;

  const a = siblings[index];
  const b = siblings[swapWith];
  await db.update(beneficiaries).set({ priority: b.priority }).where(eq(beneficiaries.id, a.id));
  await db.update(beneficiaries).set({ priority: a.priority }).where(eq(beneficiaries.id, b.id));
  return true;
}
