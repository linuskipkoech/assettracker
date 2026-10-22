import { describe, expect, it } from "vitest";
import { generateToken, hashToken } from "./tokens";

describe("tokens", () => {
  it("generates a token whose hash matches hashToken() of the raw value", () => {
    const { token, hash } = generateToken();
    expect(hashToken(token)).toBe(hash);
  });

  it("generates different tokens (and hashes) on each call", () => {
    const first = generateToken();
    const second = generateToken();
    expect(first.token).not.toBe(second.token);
    expect(first.hash).not.toBe(second.hash);
  });

  it("never stores the raw token as its own hash", () => {
    const { token, hash } = generateToken();
    expect(hash).not.toBe(token);
  });
});
