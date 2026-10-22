import { Skeleton, ListSkeleton } from "@/components/ui/skeleton";

export default function AssetsLoading() {
  return (
    <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <ListSkeleton rows={6} />
    </div>
  );
}
