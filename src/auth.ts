import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loginSchema } from "@/lib/validation";
import { isRateLimited } from "@/lib/rate-limit";
import { recordLogin } from "@/lib/repositories/escalation";
import { authConfig } from "./auth.config";

// Full auth config, including the Credentials provider (which needs
// database + bcrypt access). Only import this from Node-runtime code —
// API routes and server components. middleware.ts uses auth.config.ts
// directly instead, since it runs on the Edge runtime.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Slows down brute-force login attempts against a single account.
        // Keyed by email (not IP) so it protects the account regardless of
        // how many addresses an attacker spreads requests across.
        if (isRateLimited(`login:${email.toLowerCase().trim()}`, { windowMs: 15 * 60 * 1000, max: 15 })) {
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, email.toLowerCase().trim()),
        });
        if (!user) return null;

        const passwordOk = await bcrypt.compare(password, user.passwordHash);
        if (!passwordOk) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  events: {
    // A successful login is proof of life — it cancels any in-progress
    // check-in / beneficiary escalation and resets the inactivity clock.
    async signIn({ user }) {
      if (user?.id) {
        await recordLogin(user.id as string).catch((error) => {
          console.error("Failed to record login for activity tracking:", error);
        });
      }
    },
  },
});
