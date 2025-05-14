import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function GroupsLoading() {
  return (
    <div className="container max-w-5xl py-8 md:py-16">
      <div className="flex justify-between items-center mb-12">
        <Skeleton className="h-12 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
        <Skeleton className="h-10 w-36 bg-travel-purple/10 dark:bg-travel-purple/20 rounded-full border-2 border-travel-purple/30" />
      </div>

      <div className="mb-8">
        <div className="border-b border-zinc-200 dark:border-zinc-800 mb-8 px-0">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
            <Skeleton className="h-10 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
            <Skeleton className="h-10 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 border-2 border-black dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-black"
            >
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-2" />
                <Skeleton className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-6" />
                <div className="mt-auto flex items-center">
                  <Skeleton className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state skeleton - only shown when needed */}
      <div className="hidden">
        <div className="text-center py-16 border-2 border-black dark:border-zinc-800 rounded-2xl shadow-sm bg-white dark:bg-black">
          <Skeleton className="h-16 w-16 rounded-full bg-travel-purple/10 dark:bg-travel-purple/20 mx-auto mb-6" />
          <Skeleton className="h-8 w-64 bg-zinc-100 dark:bg-zinc-800 rounded-lg mx-auto mb-3" />
          <Skeleton className="h-4 w-3/4 max-w-2xl bg-zinc-100 dark:bg-zinc-800 rounded-md mx-auto mb-2" />
          <Skeleton className="h-4 w-2/3 max-w-2xl bg-zinc-100 dark:bg-zinc-800 rounded-md mx-auto mb-8" />
          <Skeleton className="h-12 w-60 bg-travel-purple/10 dark:bg-travel-purple/20 rounded-full border-2 border-travel-purple/30 mx-auto" />
        </div>
      </div>

      {/* Friends list skeletons - shown in friends tab */}
      <div className="hidden mt-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 justify-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-2" />
              <Skeleton className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Skeleton className="h-12 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-full border-2 border-black/20 dark:border-zinc-700" />
        </div>
      </div>
    </div>
  );
}
