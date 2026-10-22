/**
 * Applies pending SQL migrations to the local SQLite database.
 * Run via `npm run db:migrate`. Safe to run repeatedly (idempotent).
 */
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index";

migrate(db, { migrationsFolder: "./drizzle" });
console.log("Database migrated.");
