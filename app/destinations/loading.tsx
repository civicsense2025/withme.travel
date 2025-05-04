// Loading component for destinations page
import { Skeleton } from '@/components/ui/skeleton';
import { LAYOUT } from './constants';

export default function Loading() {
  return (
    <main className={LAYOUT.CONTAINER_CLASS} aria-busy="true" aria-label="Loading destinations">
      {/* Page header skeleton */}
      <div className="space-y-3 mb-10" aria-hidden="true">
        <Skeleton className="h-12 w-3/4 sm:w-1/2 max-w-md" />
        <Skeleton className="h-5 w-full sm:w-3/4 max-w-2xl" />
      </div>

      {/* Destinations grid skeleton */}
      <div className={LAYOUT.GRID_CLASS} aria-hidden="true">
        {[...Array(LAYOUT.SKELETON_COUNT)].map((_, i) => (
          <Skeleton 
            key={i} 
            className={`rounded-3xl w-full ${LAYOUT.ITEM_HEIGHT}`}
          />
        ))}
      </div>
    </main>
  );
}
