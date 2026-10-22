import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Sparkles, MapPin, Sprout, ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAssetForUser } from "@/lib/repositories/assets";
import {
  listLiabilitiesForAsset,
  summarizeLiabilities,
} from "@/lib/repositories/liabilities";
import {
  listCropCyclesForUser,
  summarizeCropCycle,
} from "@/lib/repositories/crop-cycles";
import { Badge } from "@/components/ui/badge";
import { CreateCropCycleSection } from "@/components/crop-cycles/crop-cycle-ui";
import {
  ASSET_TYPE_LABELS,
  CROP_CYCLE_STATUS_LABELS,
  type AssetType,
  type CropCycleStatus,
} from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";
import { AssetTypeIconBadge } from "@/components/ui/asset-type-icon";
import {
  AddValuationForm,
  DeleteAssetButton,
  ValuationHistoryList,
} from "@/components/asset-detail-actions";
import { LiabilityList, type LiabilityItem } from "@/components/liabilities/liability-list";

const FIELD_LABELS: Record<string, string> = {
  sizeAcres: "Size (acres)",
  primaryCrop: "Primary crop",
  secondaryCrop: "Secondary crop",
  soilType: "Soil type",
  irrigation: "Irrigation",
  species: "Species",
  breed: "Breed",
  headCount: "Head count",
  averageAgeMonths: "Average age (months)",
  purpose: "Purpose",
  industry: "Industry",
  ownershipPercent: "Ownership (%)",
  monthlyRevenue: "Monthly revenue",
  monthlyExpenses: "Monthly expenses",
  employeeCount: "Employees",
  tickerSymbol: "Ticker symbol",
  exchange: "Exchange",
  quantity: "Quantity",
  pricePerUnit: "Price per unit",
  titleDeedNumber: "Title deed number",
  zoning: "Zoning",
  propertyType: "Property type",
  bedrooms: "Bedrooms",
  monthlyRentalIncome: "Monthly rental income",
  occupied: "Occupied",
};

function formatFieldValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (key.toLowerCase().includes("revenue") || key.toLowerCase().includes("income") || key.toLowerCase().includes("expense") || key === "pricePerUnit") {
    return formatMoney(Number(value));
  }
  return String(value);
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const asset = await getAssetForUser(id, user.id);
  if (!asset) notFound();

  const liabilities = await listLiabilitiesForAsset(asset.id, user.id);
  const linkedSummary = summarizeLiabilities(liabilities);
  // What this asset is worth once what is owed against it is deducted.
  // Overall net worth subtracts every liability exactly once (on the
  // dashboard) — this per-asset figure is the same deduction, shown where
  // it belongs, never an additional one.
  const netAssetValue = asset.currentValue - linkedSummary.totalOutstandingBalance;
  const cropCycles =
    asset.type === "FARM" ? await listCropCyclesForUser(user.id, asset.id) : [];
  const liabilityItems: LiabilityItem[] = liabilities.map((l) => ({
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
  }));

  const detailEntries = asset.details
    ? Object.entries(asset.details).filter(([key]) => key !== "id" && key !== "assetId")
    : [];

  return (
    <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <AssetTypeIconBadge type={asset.type as AssetType} size="size-12" />
          <div>
            <p className="text-sm text-primary font-medium">
              {ASSET_TYPE_LABELS[asset.type as AssetType] ?? asset.type}
            </p>
            <h1 className="text-2xl font-bold">{asset.name}</h1>
            <p className="text-sm text-muted mt-1 flex items-center gap-1">
              <MapPin className="size-3.5" />
              {[asset.location, asset.county].filter(Boolean).join(", ") || "No location set"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/assets/${asset.id}/edit`} className="btn-secondary px-4 py-2">
            <Pencil className="size-4" />
            Edit
          </Link>
          <Link
            href={`/advisors?assetId=${asset.id}`}
            className="btn-primary px-4 py-2"
          >
            <Sparkles className="size-4" />
            Get advice
          </Link>
        </div>
      </div>

      <div className="card p-6">
        {linkedSummary.totalOutstandingBalance > 0 || linkedSummary.totalMonthlyOutgoings > 0 ? (
          <>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="label mb-1">Net value in this asset</p>
                <p className="text-3xl font-bold">
                  {formatMoney(netAssetValue, asset.currency)}
                </p>
                <p className="text-xs text-muted mt-1">
                  What&apos;s left of this asset&apos;s value after what&apos;s owed against
                  it — already counted once in your overall net worth.
                </p>
              </div>
            </div>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <dt className="text-muted">Current value</dt>
                <dd className="font-medium">{formatMoney(asset.currentValue, asset.currency)}</dd>
              </div>
              {linkedSummary.totalOutstandingBalance > 0 && (
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted">
                    Less: owed against this asset ({linkedSummary.activeCount} active)
                  </dt>
                  <dd className="font-medium text-danger">
                    −{formatMoney(linkedSummary.totalOutstandingBalance, asset.currency)}
                  </dd>
                </div>
              )}
              {linkedSummary.totalMonthlyOutgoings > 0 && (
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted">Going out against this asset</dt>
                  <dd className="font-medium">
                    {formatMoney(linkedSummary.totalMonthlyOutgoings, asset.currency)} / month
                  </dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          <>
            <p className="label mb-1">Current value</p>
            <p className="text-3xl font-bold">{formatMoney(asset.currentValue, asset.currency)}</p>
          </>
        )}
        {asset.acquisitionValue != null && (
          <p className="text-sm text-muted mt-2">
            Acquired for {formatMoney(asset.acquisitionValue, asset.currency)}
            {asset.acquisitionDate ? ` on ${formatDate(asset.acquisitionDate)}` : ""}
          </p>
        )}
        {asset.description && <p className="text-sm mt-4">{asset.description}</p>}
      </div>

      {detailEntries.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Details</h2>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {detailEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-border pb-2 text-sm">
                <dt className="text-muted">{FIELD_LABELS[key] ?? key}</dt>
                <dd className="font-medium">{formatFieldValue(key, value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold">Valuation history</h2>
        <ValuationHistoryList history={asset.history} />
        <div className="pt-2 border-t border-border">
          <AddValuationForm assetId={asset.id} currency={asset.currency} />
        </div>
      </div>

      {asset.type === "FARM" && (
        <div className="card p-6 space-y-4">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <Sprout className="size-5 text-primary" />
              Crop cycles on this farm
            </h2>
            <p className="text-sm text-muted mt-1">
              Track a crop from planting to harvest — record every expense along the way
              and see the season&apos;s true cost, revenue, and profit per acre.
            </p>
          </div>
          {cropCycles.length > 0 && (
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
              {cropCycles.map((cycle) => {
                const summary = summarizeCropCycle(cycle, cycle.expenses);
                return (
                  <Link
                    key={cycle.id}
                    href={`/crop-cycles/${cycle.id}`}
                    className="flex items-center gap-3 p-3.5 hover:bg-black/[.02] dark:hover:bg-white/[.03] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate flex items-center gap-2">
                        {cycle.name}
                        <Badge
                          tone={
                            cycle.status === "SOLD"
                              ? "success"
                              : cycle.status === "HARVESTED"
                                ? "warning"
                                : cycle.status === "GROWING"
                                  ? "primary"
                                  : "default"
                          }
                        >
                          {CROP_CYCLE_STATUS_LABELS[cycle.status as CropCycleStatus] ??
                            cycle.status}
                        </Badge>
                      </p>
                      <p className="text-xs text-muted mt-0.5 truncate">
                        Costs {formatMoney(summary.totalExpenses, asset.currency)}
                        {summary.hasRevenue
                          ? ` · Revenue ${formatMoney(summary.saleRevenue, asset.currency)} · Profit ${formatMoney(summary.grossProfit, asset.currency)}`
                          : " · not yet harvested / sold"}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
          <CreateCropCycleSection assetId={asset.id} />
        </div>
      )}

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold">Liabilities linked to this asset</h2>
        <LiabilityList
          items={liabilityItems}
          lockedAssetId={asset.id}
          emptyTitle="No liabilities linked here"
          emptyDescription="Link a mortgage, loan, or recurring expense to this asset to track money going out against it."
          addLabel="Add liability for this asset"
        />
      </div>

      <div className="flex justify-end">
        <DeleteAssetButton assetId={asset.id} assetName={asset.name} />
      </div>
    </div>
  );
}
