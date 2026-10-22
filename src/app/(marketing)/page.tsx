import Link from "next/link";
import {
  Sparkles,
  Users,
  LayoutDashboard,
  ArrowRight,
  UserPlus,
  Wallet,
  MessagesSquare,
  Sprout,
  Landmark,
  CalendarClock,
  ShieldCheck,
  Link2,
  Check,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import { ASSET_TYPES, ASSET_TYPE_LABELS, type AssetType } from "@/lib/constants";
import { AssetTypeIconBadge } from "@/components/ui/asset-type-icon";
import { formatMoney } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";

// ---------------------------------------------------------------------------
// Demo figures — the same seeded portfolio a visitor sees in the live demo
// (demo@assettracker.ke). Labelled as demo data wherever they appear.
// ---------------------------------------------------------------------------

const DEMO_NET_WORTH = 14_754_000;
const DEMO_TOTAL_ASSETS = 14_850_000;
const DEMO_TOTAL_OWED = 96_000;
const DEMO_CROP_EXPENSES = 187_000;

const DEMO_BREAKDOWN: { type: AssetType; value: number; barClass: string }[] = [
  { type: "PROPERTY", value: 5_000_000, barClass: "bg-rose-500" },
  { type: "FARM", value: 4_500_000, barClass: "bg-emerald-500" },
  { type: "LAND", value: 3_000_000, barClass: "bg-orange-500" },
  { type: "BUSINESS", value: 1_200_000, barClass: "bg-violet-500" },
  { type: "LIVESTOCK", value: 900_000, barClass: "bg-amber-500" },
  { type: "STOCK", value: 250_000, barClass: "bg-sky-500" },
];

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: LayoutDashboard,
    title: "Every asset, one dashboard",
    body: "Farms, livestock, a small business, stocks, land, rental property — log them once and see your total net worth update automatically.",
  },
  {
    icon: Landmark,
    title: "Debts counted, not ignored",
    body: "A liability can be tied to the specific asset it belongs to — fertilizer bought on credit for a maize farm is deducted from that farm's net value, not just your overall total. Your net worth is what you own minus what you owe, not a flattering half of the picture.",
  },
  {
    icon: CalendarClock,
    title: "Know what's due next",
    body: "Loan instalments and recurring costs — inputs, feed, labour, school fees — in one list, ordered by date, with anything overdue flagged before it becomes a problem.",
  },
  {
    icon: Sprout,
    title: "Crop cycles, planting to harvest",
    body: "Open a cycle for each season and crop, then record every expense along the way — seed, fertilizer, labour, transport. At harvest you see yield, revenue, and profit per acre, season by season.",
  },
  {
    icon: Sparkles,
    title: "AI guidance built in",
    body: "Ask the AI assistant when to plant a given crop in your county — it answers from a Kenya-specific agro-climatic calendar — whether your portfolio is too concentrated, or what a valuation change actually means.",
  },
  {
    icon: ShieldCheck,
    title: "Beneficiaries & inactivity safety net",
    body: "Nominate the people who should be notified if your account ever goes quiet for an extended period. We check in with you first — they are only contacted if you don't respond.",
  },
];

const LIABILITY_CHIPS = [
  "Bank loan",
  "SACCO loan",
  "Mortgage",
  "Asset finance",
  "Supplier credit",
  "Mobile loan",
  "Tax owed",
  "Other",
];

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: UserPlus,
    title: "Create your account",
    body: "Free, takes under a minute. No credit card required.",
  },
  {
    icon: Wallet,
    title: "Add what you own — and owe",
    body: "Farms, land, livestock, stocks, a business, plus the loans and monthly costs against them.",
  },
  {
    icon: MessagesSquare,
    title: "Get guidance, track the season",
    body: "Ask the AI assistant, book a verified advisor, and follow each crop from planting to harvest.",
  },
];

const SAFETY_NET_POINTS = [
  "You choose who is notified, and in what order — each beneficiary can have their own heir as a fallback.",
  "If you go inactive, we email you a one-click check-in first. Logging in also confirms you're fine.",
  "Acknowledging a notice never grants anyone access to your account or your data — it only stops the escalation.",
];

