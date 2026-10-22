"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check, X, CheckCheck } from "lucide-react";

export function ConsultationStatusActions({
  consultationId,
  currentStatus,
}: {
  consultationId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(status: string) {
    setLoading(status);
    const res = await fetch(`/api/consultations/${consultationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    if (!res.ok) {
      toast.error("Could not update this request.");
      return;
    }
    toast.success(
      status === "ACCEPTED" ? "Request accepted" : status === "DECLINED" ? "Request declined" : "Marked complete",
    );
    router.refresh();
  }

  if (currentStatus !== "PENDING" && currentStatus !== "ACCEPTED") {
    return null;
  }

  const options =
    currentStatus === "PENDING"
      ? (["ACCEPTED", "DECLINED"] as const)
      : (["COMPLETED"] as const);

  return (
    <div className="flex gap-2 mt-3">
      {options.map((status) => (
        <button
          key={status}
          onClick={() => updateStatus(status)}
          disabled={loading !== null}
          className={
            status === "DECLINED"
              ? "btn-secondary text-xs px-3 py-1.5 !text-danger"
              : "btn-primary text-xs px-3 py-1.5"
          }
        >
          {loading === status ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : status === "ACCEPTED" ? (
            <Check className="size-3.5" />
          ) : status === "DECLINED" ? (
            <X className="size-3.5" />
          ) : (
            <CheckCheck className="size-3.5" />
          )}
          {status === "ACCEPTED" ? "Accept" : status === "DECLINED" ? "Decline" : "Mark complete"}
        </button>
      ))}
    </div>
  );
}
