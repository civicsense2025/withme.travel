'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ItineraryFilters } from '@/components/itinerary-filters';
import { ItineraryTemplateCard } from '@/components/itinerary-template-card';
import { staggerContainer } from '@/utils/animation';
import { ItineraryTemplateMetadata } from '@/utils/constants/database';
import { Badge } from '@/components/ui/badge';

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
  isAdmin?: boolean;
  userId?: string | null;
}

export function ClientWrapper({ itineraries, isAdmin = false, userId = null }: ClientWrapperProps) {
  // Filter to only show published itineraries (drafts are handled in the parent component)
  const publishedItineraries = itineraries.filter(i => i.is_published);
  
  // Transform itineraries to match ItineraryTemplateCard expected format
  const formattedItineraries = publishedItineraries.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    image: item.destinations?.featured_image_url || '/images/placeholder-itinerary.jpg',
    location: item.destinations ? `${item.destinations.name}, ${item.destinations.country}` : 'Unknown Location',
    duration: `${item.duration_days} days`,
    tags: item.tags || [],
    slug: item.slug,
    is_published: item.is_published,
    author: item.profile, // Use profile as author
    metadata: item.metadata || {},
    // Add required fields for the card component
    destinations: [],
    duration_days: item.duration_days,
    category: 'Other',
    created_at: '',
    view_count: 0,
    use_count: 0,
    like_count: 0,
    featured: false,
    cover_image_url: '',
    groupsize: '',
  }));

  const destinations = itineraries
    .map(i => i.destinations)
    .filter(d => d !== null && d !== undefined)
    .filter((d, i, self) => self.findIndex(x => x?.id === d?.id) === i); // Remove duplicates

  return (
    <>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {/* Display admin status if the user is an admin */}
        {isAdmin && (
          <div className="mb-4">
            <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">
              Admin User
            </Badge>
            <span className="ml-2 text-sm text-muted-foreground">
              You can see all itineraries, including unpublished ones.
            </span>
          </div>
        )}
        
        <ItineraryFilters destinations={destinations} />
      </motion.div>

      {formattedItineraries.length === 0 ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-2">No itineraries found</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to share your travel plans with the community!
          </p>
          <Button asChild>
            <Link href="/itineraries/submit" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Submit Your Itinerary
            </Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {formattedItineraries.map((itinerary, index) => (
            <ItineraryTemplateCard key={itinerary.id} index={index} itinerary={itinerary} />
          ))}
        </motion.div>
      )}
    </>
  );
}
