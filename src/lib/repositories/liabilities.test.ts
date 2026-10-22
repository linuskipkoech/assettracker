import { describe, expect, it } from "vitest";
import { summarizeLiabilities, type LiabilityRow } from "./liabilities";

function liability(overrides: Partial<LiabilityRow>): LiabilityRow {
  return {
    id: "id",
    userId: "user",
    assetId: null,
    name: "Test",
    type: "OTHER",
    frequency: "MONTHLY",
    amount: 0,
    currency: "KES",
    outstandingBalance: null,
    interestRatePercent: null,
    startDate: null,
    nextDueDate: null,
    notes: null,
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("summarizeLiabilities", () => {
  it("returns zeros for an empty list", () => {
    expect(summarizeLiabilities([])).toEqual({
      totalOutstandingBalance: 0,
      totalMonthlyOutgoings: 0,
      activeCount: 0,
    });
  });

  it("sums outstanding balances for active debts", () => {
    const rows = [
      liability({ outstandingBalance: 100_000 }),
      liability({ outstandingBalance: 50_000 }),
    ];
    expect(summarizeLiabilities(rows).totalOutstandingBalance).toBe(150_000);
  });

  it("normalizes different frequencies to a monthly equivalent", () => {
    const rows = [
      liability({ amount: 1000, frequency: "MONTHLY" }), // 1000/mo
      liability({ amount: 12000, frequency: "ANNUALLY" }), // 1000/mo
      liability({ amount: 3000, frequency: "QUARTERLY" }), // 1000/mo
    ];
    expect(summarizeLiabilities(rows).totalMonthlyOutgoings).toBeCloseTo(3000, 5);
  });

  it("excludes one-time payments from the monthly outgoings total", () => {
    const rows = [liability({ amount: 50_000, frequency: "ONE_TIME" })];
    expect(summarizeLiabilities(rows).totalMonthlyOutgoings).toBe(0);
  });

  it("excludes paid-off and cancelled liabilities from every total", () => {
    const rows = [
      liability({ status: "PAID_OFF", outstandingBalance: 100_000, amount: 500 }),
      liability({ status: "CANCELLED", outstandingBalance: 100_000, amount: 500 }),
    ];
    const summary = summarizeLiabilities(rows);
    expect(summary).toEqual({ totalOutstandingBalance: 0, totalMonthlyOutgoings: 0, activeCount: 0 });
  });

  it("counts only active liabilities", () => {
    const rows = [
      liability({ status: "ACTIVE" }),
      liability({ status: "ACTIVE" }),
      liability({ status: "PAID_OFF" }),
    ];
    expect(summarizeLiabilities(rows).activeCount).toBe(2);
  });
});
