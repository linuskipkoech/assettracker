import { describe, expect, it } from "vitest";
import { summarizeNetWorth } from "./assets";

type FakeAsset = { type: string; currentValue: number };

describe("summarizeNetWorth", () => {
  it("sums total value and groups by type", () => {
    const fakeAssets: FakeAsset[] = [
      { type: "FARM", currentValue: 1000 },
      { type: "FARM", currentValue: 500 },
      { type: "STOCK", currentValue: 250 },
    ];
    const summary = summarizeNetWorth(
      fakeAssets as unknown as Parameters<typeof summarizeNetWorth>[0],
    );
    expect(summary.total).toBe(1750);
    expect(summary.byType.FARM).toBe(1500);
    expect(summary.byType.STOCK).toBe(250);
    expect(summary.assetCount).toBe(3);
  });

  it("handles an empty portfolio", () => {
    const summary = summarizeNetWorth(
      [] as unknown as Parameters<typeof summarizeNetWorth>[0],
    );
    expect(summary.total).toBe(0);
    expect(summary.assetCount).toBe(0);
    expect(Object.keys(summary.byType)).toHaveLength(0);
  });
});
