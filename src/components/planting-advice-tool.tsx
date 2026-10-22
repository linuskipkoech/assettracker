"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CloudRain, Loader2, Sprout } from "lucide-react";
import { KENYA_COUNTIES } from "@/lib/constants";

interface Result {
  advice: string;
  reference: {
    zone: { label: string; longRains: string; shortRains: string; notes: string } | null;
    cropProfile: { name: string; waterNeed: string; maturityDays: string; notes: string } | null;
  };
}

export function PlantingAdviceTool() {
  const [county, setCounty] = useState("");
  const [crop, setCrop] = useState("");
  const [sizeAcres, setSizeAcres] = useState("");
  const [soilType, setSoilType] = useState("");
  const [irrigation, setIrrigation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/ai/planting-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        county,
        crop,
        sizeAcres: sizeAcres ? Number(sizeAcres) : undefined,
        soilType: soilType || undefined,
        irrigation,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error || "Could not get advice right now.");
      return;
    }
    setResult(data);
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
          <Sprout className="size-4" />
        </div>
        <div>
          <h2 className="font-semibold leading-none">Planting advice</h2>
          <p className="text-xs text-muted mt-1">
            A general planting-window recommendation for a crop and county.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">County</label>
          <select required className="input" value={county} onChange={(e) => setCounty(e.target.value)}>
            <option value="">Select county</option>
            {KENYA_COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Crop</label>
          <input
            required
            className="input"
            placeholder="e.g. Maize, Beans, Tea..."
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Farm size (acres, optional)</label>
          <input type="number" min={0} step="any" className="input" value={sizeAcres} onChange={(e) => setSizeAcres(e.target.value)} />
        </div>
        <div>
          <label className="label">Soil type (optional)</label>
          <input className="input" value={soilType} onChange={(e) => setSoilType(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={irrigation} onChange={(e) => setIrrigation(e.target.checked)} />
          I have irrigation
        </label>
        <div className="sm:col-span-2">
          <button type="submit" disabled={loading} className="btn-primary px-5 py-2.5">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sprout className="size-4" />}
            {loading ? "Getting advice..." : "Get planting advice"}
          </button>
        </div>
      </form>

      {result && (
        <div className="border-t border-border pt-4 space-y-3 animate-fade-in">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.advice}</p>
          {result.reference.zone && (
            <div className="text-xs text-muted bg-background rounded-lg p-3 border border-border space-y-1">
              <p className="flex items-center gap-1.5">
                <CloudRain className="size-3.5 text-info" />
                <span className="font-medium text-foreground">Long rains:</span> {result.reference.zone.longRains}
              </p>
              <p className="flex items-center gap-1.5">
                <CloudRain className="size-3.5 text-info" />
                <span className="font-medium text-foreground">Short rains:</span> {result.reference.zone.shortRains}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
