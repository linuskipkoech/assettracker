/**
 * Database schema (Drizzle ORM, SQLite dialect).
 *
 * SQLite is used for zero-config local development — the whole database is
 * a single file (see src/db/index.ts). To move to PostgreSQL for
 * production, swap the driver in src/db/index.ts for `drizzle-orm/node-postgres`
 * (or `postgres-js`) and change the column builders below from
 * `sqlite-core` to `pg-core` equivalents — the table/column shapes are the
 * same, so the rest of the app (queries, types) does not need to change.
 *
 * Roles, asset types, and statuses are plain strings validated at the
 * application layer (see src/lib/constants.ts + src/lib/validation) rather
 * than native enums, since SQLite has no enum type and this keeps the
 * schema portable to Postgres too.
 */
import {
  sqliteTable,
  text,
  real,
  integer,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";
import { randomUUID } from "node:crypto";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID());

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
};

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("USER"), // USER | ADVISOR | ADMIN
  phone: text("phone"),
  county: text("county"),

  // --- Inactivity / beneficiary safety net ---------------------------------
  // The last time this user logged in (also set at signup). Inactivity is
  // measured from this timestamp, not from account creation, so a long-time
  // but currently-active user is never flagged.
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  // How many days of no login before we start the check-in process.
  inactivityThresholdDays: integer("inactivity_threshold_days").notNull().default(90),
  // How long the user has to confirm a check-in before we escalate to beneficiaries.
  checkinGraceDays: integer("checkin_grace_days").notNull().default(14),
  // How long each beneficiary/heir has to acknowledge before we move to the next one.
  beneficiaryGraceDays: integer("beneficiary_grace_days").notNull().default(14),
  // ACTIVE | AWAITING_CHECKIN | ESCALATING | ESCALATION_RESOLVED | EXHAUSTED
  escalationStatus: text("escalation_status").notNull().default("ACTIVE"),
  // Deadline for whoever currently has the ball (the user during
  // AWAITING_CHECKIN, or the current contact during ESCALATING).
  escalationDeadlineAt: integer("escalation_deadline_at", { mode: "timestamp" }),
  // Which beneficiary/heir is currently being contacted, if any.
  currentBeneficiaryId: text("current_beneficiary_id"),

  ...timestamps,
});

// ---------------------------------------------------------------------------
// Assets — one common table for aggregation, plus per-type detail tables.
// ---------------------------------------------------------------------------

export const assets = sqliteTable("assets", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // FARM | LIVESTOCK | BUSINESS | STOCK | LAND | PROPERTY | OTHER
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),

  currentValue: real("current_value").notNull(),
  currency: text("currency").notNull().default("KES"),
  acquisitionValue: real("acquisition_value"),
  acquisitionDate: integer("acquisition_date", { mode: "timestamp" }),

  location: text("location"),
  county: text("county"),
  latitude: real("latitude"),
  longitude: real("longitude"),

  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

