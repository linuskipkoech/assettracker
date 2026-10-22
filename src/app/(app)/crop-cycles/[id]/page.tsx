import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Sprout, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getCropCycleForUser, summarizeCropCycle } from "@/lib/repositories/crop-cycles";
import { getAssetForUser } from "@/lib/repositories/assets";
import {
  CROP_CYCLE_STATUS_LABELS,
  CROP_EXPENSE_CATEGORY_LABELS,
  type CropCycleStatus,
} from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  AddExpenseForm,
  CloseOutForm,
  DeleteCycleButton,
  DeleteExpenseButton,
} from "@/components/crop-cycles/crop-cycle-ui";

const STATUS_TONE: Record<string, "primary" | "warning" | "success" | "default"> = {
  PLANNED: "default",
  GROWING: "primary",
  HARVESTED: "warning",
  SOLD: "success",
};

export default async function CropCyclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const cycle = await getCropCycleForUser(id, user.id);
  if (!cycle) notFound();

  const farm = await getAssetForUser(cycle.assetId, user.id);
  const summary = summarizeCropCycle(cycle, cycle.expenses);
  const sortedExpenses = [...cycle.expenses].sort(
    (a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime(),
  );
  const categoryEntries = Object.entries(summary.expensesByCategory).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <Link
        href={farm ? `/assets/${farm.id}` : "/assets"}
        className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
      >
        <ArrowLeft className="size-4" />
        {farm ? `Back to ${farm.name}` : "Back to assets"}
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-primary font-medium flex items-center gap-1">
            <Sprout className="size-4" />
            Crop cycle{farm ? ` · ${farm.name}` : ""}
          </p>
          <h1 className="text-2xl font-bold mt-1">{cycle.name}</h1>
          <p className="text-sm text-muted mt-1 flex items-center gap-2 flex-wrap">
            <Badge tone={STATUS_TONE[cycle.status] ?? "default"}>
              {CROP_CYCLE_STATUS_LABELS[cycle.status as CropCycleStatus] ?? cycle.status}
            </Badge>
            {cycle.acreage ? <span>{cycle.acreage} acres</span> : null}
            {cycle.plantingDate ? <span>Planted {formatDate(cycle.plantingDate)}</span> : null}
            {cycle.expectedHarvestDate ? (
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3.5" />
                Expected harvest {formatDate(cycle.expectedHarvestDate)}
              </span>
            ) : null}
          </p>
        </div>
        <CloseOutForm
          cycleId={cycle.id}
          initial={{
            status: cycle.status,
            harvestQuantity: cycle.harvestQuantity,
            harvestUnit: cycle.harvestUnit,
            harvestedDate: cycle.harvestedDate,
            saleRevenue: cycle.saleRevenue,
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="label mb-1 flex items-center gap-1">
            <TrendingDown className="size-3.5" /> Total costs so far
          </p>
          <p className="text-2xl font-bold">{formatMoney(summary.totalExpenses)}</p>
          <p className="text-xs text-muted mt-1">
            {summary.expenseCount} expense{summary.expenseCount === 1 ? "" : "s"} recorded
            {summary.costPerAcre != null
              ? ` · ${formatMoney(Math.round(summary.costPerAcre))} per acre`
              : ""}
          </p>
        </div>
        <div className="card p-5">
          <p className="label mb-1 flex items-center gap-1">
            <TrendingUp className="size-3.5" /> Harvest revenue
          </p>
          <p className="text-2xl font-bold">
            {summary.hasRevenue ? formatMoney(summary.saleRevenue) : "—"}
          </p>
          <p className="text-xs text-muted mt-1">
            {cycle.harvestQuantity != null
              ? `Yield: ${cycle.harvestQuantity} ${cycle.harvestUnit ?? ""}`
              : "Record the harvest when it's in"}
          </p>
        </div>
        <div className="card p-5">
          <p className="label mb-1 flex items-center gap-1">
            <Wallet className="size-3.5" /> Season profit
          </p>
          {summary.hasRevenue ? (
            <>
              <p
                className={`text-2xl font-bold ${summary.grossProfit >= 0 ? "text-success" : "text-danger"}`}
              >
                {formatMoney(summary.grossProfit)}
              </p>
              <p className="text-xs text-muted mt-1">
                Revenue minus every recorded cost
                {summary.profitPerAcre != null
                  ? ` · ${formatMoney(Math.round(summary.profitPerAcre))} per acre`
                  : ""}
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-muted">Not yet</p>
              <p className="text-xs text-muted mt-1">
                Profit appears once the harvest is sold — costs so far are{" "}
                {formatMoney(summary.totalExpenses)}
              </p>
            </>
          )}
        </div>
        <div className="card p-5">
          <p className="label mb-1">Biggest cost</p>
          {categoryEntries.length > 0 ? (
            <>
              <p className="text-2xl font-bold">{formatMoney(categoryEntries[0][1])}</p>
              <p className="text-xs text-muted mt-1">
                {CROP_EXPENSE_CATEGORY_LABELS[
                  categoryEntries[0][0] as keyof typeof CROP_EXPENSE_CATEGORY_LABELS
                ] ?? categoryEntries[0][0]}{" "}
                · {Math.round((categoryEntries[0][1] / summary.totalExpenses) * 100)}% of costs
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">No expenses yet</p>
          )}
        </div>
      </div>

      {categoryEntries.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Where the money went</h2>
          <div className="space-y-3">
            {categoryEntries.map(([category, total]) => (
              <div key={category} className="flex items-center gap-3">
                <p className="text-sm w-44 shrink-0 truncate">
                  {CROP_EXPENSE_CATEGORY_LABELS[
                    category as keyof typeof CROP_EXPENSE_CATEGORY_LABELS
                  ] ?? category}
                </p>
                <div className="flex-1 h-2.5 rounded-full bg-border/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(3, (total / summary.totalExpenses) * 100)}%` }}
                  />
                </div>
                <p className="text-sm font-medium w-28 text-right shrink-0">
                  {formatMoney(total)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold">Expenses along the way</h2>
        {sortedExpenses.length === 0 ? (
          <p className="text-sm text-muted">
            Nothing recorded yet. Add the first cost below — seeds, land prep, fertilizer —
            and this page becomes your season&apos;s true cost picture.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {sortedExpenses.map((expense) => (
              <li key={expense.id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{expense.description}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {CROP_EXPENSE_CATEGORY_LABELS[
                      expense.category as keyof typeof CROP_EXPENSE_CATEGORY_LABELS
                    ] ?? expense.category}{" "}
                    · {formatDate(expense.expenseDate)}
                    {expense.liabilityId ? " · bought on credit (also a liability on this farm)" : ""}
                  </p>
                </div>
                <p className="font-semibold shrink-0">{formatMoney(expense.amount)}</p>
                <DeleteExpenseButton cycleId={cycle.id} expenseId={expense.id} />
              </li>
            ))}
          </ul>
        )}
        <div className="pt-2 border-t border-border">
          <AddExpenseForm cycleId={cycle.id} />
        </div>
      </div>

      {cycle.notes && (
        <div className="card p-6">
          <h2 className="font-semibold mb-2">Notes</h2>
          <p className="text-sm">{cycle.notes}</p>
        </div>
      )}

      <div className="flex justify-end">
        <DeleteCycleButton cycleId={cycle.id} cycleName={cycle.name} />
      </div>
    </div>
  );
}
