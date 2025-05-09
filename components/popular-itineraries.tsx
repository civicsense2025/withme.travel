'use client';

import { useEffect, useState } from 'react';
import { ItineraryTemplateCard } from '@/components/itinerary-template-card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Itinerary {
  id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  duration: string;
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
  groupsize: string;
  metadata: any;
}

export function PopularItineraries() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularItineraries() {
      try {
        const response = await fetch('/api/itineraries/popular');
        if (!response.ok) {
          throw new Error('Failed to fetch popular itineraries');
        }
        const data = await response.json();
        setItineraries(data.itineraries || []);
      } catch (error) {
        console.error('Error fetching popular itineraries:', error);
        // Set some default itineraries as fallback
        setItineraries([
          {
            id: '1',
            title: 'Weekend in Paris',
            description: 'Explore the City of Light in 48 hours',
            image: '/images/paris.jpg',
            location: 'Paris, France',
            duration: '3 days',
            tags: ['City Break', 'Romantic'],
            slug: 'weekend-in-paris',
            is_published: true,
            duration_days: 3,
            category: 'City Break',
            created_at: new Date().toISOString(),
            view_count: 1245,
            use_count: 87,
            like_count: 156,
            featured: true,
            cover_image_url: '/images/paris.jpg',
            groupsize: '2-4',
            metadata: {},
            destinations: []
          },
          {
            id: '2',
            title: 'Tokyo Adventure',
            description: 'Experience the blend of tradition and futurism',
            image: '/images/tokyo.jpg',
            location: 'Tokyo, Japan',
            duration: '7 days',
            tags: ['Adventure', 'Cultural'],
            slug: 'tokyo-adventure',
            is_published: true,
            duration_days: 7,
            category: 'Adventure',
            created_at: new Date().toISOString(),
            view_count: 890,
            use_count: 65,
            like_count: 134,
            featured: true,
            cover_image_url: '/images/tokyo.jpg',
            groupsize: '1-2',
            metadata: {},
            destinations: []
          },
          {
            id: '3',
            title: 'New York City Explorer',
            description: 'The ultimate guide to exploring NYC',
            image: '/images/nyc.jpg',
            location: 'New York, USA',
            duration: '5 days',
            tags: ['Urban', 'Shopping'],
            slug: 'nyc-explorer',
            is_published: true,
            duration_days: 5,
            category: 'Urban',
            created_at: new Date().toISOString(),
            view_count: 1120,
            use_count: 78,
            like_count: 145,
            featured: true,
            cover_image_url: '/images/nyc.jpg',
            groupsize: '2-6',
            metadata: {},
            destinations: []
          }
        ]);
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {itineraries.map((itinerary, index) => (
          <ItineraryTemplateCard key={itinerary.id} itinerary={itinerary} index={index} />
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