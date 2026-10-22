import { formatDistanceToNow } from "date-fns";
import { ShieldCheck, Clock, Mail, CheckCircle2, ArrowRightCircle, LogIn, AlertTriangle } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listBeneficiariesForUser } from "@/lib/repositories/beneficiaries";
import { getActivitySettings, listRecentEvents } from "@/lib/repositories/escalation";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { BeneficiaryList } from "@/components/beneficiaries/beneficiary-list";
import { ActivitySettingsForm } from "@/components/beneficiaries/activity-settings-form";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  AWAITING_CHECKIN: "Awaiting your check-in",
  ESCALATING: "Contacting a beneficiary",
  ESCALATION_RESOLVED: "A beneficiary was notified",
  EXHAUSTED: "No one has confirmed yet",
};

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "default"> = {
  ACTIVE: "success",
  AWAITING_CHECKIN: "warning",
  ESCALATING: "warning",
  ESCALATION_RESOLVED: "default",
  EXHAUSTED: "danger",
};

const EVENT_COPY: Record<string, { icon: typeof Mail; label: string }> = {
  CHECKIN_EMAIL_SENT: { icon: Mail, label: "Sent you a check-in email" },
  CHECKIN_CONFIRMED: { icon: CheckCircle2, label: "You confirmed you're active" },
  RESOLVED_BY_LOGIN: { icon: LogIn, label: "Resolved automatically — you logged in" },
  BENEFICIARY_NOTIFIED: { icon: Mail, label: "Notified a beneficiary" },
  BENEFICIARY_CONFIRMED: { icon: CheckCircle2, label: "A beneficiary confirmed receipt" },
  ESCALATED_TO_NEXT: { icon: ArrowRightCircle, label: "Moved on to the next contact" },
  ESCALATION_EXHAUSTED: { icon: AlertTriangle, label: "Ran out of contacts to notify" },
};

export default async function BeneficiariesPage() {
  const user = await requireUser();
  const [tree, settings, events] = await Promise.all([
    listBeneficiariesForUser(user.id),
    getActivitySettings(user.id),
    listRecentEvents(user.id, 10),
  ]);

  if (!settings) return null;

  const lastSeen = settings.lastLoginAt
    ? `${formatDistanceToNow(settings.lastLoginAt)} ago`
    : "never recorded";
  const deadline = settings.escalationDeadlineAt;

  return (
    <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <PageHeader
        title="Beneficiaries & safety net"
        description="If your account goes quiet for a while, we'll check in with you first. If you don't respond, we'll reach out to the beneficiaries below — and if a beneficiary doesn't respond either, we'll move on to their heir."
      />

      <div className="card p-5 flex flex-wrap items-center gap-6">
        <div className="size-11 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="size-5" />
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-2">
            <p className="font-semibold">Account status</p>
            <Badge tone={STATUS_TONE[settings.escalationStatus] ?? "default"}>
              {STATUS_LABEL[settings.escalationStatus] ?? settings.escalationStatus}
            </Badge>
          </div>
          <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
            <Clock className="size-3.5" />
            Last seen {lastSeen}
            {deadline && (
              <>
                {" "}· next step {formatDistanceToNow(deadline, { addSuffix: true })}
              </>
            )}
          </p>
        </div>
      </div>

      <ActivitySettingsForm
        initial={{
          inactivityThresholdDays: settings.inactivityThresholdDays,
          checkinGraceDays: settings.checkinGraceDays,
          beneficiaryGraceDays: settings.beneficiaryGraceDays,
        }}
      />

      <div>
        <h2 className="font-semibold mb-3">Beneficiaries</h2>
        <BeneficiaryList initial={tree} />
      </div>

      {events.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Recent activity</h2>
          <ul className="space-y-3">
            {events.map((event) => {
              const copy = EVENT_COPY[event.type] ?? { icon: Clock, label: event.type };
              const Icon = copy.icon;
              return (
                <li key={event.id} className="flex items-center gap-3 text-sm">
                  <Icon className="size-4 text-muted shrink-0" />
                  <span className="flex-1">{copy.label}</span>
                  <span className="text-xs text-muted shrink-0">
                    {formatDistanceToNow(event.createdAt, { addSuffix: true })}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
