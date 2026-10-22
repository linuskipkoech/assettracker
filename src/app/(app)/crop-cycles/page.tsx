import Link from "next/link";
import { ChevronRight, Sprout } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listCropCyclesForUser, summarizeCropCycle } from "@/lib/repositories/crop-cycles";
import { listAssetsForUser } from "@/lib/repositories/assets";
import { CROP_CYCLE_STATUS_LABELS, type CropCycleStatus } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

const STATUS_TONE: Record<string, "primary" | "warning" | "success" | "default"> = {
  PLANNED: "default",
  GROWING: "primary",
  HARVESTED: "warning",
  SOLD: "success",
};

export default async function CropCyclesPage() {
  const user = await requireUser();
  const [cycles, userAssets] = await Promise.all([
    listCropCyclesForUser(user.id),
    listAssetsForUser(user.id),
  ]);
  const farmNameById = new Map(userAssets.map((a) => [a.id, a.name]));
  const firstFarm = userAssets.find((a) => a.type === "FARM");

  return (
    <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <PageHeader
        title="Crop cycles"
        description="Every season from planting to harvest — every expense recorded along the way, so you can see what a crop truly cost and what it truly earned."
      />

      {cycles.length === 0 ? (
        <EmptyState
          icon={<Sprout className="size-5" />}
          title="No crop cycles yet"
          description={
            firstFarm
              ? `Start your first cycle on ${firstFarm.name}: record seeds, fertilizer, labour and the rest as you spend, then close the season with your harvest and sale.`
              : "Crop cycles live on a farm. Add a farm asset first, then start a cycle on it to track a crop from planting to harvest."
          }
          action={
            firstFarm ? (
              <Link href={`/assets/${firstFarm.id}`} className="btn-primary px-4 py-2 mt-1">
                <Sprout className="size-4" />
                Go to your farm
              </Link>
            ) : (
              <Link href="/assets/new" className="btn-primary px-4 py-2 mt-1">
                Add a farm asset
              </Link>
            )
          }
        />
      ) : (
        <div className="card divide-y divide-border overflow-hidden">
          {cycles.map((cycle) => {
            const summary = summarizeCropCycle(cycle, cycle.expenses);
            return (
              <Link
                key={cycle.id}
                href={`/crop-cycles/${cycle.id}`}
                className="flex items-center gap-3 p-4 hover:bg-black/[.02] dark:hover:bg-white/[.03] transition-colors"
              >
                <div className="size-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <Sprout className="size-[45%]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate flex items-center gap-2">
                    {cycle.name}
                    <Badge tone={STATUS_TONE[cycle.status] ?? "default"}>
                      {CROP_CYCLE_STATUS_LABELS[cycle.status as CropCycleStatus] ?? cycle.status}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted mt-0.5 truncate">
                    {farmNameById.get(cycle.assetId) ?? "Farm"}
                    {cycle.acreage ? ` · ${cycle.acreage} acres` : ""}
                    {cycle.plantingDate ? ` · Planted ${formatDate(cycle.plantingDate)}` : ""}
                    {" · "}Costs {formatMoney(summary.totalExpenses)}
                    {summary.hasRevenue
                      ? ` · Profit ${formatMoney(summary.grossProfit)}`
                      : ""}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground shrink-0 hidden sm:block" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
