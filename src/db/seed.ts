/**
 * Populates the local database with a demo account, a spread of sample
 * assets, and a couple of advisor profiles, so a fresh checkout has
 * something to look at immediately. Safe to re-run — it skips creating the
 * demo user if it already exists rather than erroring or duplicating data.
 *
 * Run with: npm run db:seed
 */
import { db } from "./index";
import {
  users,
  assets,
  valuationHistory,
  farmDetails,
  livestockDetails,
  businessDetails,
  stockDetails,
  landDetails,
  propertyDetails,
  advisors,
  liabilities,
  cropCycles,
  cropExpenses,
  beneficiaries,
} from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/password";

const DEMO_EMAIL = "demo@assettracker.ke";
const DEMO_PASSWORD = "demopass123";

async function main() {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, DEMO_EMAIL),
  });
  if (existing) {
    console.log(`Demo user already exists (${DEMO_EMAIL}) — skipping seed.`);
    return;
  }

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const [demoUser] = await db
    .insert(users)
    .values({
      name: "Amina Wanjiru",
      email: DEMO_EMAIL,
      passwordHash,
      county: "Nakuru",
      phone: "+254700000000",
    })
    .returning();

  const [farm] = await db
    .insert(assets)
    .values({
      userId: demoUser.id,
      type: "FARM",
      name: "Njoro Maize & Dairy Farm",
      description: "12-acre mixed farm growing maize with a small dairy herd.",
      currentValue: 4_500_000,
      county: "Nakuru",
      location: "Njoro",
    })
    .returning();
  await db.insert(farmDetails).values({
    assetId: farm.id,
    sizeAcres: 12,
    primaryCrop: "Maize",
    secondaryCrop: "Beans",
    soilType: "Volcanic loam",
    irrigation: false,
  });
  await db.insert(valuationHistory).values({ assetId: farm.id, value: 4_500_000, note: "Initial value" });

  const [cattle] = await db
    .insert(assets)
    .values({
      userId: demoUser.id,
      type: "LIVESTOCK",
      name: "Dairy Herd",
      currentValue: 900_000,
      county: "Nakuru",
      location: "Njoro",
    })
    .returning();
  await db.insert(livestockDetails).values({
    assetId: cattle.id,
    species: "Cattle",
    breed: "Friesian",
    headCount: 8,
    averageAgeMonths: 30,
    purpose: "dairy",
  });
  await db.insert(valuationHistory).values({ assetId: cattle.id, value: 900_000, note: "Initial value" });

  const [business] = await db
    .insert(assets)
    .values({
      userId: demoUser.id,
      type: "BUSINESS",
      name: "Wanjiru Agrovet Shop",
      currentValue: 1_200_000,
      county: "Nakuru",
      location: "Njoro town",
    })
    .returning();
  await db.insert(businessDetails).values({
    assetId: business.id,
    industry: "Agricultural inputs retail",
    ownershipPercent: 100,
    monthlyRevenue: 350_000,
    monthlyExpenses: 260_000,
    employeeCount: 2,
  });
  await db.insert(valuationHistory).values({ assetId: business.id, value: 1_200_000, note: "Initial value" });

  const [stock] = await db
    .insert(assets)
    .values({
      userId: demoUser.id,
      type: "STOCK",
      name: "Safaricom PLC shares",
      currentValue: 250_000,
    })
    .returning();
  await db.insert(stockDetails).values({
    assetId: stock.id,
    tickerSymbol: "SCOM",
    exchange: "NSE",
    quantity: 10_000,
    pricePerUnit: 25,
  });
  await db.insert(valuationHistory).values({ assetId: stock.id, value: 250_000, note: "Initial value" });

  const [land] = await db
    .insert(assets)
    .values({
      userId: demoUser.id,
      type: "LAND",
      name: "Naivasha Plot",
      currentValue: 3_000_000,
      county: "Nakuru",
      location: "Naivasha",
    })
    .returning();
  await db.insert(landDetails).values({
    assetId: land.id,
    sizeAcres: 2,
    titleDeedNumber: "NKR/NJRO/1234",
    zoning: "Agricultural",
  });
  await db.insert(valuationHistory).values({ assetId: land.id, value: 3_000_000, note: "Initial value" });

  const [property] = await db
    .insert(assets)
    .values({
      userId: demoUser.id,
      type: "PROPERTY",
      name: "Rental Bedsitters, Njoro",
      currentValue: 5_000_000,
      county: "Nakuru",
      location: "Njoro",
    })
    .returning();
  await db.insert(propertyDetails).values({
    assetId: property.id,
    propertyType: "rental",
    bedrooms: 6,
    monthlyRentalIncome: 60_000,
    occupied: true,
  });
  await db.insert(valuationHistory).values({ assetId: property.id, value: 5_000_000, note: "Initial value" });

  // --- The farm's story: a crop cycle, its expenses, and credit tied to it --
  // Short Rains 2026 maize, still growing. The DAP fertilizer was taken on
  // agrovet credit: it is BOTH an expense of this season AND a liability
  // tied to the farm — the same shilling seen from both sides, deducted
  // once (as a liability) in net worth. Figures match the marketing
  // homepage's demo preview: assets 14,850,000 - owed 96,000 = 14,754,000.
  const [dapLiability] = await db
    .insert(liabilities)
    .values({
      userId: demoUser.id,
      assetId: farm.id,
      name: "DAP fertilizer (credit)",
      type: "OTHER",
      frequency: "ONE_TIME",
      amount: 96_000,
      outstandingBalance: 96_000,
      nextDueDate: new Date("2027-02-12"),
      notes: "Supplier credit from Wanjiru Agrovet — payable after the short-rains harvest.",
      status: "ACTIVE",
    })
    .returning();

  const [shortRains] = await db
    .insert(cropCycles)
    .values({
      userId: demoUser.id,
      assetId: farm.id,
      name: "Short Rains 2026 — Maize",
      crop: "Maize",
      status: "GROWING",
      acreage: 8,
      plantingDate: new Date("2026-10-12"),
      expectedHarvestDate: new Date("2027-02-12"),
    })
    .returning();
  await db.insert(cropExpenses).values([
    {
      userId: demoUser.id,
      cycleId: shortRains.id,
      category: "LAND_PREP",
      description: "Ploughing & harrowing — tractor hire",
      amount: 38_000,
      expenseDate: new Date("2026-10-05"),
    },
    {
      userId: demoUser.id,
      cycleId: shortRains.id,
      category: "SEEDS",
      description: "Certified maize seed — 40kg (DH04)",
      amount: 53_000,
      expenseDate: new Date("2026-10-12"),
    },
    {
      userId: demoUser.id,
      cycleId: shortRains.id,
      category: "FERTILIZER",
      description: "DAP fertilizer — 10 bags from the agrovet (on credit)",
      amount: 96_000,
      expenseDate: new Date("2026-10-14"),
      liabilityId: dapLiability.id,
    },
  ]);

  // Last season, closed out: the payoff view — revenue against every cost.
  const [longRains] = await db
    .insert(cropCycles)
    .values({
      userId: demoUser.id,
      assetId: farm.id,
      name: "Long Rains 2026 — Maize",
      crop: "Maize",
      status: "SOLD",
      acreage: 8,
      plantingDate: new Date("2026-03-16"),
      expectedHarvestDate: new Date("2026-08-10"),
      harvestedDate: new Date("2026-08-18"),
      harvestQuantity: 96,
      harvestUnit: "90kg bags",
      saleRevenue: 780_000,
    })
    .returning();
  await db.insert(cropExpenses).values([
    { userId: demoUser.id, cycleId: longRains.id, category: "LAND_PREP", description: "Ploughing & harrowing", amount: 40_000, expenseDate: new Date("2026-03-10") },
    { userId: demoUser.id, cycleId: longRains.id, category: "SEEDS", description: "Certified maize seed — 40kg", amount: 48_000, expenseDate: new Date("2026-03-16") },
    { userId: demoUser.id, cycleId: longRains.id, category: "FERTILIZER", description: "DAP + CAN top dressing", amount: 110_000, expenseDate: new Date("2026-03-20") },
    { userId: demoUser.id, cycleId: longRains.id, category: "PESTICIDE", description: "Fall armyworm spray", amount: 18_000, expenseDate: new Date("2026-05-06") },
    { userId: demoUser.id, cycleId: longRains.id, category: "LABOUR", description: "Weeding (x2) + harvest casuals", amount: 64_000, expenseDate: new Date("2026-06-02") },
    { userId: demoUser.id, cycleId: longRains.id, category: "TRANSPORT", description: "Transport to Njoro cereal store", amount: 25_000, expenseDate: new Date("2026-08-19") },
  ]);

  // One beneficiary, so the safety net isn't an empty page in the demo.
  await db.insert(beneficiaries).values({
    userId: demoUser.id,
    name: "Peter Wanjiru",
    relationship: "Sibling",
    email: "peter.wanjiru@example.com",
    phone: "+254700000001",
    priority: 0,
  });

  // A couple of advisor accounts so the directory isn't empty.
  const advisorPasswordHash = await hashPassword("advisorpass123");
  const [agronomist] = await db
    .insert(users)
    .values({
      name: "Dr. James Kariuki",
      email: "james.kariuki@example.com",
      passwordHash: advisorPasswordHash,
      role: "ADVISOR",
      county: "Nakuru",
    })
    .returning();
  await db.insert(advisors).values({
    userId: agronomist.id,
    specialty: "Agronomy",
    bio: "PhD in Agronomy, 18 years advising smallholder and commercial farms across the Rift Valley on crop selection, soil health, and irrigation.",
    yearsExperience: 18,
    hourlyRateKes: 3500,
    county: "Nakuru",
    verified: true,
  });

  const [investmentAdvisor] = await db
    .insert(users)
    .values({
      name: "Grace Mumbi, CFA",
      email: "grace.mumbi@example.com",
      passwordHash: advisorPasswordHash,
      role: "ADVISOR",
      county: "Nairobi",
    })
    .returning();
  await db.insert(advisors).values({
    userId: investmentAdvisor.id,
    specialty: "Investments",
    bio: "CFA charterholder specializing in NSE equities, unit trusts, and diversification strategies for individuals building multi-asset portfolios.",
    yearsExperience: 10,
    hourlyRateKes: 5000,
    county: "Nairobi",
    verified: true,
  });

  console.log("Seed complete.");
  console.log(`Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
