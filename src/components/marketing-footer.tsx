import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">AssetTracker KE</span> — built for
          Kenyan farms, businesses, and portfolios.
        </p>
        <div className="flex items-center gap-6 text-sm text-muted">
          <Link href="/login" className="hover:text-foreground">Log in</Link>
          <Link href="/signup" className="hover:text-foreground">Sign up</Link>
          <Link href="/advisors" className="hover:text-foreground">Advisors</Link>
        </div>
      </div>
    </footer>
  );
}
