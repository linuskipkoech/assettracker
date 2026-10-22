"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export function ActivitySettingsForm({
  initial,
}: {
  initial: { inactivityThresholdDays: number; checkinGraceDays: number; beneficiaryGraceDays: number };
}) {
  const router = useRouter();
  const [inactivityThresholdDays, setInactivityThresholdDays] = useState(
    String(initial.inactivityThresholdDays),
  );
  const [checkinGraceDays, setCheckinGraceDays] = useState(String(initial.checkinGraceDays));
  const [beneficiaryGraceDays, setBeneficiaryGraceDays] = useState(String(initial.beneficiaryGraceDays));
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/account/activity-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inactivityThresholdDays: Number(inactivityThresholdDays),
        checkinGraceDays: Number(checkinGraceDays),
        beneficiaryGraceDays: Number(beneficiaryGraceDays),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Could not save these settings.");
      return;
    }
    toast.success("Safety net settings saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <h2 className="font-semibold">Timing</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Inactive after (days)</label>
          <input
            type="number"
            min={7}
            max={730}
            required
            className="input"
            value={inactivityThresholdDays}
            onChange={(e) => setInactivityThresholdDays(e.target.value)}
          />
          <p className="text-xs text-muted mt-1">No login for this long starts a check-in.</p>
        </div>
        <div>
          <label className="label">Your reply window (days)</label>
          <input
            type="number"
            min={1}
            max={90}
            required
            className="input"
            value={checkinGraceDays}
            onChange={(e) => setCheckinGraceDays(e.target.value)}
          />
          <p className="text-xs text-muted mt-1">Time to confirm before beneficiaries are notified.</p>
        </div>
        <div>
          <label className="label">Each contact&apos;s reply window (days)</label>
          <input
            type="number"
            min={1}
            max={90}
            required
            className="input"
            value={beneficiaryGraceDays}
            onChange={(e) => setBeneficiaryGraceDays(e.target.value)}
          />
          <p className="text-xs text-muted mt-1">Time each beneficiary/heir has before we try the next one.</p>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary px-4 py-2">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save timing
      </button>
    </form>
  );
}
