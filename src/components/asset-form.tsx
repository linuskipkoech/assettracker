"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  ASSET_TYPES,
  ASSET_TYPE_LABELS,
  KENYA_COUNTIES,
  type AssetType,
} from "@/lib/constants";
import { AssetTypeIcon } from "@/components/ui/asset-type-icon";

interface AssetFormValues {
  type: AssetType;
  name: string;
  description: string;
  currentValue: string;
  currency: string;
  acquisitionValue: string;
  acquisitionDate: string;
  location: string;
  county: string;
  // details (kept as strings for controlled inputs, parsed on submit)
  sizeAcres: string;
  primaryCrop: string;
  secondaryCrop: string;
  soilType: string;
  irrigation: boolean;
  species: string;
  breed: string;
  headCount: string;
  averageAgeMonths: string;
  purpose: string;
  industry: string;
  ownershipPercent: string;
  monthlyRevenue: string;
  monthlyExpenses: string;
  employeeCount: string;
  tickerSymbol: string;
  exchange: string;
  quantity: string;
  pricePerUnit: string;
  titleDeedNumber: string;
  zoning: string;
  propertyType: string;
  bedrooms: string;
  monthlyRentalIncome: string;
  occupied: boolean;
}

const EMPTY: AssetFormValues = {
  type: "FARM",
  name: "",
  description: "",
  currentValue: "",
  currency: "KES",
  acquisitionValue: "",
  acquisitionDate: "",
  location: "",
  county: "",
  sizeAcres: "",
  primaryCrop: "",
  secondaryCrop: "",
  soilType: "",
  irrigation: false,
  species: "",
  breed: "",
  headCount: "",
  averageAgeMonths: "",
  purpose: "",
  industry: "",
  ownershipPercent: "",
  monthlyRevenue: "",
  monthlyExpenses: "",
  employeeCount: "",
  tickerSymbol: "",
  exchange: "",
  quantity: "",
  pricePerUnit: "",
  titleDeedNumber: "",
  zoning: "",
  propertyType: "",
  bedrooms: "",
  monthlyRentalIncome: "",
  occupied: false,
};

