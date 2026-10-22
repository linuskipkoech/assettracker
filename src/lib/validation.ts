import { z } from "zod";
import {
  ASSET_TYPES,
  ADVISOR_SPECIALTIES,
  CONSULTATION_STATUSES,
  MIN_INACTIVITY_THRESHOLD_DAYS,
  MAX_INACTIVITY_THRESHOLD_DAYS,
  MIN_GRACE_DAYS,
  MAX_GRACE_DAYS,
  LIABILITY_TYPES,
  LIABILITY_FREQUENCIES,
  LIABILITY_STATUSES,
} from "./constants";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(200)
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  county: z.string().trim().max(60).optional().or(z.literal("")),
});

// ---------------------------------------------------------------------------
// Assets — a shared "core" schema plus one optional details object per type.
// The API route picks the right details validator based on `type`.
// ---------------------------------------------------------------------------

const money = z
  .number({ error: "Must be a number" })
  .finite()
  .max(1_000_000_000_000, "Value is too large");

const nonNegativeMoney = money.min(0, "Value cannot be negative");

export const assetCoreSchema = z.object({
  type: z.enum(ASSET_TYPES),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  currentValue: nonNegativeMoney,
  currency: z.string().trim().min(1).max(10).default("KES"),
  acquisitionValue: nonNegativeMoney.optional(),
  acquisitionDate: z.coerce.date().optional(),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  county: z.string().trim().max(60).optional().or(z.literal("")),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const farmDetailsSchema = z.object({
  sizeAcres: z.number().min(0).max(1_000_000).optional(),
  primaryCrop: z.string().trim().max(80).optional().or(z.literal("")),
  secondaryCrop: z.string().trim().max(80).optional().or(z.literal("")),
  soilType: z.string().trim().max(80).optional().or(z.literal("")),
  irrigation: z.boolean().optional(),
});

export const livestockDetailsSchema = z.object({
  species: z.string().trim().max(80).optional().or(z.literal("")),
  breed: z.string().trim().max(80).optional().or(z.literal("")),
  headCount: z.number().int().min(0).max(1_000_000).optional(),
  averageAgeMonths: z.number().int().min(0).max(1200).optional(),
  purpose: z.string().trim().max(80).optional().or(z.literal("")),
});

export const businessDetailsSchema = z.object({
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  ownershipPercent: z.number().min(0).max(100).optional(),
  monthlyRevenue: nonNegativeMoney.optional(),
  monthlyExpenses: nonNegativeMoney.optional(),
  employeeCount: z.number().int().min(0).max(1_000_000).optional(),
});

export const stockDetailsSchema = z.object({
  tickerSymbol: z.string().trim().max(20).optional().or(z.literal("")),
  exchange: z.string().trim().max(40).optional().or(z.literal("")),
  quantity: z.number().min(0).max(1_000_000_000).optional(),
  pricePerUnit: nonNegativeMoney.optional(),
});

export const landDetailsSchema = z.object({
  sizeAcres: z.number().min(0).max(1_000_000).optional(),
  titleDeedNumber: z.string().trim().max(100).optional().or(z.literal("")),
  zoning: z.string().trim().max(60).optional().or(z.literal("")),
});

export const propertyDetailsSchema = z.object({
  propertyType: z.string().trim().max(60).optional().or(z.literal("")),
  bedrooms: z.number().int().min(0).max(1000).optional(),
  monthlyRentalIncome: nonNegativeMoney.optional(),
  occupied: z.boolean().optional(),
});

export const assetInputSchema = assetCoreSchema.extend({
  farmDetails: farmDetailsSchema.optional(),
  livestockDetails: livestockDetailsSchema.optional(),
  businessDetails: businessDetailsSchema.optional(),
  stockDetails: stockDetailsSchema.optional(),
  landDetails: landDetailsSchema.optional(),
  propertyDetails: propertyDetailsSchema.optional(),
});

export const valuationEntrySchema = z.object({
  value: nonNegativeMoney,
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

// ---------------------------------------------------------------------------
// Advisors & consultations
// ---------------------------------------------------------------------------

export const advisorProfileSchema = z.object({
  specialty: z.enum(ADVISOR_SPECIALTIES),
  bio: z.string().trim().min(20, "Bio must be at least 20 characters").max(3000),
  yearsExperience: z.number().int().min(0).max(80).optional(),
  hourlyRateKes: nonNegativeMoney.optional(),
  county: z.string().trim().max(60).optional().or(z.literal("")),
});

export const consultationRequestSchema = z.object({
  advisorId: z.string().min(1),
  assetId: z.string().min(1).optional(),
  topic: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10, "Add a bit more detail").max(2000),
  preferredDate: z.coerce.date().optional(),
});

export const consultationStatusUpdateSchema = z.object({
  status: z.enum(CONSULTATION_STATUSES),
  advisorNote: z.string().trim().max(2000).optional().or(z.literal("")),
});

// ---------------------------------------------------------------------------
// AI assistant
// ---------------------------------------------------------------------------

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1).max(4000),
});

export const plantingAdviceSchema = z.object({
  county: z.string().trim().min(2).max(60),
  crop: z.string().trim().min(2).max(80),
  sizeAcres: z.number().min(0).max(1_000_000).optional(),
  soilType: z.string().trim().max(80).optional().or(z.literal("")),
  irrigation: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Beneficiaries & inactivity safety net
// ---------------------------------------------------------------------------

export const beneficiaryInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  relationship: z.string().trim().min(2, "Relationship is required").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  // Set only when adding this beneficiary as a heir of an existing
  // top-level beneficiary; omitted (or null) for a top-level beneficiary.
  parentBeneficiaryId: z.string().min(1).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Liabilities & outgoings
// ---------------------------------------------------------------------------

export const liabilityInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  type: z.enum(LIABILITY_TYPES),
  frequency: z.enum(LIABILITY_FREQUENCIES),
  amount: nonNegativeMoney,
  currency: z.string().trim().min(1).max(10).default("KES"),
  outstandingBalance: nonNegativeMoney.optional(),
  interestRatePercent: z.number().min(0).max(100).optional(),
  startDate: z.coerce.date().optional(),
  nextDueDate: z.coerce.date().optional(),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  status: z.enum(LIABILITY_STATUSES).default("ACTIVE"),
  // Null/omitted for a standalone liability not tied to any asset.
  assetId: z.string().min(1).optional().nullable(),
});

export const activitySettingsSchema = z.object({
  inactivityThresholdDays: z
    .number()
    .int()
    .min(MIN_INACTIVITY_THRESHOLD_DAYS, `Must be at least ${MIN_INACTIVITY_THRESHOLD_DAYS} days`)
    .max(MAX_INACTIVITY_THRESHOLD_DAYS, `Must be at most ${MAX_INACTIVITY_THRESHOLD_DAYS} days`),
  checkinGraceDays: z
    .number()
    .int()
    .min(MIN_GRACE_DAYS, `Must be at least ${MIN_GRACE_DAYS} day`)
    .max(MAX_GRACE_DAYS, `Must be at most ${MAX_GRACE_DAYS} days`),
  beneficiaryGraceDays: z
    .number()
    .int()
    .min(MIN_GRACE_DAYS, `Must be at least ${MIN_GRACE_DAYS} day`)
    .max(MAX_GRACE_DAYS, `Must be at most ${MAX_GRACE_DAYS} days`),
});
