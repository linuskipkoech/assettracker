import { describe, expect, it } from "vitest";
import {
  signupSchema,
  assetInputSchema,
  loginSchema,
  beneficiaryInputSchema,
  activitySettingsSchema,
  liabilityInputSchema,
} from "./validation";

describe("signupSchema", () => {
  it("accepts a valid signup payload", () => {
    const result = signupSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password without a number", () => {
    const result = signupSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "passwordonly",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
  });
});

describe("assetInputSchema", () => {
  it("accepts a minimal valid farm asset", () => {
    const result = assetInputSchema.safeParse({
      type: "FARM",
      name: "Test Farm",
      currentValue: 100000,
      currency: "KES",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a negative current value", () => {
    const result = assetInputSchema.safeParse({
      type: "FARM",
      name: "Test Farm",
      currentValue: -100,
      currency: "KES",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown asset type", () => {
    const result = assetInputSchema.safeParse({
      type: "SPACESHIP",
      name: "Test",
      currentValue: 100,
      currency: "KES",
    });
    expect(result.success).toBe(false);
  });
});

describe("beneficiaryInputSchema", () => {
  it("accepts a minimal valid top-level beneficiary", () => {
    const result = beneficiaryInputSchema.safeParse({
      name: "Jane Doe",
      relationship: "Spouse",
      email: "jane@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a heir with a parentBeneficiaryId", () => {
    const result = beneficiaryInputSchema.safeParse({
      name: "Jane Doe Jr.",
      relationship: "Child",
      email: "janejr@example.com",
      parentBeneficiaryId: "some-id",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = beneficiaryInputSchema.safeParse({
      name: "Jane Doe",
      relationship: "Spouse",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing relationship", () => {
    const result = beneficiaryInputSchema.safeParse({
      name: "Jane Doe",
      relationship: "",
      email: "jane@example.com",
    });
    expect(result.success).toBe(false);
  });
});

describe("activitySettingsSchema", () => {
  it("accepts valid timing values", () => {
    const result = activitySettingsSchema.safeParse({
      inactivityThresholdDays: 90,
      checkinGraceDays: 14,
      beneficiaryGraceDays: 14,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a threshold below the minimum", () => {
    const result = activitySettingsSchema.safeParse({
      inactivityThresholdDays: 1,
      checkinGraceDays: 14,
      beneficiaryGraceDays: 14,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer grace period", () => {
    const result = activitySettingsSchema.safeParse({
      inactivityThresholdDays: 90,
      checkinGraceDays: 14.5,
      beneficiaryGraceDays: 14,
    });
    expect(result.success).toBe(false);
  });
});

describe("liabilityInputSchema", () => {
  it("accepts a minimal standalone liability", () => {
    const result = liabilityInputSchema.safeParse({
      name: "Netflix",
      type: "SUBSCRIPTION",
      frequency: "MONTHLY",
      amount: 1500,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a debt-like liability linked to an asset", () => {
    const result = liabilityInputSchema.safeParse({
      name: "Home mortgage",
      type: "MORTGAGE",
      frequency: "MONTHLY",
      amount: 45000,
      outstandingBalance: 3_000_000,
      interestRatePercent: 12.5,
      assetId: "some-asset-id",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a negative amount", () => {
    const result = liabilityInputSchema.safeParse({
      name: "Netflix",
      type: "SUBSCRIPTION",
      frequency: "MONTHLY",
      amount: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown liability type", () => {
    const result = liabilityInputSchema.safeParse({
      name: "Netflix",
      type: "SPACESHIP",
      frequency: "MONTHLY",
      amount: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an interest rate over 100", () => {
    const result = liabilityInputSchema.safeParse({
      name: "Loan",
      type: "LOAN",
      frequency: "MONTHLY",
      amount: 10,
      interestRatePercent: 150,
    });
    expect(result.success).toBe(false);
  });
});