export default async function Home() {
  const user = await getCurrentUser();
  const signedIn = Boolean(user);

  return (
    <div className="flex-1 flex flex-col">
      {/* ------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--primary) 14%, transparent), transparent), radial-gradient(40% 35% at 85% 20%, color-mix(in srgb, var(--accent) 10%, transparent), transparent)",
          }}
        />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
          <span className="badge bg-primary-light text-primary-dark mx-auto">
            <Sparkles className="size-3.5" />
            Asset tracking built for Kenya
          </span>
          <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight text-foreground text-balance">
            Know what you own. And what you owe.
          </h1>
          <p className="mt-5 text-lg text-muted max-w-2xl mx-auto text-balance leading-relaxed">
            AssetTracker KE brings your farms, cattle, businesses, stocks, land, and
            property together with your loans and monthly costs — so you can see your
            real net worth, what is due next, and track a crop from planting to
            harvest with every expense recorded along the way.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            {signedIn ? (
              <>
                <Link href="/dashboard" className="btn-primary px-6 py-3 text-base">
                  Go to your dashboard
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="/assets/new" className="btn-secondary px-6 py-3 text-base">
                  Add an asset
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="btn-primary px-6 py-3 text-base">
                  Create your free account
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="/login" className="btn-secondary px-6 py-3 text-base">
                  I already have an account
                </Link>
              </>
            )}
          </div>
          <p className="mt-4 text-sm text-muted">
            Free to start · No GIS tools needed — just your phone · Works for one
            farm or a whole portfolio
          </p>
        </div>

        {/* ------------------------------------------ Demo callout + preview */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-16 sm:pb-24">
          {!signedIn && (
            <div className="card p-5 sm:p-6 mb-8 bg-primary-light/40 border-primary/20">
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex-1">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <LogIn className="size-5 text-primary" />
                    Try the live demo first
                  </h2>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">
                    No sign-up needed. Log in with the demo account below and explore
                    a full Kenyan portfolio — the dashboard figures further down this
                    page are that same demo data, labelled as such.
                  </p>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                  <div className="flex flex-col gap-1.5 text-sm font-mono bg-surface border border-border rounded-lg px-4 py-3">
                    <span>
                      <span className="text-muted">Email:</span> demo@assettracker.ke
                    </span>
                    <span>
                      <span className="text-muted">Password:</span> demopass123
                    </span>
                  </div>
                  <Link
                    href="/login"
                    className="btn-primary px-5 py-2.5 text-sm w-full mt-3"
                  >
                    Try the live demo
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Product preview — a demo dashboard, built in pure JSX */}
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-2xl -z-10 rotate-1"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--primary) 16%, transparent), color-mix(in srgb, var(--accent) 12%, transparent))",
              }}
            />
            <div
              className="card overflow-hidden"
              style={{ boxShadow: "var(--shadow-lg)" }}
            >
              <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border bg-surface-raised">
                <p className="font-semibold flex items-center gap-2 min-w-0">
                  <LayoutDashboard className="size-5 text-primary shrink-0" />
                  <span className="truncate">Your dashboard at a glance</span>
                </p>
                <span className="badge bg-accent-light text-accent shrink-0">
                  Demo data
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="label mb-1">Net worth</p>
                    <p className="text-2xl font-bold tracking-tight">
                      {formatMoney(DEMO_NET_WORTH)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Everything you own, minus everything you owe
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="label mb-1">Total assets</p>
                    <p className="text-2xl font-bold tracking-tight">
                      {formatMoney(DEMO_TOTAL_ASSETS)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Across {DEMO_BREAKDOWN.length} categories
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="label mb-1">Total owed</p>
                    <p className="text-2xl font-bold tracking-tight">
                      {formatMoney(DEMO_TOTAL_OWED)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Tied to the asset it belongs to
                    </p>
                  </div>
                </div>

                <h3 className="font-semibold mt-7 mb-4">Breakdown by category</h3>
                <ul className="space-y-3.5">
                  {DEMO_BREAKDOWN.map((row) => (
                    <li key={row.type} className="flex items-center gap-3">
                      <AssetTypeIconBadge type={row.type} size="size-8" />
                      <span className="text-sm font-medium w-24 shrink-0">
                        {ASSET_TYPE_LABELS[row.type]}
                      </span>
                      <span className="flex-1 h-2.5 rounded-full bg-border/60 overflow-hidden">
                        <span
                          className={`block h-full rounded-full ${row.barClass}`}
                          style={{
                            width: `${Math.max(
                              (row.value / DEMO_TOTAL_ASSETS) * 100,
                              2,
                            )}%`,
                          }}
                        />
                      </span>
                      <span className="text-sm font-semibold w-28 text-right shrink-0">
                        {formatMoney(row.value)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="grid gap-4 md:grid-cols-2 mt-7">
                  <div className="rounded-xl border border-warning/30 bg-warning-light/40 p-4">
                    <p className="label mb-2 flex items-center gap-1.5">
                      <CalendarClock className="size-4" />
                      What&rsquo;s due next
                    </p>
                    <p className="font-semibold text-sm">
                      DAP fertilizer (credit)
                    </p>
                    <p className="mt-1 text-xs text-muted flex items-start gap-1.5 leading-relaxed">
                      <Link2 className="size-3.5 shrink-0 mt-px" />
                      Supplier credit — tied to Njoro Maize &amp; Dairy Farm, and
                      deducted from that farm&rsquo;s net value
                    </p>
                    <p className="mt-2.5 font-bold">
                      {formatMoney(DEMO_TOTAL_OWED)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-primary/25 bg-primary-light/40 p-4">
                    <p className="label mb-2 flex items-center gap-1.5">
                      <Sprout className="size-4" />
                      Crop cycle
                    </p>
                    <p className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                      Short Rains 2026 · Maize
                      <span className="badge bg-primary text-primary-foreground">
                        Planted
                      </span>
                    </p>
                    <div
                      className="mt-3 flex items-center gap-1.5"
                      aria-hidden="true"
                    >
                      <span className="h-1.5 flex-1 rounded-full bg-primary" />
                      <span className="h-1.5 flex-1 rounded-full bg-primary/40" />
                      <span className="h-1.5 flex-1 rounded-full bg-border" />
                    </div>
                    <p className="mt-1.5 text-xs text-muted">
                      Planting · Growing · Harvest
                    </p>
                    <p className="mt-2.5 text-sm">
                      Expenses so far{" "}
                      <span className="font-bold">
                        {formatMoney(DEMO_CROP_EXPENSES)}
                      </span>
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-xs text-muted text-center">
                  Example dashboard using demo data — your figures replace these the
                  moment you add your first asset.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Features */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            The parts most trackers skip
          </h2>
          <p className="mt-3 text-muted leading-relaxed">
            Most apps count what you own and stop there. AssetTracker KE counts what
            you owe, what is due, and what each season actually cost you.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-interactive p-6">
              <div className="size-10 rounded-lg bg-primary-light text-primary flex items-center justify-center mb-4">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>

        {/* Advisors strip */}
        <div className="card mt-8 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="size-12 rounded-xl bg-accent-light text-accent flex items-center justify-center shrink-0">
              <Users className="size-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-xl">Real advisors, on demand</h3>
              <p className="mt-1.5 text-sm text-muted leading-relaxed max-w-2xl">
                Browse verified agronomy, livestock, business, investment, real
                estate, legal, and tax advisors. Request a consultation in the app
                and share the exact assets you are asking about, so the advice is
                about your farm and your numbers — not generic tips.
              </p>
            </div>
            <Link
              href={signedIn ? "/advisors" : "/signup"}
              className="btn-secondary px-5 py-2.5 text-sm shrink-0"
            >
              {signedIn ? "Browse advisors" : "Meet the advisors"}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- Assets & liabilities */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-1">Track any kind of asset</h2>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Seven categories, each with fields built for how it actually works —
              acreage and crop for a farm, head count and breed for livestock.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ASSET_TYPES.map((type) => (
                <div
                  key={type}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <AssetTypeIconBadge type={type} size="size-9" />
                  <span className="text-sm font-medium">
                    {ASSET_TYPE_LABELS[type]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-1">Count every kind of debt</h2>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              If it leaves your pocket on a schedule, it belongs here — subtracted
              from your assets so the net worth figure stays honest.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {LIABILITY_CHIPS.map((label) => (
                <span
                  key={label}
                  className="badge bg-warning-light text-warning !text-sm !py-1.5 !px-3.5"
                >
                  <Landmark className="size-3.5" />
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted leading-relaxed flex items-start gap-2">
              <Link2 className="size-4 shrink-0 mt-0.5 text-primary" />
              Tie a liability to the asset it belongs to — supplier credit for
              fertilizer is deducted from that farm&rsquo;s net value, so you can
              see what each asset is really worth after its debts.
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- How it works */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16 sm:pb-20">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-10">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted mt-1.5 leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted mt-10">
          It takes about five minutes to see where you stand.
        </p>
      </section>

      {/* ------------------------------------------------------ Safety net */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="badge bg-primary-light text-primary-dark">
              <ShieldCheck className="size-3.5" />
              Beneficiaries &amp; inactivity safety net
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-balance">
              If you ever go quiet, the right people hear about it
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              Your assets matter to more people than just you. Set up a safety net
              and, if your account is ever inactive for an extended period, we
              check in with you — and only reach out to your beneficiaries if you
              don&rsquo;t respond.
            </p>
            <Link
              href={signedIn ? "/beneficiaries" : "/signup"}
              className="btn-primary px-5 py-2.5 text-sm mt-6"
            >
              {signedIn ? "Review your safety net" : "Set up your safety net"}
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="space-y-4">
            {SAFETY_NET_POINTS.map((point) => (
              <li key={point} className="card p-5 flex items-start gap-3">
                <span className="size-6 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="size-3.5" />
                </span>
                <span className="text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------- Final CTA */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24 w-full">
        <div className="card p-8 sm:p-10 text-center bg-primary text-primary-foreground border-none overflow-hidden relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(50% 60% at 50% 0%, rgb(255 255 255 / 0.14), transparent)",
            }}
          />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-balance">
              Ready to see your whole net worth in one place?
            </h2>
            <p className="mt-2 text-primary-foreground/90">
              Free to start. No credit card required.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              {signedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="btn-secondary !bg-white !text-primary-dark border-none px-6 py-3 text-base inline-flex"
                  >
                    Go to your dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/assets/new"
                    className="btn-ghost !text-primary-foreground px-6 py-3 text-base inline-flex"
                  >
                    Add an asset
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="btn-secondary !bg-white !text-primary-dark border-none px-6 py-3 text-base inline-flex"
                  >
                    Get started
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="btn-ghost !text-primary-foreground px-6 py-3 text-base inline-flex"
                  >
                    Try the live demo
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
