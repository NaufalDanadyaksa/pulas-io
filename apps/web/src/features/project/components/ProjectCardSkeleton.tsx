import { Skeleton } from '@pulas/ui';

export function ProjectCardSkeleton() {
  return (
    <div
      data-testid="project-card-skeleton"
      className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div>
        <div className="flex items-start justify-between">
          <Skeleton className="h-11 w-11 rounded-lg" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
