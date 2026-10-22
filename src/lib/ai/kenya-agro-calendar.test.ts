import { describe, expect, it } from "vitest";
import { resolveZoneForCounty, resolveCropProfile } from "./kenya-agro-calendar";

describe("resolveZoneForCounty", () => {
  it("resolves a known county to its agro zone", () => {
    const zone = resolveZoneForCounty("Nakuru");
    expect(zone?.key).toBe("highlands");
  });

  it("is case-insensitive", () => {
    const zone = resolveZoneForCounty("nakuru");
    expect(zone?.key).toBe("highlands");
  });

  it("resolves an arid county correctly", () => {
    const zone = resolveZoneForCounty("Turkana");
    expect(zone?.key).toBe("arid-north");
  });

  it("returns null for an unknown county", () => {
    expect(resolveZoneForCounty("Atlantis")).toBeNull();
  });
});

describe("resolveCropProfile", () => {
  it("resolves an exact crop match", () => {
    const crop = resolveCropProfile("Maize");
    expect(crop?.name).toBe("Maize");
  });

  it("resolves via an alias", () => {
    const crop = resolveCropProfile("mtama");
    expect(crop?.name).toBe("Sorghum");
  });

  it("is case-insensitive", () => {
    const crop = resolveCropProfile("BEANS");
    expect(crop?.name).toBe("Beans");
  });

  it("returns null for an unknown crop", () => {
    expect(resolveCropProfile("Dragonfruit-xyz")).toBeNull();
  });
});
