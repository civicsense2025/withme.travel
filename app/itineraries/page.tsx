import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { createServerComponentClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { TABLES, FIELDS, ItineraryTemplateMetadata } from '@/utils/constants/database';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ClientWrapper } from './client-wrapper';
import { Badge } from '@/components/ui/badge';
import { ItineraryTemplateCard } from '@/components/itinerary-template-card';

export const dynamic = 'force-dynamic'; // Ensure dynamic rendering
export const revalidate = 0; // Disable cache

// Define the Itinerary type based on expected data from the query
export interface Itinerary {
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

export default async function ItinerariesPage() {
  try {
    // Check if we have a logged-in user
    const cookieStore = cookies();
    const supabase = await createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if the user is an admin
    let isAdmin = false;
    if (user) {
      const { data: profileData } = await supabase
        .from(TABLES.PROFILES)
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      isAdmin = profileData?.is_admin || false;
    }
    
    console.log(`[Itineraries Page] User authenticated: ${!!user}, Admin: ${isAdmin}`);
    
    // Fetch itineraries from our API endpoint (which handles auth status internally)
    console.log('[Itineraries Page] Fetching itineraries from API');
    
    // Construct the API URL safely
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/itineraries`;
    
    const itinerariesResponse = await fetch(apiUrl, {
      cache: 'no-store',
      next: { revalidate: 0 }, // Disable caching
    });

    if (!itinerariesResponse.ok) {
      console.error('[Itineraries Page] Failed to fetch itineraries:', itinerariesResponse.statusText);
      throw new Error(`Failed to fetch itineraries: ${itinerariesResponse.statusText}`);
    }

    const { data: itineraries } = await itinerariesResponse.json();
    
    // Log how many we received and their types
    if (itineraries) {
      const publishedCount = itineraries.filter((i: Itinerary) => i.is_published).length;
      const draftCount = itineraries.filter((i: Itinerary) => !i.is_published).length;
      console.log(`[Itineraries Page] Received ${itineraries.length} itineraries (${publishedCount} published, ${draftCount} drafts)`);
    }

    if (!itineraries || itineraries.length === 0) {
      console.log('[Itineraries Page] No itineraries found');
      // No itineraries to display, but don't throw an error - show empty state
      return (
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-2">Community Itineraries</h1>
          <p className="text-muted-foreground mb-8">
            Discover and save itineraries shared by the WithMe community. Use these templates for your own trips.
          </p>
          
          <div className="flex justify-end mb-8">
            <Link href="/itineraries/submit">
              <Button size="sm" className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Submit Itinerary
              </Button>
            </Link>
          </div>
          
          <div className="border rounded-lg p-8 bg-card text-center">
            <h2 className="text-xl font-semibold mb-2">No itineraries available</h2>
            <p className="mb-4 text-muted-foreground">Be the first to share your travel plans with the community!</p>
            <Link href="/itineraries/submit">
              <Button>Submit an Itinerary</Button>
            </Link>
          </div>
        </div>
      );
    }

    // Group itineraries into published and drafts
    const publishedItineraries = itineraries.filter((i: Itinerary) => i.is_published);
    const draftItineraries = itineraries.filter((i: Itinerary) => !i.is_published);
    
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">Community Itineraries</h1>
        <p className="text-muted-foreground mb-8">
          Discover and save itineraries shared by the WithMe community. Use these templates for your own trips.
        </p>
        
        <div className="flex justify-end mb-8">
          <Link href="/itineraries/submit">
            <Button size="sm" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit Itinerary
            </Button>
          </Link>
        </div>

        {/* Pass all itineraries to the client wrapper which will filter for published ones */}
        <ClientWrapper 
          itineraries={itineraries} 
          isAdmin={isAdmin} 
          userId={user?.id || null}
        />
        
        {/* If the user has drafts, display them in a separate section */}
        {user && draftItineraries.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Your Draft Itineraries</h2>
            <p className="text-muted-foreground mb-6">
              These itineraries are only visible to you until published
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftItineraries.map((item: Itinerary) => {
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
                  is_published: false,
                  author: item.profile,
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
                };
                
                return (
                  <div key={item.id} className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-yellow-500/90 text-white text-xs font-medium px-2.5 py-0.5 rounded">
                        Draft
                      </span>
                    </div>
                    <ItineraryTemplateCard 
                      itinerary={itinerary} 
                      index={0} 
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('[Itineraries Page] Error fetching itineraries:', error);
    throw error; // Let Next.js error boundary handle this
  }
}
