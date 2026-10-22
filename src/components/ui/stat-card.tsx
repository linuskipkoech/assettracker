import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  trend?: { value: string; direction: "up" | "down" | "flat" };
}) {
  return (
    <div className="card p-6 card-interactive">
      <div className="flex items-center justify-between mb-3">
        <p className="label mb-0">{label}</p>
        <div className="size-9 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
      {trend && (
        <p
          className={`text-xs font-medium mt-2 flex items-center gap-1 ${
            trend.direction === "up"
              ? "text-success"
              : trend.direction === "down"
                ? "text-danger"
                : "text-muted"
          }`}
        >
          {trend.direction === "up" && <ArrowUpRight className="size-3.5" />}
          {trend.direction === "down" && <ArrowDownRight className="size-3.5" />}
          {trend.value}
        </p>
      )}
    </div>
  );
}
