"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm card p-8 text-center">
        <div className="mx-auto size-12 rounded-full bg-danger-light text-danger flex items-center justify-center mb-4">
          <AlertTriangle className="size-5" />
        </div>
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted mt-2">
          An unexpected error occurred. You can try again, or head back to your
          dashboard.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => reset()} className="btn-primary px-4 py-2">
            <RotateCw className="size-4" />
            Try again
          </button>
          <Link href="/dashboard" className="btn-secondary px-4 py-2">
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
