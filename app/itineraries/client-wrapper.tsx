'use client';

import React, { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { ItineraryTemplateCard } from '@/components/features/itinerary/molecules/ItineraryTemplateCard';
import { ItineraryTemplateMetadata } from '@/utils/constants/tables';
import { Badge } from '@/components/ui/badge';
import { ItineraryFilters } from '@/components/features/itinerary/molecules/ItineraryFilters';

// Define a minimal Destination type
interface Destination {
  id: string;
  name: string;
}

// Updated interface based on API response structure - ensuring slug is a string
interface Itinerary {
  id: string;
  title: string;
  slug: string; // This must be a string now
  description: string | null;
  destination_id: string;
  duration_days: number;
  created_by: string;
  is_published: boolean;
  tags: string[];
  metadata: ItineraryTemplateMetadata | null; // Allow null metadata
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
const ClientWrapperContent = memo(
  ({ itineraries = [], isAdmin = false, userId = null }: ClientWrapperProps) => {
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

      const tags = Array.from(new Set(visibleItineraries.flatMap((i) => i.tags || [])))
        .filter(Boolean)
        .sort();

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
          delayChildren: 0.05,
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1.0], // cubic-bezier easing function for Apple-like smoothness
        },
      },
    };

    const item = {
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1.0], // cubic-bezier easing function
        },
      },
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
          location: item.destinations
            ? `${item.destinations.name}, ${item.destinations.country}`
            : 'Unknown Location',
          duration: `${item.duration_days} days`,
          tags: item.tags || [],
          slug: item.slug, // Already enforced as a string in our interface
          is_published: item.is_published,
          author: item.profile,
          metadata: item.metadata || {
            title: '',
            description: '',
            days: 0,
            destination: '',
            tags: [],
          },
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
          <motion.div
            key={item.id}
            variants={item as any}
            layout
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <div className="h-full transition-all duration-300 rounded-xl overflow-hidden hover:shadow-lg">
              <ItineraryTemplateCard itinerary={itinerary} index={index} />
            </div>
          </motion.div>
        );
      });
    }, [sortedItineraries, item]);

    return (
      <div>
        <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-xl mb-10 py-4 shadow-sm">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="text-center py-20 bg-card/50 rounded-xl border shadow-sm"
          >
            <h3 className="text-2xl font-medium mb-4">No itineraries match your filters</h3>
            <p className="text-muted-foreground mb-8">Try adjusting your filter criteria</p>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="rounded-full px-6 hover:shadow-md transition-all"
            >
              Clear Filters
            </Button>
          </motion.div>
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
  }
);

// Add display name
ClientWrapperContent.displayName = 'ClientWrapperContent';

// The exported component - a small wrapper that forwards props to the memoized component
export function ClientWrapper(props: ClientWrapperProps) {
  return <ClientWrapperContent {...props} />;
}
