import React from 'react';
import { CardGrid, CardGridFilter, CardGridSortOption } from './card-grid';
import { ItineraryTemplateCard } from '../../components/itinerary-template-card';

export interface ItineraryTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  popularity: number;
  slug: string;
  cover_image_url: string | null;
  // ...other fields
}

const filters: CardGridFilter[] = [
  { label: 'All', value: 'all' },
  { label: 'Beach', value: 'beach' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'City', value: 'city' },
  { label: 'Nature', value: 'nature' },
];

const sortOptions: CardGridSortOption[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Popular', value: 'popular' },
];

export function ItineraryTemplateGrid({ templates }: { templates: ItineraryTemplate[] }) {
  return (
    <CardGrid
      items={templates}
      renderItem={(item) => <ItineraryTemplateCard itinerary={item} />}
      filters={filters}
      sortOptions={sortOptions}
      getFilterValue={(item) => item.category}
      getSortValue={(item, sort) =>
        sort === 'newest' ? new Date(item.created_at).getTime() : item.popularity
      }
      getSearchText={(item) => item.title + ' ' + item.description}
      searchPlaceholder="Search templates..."
    />
  );
}
