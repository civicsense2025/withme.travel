import React from 'react';
import { CardGrid, CardGridSortOption } from './card-grid';
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

const sortOptions: CardGridSortOption[] = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'A-Z', value: 'az' },
];

export function PopularDestinationsGrid({ destinations }: { destinations: Destination[] }) {
  // Only show top 8 by popularity (sum of ratings)
  const topDestinations = [...destinations]
    .sort(
      (a, b) =>
        b.cuisine_rating +
        b.nightlife_rating +
        b.cultural_attractions +
        b.outdoor_activities +
        b.beach_quality -
        (a.cuisine_rating +
          a.nightlife_rating +
          a.cultural_attractions +
          a.outdoor_activities +
          a.beach_quality)
    )
    .slice(0, 8);

  return (
    <CardGrid
      items={topDestinations}
      renderItem={(item) => <DestinationCard destination={item} />}
      sortOptions={sortOptions}
      getSortValue={(item, sort) =>
        sort === 'az'
          ? (item.name || item.city || '').toLowerCase()
          : -(
              item.cuisine_rating +
              item.nightlife_rating +
              item.cultural_attractions +
              item.outdoor_activities +
              item.beach_quality
            )
      }
      getSearchText={(item) =>
        [item.name, item.city, item.country, item.description].filter(Boolean).join(' ')
      }
      searchPlaceholder="Search popular destinations..."
    />
  );
}
