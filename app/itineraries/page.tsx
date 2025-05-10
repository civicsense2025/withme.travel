// Replace the 'use client' directive since this is a server component and update the catch block
// Remove the 'use client' directive at the top of the file since this should be a server component

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { createServerComponentClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { FIELDS, ItineraryTemplateMetadata, TABLES } from '@/utils/constants/tables';
import { TABLES as DatabaseTables } from '@/utils/constants/database';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ClientWrapper } from './client-wrapper';
import { Badge } from '@/components/ui/badge';
import { ItineraryTemplateCard } from '@/components/itinerary-template-card';
import { ClassErrorBoundary } from '@/components/error-boundary';
import RefreshFallback from './refresh-fallback';

export const dynamic = 'force-dynamic'; // Ensure dynamic rendering
export const revalidate = 0; // Disable cache

// Define the Itinerary type based on expected data from the query
export interface Itinerary {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  destination_id: string;
  duration_days: number;
  created_by: string;
  is_published: boolean | null;
  tags: string[] | null;
  metadata: ItineraryTemplateMetadata | null;
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

// Simple error fallback component for itineraries section
const ItinerariesErrorFallback = () => (
  <div className="p-8 border rounded-lg bg-card/50 text-center">
    <h3 className="text-xl font-semibold mb-2">Unable to load itineraries</h3>
    <p className="text-muted-foreground mb-4">There was a problem loading the itineraries. Please try again later.</p>
    <Button asChild>
      <Link href="/">Return Home</Link>
    </Button>
  </div>
);

export default async function ItinerariesPage() {
  try {
    // Check if we have a logged-in user
    const supabase = await createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if the user is an admin
    let isAdmin = false;
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      isAdmin = profileData?.is_admin || false;
    }
    
    console.log(`[Itineraries Page] User authenticated: ${!!user}, Admin: ${isAdmin}`);
    
    // Fetch itineraries directly from Supabase
    let query = supabase
      .from('itinerary_templates')
      .select('*, destinations(*)')
      .order('created_at', { ascending: false });
    let data;
    let templatesError;
    if (user) {
      if (isAdmin) {
        // Admin users can see all templates
        const result = await query;
        data = result.data;
        templatesError = result.error;
      } else {
        // Regular authenticated users: show published templates + their drafts
        const result = await query.or(
          `is_published.eq.true,created_by.eq.${user.id}`
        );
        data = result.data;
        templatesError = result.error;
      }
    } else {
      // For unauthenticated users: only show published templates
      const result = await query.eq('is_published', true);
      data = result.data;
      templatesError = result.error;
    }

    if (!data || templatesError) {
      console.error('[Itineraries Page] Error fetching itineraries:', templatesError);
      return <RefreshFallback />;
    }

    // Define a type assertion function to properly convert database records to our Itinerary type
    function assertAsItinerary(item: any): Itinerary {
      return {
        id: item.id,
        title: item.title || '',
        slug: item.slug || '',
        description: item.description,
        destination_id: item.destination_id || '',
        duration_days: item.duration_days || 0,
        created_by: item.created_by || '',
        is_published: item.is_published === true,
        tags: item.tags || [],
        metadata: item.metadata ? 
          (typeof item.metadata === 'object' ? 
            {
              title: typeof item.metadata.title === 'string' ? item.metadata.title : '',
              description: typeof item.metadata.description === 'string' ? item.metadata.description : '',
              days: typeof item.metadata.days === 'number' ? item.metadata.days : 0,
              destination: typeof item.metadata.destination === 'string' ? item.metadata.destination : '',
              tags: Array.isArray(item.metadata.tags) ? item.metadata.tags : []
            } : null) : null,
        profile: item.profile,
        destinations: item.destinations,
      };
    }

    // Process data to match our Itinerary interface
    let processedItineraries: Itinerary[] = [];

    // Associate author profiles with templates
    if (data.length > 0) {
      const creatorIds = Array.from(new Set(data.map(t => t.created_by)));
      if (creatorIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', creatorIds);
          
        if (!profilesError && profilesData) {
          const profilesMap = new Map(profilesData.map(p => [p.id, p]));
          // Add profile data to each template
          data = data.map(template => ({
            ...template,
            profile: profilesMap.get(template.created_by) || null
          }));
        }
      }
      
      // Convert to our Itinerary interface and ensure slug is always a string
      processedItineraries = data.map(item => {
        const itinerary = assertAsItinerary(item);
        // Always enforce slug as a string - this is crucial for the client wrapper
        itinerary.slug = itinerary.slug || '';
        return itinerary;
      });
    }

    // Log how many we processed
    const publishedCount = processedItineraries.filter(i => i.is_published).length;
    const draftCount = processedItineraries.filter(i => !i.is_published).length;
    console.log(`[Itineraries Page] Processed ${processedItineraries.length} itineraries (${publishedCount} published, ${draftCount} drafts)`);

    // Early return if no itineraries
    if (processedItineraries.length === 0) {
      console.log('[Itineraries Page] No itineraries found');
      // Show empty state
      return (
        <div className="container py-8">
          <h1 className="text-4xl font-medium mb-3">Itineraries</h1>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Ready-made travel plans to inspire your next adventure
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

    // Split into published and drafts
    const publishedItineraries = processedItineraries.filter(i => i.is_published);
    const draftItineraries = processedItineraries.filter(i => !i.is_published);

    return (
      <div className="max-w-screen-2xl mx-auto">
        <div className="px-6 py-12 text-center">
          <h1 className="text-6xl font-medium tracking-tight mb-4">Itineraries</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Ready-made travel plans to inspire your next adventure
          </p>
          
          <div className="flex justify-center mb-12">
            <Link href="/itineraries/submit">
              <Button size="default" className="flex items-center rounded-full px-5 bg-white text-black border border-gray-200 hover:bg-gray-100 hover:text-black">
                <PlusCircle className="mr-2 h-4 w-4" />
                Submit Itinerary
              </Button>
            </Link>
          </div>

          {/* Wrap client components with error boundaries */}
          <ClassErrorBoundary fallback={<ItinerariesErrorFallback />}>
            <ClientWrapper 
              // Type assertion is safe because we've ensured all properties match
              itineraries={processedItineraries as any} 
              isAdmin={isAdmin} 
              userId={user?.id || null}
            />
          </ClassErrorBoundary>
          
          {/* If the user has drafts, display them in a separate section */}
          {user && draftItineraries.length > 0 && (
            <ClassErrorBoundary fallback={<div className="mt-8 p-4 border rounded bg-muted/50">Unable to load draft itineraries</div>}>
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
                      tags: item.tags ?? [],
                      slug: item.slug || '',
                      is_published: false,
                      author: item.profile,
                      metadata: {
                        title: item.metadata?.title || '',
                        description: item.metadata?.description || '',
                        days: item.metadata?.days || 0,
                        destination: item.metadata?.destination || '',
                        tags: item.metadata?.tags || []
                      },
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
                      groupsize: ''
                    };
                    
                    return (
                      <ItineraryTemplateCard key={item.id} itinerary={itinerary} />
                    );
                  })}
                </div>
              </div>
            </ClassErrorBoundary>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('[Itineraries Page] Error fetching itineraries:', error);
    throw error; // Let Next.js error boundary handle this
  }
}
