import { describe, expect, it } from "vitest";
import { summarizeCropCycle } from "./crop-cycles";

const expenses = [
  { category: "LAND_PREP", amount: 38_000 },
  { category: "SEEDS", amount: 53_000 },
  { category: "FERTILIZER", amount: 96_000 },
  { category: "LABOUR", amount: 30_000 },
];

describe("summarizeCropCycle", () => {
  it("totals expenses and groups them by category", () => {
    const s = summarizeCropCycle({ acreage: 8, saleRevenue: null }, expenses);
    expect(s.totalExpenses).toBe(217_000);
    expect(s.expenseCount).toBe(4);
    expect(s.expensesByCategory.FERTILIZER).toBe(96_000);
    expect(s.expensesByCategory.LABOUR).toBe(30_000);
  });

  it("computes cost per acre when acreage is known", () => {
    const s = summarizeCropCycle({ acreage: 8, saleRevenue: null }, expenses);
    expect(s.costPerAcre).toBe(217_000 / 8);
  });

  it("returns null per-acre figures without acreage", () => {
    const s = summarizeCropCycle({ acreage: null, saleRevenue: null }, expenses);
    expect(s.costPerAcre).toBeNull();
    expect(s.profitPerAcre).toBeNull();
  });

  it("computes gross profit and profit per acre once revenue exists", () => {
    const s = summarizeCropCycle({ acreage: 8, saleRevenue: 780_000 }, expenses);
    expect(s.hasRevenue).toBe(true);
    expect(s.grossProfit).toBe(780_000 - 217_000);
    expect(s.profitPerAcre).toBe((780_000 - 217_000) / 8);
  });

  it("flags a growing crop with no revenue yet", () => {
    const s = summarizeCropCycle({ acreage: 8, saleRevenue: null }, expenses);
    expect(s.hasRevenue).toBe(false);
    expect(s.saleRevenue).toBe(0);
  });

  it("handles a cycle with no expenses", () => {
    const s = summarizeCropCycle({ acreage: 5, saleRevenue: 0 }, []);
    expect(s.totalExpenses).toBe(0);
    expect(s.costPerAcre).toBe(0);
  });
});
