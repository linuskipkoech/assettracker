"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function MarketingNav() {
  const { status } = useSession();

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-lg text-primary">
          AssetTracker<span className="text-foreground"> KE</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {status === "authenticated" ? (
            <Link href="/dashboard" className="btn-primary text-sm px-4 py-2">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground/80 hover:text-foreground hidden sm:block"
              >
                Log in
              </Link>
              <Link href="/signup" className="btn-primary text-sm px-4 py-2">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
