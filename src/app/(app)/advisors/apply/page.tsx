import { requireUser } from "@/lib/session";
import { getAdvisorProfileForUser } from "@/lib/repositories/advisors";
import { AdvisorProfileForm } from "@/components/advisor-profile-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function ApplyAdvisorPage() {
  const user = await requireUser();
  const profile = await getAdvisorProfileForUser(user.id);

  return (
    <div className="mx-auto max-w-2xl w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <PageHeader
        title={profile ? "Edit your advisor profile" : "Become an advisor"}
        description={
          profile
            ? "Get listed in the advisors directory so users can request consultations directly from you."
            : "Get listed in the advisors directory so users can request consultations directly from you. New profiles start unverified — the app owner can mark trusted advisors as verified."
        }
      />
      <AdvisorProfileForm
        initial={
          profile
            ? {
                specialty: profile.specialty,
                bio: profile.bio,
                yearsExperience: profile.yearsExperience?.toString() ?? "",
                hourlyRateKes: profile.hourlyRateKes?.toString() ?? "",
                county: profile.county ?? "",
              }
            : undefined
        }
      />
    </div>
  );
}
