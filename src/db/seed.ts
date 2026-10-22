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
