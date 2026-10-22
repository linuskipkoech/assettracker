import {
  Sprout,
  Beef,
  Briefcase,
  TrendingUp,
  MapPin,
  Building2,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { AssetType } from "@/lib/constants";

export const ASSET_TYPE_ICON: Record<AssetType, LucideIcon> = {
  FARM: Sprout,
  LIVESTOCK: Beef,
  BUSINESS: Briefcase,
  STOCK: TrendingUp,
  LAND: MapPin,
  PROPERTY: Building2,
  OTHER: Package,
};

export const ASSET_TYPE_COLOR: Record<AssetType, string> = {
  FARM: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  LIVESTOCK: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  BUSINESS: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  STOCK: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  LAND: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  PROPERTY: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  OTHER: "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/15 dark:text-neutral-400",
};

export function AssetTypeIcon({
  type,
  className = "size-5",
}: {
  type: AssetType | string;
  className?: string;
}) {
  const Icon = ASSET_TYPE_ICON[type as AssetType] ?? Package;
  return <Icon className={className} />;
}

export function AssetTypeIconBadge({ type, size = "size-10" }: { type: AssetType | string; size?: string }) {
  const Icon = ASSET_TYPE_ICON[type as AssetType] ?? Package;
  const color = ASSET_TYPE_COLOR[type as AssetType] ?? ASSET_TYPE_COLOR.OTHER;
  return (
    <div className={`${size} rounded-lg flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="size-[45%]" />
    </div>
  );
}
