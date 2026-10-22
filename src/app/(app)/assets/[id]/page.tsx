import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Sparkles, MapPin } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAssetForUser } from "@/lib/repositories/assets";
import { listLiabilitiesForAsset } from "@/lib/repositories/liabilities";
import { ASSET_TYPE_LABELS, type AssetType } from "@/lib/constants";
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
        <p className="label mb-1">Current value</p>
        <p className="text-3xl font-bold">{formatMoney(asset.currentValue, asset.currency)}</p>
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
