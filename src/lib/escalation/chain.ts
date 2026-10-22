import type { BeneficiaryWithHeirs } from "@/lib/repositories/beneficiaries";

/**
 * Pure logic for deciding who's next in the escalation chain. Kept separate
 * from the database-touching code in repositories/escalation.ts so it can
 * be unit tested without a database.
 *
 * The chain is a depth-first flattening of the beneficiary tree: each
 * top-level beneficiary, immediately followed by their own heirs (priority
 * order), before moving on to the next top-level beneficiary. This matches
 * "contact them, and if they don't confirm, contact their heirs" — heirs
 * are only ever reached as a fallback for the specific beneficiary they
 * belong to, not as a fallback for anyone else's.
 *
 * Example: beneficiaries [A (heirs: A1, A2), B (heirs: B1)] flattens to
 * [A, A1, A2, B, B1] — A2 is only tried after A1, which is only tried
 * after A.
 */
export function buildEscalationChain(tree: BeneficiaryWithHeirs[]): string[] {
  const sortedTopLevel = [...tree].sort((a, b) => a.priority - b.priority);
  const chain: string[] = [];
  for (const beneficiary of sortedTopLevel) {
    chain.push(beneficiary.id);
    const sortedHeirs = [...beneficiary.heirs].sort((a, b) => a.priority - b.priority);
    for (const heir of sortedHeirs) {
      chain.push(heir.id);
    }
  }
  return chain;
}

/** First contact to notify when escalation begins, or null if there are none. */
export function firstInChain(tree: BeneficiaryWithHeirs[]): string | null {
  return buildEscalationChain(tree)[0] ?? null;
}

/** Contact after `currentId` in the chain, or null if `currentId` was the last one (or not found). */
export function nextInChain(tree: BeneficiaryWithHeirs[], currentId: string): string | null {
  const chain = buildEscalationChain(tree);
  const index = chain.indexOf(currentId);
  if (index === -1) return null;
  return chain[index + 1] ?? null;
}
