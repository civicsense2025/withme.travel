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
  // Keep these fields for type compatibility, but default them to safe values
  cuisine_rating?: number;
  nightlife_rating?: number;
  cultural_attractions?: number;
  outdoor_activities?: number;
  beach_quality?: number;
  best_season?: string;
  avg_cost_per_day?: number;
  safety_rating?: number;
  name?: string;
  created_at?: string;
}

interface PopularDestinationsGridProps {
  destinations: Destination[];
  maxItems?: number;
  onSelectDestination?: (destination: Destination) => void;
}

const sortOptions: CardGridSortOption[] = [
  { label: 'A-Z', value: 'az' },
  { label: 'Recent', value: 'recent' },
];

export function PopularDestinationsGrid({ 
  destinations, 
  maxItems = 8, 
  onSelectDestination 
}: PopularDestinationsGridProps) {
  // Simply take the first N destinations, without trying to sort by ratings
  const limitedDestinations = destinations.slice(0, maxItems).map(dest => ({
    ...dest,
    // Add default values for required rating fields
    cuisine_rating: dest.cuisine_rating ?? 0,
    nightlife_rating: dest.nightlife_rating ?? 0,
    cultural_attractions: dest.cultural_attractions ?? 0,
    outdoor_activities: dest.outdoor_activities ?? 0,
    beach_quality: dest.beach_quality ?? 0
  }));

  const handleDestinationClick = (destination: Destination) => {
    console.log('Destination clicked:', destination);
    if (onSelectDestination) {
      onSelectDestination(destination);
    }
  };

  return (
    <CardGrid
      items={limitedDestinations}
      renderItem={(item) => (
        <DestinationCard 
          destination={item} 
          onClick={() => handleDestinationClick(item)}
          className="cursor-pointer hover:shadow-md transition-shadow"
        />
      )}
      sortOptions={sortOptions}
      getSortValue={(item, sort) =>
        sort === 'az'
          ? (item.name || item.city || '').toLowerCase()
          : -(new Date(item.created_at || Date.now()).getTime())
      }
      getSearchText={(item) =>
        [item.name, item.city, item.country, item.description].filter(Boolean).join(' ')
      }
      searchPlaceholder="Search popular destinations..."
    />
  );
}
