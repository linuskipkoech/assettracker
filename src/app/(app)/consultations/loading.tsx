import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function ConsultationsLoading() {
  return (
    <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 py-8 space-y-8">
      <Skeleton className="h-7 w-48" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} lines={2} />
        ))}
      </div>
    </div>
  );
}
