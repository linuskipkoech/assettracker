import Link from "next/link";
import { Sprout } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-bold text-lg text-primary inline-flex items-center gap-2"
            >
              <span className="size-8 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                <Sprout className="size-4.5" />
              </span>
              <span>
                AssetTracker<span className="text-foreground"> KE</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted leading-relaxed max-w-xs">
              Know what you own. And what you owe.
            </p>
          </div>

          {/* Product */}
          <nav aria-label="Product">
            <p className="label mb-3">Product</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="text-muted hover:text-foreground">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-muted hover:text-foreground">
                  Sign up
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted hover:text-foreground">
                  Try the demo
                </Link>
              </li>
            </ul>
          </nav>

          {/* Built for Kenya */}
          <div>
            <p className="label mb-3">Built for Kenya</p>
            <p className="text-sm text-muted leading-relaxed">
              Made for the way Kenyans actually build wealth — farms that run on
              the long rains and the short rains, SACCO loans and supplier
              credit, land, livestock, a small business, and a few shares on the
              side, all counted in one place.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted">© 2026 AssetTracker KE</p>
          <p className="text-sm text-muted">
            Track every asset. Count every debt.
          </p>
        </div>
      </div>
    </footer>
  );
}
