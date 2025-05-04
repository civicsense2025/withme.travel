import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { createServerComponentClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ItineraryFilters } from '@/components/itinerary-filters';
import { ItineraryTemplateCard } from '@/components/itinerary-template-card';
import { ClientWrapper } from './client-wrapper';

export const dynamic = 'force-dynamic'; // Ensure dynamic rendering

// Define the Itinerary type based on expected data from the query
interface Itinerary {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  duration_days: number;
  slug: string;
  is_published: boolean;
  view_count: number;
  like_count: number;
  tags: string[];
  created_by: string;
  destinations: {
    city: string;
    country: string;
    image_url: string | null;
  } | null;
  creator?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
  author?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
}

// Fetch itineraries from the database
async function getItineraries(): Promise<Itinerary[]> {
  const supabase = await createServerComponentClient();

  try {
    // Get all published templates with proper join syntax for auth.users
    const { data, error } = await supabase
      .from('itinerary_templates')
      .select('*, destinations(*), creator:created_by(id, email, raw_user_meta_data)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching itineraries:', error);
      return [];
    }

    // Map data to ensure consistency and transform creator data
    return (data || []).map((item: any) => ({
      ...item,
      author: item.creator
        ? {
            id: item.creator.id,
            name: item.creator.raw_user_meta_data?.name || 
                  item.creator.email?.split('@')[0] || 
                  'Unknown User',
            avatar_url: item.creator.raw_user_meta_data?.avatar_url || null,
          }
        : null,
    }));
  } catch (err) {
    console.error('Exception fetching itineraries:', err);
    return [];
  }
}

export default async function ItinerariesPage() {
  const itineraries = await getItineraries();

  const hasItineraries = itineraries.length > 0;
  const displayItineraries = hasItineraries ? itineraries : [];

  console.log(`Found ${displayItineraries.length} itineraries`);

  // Transform itineraries into a format compatible with the client component
  const formattedItineraries = displayItineraries.map((itinerary: Itinerary) => ({
    id: itinerary.id,
    title: itinerary.title,
    description: itinerary.description,
    image:
      itinerary.cover_image_url ||
      (itinerary.destinations ? itinerary.destinations.image_url : null) ||
      '/images/placeholder-itinerary.jpg',
    location: itinerary.destinations
      ? `${itinerary.destinations.city || ''}, ${itinerary.destinations.country || ''}`
      : 'Unknown Location',
    duration: `${itinerary.duration_days || 'N/A'} days`,
    tags: itinerary.tags || [],
    slug: itinerary.slug || itinerary.id,
    is_published: itinerary.is_published || false,
    author: itinerary.author || null,
  }));

  return (
    <div className="container py-10">
      <PageHeader
        heading="explore itineraries"
        description="discover travel plans shared by the community"
      >
        <Button asChild>
          <Link href="/itineraries/submit" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Submit Yours
          </Link>
        </Button>
      </PageHeader>

      {/* Client side components wrapped in a client component */}
      <ClientWrapper
        itineraries={formattedItineraries}
        destinations={[]} // Pass fetched destinations here eventually
      />
    </div>
  );
}
