import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signupSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/password";
import { withErrorHandling } from "@/lib/api-utils";
import { isRateLimited, clientKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    if (isRateLimited(`signup:${clientKey(req)}`, { windowMs: 10 * 60 * 1000, max: 10 })) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const input = signupSchema.parse(body);

    const existing = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(input.password);
    const [user] = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        passwordHash,
        phone: input.phone || null,
        county: input.county || null,
      })
      .returning({ id: users.id, name: users.name, email: users.email });

    return NextResponse.json({ user }, { status: 201 });
  });
}
