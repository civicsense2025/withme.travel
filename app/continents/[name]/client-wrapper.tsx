'use client';

import { useState, useEffect } from 'react';
import { ContinentPageAdminEditor } from '@/components/features/admin';
import { useDestinationStats } from '@/hooks/use-destination-stats';
import { Skeleton } from '@/components/ui/skeleton';

interface ContinentStatsClientWrapperProps {
  continent: string;
  countriesCount: number;
  destinationsCount: number;
}

export function ContinentStatsClientWrapper({
  continent,
  countriesCount,
  destinationsCount,
}: ContinentStatsClientWrapperProps) {
  const { stats, isLoading, error } = useDestinationStats({
    type: 'continent',
    name: continent,
  });

  // Merge the server-side destinations count with the client-side stats
  const mergedStats = {
    ...stats,
    countries_count: countriesCount,
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
    return <div className="text-red-500">Error loading continent statistics: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">Countries</h3>
          <p className="text-3xl font-bold">{countriesCount}</p>
        </div>

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
      </div>

      <div className="mt-6">
        <ContinentPageAdminEditor continent={continent} stats={mergedStats} />
      </div>

      <div className="prose max-w-none dark:prose-invert">
        <h2>About {continent}</h2>
        {stats.description ? (
          <p>{stats.description}</p>
        ) : (
          <p>
            {continent} is home to {countriesCount} {countriesCount === 1 ? 'country' : 'countries'}{' '}
            and {destinationsCount} {destinationsCount === 1 ? 'destination' : 'destinations'}, each
            offering unique experiences for travelers.
          </p>
        )}

        {stats.high_season && (
          <p>
            <strong>High Season:</strong>{' '}
            {stats.high_season.charAt(0).toUpperCase() + stats.high_season.slice(1)}
          </p>
        )}

        {stats.recommended_currencies && (
          <p>
            <strong>Recommended Currencies:</strong> {stats.recommended_currencies}
          </p>
        )}
      </div>
    </div>
  );
}
