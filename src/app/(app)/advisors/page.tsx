import Link from "next/link";
import { Users, BadgeCheck, MapPin, Info } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listAdvisors, getAdvisorProfileForUser } from "@/lib/repositories/advisors";
import { ADVISOR_SPECIALTIES, KENYA_COUNTIES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function AdvisorsPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; county?: string; assetId?: string }>;
}) {
  const user = await requireUser();
  const { specialty, county, assetId } = await searchParams;
  const [advisors, myProfile] = await Promise.all([
    listAdvisors({ specialty, county }),
    getAdvisorProfileForUser(user.id),
  ]);

  const query = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { specialty, county, assetId, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/advisors?${qs}` : "/advisors";
  };

  return (
    <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <PageHeader
        title="Professional advisors"
        description="Get advice tailored to your situation from agronomy, business, investment, real estate, legal, and tax professionals."
        actions={
          <Link href="/advisors/apply" className="btn-secondary px-4 py-2">
            {myProfile ? "Edit my advisor profile" : "Become an advisor"}
          </Link>
        }
      />

      {assetId && (
        <div className="card p-4 bg-info-light border-info/20 text-sm flex items-center gap-2">
          <Info className="size-4 text-info shrink-0" />
          Requests you send will be linked to this asset.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href={query({ specialty: undefined })} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${!specialty ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-border-strong"}`}>
          All specialties
        </Link>
        {ADVISOR_SPECIALTIES.map((s) => (
          <Link
            key={s}
            href={query({ specialty: s })}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${specialty === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-border-strong"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted">County:</span>
        <Link href={query({ county: undefined })} className={`px-3 py-1 rounded-full text-xs border transition-colors ${!county ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-border-strong"}`}>
          Any
        </Link>
        {KENYA_COUNTIES.slice(0, 12).map((c) => (
          <Link
            key={c}
            href={query({ county: c })}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${county === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-border-strong"}`}
          >
            {c}
          </Link>
        ))}
      </div>

      {advisors.length === 0 ? (
        <EmptyState
          icon={<Users className="size-5" />}
          title="No advisors match those filters yet"
          description="Check back soon, or be the first to list yourself."
          action={
            <Link href="/advisors/apply" className="btn-primary px-4 py-2 mt-1">
              Become an advisor
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {advisors.map((advisor) => (
            <Link
              key={advisor.id}
              href={`/advisors/${advisor.id}${assetId ? `?assetId=${assetId}` : ""}`}
              className="card card-interactive p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={advisor.name} className="size-11 text-sm" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{advisor.name}</p>
                    <p className="text-sm text-primary truncate">{advisor.specialty}</p>
                  </div>
                </div>
                {advisor.verified === true && (
                  <Badge tone="primary" icon={<BadgeCheck className="size-3.5" />}>
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted mt-3 line-clamp-2">{advisor.bio}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {advisor.county || "Location not set"}
                </span>
                {advisor.hourlyRateKes != null && (
                  <span className="font-medium text-foreground">
                    {formatMoney(advisor.hourlyRateKes)}/hr
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
