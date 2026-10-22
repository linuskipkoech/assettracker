"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Save, Sprout, Trash2, X } from "lucide-react";
import {
  CROP_CYCLE_STATUSES,
  CROP_CYCLE_STATUS_LABELS,
  CROP_EXPENSE_CATEGORIES,
  CROP_EXPENSE_CATEGORY_LABELS,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// Create a new crop cycle on a farm asset.
// ---------------------------------------------------------------------------

export function CreateCropCycleForm({
  assetId,
  onDone,
  onCancel,
}: {
  assetId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [crop, setCrop] = useState("");
  const [status, setStatus] = useState("GROWING");
  const [acreage, setAcreage] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [expectedHarvestDate, setExpectedHarvestDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/crop-cycles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assetId,
        name,
        crop,
        status,
        acreage: acreage ? Number(acreage) : undefined,
        plantingDate: plantingDate || undefined,
        expectedHarvestDate: expectedHarvestDate || undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Could not start this crop cycle.");
      return;
    }
    toast.success("Crop cycle started");
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3 border-primary/30 bg-primary-light/30">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Season name</label>
          <input
            required
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Short Rains 2026 — Maize"
          />
        </div>
        <div>
          <label className="label">Crop</label>
          <input
            required
            className="input"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            placeholder="e.g. Maize"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-4 gap-3">
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {CROP_CYCLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CROP_CYCLE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Acres planted</label>
          <input
            type="number"
            min={0}
            step="any"
            className="input"
            value={acreage}
            onChange={(e) => setAcreage(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Planting date</label>
          <input
            type="date"
            className="input"
            value={plantingDate}
            onChange={(e) => setPlantingDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Expected harvest</label>
          <input
            type="date"
            className="input"
            value={expectedHarvestDate}
            onChange={(e) => setExpectedHarvestDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading} className="btn-primary px-4 py-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sprout className="size-4" />}
          Start crop cycle
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary px-4 py-2">
          <X className="size-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}

export function CreateCropCycleSection({ assetId }: { assetId: string }) {
  const [adding, setAdding] = useState(false);
  if (adding) {
    return (
      <CreateCropCycleForm
        assetId={assetId}
        onDone={() => setAdding(false)}
        onCancel={() => setAdding(false)}
      />
    );
  }
  return (
    <button onClick={() => setAdding(true)} className="btn-secondary px-4 py-2">
      <Plus className="size-4" />
      Start a crop cycle
    </button>
  );
}

// ---------------------------------------------------------------------------
// Record an expense against a cycle. "On credit" also creates a liability
// tied to the farm, so the debt shows against the asset (and in net worth)
// while the cost shows in the season's profit — the same shilling, recorded
// once as a debt and counted once as a season cost, never deducted twice.
// ---------------------------------------------------------------------------

export function AddExpenseForm({ cycleId }: { cycleId: string }) {
  const router = useRouter();
  const [category, setCategory] = useState("FERTILIZER");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [onCredit, setOnCredit] = useState(false);
  const [creditDueDate, setCreditDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/crop-cycles/${cycleId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        description,
        amount: num,
        expenseDate: expenseDate || undefined,
        onCredit,
        creditDueDate: onCredit && creditDueDate ? creditDueDate : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Could not record this expense.");
      return;
    }
    toast.success(
      onCredit
        ? "Expense recorded — and added as a liability against this farm"
        : "Expense recorded",
    );
    setDescription("");
    setAmount("");
    setOnCredit(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid sm:grid-cols-4 gap-3">
        <div>
          <label className="label">Category</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CROP_EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CROP_EXPENSE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">What was it for?</label>
          <input
            required
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. DAP fertilizer — 10 bags from the agrovet"
          />
        </div>
        <div>
          <label className="label">Amount (KES)</label>
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
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input w-44"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm pb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={onCredit}
            onChange={(e) => setOnCredit(e.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          Bought on credit (pay later)
        </label>
        {onCredit && (
          <div>
            <label className="label">Credit due date (optional)</label>
            <input
              type="date"
              className="input w-44"
              value={creditDueDate}
              onChange={(e) => setCreditDueDate(e.target.value)}
            />
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary px-4 py-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Record expense
        </button>
      </div>
      {onCredit && (
        <p className="text-xs text-muted">
          This will also appear under this farm&apos;s liabilities as money owed, and counts
          against the farm&apos;s net value and your overall net worth — once, not twice.
        </p>
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Harvest / sale close-out: yield, revenue, status.
// ---------------------------------------------------------------------------

export function CloseOutForm({
  cycleId,
  initial,
}: {
  cycleId: string;
  initial: {
    status: string;
    harvestQuantity?: number | null;
    harvestUnit?: string | null;
    harvestedDate?: string | Date | null;
    saleRevenue?: number | null;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(initial.status);
  const [harvestQuantity, setHarvestQuantity] = useState(
    initial.harvestQuantity != null ? String(initial.harvestQuantity) : "",
  );
  const [harvestUnit, setHarvestUnit] = useState(initial.harvestUnit ?? "90kg bags");
  const [harvestedDate, setHarvestedDate] = useState(
    initial.harvestedDate ? new Date(initial.harvestedDate).toISOString().slice(0, 10) : "",
  );
  const [saleRevenue, setSaleRevenue] = useState(
    initial.saleRevenue != null ? String(initial.saleRevenue) : "",
  );
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary px-4 py-2">
        <Save className="size-4" />
        Record harvest / sale
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/crop-cycles/${cycleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        harvestQuantity: harvestQuantity ? Number(harvestQuantity) : undefined,
        harvestUnit: harvestUnit || undefined,
        harvestedDate: harvestedDate || undefined,
        saleRevenue: saleRevenue ? Number(saleRevenue) : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Could not save the harvest details.");
      return;
    }
    toast.success("Harvest details saved");
    setOpen(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-4 space-y-3 border-primary/30 bg-primary-light/30 w-full"
    >
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {CROP_CYCLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CROP_CYCLE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Harvested on</label>
          <input
            type="date"
            className="input"
            value={harvestedDate}
            onChange={(e) => setHarvestedDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Sale revenue (KES)</label>
          <input
            type="number"
            min={0}
            step="any"
            className="input"
            value={saleRevenue}
            onChange={(e) => setSaleRevenue(e.target.value)}
            placeholder="What the harvest sold for"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Yield quantity</label>
          <input
            type="number"
            min={0}
            step="any"
            className="input"
            value={harvestQuantity}
            onChange={(e) => setHarvestQuantity(e.target.value)}
            placeholder="e.g. 96"
          />
        </div>
        <div>
          <label className="label">Yield unit</label>
          <input
            className="input"
            value={harvestUnit}
            onChange={(e) => setHarvestUnit(e.target.value)}
            placeholder="e.g. 90kg bags"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading} className="btn-primary px-4 py-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save harvest details
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary px-4 py-2">
          <X className="size-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Deletes (with inline confirm, matching DeleteAssetButton's pattern).
// ---------------------------------------------------------------------------

export function DeleteExpenseButton({
  cycleId,
  expenseId,
}: {
  cycleId: string;
  expenseId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/crop-cycles/${cycleId}/expenses/${expenseId}`, {
      method: "DELETE",
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Expense removed");
      router.refresh();
    } else {
      toast.error("Could not remove this expense.");
    }
  }
  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-ghost size-8 p-0 flex items-center justify-center !text-danger shrink-0"
      aria-label="Remove expense"
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
    </button>
  );
}

export function DeleteCycleButton({ cycleId, cycleName }: { cycleId: string; cycleName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/crop-cycles/${cycleId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      toast.success("Crop cycle removed");
      router.push("/assets");
      router.refresh();
    } else {
      toast.error("Could not remove this crop cycle.");
    }
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="btn-secondary px-4 py-2 !text-danger">
        <Trash2 className="size-4" />
        Remove crop cycle
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted">Remove &quot;{cycleName}&quot; and its expenses?</span>
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