function num(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function buildPayload(v: AssetFormValues) {
  const core = {
    type: v.type,
    name: v.name,
    description: v.description || undefined,
    currentValue: num(v.currentValue) ?? 0,
    currency: v.currency || "KES",
    acquisitionValue: num(v.acquisitionValue),
    acquisitionDate: v.acquisitionDate ? new Date(v.acquisitionDate) : undefined,
    location: v.location || undefined,
    county: v.county || undefined,
  };

  switch (v.type) {
    case "FARM":
      return {
        ...core,
        farmDetails: {
          sizeAcres: num(v.sizeAcres),
          primaryCrop: v.primaryCrop || undefined,
          secondaryCrop: v.secondaryCrop || undefined,
          soilType: v.soilType || undefined,
          irrigation: v.irrigation,
        },
      };
    case "LIVESTOCK":
      return {
        ...core,
        livestockDetails: {
          species: v.species || undefined,
          breed: v.breed || undefined,
          headCount: num(v.headCount),
          averageAgeMonths: num(v.averageAgeMonths),
          purpose: v.purpose || undefined,
        },
      };
    case "BUSINESS":
      return {
        ...core,
        businessDetails: {
          industry: v.industry || undefined,
          ownershipPercent: num(v.ownershipPercent),
          monthlyRevenue: num(v.monthlyRevenue),
          monthlyExpenses: num(v.monthlyExpenses),
          employeeCount: num(v.employeeCount),
        },
      };
    case "STOCK":
      return {
        ...core,
        stockDetails: {
          tickerSymbol: v.tickerSymbol || undefined,
          exchange: v.exchange || undefined,
          quantity: num(v.quantity),
          pricePerUnit: num(v.pricePerUnit),
        },
      };
    case "LAND":
      return {
        ...core,
        landDetails: {
          sizeAcres: num(v.sizeAcres),
          titleDeedNumber: v.titleDeedNumber || undefined,
          zoning: v.zoning || undefined,
        },
      };
    case "PROPERTY":
      return {
        ...core,
        propertyDetails: {
          propertyType: v.propertyType || undefined,
          bedrooms: num(v.bedrooms),
          monthlyRentalIncome: num(v.monthlyRentalIncome),
          occupied: v.occupied,
        },
      };
    default:
      return core;
  }
}

export function AssetForm({
  assetId,
  initial,
}: {
  assetId?: string;
  initial?: Partial<AssetFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<AssetFormValues>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);

  function set<K extends keyof AssetFormValues>(key: K, value: AssetFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = buildPayload(values);
    const res = await fetch(assetId ? `/api/assets/${assetId}` : "/api/assets", {
      method: assetId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Something went wrong. Please check your input.");
      return;
    }

    toast.success(assetId ? "Asset updated" : "Asset added");
    router.push(`/assets/${data.asset.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold">Basics</h2>

        <div>
          <label className="label">Asset type</label>
          {assetId ? (
            <div className="input flex items-center gap-2 bg-background cursor-not-allowed">
              <AssetTypeIcon type={values.type} className="size-4 text-primary" />
              {ASSET_TYPE_LABELS[values.type]}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ASSET_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("type", t)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    values.type === t
                      ? "border-primary bg-primary-light text-primary-dark"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  <AssetTypeIcon type={t} className="size-4 shrink-0" />
                  <span className="truncate">{ASSET_TYPE_LABELS[t]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">Name</label>
          <input
            required
            className="input"
            placeholder="e.g. Nakuru Dairy Farm"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>

        <div>
          <label className="label">Description (optional)</label>
          <textarea
            className="input"
            rows={2}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Location (optional)</label>
            <input
              className="input"
              placeholder="e.g. Njoro, Nakuru"
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>
          <div>
            <label className="label">County (optional)</label>
            <select
              className="input"
              value={values.county}
              onChange={(e) => set("county", e.target.value)}
            >
              <option value="">Select county</option>
              {KENYA_COUNTIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold">Valuation</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Current value</label>
            <input
              required
              type="number"
              min={0}
              step="any"
              className="input"
              value={values.currentValue}
              onChange={(e) => set("currentValue", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Currency</label>
            <input
              className="input"
              value={values.currency}
              onChange={(e) => set("currency", e.target.value.toUpperCase())}
              maxLength={10}
            />
          </div>
          <div>
            <label className="label">Acquisition value (optional)</label>
            <input
              type="number"
              min={0}
              step="any"
              className="input"
              value={values.acquisitionValue}
              onChange={(e) => set("acquisitionValue", e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-1/3">
          <label className="label">Acquisition date (optional)</label>
          <input
            type="date"
            className="input"
            value={values.acquisitionDate}
            onChange={(e) => set("acquisitionDate", e.target.value)}
          />
        </div>
      </div>

      <TypeDetailsFields values={values} set={set} />

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Saving..." : assetId ? "Save changes" : "Add asset"}
        </button>
        <button
          type="button"
          className="btn-secondary px-6 py-2.5"
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function TypeDetailsFields({
  values,
  set,
}: {
  values: AssetFormValues;
  set: <K extends keyof AssetFormValues>(key: K, value: AssetFormValues[K]) => void;
}) {
  switch (values.type) {
    case "FARM":
      return (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Farm details</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Size (acres)">
              <input type="number" min={0} step="any" className="input"
                value={values.sizeAcres} onChange={(e) => set("sizeAcres", e.target.value)} />
            </Field>
            <Field label="Primary crop">
              <input className="input" value={values.primaryCrop}
                onChange={(e) => set("primaryCrop", e.target.value)} />
            </Field>
            <Field label="Secondary crop">
              <input className="input" value={values.secondaryCrop}
                onChange={(e) => set("secondaryCrop", e.target.value)} />
            </Field>
            <Field label="Soil type">
              <input className="input" value={values.soilType}
                onChange={(e) => set("soilType", e.target.value)} />
            </Field>
            <label className="flex items-center gap-2 text-sm mt-6">
              <input type="checkbox" checked={values.irrigation}
                onChange={(e) => set("irrigation", e.target.checked)} />
              Has irrigation
            </label>
          </div>
        </div>
      );
    case "LIVESTOCK":
      return (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Livestock details</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Species"><input className="input" value={values.species} onChange={(e) => set("species", e.target.value)} /></Field>
            <Field label="Breed"><input className="input" value={values.breed} onChange={(e) => set("breed", e.target.value)} /></Field>
            <Field label="Head count"><input type="number" min={0} className="input" value={values.headCount} onChange={(e) => set("headCount", e.target.value)} /></Field>
            <Field label="Average age (months)"><input type="number" min={0} className="input" value={values.averageAgeMonths} onChange={(e) => set("averageAgeMonths", e.target.value)} /></Field>
            <Field label="Purpose (dairy, beef, breeding...)"><input className="input" value={values.purpose} onChange={(e) => set("purpose", e.target.value)} /></Field>
          </div>
        </div>
      );
    case "BUSINESS":
      return (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Business details</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Industry"><input className="input" value={values.industry} onChange={(e) => set("industry", e.target.value)} /></Field>
            <Field label="Your ownership (%)"><input type="number" min={0} max={100} className="input" value={values.ownershipPercent} onChange={(e) => set("ownershipPercent", e.target.value)} /></Field>
            <Field label="Employees"><input type="number" min={0} className="input" value={values.employeeCount} onChange={(e) => set("employeeCount", e.target.value)} /></Field>
            <Field label="Monthly revenue"><input type="number" min={0} step="any" className="input" value={values.monthlyRevenue} onChange={(e) => set("monthlyRevenue", e.target.value)} /></Field>
            <Field label="Monthly expenses"><input type="number" min={0} step="any" className="input" value={values.monthlyExpenses} onChange={(e) => set("monthlyExpenses", e.target.value)} /></Field>
          </div>
        </div>
      );
    case "STOCK":
      return (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Stock / investment details</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            <Field label="Ticker symbol"><input className="input" value={values.tickerSymbol} onChange={(e) => set("tickerSymbol", e.target.value.toUpperCase())} /></Field>
            <Field label="Exchange"><input className="input" placeholder="NSE, NASDAQ..." value={values.exchange} onChange={(e) => set("exchange", e.target.value)} /></Field>
            <Field label="Quantity"><input type="number" min={0} step="any" className="input" value={values.quantity} onChange={(e) => set("quantity", e.target.value)} /></Field>
            <Field label="Price per unit"><input type="number" min={0} step="any" className="input" value={values.pricePerUnit} onChange={(e) => set("pricePerUnit", e.target.value)} /></Field>
          </div>
        </div>
      );
    case "LAND":
      return (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Land details</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Size (acres)"><input type="number" min={0} step="any" className="input" value={values.sizeAcres} onChange={(e) => set("sizeAcres", e.target.value)} /></Field>
            <Field label="Title deed number"><input className="input" value={values.titleDeedNumber} onChange={(e) => set("titleDeedNumber", e.target.value)} /></Field>
            <Field label="Zoning"><input className="input" placeholder="agricultural, residential..." value={values.zoning} onChange={(e) => set("zoning", e.target.value)} /></Field>
          </div>
        </div>
      );
    case "PROPERTY":
      return (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Property details</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            <Field label="Property type"><input className="input" placeholder="residential, rental..." value={values.propertyType} onChange={(e) => set("propertyType", e.target.value)} /></Field>
            <Field label="Bedrooms"><input type="number" min={0} className="input" value={values.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} /></Field>
            <Field label="Monthly rental income"><input type="number" min={0} step="any" className="input" value={values.monthlyRentalIncome} onChange={(e) => set("monthlyRentalIncome", e.target.value)} /></Field>
            <label className="flex items-center gap-2 text-sm mt-6">
              <input type="checkbox" checked={values.occupied} onChange={(e) => set("occupied", e.target.checked)} />
              Currently occupied / rented
            </label>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
