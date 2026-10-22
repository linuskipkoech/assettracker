import { TrendingDown, Landmark, CreditCard } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listLiabilitiesForUser, summarizeLiabilities } from "@/lib/repositories/liabilities";
import { listAssetsForUser } from "@/lib/repositories/assets";
import { formatMoney } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { LiabilityList, type LiabilityItem } from "@/components/liabilities/liability-list";

export default async function LiabilitiesPage() {
  const user = await requireUser();
  const [liabilities, userAssets] = await Promise.all([
    listLiabilitiesForUser(user.id),
    listAssetsForUser(user.id),
  ]);

  const summary = summarizeLiabilities(liabilities);
  const assetNameById = new Map(userAssets.map((a) => [a.id, a.name]));
  const assetOptions = userAssets.map((a) => ({ id: a.id, name: a.name }));

  const items: LiabilityItem[] = liabilities.map((l) => ({
    id: l.id,
    name: l.name,
    type: l.type,
    frequency: l.frequency,
    amount: l.amount,
    currency: l.currency,
    outstandingBalance: l.outstandingBalance,
    interestRatePercent: l.interestRatePercent,
    nextDueDate: l.nextDueDate,
    notes: l.notes,
    status: l.status,
    assetId: l.assetId,
    assetName: l.assetId ? assetNameById.get(l.assetId) ?? null : null,
  }));

  return (
    <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <PageHeader
        title="Liabilities & outgoings"
        description="Anything with money going out — loans, bills, subscriptions. Link one to an asset (like a mortgage on a property) or leave it standalone."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Landmark className="size-4.5" />}
          label="Total owed (active)"
          value={formatMoney(summary.totalOutstandingBalance)}
        />
        <StatCard
          icon={<TrendingDown className="size-4.5" />}
          label="Monthly outgoings (active)"
          value={formatMoney(summary.totalMonthlyOutgoings)}
        />
        <StatCard icon={<CreditCard className="size-4.5" />} label="Active liabilities" value={String(summary.activeCount)} />
      </div>

      <LiabilityList items={items} assetOptions={assetOptions} />
    </div>
  );
}
