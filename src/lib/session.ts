import { auth } from "@/auth";

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in to do that.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Throws UnauthorizedError if there is no signed-in user. Use inside API routes. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session.user;
}

/** Returns the current session's user, or null. Safe for optional auth checks. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
