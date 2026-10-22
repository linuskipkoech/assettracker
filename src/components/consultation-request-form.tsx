"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Send } from "lucide-react";

export function ConsultationRequestForm({
  advisorId,
  assetId,
}: {
  advisorId: string;
  assetId?: string;
}) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        advisorId,
        assetId,
        topic,
        message,
        preferredDate: preferredDate || undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Could not send your request.");
      return;
    }
    toast.success("Request sent");
    setSent(true);
    router.refresh();
  }

  if (sent) {
    return (
      <div className="card p-6 bg-primary-light border-primary/20 flex items-start gap-3">
        <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-primary-dark">Request sent.</p>
          <p className="text-sm text-primary-dark/80 mt-1">
            You&apos;ll see the advisor&apos;s response on your{" "}
            <Link href="/consultations" className="font-medium underline">
              Consultations
            </Link>{" "}
            page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h2 className="font-semibold">Request a consultation</h2>
      <div>
        <label className="label">Topic</label>
        <input
          required
          className="input"
          placeholder="e.g. Should I expand my dairy herd?"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea
          required
          minLength={10}
          rows={4}
          className="input"
          placeholder="Share context about your situation and what you'd like advice on."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div className="sm:w-1/2">
        <label className="label">Preferred date (optional)</label>
        <input
          type="date"
          className="input"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary px-5 py-2.5">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Send request
      </button>
    </form>
  );
}
