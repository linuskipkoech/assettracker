"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { ADVISOR_SPECIALTIES, KENYA_COUNTIES } from "@/lib/constants";

interface Initial {
  specialty?: string;
  bio?: string;
  yearsExperience?: string;
  hourlyRateKes?: string;
  county?: string;
}

export function AdvisorProfileForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [specialty, setSpecialty] = useState(initial?.specialty ?? ADVISOR_SPECIALTIES[0]);
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [yearsExperience, setYearsExperience] = useState(initial?.yearsExperience ?? "");
  const [hourlyRateKes, setHourlyRateKes] = useState(initial?.hourlyRateKes ?? "");
  const [county, setCounty] = useState(initial?.county ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/advisors/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        specialty,
        bio,
        yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
        hourlyRateKes: hourlyRateKes ? Number(hourlyRateKes) : undefined,
        county: county || undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Could not save your profile.");
      return;
    }
    toast.success("Advisor profile saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div>
        <label className="label">Specialty</label>
        <select className="input" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
          {ADVISOR_SPECIALTIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Bio</label>
        <textarea
          required
          minLength={20}
          rows={5}
          className="input"
          placeholder="Tell users about your experience and how you can help."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Years of experience</label>
          <input type="number" min={0} className="input" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
        </div>
        <div>
          <label className="label">Hourly rate (KES)</label>
          <input type="number" min={0} className="input" value={hourlyRateKes} onChange={(e) => setHourlyRateKes(e.target.value)} />
        </div>
        <div>
          <label className="label">County</label>
          <select className="input" value={county} onChange={(e) => setCounty(e.target.value)}>
            <option value="">Select county</option>
            {KENYA_COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary px-5 py-2.5">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save advisor profile
      </button>
    </form>
  );
}
