import { db } from "@/db";
import { advisors, users, consultationRequests, assets } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function listAdvisors(filters?: {
  specialty?: string;
  county?: string;
}) {
  const rows = await db
    .select({
      id: advisors.id,
      userId: advisors.userId,
      specialty: advisors.specialty,
      bio: advisors.bio,
      yearsExperience: advisors.yearsExperience,
      hourlyRateKes: advisors.hourlyRateKes,
      county: advisors.county,
      verified: advisors.verified,
      createdAt: advisors.createdAt,
      name: users.name,
      email: users.email,
    })
    .from(advisors)
    .innerJoin(users, eq(advisors.userId, users.id))
    .orderBy(desc(advisors.verified), desc(advisors.createdAt));

  return rows.filter((row) => {
    if (filters?.specialty && row.specialty !== filters.specialty) return false;
    if (filters?.county && row.county !== filters.county) return false;
    return true;
  });
}

export async function getAdvisorById(advisorId: string) {
  const rows = await db
    .select({
      id: advisors.id,
      userId: advisors.userId,
      specialty: advisors.specialty,
      bio: advisors.bio,
      yearsExperience: advisors.yearsExperience,
      hourlyRateKes: advisors.hourlyRateKes,
      county: advisors.county,
      verified: advisors.verified,
      createdAt: advisors.createdAt,
      name: users.name,
      email: users.email,
    })
    .from(advisors)
    .innerJoin(users, eq(advisors.userId, users.id))
    .where(eq(advisors.id, advisorId));
  return rows[0] ?? null;
}

export async function getAdvisorProfileForUser(userId: string) {
  const rows = await db.select().from(advisors).where(eq(advisors.userId, userId));
  return rows[0] ?? null;
}

export async function upsertAdvisorProfile(
  userId: string,
  data: {
    specialty: string;
    bio: string;
    yearsExperience?: number;
    hourlyRateKes?: number;
    county?: string;
  },
) {
  const existing = await getAdvisorProfileForUser(userId);
  if (existing) {
    const [updated] = await db
      .update(advisors)
      .set({
        specialty: data.specialty,
        bio: data.bio,
        yearsExperience: data.yearsExperience ?? null,
        hourlyRateKes: data.hourlyRateKes ?? null,
        county: data.county || null,
      })
      .where(eq(advisors.userId, userId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(advisors)
    .values({
      userId,
      specialty: data.specialty,
      bio: data.bio,
      yearsExperience: data.yearsExperience ?? null,
      hourlyRateKes: data.hourlyRateKes ?? null,
      county: data.county || null,
    })
    .returning();

  await db.update(users).set({ role: "ADVISOR" }).where(eq(users.id, userId));

  return created;
}

// ---------------------------------------------------------------------------
// Consultation requests
// ---------------------------------------------------------------------------

export async function createConsultationRequest(
  userId: string,
  input: {
    advisorId: string;
    assetId?: string;
    topic: string;
    message: string;
    preferredDate?: Date;
  },
) {
  const [request] = await db
    .insert(consultationRequests)
    .values({
      userId,
      advisorId: input.advisorId,
      assetId: input.assetId || null,
      topic: input.topic,
      message: input.message,
      preferredDate: input.preferredDate ?? null,
    })
    .returning();
  return request;
}

export async function listConsultationsForRequester(userId: string) {
  const rows = await db
    .select({
      id: consultationRequests.id,
      topic: consultationRequests.topic,
      message: consultationRequests.message,
      status: consultationRequests.status,
      preferredDate: consultationRequests.preferredDate,
      advisorNote: consultationRequests.advisorNote,
      createdAt: consultationRequests.createdAt,
      updatedAt: consultationRequests.updatedAt,
      advisorId: advisors.id,
      advisorName: users.name,
      advisorSpecialty: advisors.specialty,
      assetName: assets.name,
    })
    .from(consultationRequests)
    .innerJoin(advisors, eq(consultationRequests.advisorId, advisors.id))
    .innerJoin(users, eq(advisors.userId, users.id))
    .leftJoin(assets, eq(consultationRequests.assetId, assets.id))
    .where(eq(consultationRequests.userId, userId))
    .orderBy(desc(consultationRequests.createdAt));
  return rows;
}

export async function listConsultationsForAdvisor(advisorUserId: string) {
  const advisorProfile = await getAdvisorProfileForUser(advisorUserId);
  if (!advisorProfile) return [];

  const rows = await db
    .select({
      id: consultationRequests.id,
      topic: consultationRequests.topic,
      message: consultationRequests.message,
      status: consultationRequests.status,
      preferredDate: consultationRequests.preferredDate,
      advisorNote: consultationRequests.advisorNote,
      createdAt: consultationRequests.createdAt,
      updatedAt: consultationRequests.updatedAt,
      requesterName: users.name,
      requesterEmail: users.email,
      assetName: assets.name,
    })
    .from(consultationRequests)
    .innerJoin(users, eq(consultationRequests.userId, users.id))
    .leftJoin(assets, eq(consultationRequests.assetId, assets.id))
    .where(eq(consultationRequests.advisorId, advisorProfile.id))
    .orderBy(desc(consultationRequests.createdAt));
  return rows;
}

export async function updateConsultationStatus(
  consultationId: string,
  advisorUserId: string,
  status: string,
  advisorNote?: string,
) {
  const advisorProfile = await getAdvisorProfileForUser(advisorUserId);
  if (!advisorProfile) return null;

  const existing = await db.query.consultationRequests.findFirst({
    where: and(
      eq(consultationRequests.id, consultationId),
      eq(consultationRequests.advisorId, advisorProfile.id),
    ),
  });
  if (!existing) return null;

  const [updated] = await db
    .update(consultationRequests)
    .set({ status, advisorNote: advisorNote || null, updatedAt: new Date() })
    .where(eq(consultationRequests.id, consultationId))
    .returning();
  return updated;
}
