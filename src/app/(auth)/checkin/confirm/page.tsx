import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { confirmUserCheckinToken } from "@/lib/repositories/escalation";

export default async function UserCheckinConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await confirmUserCheckinToken(token) : { ok: false as const };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm card p-8 text-center animate-fade-in">
        {result.ok ? (
          <>
            <div className="size-12 rounded-full bg-success-light text-success flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="size-6" />
            </div>
            <h1 className="text-xl font-bold mb-1">You&apos;re confirmed active</h1>
            <p className="text-sm text-muted">
              Thanks for checking in. Your account is marked active again and no beneficiaries will be
              contacted.
            </p>
          </>
        ) : (
          <>
            <div className="size-12 rounded-full bg-danger-light text-danger flex items-center justify-center mx-auto mb-4">
              <XCircle className="size-6" />
            </div>
            <h1 className="text-xl font-bold mb-1">This link isn&apos;t valid</h1>
            <p className="text-sm text-muted">
              It may have already been used, or expired. If you&apos;re still active, just log in — that
              confirms it too.
            </p>
          </>
        )}
        <Link href="/login" className="btn-primary px-4 py-2 mt-6 inline-flex">
          Go to login
        </Link>
      </div>
    </div>
  );
}
