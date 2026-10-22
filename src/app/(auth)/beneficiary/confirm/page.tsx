import Link from "next/link";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { confirmBeneficiaryAckToken } from "@/lib/repositories/escalation";

export default async function BeneficiaryConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await confirmBeneficiaryAckToken(token) : { ok: false as const };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm card p-8 text-center animate-fade-in">
        {result.ok ? (
          <>
            <div className="size-12 rounded-full bg-success-light text-success flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="size-6" />
            </div>
            <h1 className="text-xl font-bold mb-1">Thanks for confirming</h1>
            <p className="text-sm text-muted mb-4">
              We&apos;ve recorded that you received this notice. No one else needs to be contacted.
            </p>
            <div className="card p-3 bg-info-light border-info/20 text-xs text-left flex items-start gap-2">
              <ShieldCheck className="size-4 text-info shrink-0 mt-0.5" />
              <span>
                This only confirms you saw the message — it does not give you access to anyone&apos;s
                account or asset data. Please reach out to them directly.
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="size-12 rounded-full bg-danger-light text-danger flex items-center justify-center mx-auto mb-4">
              <XCircle className="size-6" />
            </div>
            <h1 className="text-xl font-bold mb-1">This link isn&apos;t valid</h1>
            <p className="text-sm text-muted">
              It may have already been used, or expired.
            </p>
          </>
        )}
        <Link href="/" className="btn-secondary px-4 py-2 mt-6 inline-flex">
          Back to AssetTracker KE
        </Link>
      </div>
    </div>
  );
}
