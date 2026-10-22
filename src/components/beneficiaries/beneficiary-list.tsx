"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Mail, Phone, Pencil, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { BeneficiaryForm } from "./beneficiary-form";

export interface BeneficiaryItem {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string | null;
  notes: string | null;
  priority: number;
}

export interface BeneficiaryTreeItem extends BeneficiaryItem {
  heirs: BeneficiaryItem[];
}

type OpenForm =
  | { kind: "add-top-level" }
  | { kind: "add-heir"; parentId: string }
  | { kind: "edit"; beneficiary: BeneficiaryItem };

export function BeneficiaryList({ initial }: { initial: BeneficiaryTreeItem[] }) {
  const [openForm, setOpenForm] = useState<OpenForm | null>(null);

  return (
    <div className="space-y-4">
      {initial.length === 0 && !openForm && (
        <EmptyState
          icon={<Users className="size-5" />}
          title="No beneficiaries yet"
          description="Add the people we should reach out to if your account goes inactive for an extended period."
          action={
            <button onClick={() => setOpenForm({ kind: "add-top-level" })} className="btn-primary px-4 py-2 mt-1">
              <Plus className="size-4" />
              Add your first beneficiary
            </button>
          }
        />
      )}

      {initial.map((beneficiary, index) => (
        <BeneficiaryCard
          key={beneficiary.id}
          beneficiary={beneficiary}
          isFirst={index === 0}
          isLast={index === initial.length - 1}
          openForm={openForm}
          setOpenForm={setOpenForm}
        />
      ))}

      {openForm?.kind === "add-top-level" ? (
        <BeneficiaryForm onDone={() => setOpenForm(null)} onCancel={() => setOpenForm(null)} />
      ) : (
        initial.length > 0 && (
          <button onClick={() => setOpenForm({ kind: "add-top-level" })} className="btn-secondary px-4 py-2">
            <Plus className="size-4" />
            Add another beneficiary
          </button>
        )
      )}
    </div>
  );
}

function BeneficiaryCard({
  beneficiary,
  isFirst,
  isLast,
  openForm,
  setOpenForm,
}: {
  beneficiary: BeneficiaryTreeItem;
  isFirst: boolean;
  isLast: boolean;
  openForm: OpenForm | null;
  setOpenForm: (f: OpenForm | null) => void;
}) {
  const isEditingThis = openForm?.kind === "edit" && openForm.beneficiary.id === beneficiary.id;
  const isAddingHeirHere = openForm?.kind === "add-heir" && openForm.parentId === beneficiary.id;

  if (isEditingThis) {
    return (
      <BeneficiaryForm
        initial={openForm.beneficiary}
        onDone={() => setOpenForm(null)}
        onCancel={() => setOpenForm(null)}
      />
    );
  }

  return (
    <div className="card p-5">
      <ContactRow
        contact={beneficiary}
        badge={<Badge tone="primary">Priority {beneficiary.priority + 1}</Badge>}
        onEdit={() => setOpenForm({ kind: "edit", beneficiary })}
        reorderUp={!isFirst}
        reorderDown={!isLast}
        beneficiaryId={beneficiary.id}
        setOpenForm={setOpenForm}
      />

      <div className="mt-4 pl-6 border-l-2 border-border space-y-3">
        {beneficiary.heirs.map((heir, heirIndex) => {
          const isEditingHeir = openForm?.kind === "edit" && openForm.beneficiary.id === heir.id;
          if (isEditingHeir) {
            return (
              <BeneficiaryForm
                key={heir.id}
                initial={openForm.beneficiary}
                onDone={() => setOpenForm(null)}
                onCancel={() => setOpenForm(null)}
              />
            );
          }
          return (
            <ContactRow
              key={heir.id}
              contact={heir}
              badge={<Badge tone="default">Heir {heirIndex + 1}</Badge>}
              onEdit={() => setOpenForm({ kind: "edit", beneficiary: heir })}
              reorderUp={heirIndex > 0}
              reorderDown={heirIndex < beneficiary.heirs.length - 1}
              beneficiaryId={heir.id}
              setOpenForm={setOpenForm}
            />
          );
        })}

        {isAddingHeirHere ? (
          <BeneficiaryForm
            parentBeneficiaryId={beneficiary.id}
            onDone={() => setOpenForm(null)}
            onCancel={() => setOpenForm(null)}
          />
        ) : (
          <button
            onClick={() => setOpenForm({ kind: "add-heir", parentId: beneficiary.id })}
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1.5"
          >
            <UserPlus className="size-3.5" />
            Add heir for {beneficiary.name.split(" ")[0]}
          </button>
        )}
      </div>
    </div>
  );
}

function ContactRow({
  contact,
  badge,
  onEdit,
  reorderUp,
  reorderDown,
  beneficiaryId,
  setOpenForm,
}: {
  contact: BeneficiaryItem;
  badge: React.ReactNode;
  onEdit: () => void;
  reorderUp: boolean;
  reorderDown: boolean;
  beneficiaryId: string;
  setOpenForm: (f: OpenForm | null) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"up" | "down" | "delete" | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function reorder(direction: "up" | "down") {
    setBusy(direction);
    const res = await fetch(`/api/beneficiaries/${beneficiaryId}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    setBusy(null);
    if (!res.ok) {
      toast.error("Could not reorder.");
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    setBusy("delete");
    const res = await fetch(`/api/beneficiaries/${beneficiaryId}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) {
      toast.error("Could not remove this contact.");
      return;
    }
    toast.success("Contact removed");
    setOpenForm(null);
    router.refresh();
  }

  return (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="flex items-start gap-3 min-w-0">
        <Avatar name={contact.name} className="size-10 text-sm shrink-0 mt-0.5" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">{contact.name}</p>
            {badge}
          </div>
          <p className="text-sm text-muted">{contact.relationship}</p>
          <div className="flex items-center gap-3 text-xs text-muted mt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <Mail className="size-3.5" />
              {contact.email}
            </span>
            {contact.phone && (
              <span className="flex items-center gap-1">
                <Phone className="size-3.5" />
                {contact.phone}
              </span>
            )}
          </div>
          {contact.notes && <p className="text-xs text-muted mt-1 italic">{contact.notes}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!confirmingDelete ? (
          <>
            <button
              onClick={() => reorder("up")}
              disabled={!reorderUp || busy !== null}
              className="btn-ghost size-8 p-0 flex items-center justify-center disabled:opacity-30"
              aria-label="Move up"
            >
              {busy === "up" ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowUp className="size-3.5" />}
            </button>
            <button
              onClick={() => reorder("down")}
              disabled={!reorderDown || busy !== null}
              className="btn-ghost size-8 p-0 flex items-center justify-center disabled:opacity-30"
              aria-label="Move down"
            >
              {busy === "down" ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowDown className="size-3.5" />}
            </button>
            <button
              onClick={onEdit}
              className="btn-ghost size-8 p-0 flex items-center justify-center"
              aria-label="Edit"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              onClick={() => setConfirmingDelete(true)}
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
              disabled={busy !== null}
              className="btn-primary !bg-danger hover:!bg-danger/90 text-xs px-2.5 py-1"
            >
              {busy === "delete" && <Loader2 className="size-3 animate-spin" />}
              Confirm
            </button>
            <button onClick={() => setConfirmingDelete(false)} className="btn-secondary text-xs px-2.5 py-1">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
