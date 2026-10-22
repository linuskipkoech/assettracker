"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";
import { BENEFICIARY_RELATIONSHIPS } from "@/lib/constants";

export interface BeneficiaryFormInitial {
  id?: string;
  name?: string;
  relationship?: string;
  email?: string;
  phone?: string | null;
  notes?: string | null;
}

export function BeneficiaryForm({
  initial,
  parentBeneficiaryId,
  onDone,
  onCancel,
}: {
  initial?: BeneficiaryFormInitial;
  parentBeneficiaryId?: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [relationship, setRelationship] = useState(initial?.relationship ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(initial?.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = isEdit ? `/api/beneficiaries/${initial!.id}` : "/api/beneficiaries";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        relationship,
        email,
        phone: phone || undefined,
        notes: notes || undefined,
        ...(isEdit ? {} : { parentBeneficiaryId: parentBeneficiaryId ?? null }),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Could not save this contact.");
      return;
    }
    toast.success(isEdit ? "Contact updated" : "Contact added");
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3 border-primary/30 bg-primary-light/30">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Full name</label>
          <input required className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Relationship</label>
          <input
            required
            className="input"
            list="beneficiary-relationships"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            placeholder="e.g. Spouse"
          />
          <datalist id="beneficiary-relationships">
            {BENEFICIARY_RELATIONSHIPS.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Phone (optional)</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Notes (optional)</label>
        <input
          className="input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Preferred way to reach them"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading} className="btn-primary px-4 py-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isEdit ? "Save changes" : "Add contact"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary px-4 py-2">
          <X className="size-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
