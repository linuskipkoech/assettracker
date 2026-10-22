"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2, Link2, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney, formatDate } from "@/lib/format";
import { LIABILITY_TYPE_LABELS, LIABILITY_FREQUENCY_LABELS, type LiabilityType, type LiabilityFrequency } from "@/lib/constants";
import { LiabilityForm, type LiabilityFormInitial } from "./liability-form";

export interface LiabilityItem {
  id: string;
  name: string;
  type: string;
  frequency: string;
  amount: number;
  currency: string;
  outstandingBalance: number | null;
  interestRatePercent: number | null;
  nextDueDate: Date | string | null;
  notes: string | null;
  status: string;
  assetId: string | null;
  /** Shown on the all-liabilities page so a linked item says which asset it belongs to. Omit on an asset's own page — it's redundant there. */
  assetName?: string | null;
}

const STATUS_TONE: Record<string, "success" | "warning" | "default"> = {
  ACTIVE: "warning",
  PAID_OFF: "success",
  CANCELLED: "default",
};

export function LiabilityList({
  items,
  assetOptions,
  lockedAssetId,
  emptyTitle = "No liabilities yet",
  emptyDescription = "Add a loan, mortgage, bill, or anything else with money going out.",
  addLabel = "Add liability",
}: {
  items: LiabilityItem[];
  assetOptions?: { id: string; name: string }[];
  lockedAssetId?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  addLabel?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {items.length === 0 && !adding && (
        <EmptyState
          icon={<Link2 className="size-5" />}
          title={emptyTitle}
          description={emptyDescription}
          action={
            <button onClick={() => setAdding(true)} className="btn-primary px-4 py-2 mt-1">
              <Plus className="size-4" />
              {addLabel}
            </button>
          }
        />
      )}

      {items.map((item) =>
        editingId === item.id ? (
          <LiabilityForm
            key={item.id}
            initial={toFormInitial(item)}
            assetOptions={assetOptions}
            lockedAssetId={lockedAssetId}
            onDone={() => setEditingId(null)}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <LiabilityRow key={item.id} item={item} onEdit={() => setEditingId(item.id)} />
        ),
      )}

      {adding ? (
        <LiabilityForm
          assetOptions={assetOptions}
          lockedAssetId={lockedAssetId}
          onDone={() => setAdding(false)}
          onCancel={() => setAdding(false)}
        />
      ) : (
        items.length > 0 && (
          <button onClick={() => setAdding(true)} className="btn-secondary px-4 py-2">
            <Plus className="size-4" />
            {addLabel}
          </button>
        )
      )}
    </div>
  );
}

function toFormInitial(item: LiabilityItem): LiabilityFormInitial {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    frequency: item.frequency,
    amount: item.amount,
    currency: item.currency,
    outstandingBalance: item.outstandingBalance,
    interestRatePercent: item.interestRatePercent,
    nextDueDate: item.nextDueDate,
    notes: item.notes,
    status: item.status,
    assetId: item.assetId,
  };
}

function LiabilityRow({ item, onEdit }: { item: LiabilityItem; onEdit: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setBusy(true);
    const res = await fetch(`/api/liabilities/${item.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      toast.error("Could not remove this liability.");
      return;
    }
    toast.success("Liability removed");
    router.refresh();
  }

  return (
    <div className="card p-4 flex items-start justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold">{item.name}</p>
          <Badge tone={STATUS_TONE[item.status] ?? "default"}>
            {item.status === "ACTIVE" ? "Active" : item.status === "PAID_OFF" ? "Paid off" : "Cancelled"}
          </Badge>
        </div>
        <p className="text-sm text-muted mt-0.5">
          {LIABILITY_TYPE_LABELS[item.type as LiabilityType] ?? item.type} ·{" "}
          {formatMoney(item.amount, item.currency)} {LIABILITY_FREQUENCY_LABELS[item.frequency as LiabilityFrequency]?.toLowerCase()}
          {item.outstandingBalance != null && <> · {formatMoney(item.outstandingBalance, item.currency)} owed</>}
          {item.interestRatePercent != null && <> · {item.interestRatePercent}% interest</>}
        </p>
        {item.assetName && (
          <p className="text-xs text-primary mt-1 flex items-center gap-1">
            <Link2 className="size-3.5" />
            Linked to {item.assetName}
          </p>
        )}
        {item.nextDueDate && (
          <p className="text-xs text-muted mt-1 flex items-center gap-1">
            <CalendarClock className="size-3.5" />
            Next due {formatDate(item.nextDueDate)}
          </p>
        )}
        {item.notes && <p className="text-xs text-muted mt-1 italic">{item.notes}</p>}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!confirming ? (
          <>
            <button onClick={onEdit} className="btn-ghost size-8 p-0 flex items-center justify-center" aria-label="Edit">
              <Pencil className="size-3.5" />
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="btn-ghost size-8 p-0 flex items-center justify-center !text-danger"
              aria-label="Remove"
            >
              <Trash2 className="size-3.5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Remove?</span>
            <button
              onClick={handleDelete}
              disabled={busy}
              className="btn-primary !bg-danger hover:!bg-danger/90 text-xs px-2.5 py-1"
            >
              {busy && <Loader2 className="size-3 animate-spin" />}
              Confirm
            </button>
            <button onClick={() => setConfirming(false)} className="btn-secondary text-xs px-2.5 py-1">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
