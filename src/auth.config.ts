import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no database access, no bcrypt) — used by
 * middleware.ts, which runs in the Edge runtime and can't load native
 * modules like better-sqlite3. The full config with the Credentials
 * provider (which does touch the database) lives in src/auth.ts and is
 * only ever imported by Node-runtime code (API routes, server components).
 */
export const authConfig = {
  session: { strategy: "jwt" },
  // Trusts the incoming Host header rather than requiring it to exactly
  // match NEXTAUTH_URL. Safe for a self-hosted single app like this one;
  // if you deploy behind a reverse proxy, make sure it forwards the real
  // Host header (most do by default).
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
