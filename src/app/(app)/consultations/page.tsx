import { MessageSquare } from "lucide-react";
import { requireUser } from "@/lib/session";
import {
  listConsultationsForRequester,
  listConsultationsForAdvisor,
  getAdvisorProfileForUser,
} from "@/lib/repositories/advisors";
import { formatDate } from "@/lib/format";
import { ConsultationStatusActions } from "@/components/consultation-status-actions";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import type { ConsultationStatus } from "@/lib/constants";

const STATUS_TONE: Record<ConsultationStatus, "warning" | "info" | "danger" | "success" | "default"> = {
  PENDING: "warning",
  ACCEPTED: "info",
  DECLINED: "danger",
  COMPLETED: "success",
  CANCELLED: "default",
};

function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status as ConsultationStatus] ?? "default"}>{status}</Badge>;
}

export default async function ConsultationsPage() {
  const user = await requireUser();
  const [myRequests, advisorProfile] = await Promise.all([
    listConsultationsForRequester(user.id),
    getAdvisorProfileForUser(user.id),
  ]);
  const incoming = advisorProfile ? await listConsultationsForAdvisor(user.id) : [];

  return (
    <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 py-8 space-y-10 animate-fade-in">
      <PageHeader
        title="Consultations"
        description={`Track requests you've sent to advisors${advisorProfile ? ", and requests sent to you" : ""}.`}
      />

      <section className="space-y-3">
        <h2 className="font-semibold text-lg">My requests</h2>
        {myRequests.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="size-5" />}
            title="No requests yet"
            description="You haven't requested a consultation yet."
          />
        ) : (
          <div className="space-y-3">
            {myRequests.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{c.topic}</p>
                    <p className="text-xs text-muted mt-0.5">
                      With {c.advisorName} · {c.advisorSpecialty}
                      {c.assetName ? ` · re: ${c.assetName}` : ""} · {formatDate(c.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-sm mt-2">{c.message}</p>
                {c.advisorNote && (
                  <p className="text-sm mt-2 bg-background rounded-md p-2 border border-border">
                    <span className="font-medium">Advisor note: </span>
                    {c.advisorNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {advisorProfile && (
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">Requests to me</h2>
          {incoming.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="size-5" />}
              title="No requests yet"
              description="Consultation requests from users will show up here."
            />
          ) : (
            <div className="space-y-3">
              {incoming.map((c) => (
                <div key={c.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{c.topic}</p>
                      <p className="text-xs text-muted mt-0.5">
                        From {c.requesterName} ({c.requesterEmail})
                        {c.assetName ? ` · re: ${c.assetName}` : ""} · {formatDate(c.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-sm mt-2">{c.message}</p>
                  <ConsultationStatusActions consultationId={c.id} currentStatus={c.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
