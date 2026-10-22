import { describe, expect, it } from "vitest";
import { buildEscalationChain, firstInChain, nextInChain } from "./chain";
import type { BeneficiaryWithHeirs } from "@/lib/repositories/beneficiaries";

// Minimal fixtures — only the fields the chain logic actually reads.
function beneficiary(id: string, priority: number, heirs: { id: string; priority: number }[] = []) {
  return {
    id,
    priority,
    heirs: heirs.map((h) => ({ id: h.id, priority: h.priority }) as never),
  } as unknown as BeneficiaryWithHeirs;
}

describe("buildEscalationChain", () => {
  it("returns an empty chain with no beneficiaries", () => {
    expect(buildEscalationChain([])).toEqual([]);
  });

  it("orders top-level beneficiaries by priority", () => {
    const tree = [beneficiary("B", 1), beneficiary("A", 0)];
    expect(buildEscalationChain(tree)).toEqual(["A", "B"]);
  });

  it("inserts each beneficiary's heirs immediately after them, in priority order", () => {
    const tree = [
      beneficiary("A", 0, [
        { id: "A2", priority: 1 },
        { id: "A1", priority: 0 },
      ]),
      beneficiary("B", 1, [{ id: "B1", priority: 0 }]),
    ];
    expect(buildEscalationChain(tree)).toEqual(["A", "A1", "A2", "B", "B1"]);
  });
});

describe("firstInChain", () => {
  it("returns null when there are no beneficiaries", () => {
    expect(firstInChain([])).toBeNull();
  });

  it("returns the first top-level beneficiary", () => {
    const tree = [beneficiary("A", 0, [{ id: "A1", priority: 0 }]), beneficiary("B", 1)];
    expect(firstInChain(tree)).toBe("A");
  });
});

describe("nextInChain", () => {
  const tree = [
    beneficiary("A", 0, [{ id: "A1", priority: 0 }]),
    beneficiary("B", 1, [{ id: "B1", priority: 0 }]),
  ];

  it("moves from a beneficiary to their own heir first", () => {
    expect(nextInChain(tree, "A")).toBe("A1");
  });

  it("moves to the next top-level beneficiary once a beneficiary's heirs are exhausted", () => {
    expect(nextInChain(tree, "A1")).toBe("B");
  });

  it("returns null after the last contact in the chain", () => {
    expect(nextInChain(tree, "B1")).toBeNull();
  });

  it("returns null for an id that isn't in the chain", () => {
    expect(nextInChain(tree, "unknown")).toBeNull();
  });
});
