"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";
import {
  LIABILITY_TYPES,
  LIABILITY_TYPE_LABELS,
  LIABILITY_FREQUENCIES,
  LIABILITY_FREQUENCY_LABELS,
  LIABILITY_STATUSES,
} from "@/lib/constants";

export interface LiabilityFormInitial {
  id?: string;
  name?: string;
  type?: string;
  frequency?: string;
  amount?: number;
  currency?: string;
  outstandingBalance?: number | null;
  interestRatePercent?: number | null;
  nextDueDate?: string | Date | null;
  notes?: string | null;
  status?: string;
  assetId?: string | null;
}

export function LiabilityForm({
  initial,
  assetOptions,
  lockedAssetId,
  onDone,
  onCancel,
}: {
  initial?: LiabilityFormInitial;
  /** Assets the user can pick from when this isn't locked to one. Omit (or pass []) when there are none / this is always standalone. */
  assetOptions?: { id: string; name: string }[];
  /** When set, the asset picker is hidden and every liability created here is linked to this asset. */
  lockedAssetId?: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? LIABILITY_TYPES[0]);
  const [frequency, setFrequency] = useState(initial?.frequency ?? "MONTHLY");
  const [amount, setAmount] = useState(initial?.amount != null ? String(initial.amount) : "");
  const [outstandingBalance, setOutstandingBalance] = useState(
    initial?.outstandingBalance != null ? String(initial.outstandingBalance) : "",
  );
  const [interestRatePercent, setInterestRatePercent] = useState(
    initial?.interestRatePercent != null ? String(initial.interestRatePercent) : "",
  );
  const [nextDueDate, setNextDueDate] = useState(
    initial?.nextDueDate ? new Date(initial.nextDueDate).toISOString().slice(0, 10) : "",
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [status, setStatus] = useState(initial?.status ?? "ACTIVE");
  const [assetId, setAssetId] = useState(lockedAssetId ?? initial?.assetId ?? "");
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(initial?.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum < 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setLoading(true);
    const url = isEdit ? `/api/liabilities/${initial!.id}` : "/api/liabilities";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        frequency,
        amount: amountNum,
        outstandingBalance: outstandingBalance ? Number(outstandingBalance) : undefined,
        interestRatePercent: interestRatePercent ? Number(interestRatePercent) : undefined,
        nextDueDate: nextDueDate || undefined,
        notes: notes || undefined,
        status,
        assetId: assetId || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Could not save this liability.");
      return;
    }
    toast.success(isEdit ? "Liability updated" : "Liability added");
    router.refresh();
    onDone();
  }

  const isDebtLike = type === "LOAN" || type === "MORTGAGE" || type === "CREDIT_CARD";

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3 border-primary/30 bg-primary-light/30">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Name</label>
          <input required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Home mortgage" />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            {LIABILITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {LIABILITY_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Amount</label>
          <input
            type="number"
            min={0}
            step="any"
            required
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Frequency</label>
          <select className="input" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            {LIABILITY_FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {LIABILITY_FREQUENCY_LABELS[f]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Next due date (optional)</label>
          <input type="date" className="input" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">
            Outstanding balance {isDebtLike ? "" : "(optional)"}
          </label>
          <input
            type="number"
            min={0}
            step="any"
            className="input"
            value={outstandingBalance}
            onChange={(e) => setOutstandingBalance(e.target.value)}
            placeholder={isDebtLike ? "Total still owed" : "Leave blank if there's no balance"}
          />
          <p className="text-xs text-muted mt-1">Counted against your net worth. Leave blank for a pure expense with no balance owed.</p>
        </div>
        <div>
          <label className="label">Interest rate % (optional)</label>
          <input
            type="number"
            min={0}
            max={100}
            step="any"
            className="input"
            value={interestRatePercent}
            onChange={(e) => setInterestRatePercent(e.target.value)}
          />
        </div>
      </div>

      {!lockedAssetId && (
        <div>
          <label className="label">Linked asset (optional)</label>
          <select className="input" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
            <option value="">Not linked — standalone</option>
            {(assetOptions ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {LIABILITY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "ACTIVE" ? "Active" : s === "PAID_OFF" ? "Paid off" : "Cancelled"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Notes (optional)</label>
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading} className="btn-primary px-4 py-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isEdit ? "Save changes" : "Add liability"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary px-4 py-2">
          <X className="size-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
