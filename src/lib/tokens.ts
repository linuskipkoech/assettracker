import { randomBytes, createHash } from "node:crypto";

/**
 * Secure, single-use tokens for email-based confirmation links (user
 * check-ins and beneficiary acknowledgements). Only the sha256 hash is
 * ever persisted — the raw token exists only in the emailed URL, the same
 * way a password reset link normally works.
 */

export function generateToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
