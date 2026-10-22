import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getAssetForUser } from "@/lib/repositories/assets";
import { AssetForm } from "@/components/asset-form";
import { PageHeader } from "@/components/ui/page-header";

function toStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const asset = await getAssetForUser(id, user.id);
  if (!asset) notFound();

  const d = (asset.details ?? {}) as Record<string, unknown>;

  const initial = {
    type: asset.type as never,
    name: asset.name,
    description: asset.description ?? "",
    currentValue: toStr(asset.currentValue),
    currency: asset.currency,
    acquisitionValue: toStr(asset.acquisitionValue),
    acquisitionDate: asset.acquisitionDate
      ? new Date(asset.acquisitionDate).toISOString().slice(0, 10)
      : "",
    location: asset.location ?? "",
    county: asset.county ?? "",
    sizeAcres: toStr(d.sizeAcres),
    primaryCrop: toStr(d.primaryCrop),
    secondaryCrop: toStr(d.secondaryCrop),
    soilType: toStr(d.soilType),
    irrigation: Boolean(d.irrigation),
    species: toStr(d.species),
    breed: toStr(d.breed),
    headCount: toStr(d.headCount),
    averageAgeMonths: toStr(d.averageAgeMonths),
    purpose: toStr(d.purpose),
    industry: toStr(d.industry),
    ownershipPercent: toStr(d.ownershipPercent),
    monthlyRevenue: toStr(d.monthlyRevenue),
    monthlyExpenses: toStr(d.monthlyExpenses),
    employeeCount: toStr(d.employeeCount),
    tickerSymbol: toStr(d.tickerSymbol),
    exchange: toStr(d.exchange),
    quantity: toStr(d.quantity),
    pricePerUnit: toStr(d.pricePerUnit),
    titleDeedNumber: toStr(d.titleDeedNumber),
    zoning: toStr(d.zoning),
    propertyType: toStr(d.propertyType),
    bedrooms: toStr(d.bedrooms),
    monthlyRentalIncome: toStr(d.monthlyRentalIncome),
    occupied: Boolean(d.occupied),
  };

  return (
    <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <PageHeader title={`Edit ${asset.name}`} />
      <AssetForm assetId={asset.id} initial={initial} />
    </div>
  );
}
