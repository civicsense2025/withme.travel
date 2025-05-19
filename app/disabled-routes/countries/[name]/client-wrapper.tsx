'use client';

import { useState, useEffect } from 'react';
import { CountryPageAdminEditor } from '@/components/features/admin';
import { useDestinationStats } from '@/hooks/use-destination-stats';
import { Skeleton } from '@/components/ui/skeleton';

interface CountryStatsClientWrapperProps {
  country: string;
  destinationsCount: number;
}

export function CountryStatsClientWrapper({
  country,
  destinationsCount,
}: CountryStatsClientWrapperProps) {
  const { stats, isLoading, error } = useDestinationStats({
    type: 'country',
    name: country,
  });

  // Merge the server-side destinations count with the client-side stats
  const mergedStats = {
    ...stats,
    destinations_count: destinationsCount,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading country statistics: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">Destinations</h3>
          <p className="text-3xl font-bold">{destinationsCount}</p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">Avg. Cost Per Day</h3>
          <p className="text-3xl font-bold">
            {stats.avg_cost_per_day ? `$${stats.avg_cost_per_day}` : 'N/A'}
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">Avg. Safety Rating</h3>
          <p className="text-3xl font-bold">
            {stats.avg_safety_rating ? `${stats.avg_safety_rating}/5` : 'N/A'}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <CountryPageAdminEditor country={country} stats={mergedStats} />
      </div>

      <div className="prose max-w-none dark:prose-invert">
        <h2>About {country}</h2>
        <p>
          {stats.local_language ? (
            <>
              The local language in {country} is {stats.local_language}.{' '}
              {stats.visa_required
                ? 'A visa is required for most visitors.'
                : 'Visa is not required for most visitors.'}
            </>
          ) : (
            <>
              {country} is a fascinating destination with unique culture and attractions.
              {stats.visa_required
                ? ' A visa is required for most visitors.'
                : ' Visa is not required for most visitors.'}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
