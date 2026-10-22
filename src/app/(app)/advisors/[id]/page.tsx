import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getAdvisorById } from "@/lib/repositories/advisors";
import { formatMoney } from "@/lib/format";
import { ConsultationRequestForm } from "@/components/consultation-request-form";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function AdvisorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ assetId?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { assetId } = await searchParams;
  const advisor = await getAdvisorById(id);
  if (!advisor) notFound();

  return (
    <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Avatar name={advisor.name} className="size-14 text-lg" />
            <div>
              <h1 className="text-2xl font-bold">{advisor.name}</h1>
              <p className="text-primary font-medium">{advisor.specialty}</p>
            </div>
          </div>
          {advisor.verified === true && (
            <Badge tone="primary" icon={<BadgeCheck className="size-3.5" />}>
              Verified
            </Badge>
          )}
        </div>

        <p className="mt-5 text-sm leading-relaxed">{advisor.bio}</p>

        <dl className="grid sm:grid-cols-3 gap-4 mt-6 text-sm">
          <div className="rounded-lg bg-background p-3">
            <dt className="text-muted text-xs">County</dt>
            <dd className="font-medium mt-0.5">{advisor.county || "Not set"}</dd>
          </div>
          <div className="rounded-lg bg-background p-3">
            <dt className="text-muted text-xs">Experience</dt>
            <dd className="font-medium mt-0.5">
              {advisor.yearsExperience != null ? `${advisor.yearsExperience} years` : "Not set"}
            </dd>
          </div>
          <div className="rounded-lg bg-background p-3">
            <dt className="text-muted text-xs">Rate</dt>
            <dd className="font-medium mt-0.5">
              {advisor.hourlyRateKes != null ? `${formatMoney(advisor.hourlyRateKes)}/hr` : "On request"}
            </dd>
          </div>
        </dl>
      </div>

      <ConsultationRequestForm advisorId={advisor.id} assetId={assetId} />
    </div>
  );
}
