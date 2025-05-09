'use client';

import React, { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ItineraryFilters } from '@/components/itinerary-filters';
import { ItineraryTemplateCard } from '@/components/itinerary-template-card';
import { ItineraryTemplateMetadata } from '@/utils/constants/tables';
import { Badge } from '@/components/ui/badge';

// Define a minimal Destination type
interface Destination {
  id: string;
  name: string;
}

// Updated interface based on API response structure
interface Itinerary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  destination_id: string;
  duration_days: number;
  created_by: string;
  is_published: boolean;
  tags: string[];
  metadata: ItineraryTemplateMetadata;
  profile?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
  destinations?: {
    id: string;
    name: string;
    country: string;
    state: string | null;
    featured_image_url: string | null;
  } | null;
}

interface ClientWrapperProps {
  itineraries: Itinerary[];
  isAdmin: boolean;
  userId: string | null;
}

// Memoized wrapper component
const ClientWrapperContent = memo(({ 
  itineraries = [], 
  isAdmin = false, 
  userId = null 
}: ClientWrapperProps) => {
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Memoize visible itineraries to avoid recalculation on every render
  const visibleItineraries = useMemo(() => {
    return itineraries.filter(
      (item) => item.is_published || isAdmin || (userId && item.created_by === userId)
    );
  }, [itineraries, isAdmin, userId]);

  // Memoize filter options to prevent recalculation
  const { allDurations, allDestinations, allTags } = useMemo(() => {
    const durations = Array.from(
      new Set(visibleItineraries.map((i) => `${i.duration_days} days`))
    ).sort((a, b) => parseInt(a) - parseInt(b));

    const destinations = Array.from(
      new Set(
        visibleItineraries
          .filter((i) => i.destinations?.name)
          .map((i) => i.destinations?.name || '')
      )
    ).sort();

    const tags = Array.from(
      new Set(visibleItineraries.flatMap((i) => i.tags || []))
    ).filter(Boolean).sort();

    return { allDurations: durations, allDestinations: destinations, allTags: tags };
  }, [visibleItineraries]);

  // Memoize filtered and sorted itineraries
  const sortedItineraries = useMemo(() => {
    // Apply filters
    const filtered = visibleItineraries.filter((item) => {
      // Duration filter
      if (selectedDuration && `${item.duration_days} days` !== selectedDuration) {
        return false;
      }

      // Destination filter
      if (selectedDestination && item.destinations?.name !== selectedDestination) {
        return false;
      }

      // Tags filter (must match all selected tags)
      if (selectedTags.length > 0) {
        const itemTags = item.tags || [];
        return selectedTags.every((tag) => itemTags.includes(tag));
      }

      return true;
    });

    // Apply sorting - newest first
    return [...filtered].sort((a, b) => {
      // Sort by ID if no creation date is available
      return b.id.localeCompare(a.id);
    });
  }, [visibleItineraries, selectedDuration, selectedDestination, selectedTags]);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Clear all filters handler
  const handleClearFilters = () => {
    setSelectedDuration(null);
    setSelectedDestination(null);
    setSelectedTags([]);
  };
  
  // Memoize the itinerary card data to prevent recreation on each render
  const itineraryCards = useMemo(() => {
    return sortedItineraries.map((item, index) => {
      // Convert to format expected by ItineraryTemplateCard
      const itinerary = {
        id: item.id,
        title: item.title,
        description: item.description || '',
        image: item.destinations?.featured_image_url || '/images/placeholder-itinerary.jpg',
        location: item.destinations ? `${item.destinations.name}, ${item.destinations.country}` : 'Unknown Location',
        duration: `${item.duration_days} days`,
        tags: item.tags || [],
        slug: item.slug,
        is_published: item.is_published,
        author: item.profile,
        metadata: item.metadata || {},
        // Add required fields for the card component
        destinations: [], // Empty array is fine here since we're not using it
        duration_days: item.duration_days,
        category: 'Other',
        created_at: '',
        view_count: 0,
        use_count: 0,
        like_count: 0,
        featured: false,
        cover_image_url: '',
        groupsize: '',
      };
      
      return (
        <motion.div key={item.id} variants={item as any} layout>
          <ItineraryTemplateCard 
            itinerary={itinerary} 
            index={index} 
          />
        </motion.div>
      );
    });
  }, [sortedItineraries, item]);

  return (
    <div>
      <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-md mb-10 py-4">
        <ItineraryFilters
          durations={allDurations}
          destinations={allDestinations}
          tags={allTags}
          selectedDuration={selectedDuration}
          selectedDestination={selectedDestination}
          selectedTags={selectedTags}
          onDurationChange={setSelectedDuration}
          onDestinationChange={setSelectedDestination}
          onTagsChange={setSelectedTags}
        />
      </div>

      {sortedItineraries.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-2xl font-medium mb-4">No itineraries match your filters</h3>
          <p className="text-muted-foreground mb-8">Try adjusting your filter criteria</p>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          layout
        >
          {itineraryCards}
        </motion.div>
      )}
    </div>
  );
});

// The exported component - a small wrapper that forwards props to the memoized component
export function ClientWrapper(props: ClientWrapperProps) {
  return <ClientWrapperContent {...props} />;
}
