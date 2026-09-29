import { Skeleton } from '@/components/ui';

export default function OrdersLoading() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        {/* Back + title skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-xl bg-muted shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 bg-muted rounded w-36" />
            <Skeleton className="h-4 bg-muted rounded w-24" />
          </div>
        </div>

        {/* Search skeleton */}
        <Skeleton className="h-10 bg-muted rounded-xl" />

        {/* Filter tabs skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 bg-muted rounded-lg w-20" />
          ))}
        </div>

        {/* Order cards skeleton */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border">
            <Skeleton className="size-11 rounded-xl bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-4 bg-muted rounded w-24" />
                <Skeleton className="h-4 bg-muted rounded-full w-20" />
              </div>
              <Skeleton className="h-4 bg-muted rounded w-40" />
              <Skeleton className="h-3 bg-muted rounded w-28" />
            </div>
            <div className="space-y-2 items-end flex flex-col shrink-0">
              <Skeleton className="h-5 bg-muted rounded w-14" />
              <Skeleton className="h-7 bg-muted rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
