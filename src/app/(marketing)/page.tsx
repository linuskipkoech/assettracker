import Link from "next/link";
import {
  Sparkles,
  Users,
  LayoutDashboard,
  ArrowRight,
  UserPlus,
  Wallet,
  MessagesSquare,
} from "lucide-react";
import { ASSET_TYPES, ASSET_TYPE_LABELS, type AssetType } from "@/lib/constants";
import { AssetTypeIconBadge } from "@/components/ui/asset-type-icon";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Every asset, one dashboard",
    body: "Farms, livestock, a small business, stocks, land, rental property — log them once and see your total net worth update automatically.",
  },
  {
    icon: Sparkles,
    title: "AI guidance built in",
    body: "Ask the AI assistant when to plant a given crop in your county, whether your portfolio is too concentrated, or what a valuation change means.",
  },
  {
    icon: Users,
    title: "Real advisors, on demand",
    body: "Browse verified agronomy, business, investment, and legal advisors and request a consultation directly from the app.",
  },
];

const STEPS = [
  { icon: UserPlus, title: "Create your account", body: "Free, takes under a minute." },
  { icon: Wallet, title: "Add what you own", body: "Farms, land, livestock, stocks, a business — whatever applies." },
  { icon: MessagesSquare, title: "Get guidance", body: "Ask the AI assistant or book a verified advisor." },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--primary) 12%, transparent), transparent)",
          }}
        />
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28 text-center">
          <span className="badge bg-primary-light text-primary-dark mx-auto">
            <Sparkles className="size-3.5" />
            AI-powered asset tracking for Kenya
          </span>
          <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight text-foreground text-balance">
            All your assets. One place. Real advice.
          </h1>
          <p className="mt-5 text-lg text-muted max-w-2xl mx-auto text-balance">
            AssetTracker KE brings your farms, cattle, businesses, stocks, land, and
            property into a single dashboard — with an AI assistant and a network of
            professional advisors to help you make the most of what you own.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">
              Create your free account
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-base">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 grid gap-6 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="card card-interactive p-6">
            <div className="size-10 rounded-lg bg-primary-light text-primary flex items-center justify-center mb-4">
              <f.icon className="size-5" />
            </div>
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-1">Track any kind of asset</h2>
          <p className="text-sm text-muted mb-6">Six categories, each with fields built for how they actually work.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ASSET_TYPES.filter((t) => t !== "OTHER").map((type) => (
              <div
                key={type}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <AssetTypeIconBadge type={type as AssetType} size="size-9" />
                <span className="text-sm font-medium">{ASSET_TYPE_LABELS[type as AssetType]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-xl font-semibold text-center mb-10">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted mt-1.5">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="card p-10 text-center bg-primary text-primary-foreground border-none">
          <h2 className="text-2xl font-bold">Ready to see your whole net worth in one place?</h2>
          <p className="mt-2 text-primary-foreground/90">Free to start. No credit card required.</p>
          <Link
            href="/signup"
            className="btn-secondary !bg-white !text-primary-dark border-none mt-6 px-6 py-3 text-base inline-flex"
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
