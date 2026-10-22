"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2, TrendingUp } from "lucide-react";
import { formatMoney } from "@/lib/format";

export function AddValuationForm({ assetId, currency }: { assetId: string; currency: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) {
      toast.error("Enter a valid value");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/assets/${assetId}/valuations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: num, note: note || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Could not save this update.");
      return;
    }
    toast.success("Valuation recorded");
    setValue("");
    setNote("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="label">New value ({currency})</label>
        <input
          type="number"
          min={0}
          step="any"
          required
          className="input w-40"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className="flex-1 min-w-[160px]">
        <label className="label">Note (optional)</label>
        <input
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Land re-valued after survey"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary px-4 py-2">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <TrendingUp className="size-4" />}
        Record update
      </button>
    </form>
  );
}

export function DeleteAssetButton({ assetId, assetName }: { assetId: string; assetName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/assets/${assetId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      toast.success("Asset removed");
      router.push("/assets");
      router.refresh();
    } else {
      toast.error("Could not remove this asset.");
    }
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="btn-secondary px-4 py-2 !text-danger">
        <Trash2 className="size-4" />
        Remove asset
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted">Remove &quot;{assetName}&quot;?</span>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="btn-primary px-3 py-1.5 !bg-danger hover:!bg-danger/90"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        Confirm
      </button>
      <button onClick={() => setConfirming(false)} className="btn-secondary px-3 py-1.5">
        Cancel
      </button>
    </div>
  );
}

export function ValuationHistoryList({
  history,
}: {
  history: { id: string; value: number; note: string | null; recordedAt: Date | string }[];
}) {
  if (history.length === 0) {
    return <p className="text-sm text-muted">No valuation history yet.</p>;
  }
  return (
    <ul className="space-y-2">
      {history.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
          <div>
            <span className="font-medium">{formatMoney(entry.value)}</span>
            {entry.note && <span className="text-muted"> — {entry.note}</span>}
          </div>
          <span className="text-muted text-xs">
            {new Date(entry.recordedAt).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        </li>
      ))}
    </ul>
  );
}
