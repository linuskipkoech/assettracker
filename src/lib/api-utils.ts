import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UnauthorizedError } from "./session";

/**
 * Wraps an API route body so every route gets consistent error handling:
 * zod validation errors -> 400, UnauthorizedError -> 401, anything else -> 500
 * (logged server-side, never leaked to the client).
 */
export function withErrorHandling(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  return handler().catch((error) => {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", issues: error.issues },
        { status: 400 },
      );
    }
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  });
}
