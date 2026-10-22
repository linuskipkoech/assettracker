import Link from "next/link";
import { Plus, Wallet, ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listAssetsForUser } from "@/lib/repositories/assets";
import { ASSET_TYPE_LABELS, type AssetType } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { AssetTypeIconBadge } from "@/components/ui/asset-type-icon";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await requireUser();
  const { type } = await searchParams;
  const assets = await listAssetsForUser(user.id);
  const filtered = type ? assets.filter((a) => a.type === type) : assets;

  const types = Array.from(new Set(assets.map((a) => a.type)));

  return (
    <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <PageHeader
        title="Your assets"
        description={`${assets.length} asset${assets.length === 1 ? "" : "s"} tracked across ${types.length} categor${types.length === 1 ? "y" : "ies"}.`}
        actions={
          <Link href="/assets/new" className="btn-primary px-4 py-2">
            <Plus className="size-4" />
            Add an asset
          </Link>
        }
      />

      {types.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/assets"
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              !type ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-border-strong"
            }`}
          >
            All ({assets.length})
          </Link>
          {types.map((t) => (
            <Link
              key={t}
              href={`/assets?type=${t}`}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                type === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-border-strong"
              }`}
            >
              {ASSET_TYPE_LABELS[t as AssetType] ?? t} ({assets.filter((a) => a.type === t).length})
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Wallet className="size-5" />}
          title="No assets here yet"
          description="Add your first asset to see it tracked here."
          action={
            <Link href="/assets/new" className="btn-primary px-4 py-2 mt-1">
              <Plus className="size-4" />
              Add an asset
            </Link>
          }
        />
      ) : (
        <div className="card divide-y divide-border overflow-hidden">
          {filtered.map((asset) => (
            <Link
              key={asset.id}
              href={`/assets/${asset.id}`}
              className="flex items-center gap-3 p-4 hover:bg-black/[.02] dark:hover:bg-white/[.03] transition-colors"
            >
              <AssetTypeIconBadge type={asset.type as AssetType} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{asset.name}</p>
                <p className="text-xs text-muted mt-0.5 truncate">
                  {ASSET_TYPE_LABELS[asset.type as AssetType] ?? asset.type}
                  {asset.county ? ` · ${asset.county}` : ""} · Updated {formatDate(asset.updatedAt)}
                </p>
              </div>
              <p className="font-semibold shrink-0">{formatMoney(asset.currentValue, asset.currency)}</p>
              <ChevronRight className="size-4 text-muted-foreground shrink-0 hidden sm:block" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