export const valuationHistory = sqliteTable("valuation_history", {
  id: id(),
  assetId: text("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  value: real("value").notNull(),
  note: text("note"),
  recordedAt: integer("recorded_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const farmDetails = sqliteTable("farm_details", {
  id: id(),
  assetId: text("asset_id")
    .notNull()
    .unique()
    .references(() => assets.id, { onDelete: "cascade" }),
  sizeAcres: real("size_acres"),
  primaryCrop: text("primary_crop"),
  secondaryCrop: text("secondary_crop"),
  soilType: text("soil_type"),
  irrigation: integer("irrigation", { mode: "boolean" }).notNull().default(false),
});

export const livestockDetails = sqliteTable("livestock_details", {
  id: id(),
  assetId: text("asset_id")
    .notNull()
    .unique()
    .references(() => assets.id, { onDelete: "cascade" }),
  species: text("species"),
  breed: text("breed"),
  headCount: integer("head_count"),
  averageAgeMonths: integer("average_age_months"),
  purpose: text("purpose"), // dairy | beef | breeding | mixed
});

export const businessDetails = sqliteTable("business_details", {
  id: id(),
  assetId: text("asset_id")
    .notNull()
    .unique()
    .references(() => assets.id, { onDelete: "cascade" }),
  industry: text("industry"),
  ownershipPercent: real("ownership_percent"),
  monthlyRevenue: real("monthly_revenue"),
  monthlyExpenses: real("monthly_expenses"),
  employeeCount: integer("employee_count"),
});

export const stockDetails = sqliteTable("stock_details", {
  id: id(),
  assetId: text("asset_id")
    .notNull()
    .unique()
    .references(() => assets.id, { onDelete: "cascade" }),
  tickerSymbol: text("ticker_symbol"),
  exchange: text("exchange"), // NSE | NASDAQ | NYSE ...
  quantity: real("quantity"),
  pricePerUnit: real("price_per_unit"),
});

export const landDetails = sqliteTable("land_details", {
  id: id(),
  assetId: text("asset_id")
    .notNull()
    .unique()
    .references(() => assets.id, { onDelete: "cascade" }),
  sizeAcres: real("size_acres"),
  titleDeedNumber: text("title_deed_number"),
  zoning: text("zoning"), // agricultural | residential | commercial | mixed-use
});

export const propertyDetails = sqliteTable("property_details", {
  id: id(),
  assetId: text("asset_id")
    .notNull()
    .unique()
    .references(() => assets.id, { onDelete: "cascade" }),
  propertyType: text("property_type"), // residential | commercial | rental | land-banked
  bedrooms: integer("bedrooms"),
  monthlyRentalIncome: real("monthly_rental_income"),
  occupied: integer("occupied", { mode: "boolean" }).notNull().default(false),
});

// ---------------------------------------------------------------------------
// Professional advisors & consultation requests
// ---------------------------------------------------------------------------

export const advisors = sqliteTable("advisors", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  specialty: text("specialty").notNull(), // Agronomy | Livestock | Business | Investments | Real Estate | Legal | Tax
  bio: text("bio").notNull(),
  yearsExperience: integer("years_experience"),
  hourlyRateKes: real("hourly_rate_kes"),
  county: text("county"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const consultationRequests = sqliteTable("consultation_requests", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  advisorId: text("advisor_id")
    .notNull()
    .references(() => advisors.id, { onDelete: "cascade" }),
  assetId: text("asset_id").references(() => assets.id, {
    onDelete: "set null",
  }),

  topic: text("topic").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("PENDING"), // PENDING | ACCEPTED | DECLINED | COMPLETED | CANCELLED
  preferredDate: integer("preferred_date", { mode: "timestamp" }),
  advisorNote: text("advisor_note"),

  ...timestamps,
});

// ---------------------------------------------------------------------------
// AI assistant chat history
// ---------------------------------------------------------------------------

export const chatMessages = sqliteTable("chat_messages", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// Liabilities & outgoings — anything with money going out. Optionally
// linked to a specific asset (e.g. a mortgage against a property, a loan
// against a farm); left unlinked, it's a standalone outgoing (e.g. school
// fees, a subscription). One table covers both debts and recurring
// expenses: a debt has an `outstandingBalance` (counted against net
// worth), a pure outgoing doesn't.
// ---------------------------------------------------------------------------

export const liabilities = sqliteTable("liabilities", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Null for a standalone liability/outgoing not tied to a specific asset.
  assetId: text("asset_id").references(() => assets.id, { onDelete: "set null" }),

  name: text("name").notNull(),
  // LOAN | MORTGAGE | CREDIT_CARD | SCHOOL_FEES | UTILITY | SUBSCRIPTION | RENT | INSURANCE | TAX | OTHER
  type: text("type").notNull(),
  // ONE_TIME | WEEKLY | MONTHLY | QUARTERLY | ANNUALLY
  frequency: text("frequency").notNull(),
  // The recurring (or one-time) payment amount — the actual "money going out".
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("KES"),

  // What's still owed in total, if this is debt (a loan, mortgage, credit
  // card balance). Left null for a pure recurring outgoing with no
  // principal (rent, a subscription, school fees) — those don't reduce net
  // worth, they're just cash flow to keep an eye on.
  outstandingBalance: real("outstanding_balance"),
  interestRatePercent: real("interest_rate_percent"),

  startDate: integer("start_date", { mode: "timestamp" }),
  nextDueDate: integer("next_due_date", { mode: "timestamp" }),
  notes: text("notes"),
  // ACTIVE | PAID_OFF | CANCELLED
  status: text("status").notNull().default("ACTIVE"),

  ...timestamps,
});

// ---------------------------------------------------------------------------
// Beneficiaries & inactivity safety net.
//
// Each user has a priority-ordered list of top-level beneficiaries. Each
// beneficiary may in turn have their own priority-ordered heirs (a second
// level only — a beneficiary's heir cannot have further heirs of their
// own), reached only if that specific beneficiary doesn't acknowledge in
// time. See src/lib/repositories/escalation.ts for the full chain logic.
// ---------------------------------------------------------------------------

export const beneficiaries = sqliteTable("beneficiaries", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Null for a top-level beneficiary; set to a beneficiary's id if this row
  // is one of that beneficiary's heirs (a fallback contact for them only).
  parentBeneficiaryId: text("parent_beneficiary_id").references(
    (): AnySQLiteColumn => beneficiaries.id,
    { onDelete: "cascade" },
  ),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  notes: text("notes"),
  // Order among siblings (other top-level beneficiaries, or other heirs of
  // the same parent). Lower runs first.
  priority: integer("priority").notNull().default(0),
  ...timestamps,
});

// Audit trail of every notification sent and confirmation received, shown
// to the user as a timeline on the beneficiaries page.
export const escalationEvents = sqliteTable("escalation_events", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  beneficiaryId: text("beneficiary_id").references(() => beneficiaries.id, {
    onDelete: "set null",
  }),
  // CHECKIN_EMAIL_SENT | CHECKIN_CONFIRMED | RESOLVED_BY_LOGIN |
  // BENEFICIARY_NOTIFIED | BENEFICIARY_CONFIRMED | ESCALATED_TO_NEXT |
  // ESCALATION_EXHAUSTED
  type: text("type").notNull(),
  message: text("message"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Single-use, time-limited tokens emailed to the user (to confirm they're
// still active) or to a beneficiary/heir (to acknowledge they were
// notified). Only the sha256 hash is stored — the raw token only ever
// exists in the emailed link.
export const checkinTokens = sqliteTable("checkin_tokens", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  beneficiaryId: text("beneficiary_id").references(() => beneficiaries.id, {
    onDelete: "cascade",
  }),
  purpose: text("purpose").notNull(), // USER_CHECKIN | BENEFICIARY_ACK
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// Crop cycles & their expenses.
//
// A crop cycle tracks one crop on one FARM asset from planting to harvest:
// what was planted, when, on how many acres, every expense recorded along
// the way, and the closing numbers (yield + sale revenue) that turn those
// expenses into a profit-per-season / profit-per-acre figure.
//
// An expense bought on credit also creates a row in `liabilities` tied to
// the same farm asset (liabilityId below) — so the fertilizer a farmer took
// on agrovet credit shows up both in the season's costs AND as money owed
// against that farm, without ever being double-counted in net worth (net
// worth subtracts liabilities once, globally; cycle expenses are a
// crop-profit view, not a second deduction).
// ---------------------------------------------------------------------------

export const cropCycles = sqliteTable("crop_cycles", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // The FARM asset this cycle belongs to. Validated at the app layer
  // (the asset must exist, belong to the user, and be type FARM).
  assetId: text("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),

  name: text("name").notNull(), // e.g. "Short Rains 2026 — Maize"
  crop: text("crop").notNull(), // e.g. "Maize"
  status: text("status").notNull().default("PLANNED"), // PLANNED | GROWING | HARVESTED | SOLD
  acreage: real("acreage"),

  plantingDate: integer("planting_date", { mode: "timestamp" }),
  expectedHarvestDate: integer("expected_harvest_date", { mode: "timestamp" }),
  harvestedDate: integer("harvested_date", { mode: "timestamp" }),

  // Closing numbers, filled in at harvest / sale time.
  harvestQuantity: real("harvest_quantity"),
  harvestUnit: text("harvest_unit"), // e.g. "90kg bags", "kg", "crates"
  saleRevenue: real("sale_revenue"),

  notes: text("notes"),
  ...timestamps,
});

export const cropExpenses = sqliteTable("crop_expenses", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  cycleId: text("cycle_id")
    .notNull()
    .references(() => cropCycles.id, { onDelete: "cascade" }),

  // LAND_PREP | SEEDS | FERTILIZER | PESTICIDE | LABOUR | IRRIGATION | EQUIPMENT | TRANSPORT | OTHER
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("KES"),
  expenseDate: integer("expense_date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),

  // Set when this expense was bought on credit: the liability created for
  // it (tied to the same farm asset). Kept for reference; deleting the
  // expense does not silently delete the debt — the farmer settles or
  // removes the liability explicitly from the farm's liabilities list.
  liabilityId: text("liability_id").references(() => liabilities.id, {
    onDelete: "set null",
  }),

  ...timestamps,
});
