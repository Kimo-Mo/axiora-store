import { Skeleton } from '@/components/ui';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen py-8">
      <div className="space-y-6">
        {/* ── Header Skeleton ── */}
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 md:size-20 rounded-2xl bg-muted shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <Skeleton className="h-8 bg-muted rounded-lg w-1/2 max-w-50" />
            <Skeleton className="h-4 bg-muted rounded-lg w-2/3 max-w-62.5" />
            <Skeleton className="h-5 bg-muted rounded-full w-16 mt-1" />
          </div>
        </div>

        {/* ── Quick Nav Skeleton ── */}
        <div className="flex flex-wrap gap-3 *:lg:flex-none *:flex-1">
          <Skeleton className="h-18.5 min-w-45 bg-muted rounded-xl border border-transparent" />
          <Skeleton className="h-18.5 min-w-45 bg-muted rounded-xl border border-transparent" />
        </div>

        {/* ── Account Information Skeleton ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="size-5 bg-muted rounded-md" />
            <Skeleton className="h-4 bg-muted rounded w-44" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-17.5 bg-muted rounded-xl" />
            <Skeleton className="h-17.5 bg-muted rounded-xl" />
            <Skeleton className="h-17.5 bg-muted rounded-xl" />
            <Skeleton className="h-17.5 bg-muted rounded-xl" />
          </div>
        </div>

        {/* ── Security Skeleton ── */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="size-5 bg-muted rounded-md" />
            <Skeleton className="h-4 bg-muted rounded w-24" />
          </div>
          <Skeleton className="h-18.5 bg-muted rounded-xl" />
        </div>

        {/* ── Logout Button Skeleton ── */}
        <div className="max-w-2xl mx-auto w-full pt-4">
          <Skeleton className="h-11 bg-muted rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
