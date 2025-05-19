'use client';

import { useEffect, useState } from 'react';
import { ItineraryTemplateCard } from '@/components/itinerary-template-card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Type for an itinerary template, matching the structure from the itinerary_templates table.
 */
interface ItineraryTemplate {
  id: string;
  title: string;
  description: string;
  image?: string;
  location: string;
  duration?: string;
  tags: string[];
  slug: string;
  is_published: boolean;
  author?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
  destinations: any[];
  duration_days: number;
  category: string;
  created_at: string;
  view_count: number;
  use_count: number;
  like_count: number;
  featured: boolean;
  cover_image_url: string;
  groupsize?: string;
  metadata: any;
  image_metadata?: any;
}

export function PopularItineraries() {
  const [itineraries, setItineraries] = useState<ItineraryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPopularItineraries() {
      try {
        setLoading(true);
        setError(null);

        // Use the correct endpoint for popular itineraries
        const response = await fetch('/api/itineraries/popular', {
          cache: 'no-store',
          next: { revalidate: 0 },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch itinerary templates: ${response.statusText}`);
        }

        const data = await response.json();

        // Defensive: ensure we have an array of itineraries
        const templates: ItineraryTemplate[] = Array.isArray(data.itineraries)
          ? data.itineraries
          : Array.isArray(data)
            ? data
            : [];

        setItineraries(templates);
      } catch (error) {
        console.error('Error fetching itinerary templates:', error);
        setError(error instanceof Error ? error.message : 'Failed to load itineraries');
        setItineraries([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPopularItineraries();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Unable to load itineraries.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  if (itineraries.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No itineraries available at the moment.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/itineraries">
            Browse all itineraries
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {itineraries.map((itinerary, index) => (
          <ItineraryTemplateCard
            key={itinerary.id}
            itinerary={{
              id: itinerary.id,
              title: itinerary.title,
              slug: itinerary.slug,
              cover_image_url: itinerary.cover_image_url || null,
            }}
            index={index}
          />
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <Button variant="outline" asChild>
          <Link href="/itineraries">
            Browse all itineraries
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
