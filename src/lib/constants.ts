// Central place for the string "enums" used across the schema, API, and UI.
// Kept as const arrays + derived union types (rather than TS/Prisma enums)
// so they work directly with zod and with the SQLite text columns.

export const USER_ROLES = ["USER", "ADVISOR", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ASSET_TYPES = [
  "FARM",
  "LIVESTOCK",
  "BUSINESS",
  "STOCK",
  "LAND",
  "PROPERTY",
  "OTHER",
] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  FARM: "Farm",
  LIVESTOCK: "Livestock",
  BUSINESS: "Business",
  STOCK: "Stocks & Investments",
  LAND: "Land",
  PROPERTY: "Property",
  OTHER: "Other",
};

export const CONSULTATION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type ConsultationStatus = (typeof CONSULTATION_STATUSES)[number];

export const ADVISOR_SPECIALTIES = [
  "Agronomy",
  "Livestock",
  "Business",
  "Investments",
  "Real Estate",
  "Legal",
  "Tax",
] as const;
export type AdvisorSpecialty = (typeof ADVISOR_SPECIALTIES)[number];

// Kenya's 47 counties — used for location pickers on farms, land, property,
// and advisor profiles.
export const KENYA_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru",
  "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua",
  "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
  "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo-Marakwet", "Nandi",
  "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho",
  "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu",
  "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi",
] as const;

export const DEFAULT_CURRENCY = "KES";

// ---------------------------------------------------------------------------
// Liabilities & outgoings
// ---------------------------------------------------------------------------

export const LIABILITY_TYPES = [
  "LOAN",
  "MORTGAGE",
  "CREDIT_CARD",
  "SCHOOL_FEES",
  "UTILITY",
  "SUBSCRIPTION",
  "RENT",
  "INSURANCE",
  "TAX",
  "OTHER",
] as const;
export type LiabilityType = (typeof LIABILITY_TYPES)[number];

export const LIABILITY_TYPE_LABELS: Record<LiabilityType, string> = {
  LOAN: "Loan",
  MORTGAGE: "Mortgage",
  CREDIT_CARD: "Credit card",
  SCHOOL_FEES: "School fees",
  UTILITY: "Utility bill",
  SUBSCRIPTION: "Subscription",
  RENT: "Rent",
  INSURANCE: "Insurance premium",
  TAX: "Tax",
  OTHER: "Other",
};

export const LIABILITY_FREQUENCIES = ["ONE_TIME", "WEEKLY", "MONTHLY", "QUARTERLY", "ANNUALLY"] as const;
export type LiabilityFrequency = (typeof LIABILITY_FREQUENCIES)[number];

export const LIABILITY_FREQUENCY_LABELS: Record<LiabilityFrequency, string> = {
  ONE_TIME: "One-time",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUALLY: "Annually",
};

// Multiplier to normalize a payment of this frequency into a monthly
// equivalent, for the "total monthly outgoings" summary. One-time
// liabilities are excluded from that total entirely (handled in code).
export const LIABILITY_FREQUENCY_MONTHLY_FACTOR: Record<LiabilityFrequency, number> = {
  ONE_TIME: 0,
  WEEKLY: 52 / 12,
  MONTHLY: 1,
  QUARTERLY: 1 / 3,
  ANNUALLY: 1 / 12,
};

export const LIABILITY_STATUSES = ["ACTIVE", "PAID_OFF", "CANCELLED"] as const;
export type LiabilityStatus = (typeof LIABILITY_STATUSES)[number];

// ---------------------------------------------------------------------------
// Beneficiaries & inactivity safety net
// ---------------------------------------------------------------------------

export const ESCALATION_STATUSES = [
  "ACTIVE",
  "AWAITING_CHECKIN",
  "ESCALATING",
  "ESCALATION_RESOLVED",
  "EXHAUSTED",
] as const;
export type EscalationStatus = (typeof ESCALATION_STATUSES)[number];

export const BENEFICIARY_RELATIONSHIPS = [
  "Spouse",
  "Child",
  "Parent",
  "Sibling",
  "Friend",
  "Attorney",
  "Business partner",
  "Other",
] as const;

export const DEFAULT_INACTIVITY_THRESHOLD_DAYS = 90;
export const DEFAULT_CHECKIN_GRACE_DAYS = 14;
export const DEFAULT_BENEFICIARY_GRACE_DAYS = 14;

export const MIN_INACTIVITY_THRESHOLD_DAYS = 7;
export const MAX_INACTIVITY_THRESHOLD_DAYS = 730;
export const MIN_GRACE_DAYS = 1;
export const MAX_GRACE_DAYS = 90;
