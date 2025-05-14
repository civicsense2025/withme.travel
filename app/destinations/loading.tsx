// Loading component for destinations page
import { Skeleton } from '@/components/ui/skeleton';
import { LAYOUT } from './constants';

export default function Loading() {
  return (
    <main className={LAYOUT.CONTAINER_CLASS} aria-busy="true" aria-label="Loading destinations">
      {/* Page header skeleton */}
      <div className="space-y-3 mb-10" aria-hidden="true">
        <Skeleton className="h-12 w-3/4 sm:w-1/2 max-w-md bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
        <Skeleton className="h-5 w-full sm:w-3/4 max-w-2xl bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
      </div>

      {/* Destinations grid skeleton */}
      <div className={LAYOUT.GRID_CLASS} aria-hidden="true">
        {[...Array(LAYOUT.SKELETON_COUNT)].map((_, i) => (
          <div key={i} className="relative w-full">
            <Skeleton
              className={`rounded-2xl w-full ${LAYOUT.ITEM_HEIGHT} border-2 border-black dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800`}
            />
            <div className="absolute bottom-4 left-4 right-4">
              <Skeleton className="h-6 w-2/3 mb-2 bg-white/80 dark:bg-black/80 rounded-md" />
              <Skeleton className="h-4 w-1/2 bg-white/80 dark:bg-black/80 rounded-md" />
            </div>
            <div className="absolute top-3 right-3">
              <div className="h-8 w-8 rounded-full bg-travel-purple/20 border border-travel-purple/30"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
