'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { getRandomColorClass } from "@/lib/utils";

interface TripCardSkeletonProps {
  delayIndex?: number;
  pulse?: boolean;
}

/**
 * A skeleton loading state for trip cards
 * Used when trip data is being fetched
 */
export function TripCardSkeleton({ delayIndex = 0, pulse = true }: TripCardSkeletonProps) {
  // Generate a random pastel color class for variety
  const colorClass = getRandomColorClass();
  const delay = delayIndex * 0.1;

  return (
    <motion.div
      className="rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 max-w-xs mx-auto h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="relative h-48 w-full">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      <div className={`p-4 ${colorClass} bg-opacity-30`}>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-black/10 flex justify-between items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * A grid of skeleton trip cards for loading states
 */
export function TripCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <TripCardSkeleton key={i} delayIndex={i} />
      ))}
    </div>
  );
}

