import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import * as schema from "./schema";

// The raw file path is derived from DATABASE_URL (format: "file:./dev.db")
// so the same env var name works if this project is later pointed at a
// different SQLite path, and so tests can point at an isolated file/":memory:".
function resolveSqlitePath(databaseUrl: string | undefined): string {
  const withoutScheme = (databaseUrl ?? "file:./dev.db").replace(/^file:/, "");
  if (withoutScheme === ":memory:") return withoutScheme;
  // path.resolve() (rather than path.join(process.cwd(), ...)) avoids
  // Next.js/Turbopack's build-time heuristic that treats an explicit
  // process.cwd() call inside path.join() as a signal to trace and bundle
  // the entire project as server output.
  return path.resolve(withoutScheme);
}

declare global {
  var __assetTrackerSqlite: Database.Database | undefined;
}

const sqlitePath = resolveSqlitePath(process.env.DATABASE_URL);

// Reuse a single connection across hot-reloads in dev so we don't leak file
// handles, and so every module sees the same in-memory DB in tests.
const sqlite =
  globalThis.__assetTrackerSqlite ?? new Database(sqlitePath);
if (process.env.NODE_ENV !== "production") {
  globalThis.__assetTrackerSqlite = sqlite;
}

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export type DbClient = typeof db;
