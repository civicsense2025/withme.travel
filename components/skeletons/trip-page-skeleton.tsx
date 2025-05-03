'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * A skeleton loading state component for the trip page.
 * Shows placeholder elements while the trip data is being loaded.
 */
export function TripPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        {/* Cover image skeleton */}
        <Skeleton className="w-full h-48 md:h-64 rounded-lg mb-6" />

        {/* Title skeleton */}
        <Skeleton className="h-10 w-3/4 mb-4" />

        {/* Description skeleton */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-5" />

        {/* Meta info skeletons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-28" />
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <Tabs defaultValue="skeleton" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </TabsList>

        <TabsContent value="skeleton" className="mt-0">
          {/* Itinerary skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating action button skeleton */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10">
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    </div>
  );
}
