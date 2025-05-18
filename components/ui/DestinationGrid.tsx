'use client';

import React from 'react';
import { CardGrid, CardGridFilter, CardGridSortOption } from './card-grid';
import { DestinationCard } from '../destination-card';

// Match the props expected by DestinationCard
export interface Destination {
  id: string;
  city: string | null;
  country: string | null;
  continent: string;
  description: string | null;
  byline?: string | null;
  highlights?: string[] | string | null;
  image_url?: string | null;
  emoji?: string | null;
  image_metadata?: {
    alt_text?: string;
    attribution?: string;
    attributionHtml?: string;
    photographer_name?: string;
    photographer_url?: string;
    source?: string;
    source_id?: string;
    url?: string;
  };
  cuisine_rating: number;
  nightlife_rating: number;
  cultural_attractions: number;
  outdoor_activities: number;
  beach_quality: number;
  best_season?: string;
  avg_cost_per_day?: number;
  safety_rating?: number;
  name?: string;
  created_at?: string;
  // ...other fields
}

const filters: CardGridFilter[] = [
  { label: 'All', value: 'all' },
  { label: 'Europe', value: 'Europe' },
  { label: 'Asia', value: 'Asia' },
  { label: 'Americas', value: 'Americas' },
  { label: 'Africa', value: 'Africa' },
  { label: 'Oceania', value: 'Oceania' },
];

const sortOptions: CardGridSortOption[] = [
  { label: 'Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
];

export function DestinationGrid({ destinations }: { destinations: Destination[] }) {
  return (
    <CardGrid
      items={destinations}
      renderItem={(item) => <DestinationCard destination={item} />}
      filters={filters}
      sortOptions={sortOptions}
      getFilterValue={(item) => item.continent}
      getSortValue={(item, sort) =>
        sort === 'newest'
          ? new Date(item.created_at ?? '').getTime()
          : item.cuisine_rating +
            item.nightlife_rating +
            item.cultural_attractions +
            item.outdoor_activities +
            item.beach_quality
      }
      getSearchText={(item) =>
        [item.name, item.city, item.country, item.description].filter(Boolean).join(' ')
      }
      searchPlaceholder="Search destinations..."
    />
  );
}
