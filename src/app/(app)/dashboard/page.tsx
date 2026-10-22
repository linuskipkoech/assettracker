import Link from "next/link";
import { Wallet, Landmark, TrendingDown, Plus, Sparkles, Users, ArrowRight, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listAssetsForUser, summarizeNetWorth } from "@/lib/repositories/assets";
import { listLiabilitiesForUser, summarizeLiabilities } from "@/lib/repositories/liabilities";
import { listBeneficiariesForUser } from "@/lib/repositories/beneficiaries";
import { ASSET_TYPE_LABELS, type AssetType } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";
import { NetWorthChart } from "@/components/net-worth-chart";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { AssetTypeIconBadge } from "@/components/ui/asset-type-icon";

export default async function DashboardPage() {
  const user = await requireUser();
  const [assets, liabilityRows, beneficiaries] = await Promise.all([
    listAssetsForUser(user.id),
    listLiabilitiesForUser(user.id),
    listBeneficiariesForUser(user.id),
  ]);
  const summary = summarizeNetWorth(assets);
  const liabilitiesSummary = summarizeLiabilities(liabilityRows);
  const netWorth = summary.total - liabilitiesSummary.totalOutstandingBalance;
  const recent = assets.slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      <PageHeader
        title={`Welcome back${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Here's where things stand today."
        actions={
          <Link href="/assets/new" className="btn-primary px-4 py-2">
            <Plus className="size-4" />
            Add an asset
          </Link>
        }
      />

      {beneficiaries.length === 0 && (
        <div className="card p-4 flex items-center gap-3 bg-warning-light border-warning/20">
          <ShieldCheck className="size-5 text-warning shrink-0" />
          <p className="text-sm flex-1">
            You haven&apos;t set up a safety net yet — add beneficiaries so someone is notified if your
            account ever goes inactive for an extended period.
          </p>
          <Link href="/beneficiaries" className="btn-secondary px-3 py-1.5 text-sm shrink-0 !bg-white dark:!bg-surface">
            Set up now
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Wallet className="size-4.5" />} label="Net worth" value={formatMoney(netWorth)} />
        <StatCard icon={<Wallet className="size-4.5" />} label="Total assets" value={formatMoney(summary.total)} />
        <StatCard
          icon={<Landmark className="size-4.5" />}
          label="Total owed"
          value={formatMoney(liabilitiesSummary.totalOutstandingBalance)}
        />
        <StatCard
          icon={<TrendingDown className="size-4.5" />}
          label="Monthly outgoings"
          value={formatMoney(liabilitiesSummary.totalMonthlyOutgoings)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-semibold mb-4">Breakdown by category</h2>
          <NetWorthChart byType={summary.byType} />
        </div>

        <div className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recently updated</h2>
            <Link href="/assets" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={<Wallet className="size-5" />}
              title="No assets yet"
              description="Add your first asset to start tracking your net worth."
              action={
                <Link href="/assets/new" className="btn-primary px-4 py-2 mt-1">
                  <Plus className="size-4" />
                  Add your first asset
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-border -mx-2">
              {recent.map((asset) => (
                <li key={asset.id}>
                  <Link
                    href={`/assets/${asset.id}`}
                    className="flex items-center gap-3 py-3 px-2 hover:bg-black/[.02] dark:hover:bg-white/[.03] rounded-md transition-colors"
                  >
                    <AssetTypeIconBadge type={asset.type as AssetType} size="size-10" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{asset.name}</p>
                      <p className="text-xs text-muted truncate">
                        {ASSET_TYPE_LABELS[asset.type as AssetType] ?? asset.type}
                        {asset.county ? ` · ${asset.county}` : ""} · Updated{" "}
                        {formatDate(asset.updatedAt)}
                      </p>
                    </div>
                    <p className="font-semibold shrink-0">{formatMoney(asset.currentValue, asset.currency)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-6 sm:p-8 bg-primary-light border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-semibold text-primary-dark">Not sure what to do next?</h2>
            <p className="text-sm text-primary-dark/80 mt-1">
              Ask the AI assistant for guidance, or book a professional advisor for
              advice tailored to your situation.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/assistant" className="btn-secondary px-4 py-2 !bg-white dark:!bg-surface">
              <Sparkles className="size-4" />
              Ask the AI Assistant
            </Link>
            <Link href="/advisors" className="btn-primary px-4 py-2">
              <Users className="size-4" />
              Browse advisors
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
