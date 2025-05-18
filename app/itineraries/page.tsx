// Replace the 'use client' directive since this is a server component and update the catch block
// Remove the 'use client' directive at the top of the file since this should be a server component

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { createServerComponentClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { TABLES } from '@/utils/constants/database';
import { FIELDS, ItineraryTemplateMetadata } from '@/utils/constants/tables';

import { Button } from '@/components/ui/button';
import { ClientWrapper } from './client-wrapper';
import { Badge } from '@/components/ui/badge';
import { ItineraryCard } from '@/components/ui/ItineraryCard';
import { ClassErrorBoundary } from '@/components/error-boundary';
import RefreshFallback from './refresh-fallback';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Section } from '@/components/ui/section';
import { ItineraryTemplateCard } from '@/components/itinerary-template-card';
import { FullBleedSection } from '@/components/ui/FullBleedSection';

export const dynamic = 'force-dynamic'; // Ensure dynamic rendering
export const revalidate = 600; // Revalidate every 10 minutes

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
    <p className="text-muted-foreground mb-4">
      There was a problem loading the itineraries. Please try again later.
    </p>
    <Button asChild>
      <Link href="/">Return Home</Link>
    </Button>
  </div>
);

export default async function ItinerariesPage() {
  try {
    // Check if we have a logged-in user
    const supabase = await createServerComponentClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
        const result = await query.or(`is_published.eq.true,created_by.eq.${user.id}`);
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
        metadata: item.metadata
          ? typeof item.metadata === 'object'
            ? {
                title: typeof item.metadata.title === 'string' ? item.metadata.title : '',
                description:
                  typeof item.metadata.description === 'string' ? item.metadata.description : '',
                days: typeof item.metadata.days === 'number' ? item.metadata.days : 0,
                destination:
                  typeof item.metadata.destination === 'string' ? item.metadata.destination : '',
                tags: Array.isArray(item.metadata.tags) ? item.metadata.tags : [],
              }
            : null
          : null,
        profile: item.profile,
        destinations: item.destinations,
      };
    }

    // Process data to match our Itinerary interface
    let processedItineraries: Itinerary[] = [];

    // Associate author profiles with templates
    if (data.length > 0) {
      const creatorIds = Array.from(new Set(data.map((t) => t.created_by)));
      if (creatorIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', creatorIds);

        if (!profilesError && profilesData) {
          const profilesMap = new Map(profilesData.map((p) => [p.id, p]));
          // Add profile data to each template
          data = data.map((template) => ({
            ...template,
            profile: profilesMap.get(template.created_by) || null,
          }));
        }
      }

      // Convert to our Itinerary interface and ensure slug is always a string
      processedItineraries = data.map((item) => {
        const itinerary = assertAsItinerary(item);
        // Always enforce slug as a string - this is crucial for the client wrapper
        itinerary.slug = itinerary.slug || '';
        return itinerary;
      });
    }

    // Log how many we processed
    const publishedCount = processedItineraries.filter((i) => i.is_published).length;
    const draftCount = processedItineraries.filter((i) => !i.is_published).length;
    console.log(
      `[Itineraries Page] Processed ${processedItineraries.length} itineraries (${publishedCount} published, ${draftCount} drafts)`
    );

    // Create the header section with title, description and submit button
    const header = (
      <main>
        <PageHeader
          title="Explore Itineraries"
          description="Ready-made travel plans to inspire your next adventure"
          centered={true}
        />
        <div className="mt-6">
          <Link href="/itineraries/submit">
            <Button
              size="default"
              className="mx-auto flex items-center rounded-full px-5 bg-white text-black border border-gray-200 hover:bg-gray-100 hover:text-black"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit Itinerary
            </Button>
          </Link>
        </div>
      </main>
    );

    // Early return if no itineraries
    if (processedItineraries.length === 0) {
      console.log('[Itineraries Page] No itineraries found');

      return (
        <PageContainer header={header}>
          <div className="border rounded-lg p-8 bg-card text-center">
            <Heading level={2} size="default" className="mb-2">
              No itineraries available
            </Heading>
            <Text variant="body" className="mb-4 text-muted-foreground">
              Be the first to share your travel plans with the community!
            </Text>
          </div>
        </PageContainer>
      );
    }

    // Split into published and drafts
    const publishedItineraries = processedItineraries.filter((i) => i.is_published);
    const draftItineraries = processedItineraries.filter((i) => !i.is_published);

    return (
      <PageContainer header={header} fullWidth={false} className="max-w-3xl mx-auto">
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
          <div className="mt-16">
            <Heading level={2} size="default" className="mb-8">
              Your Drafts
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftItineraries.map((draft, index) => (
                <div key={draft.id} className="relative">
                  <Badge
                    variant="outline"
                    className="absolute top-4 right-4 z-10 bg-yellow-100 text-yellow-800 border-yellow-300"
                  >
                    Draft
                  </Badge>
                  <ItineraryCard
                    title={draft.title}
                    description={draft.description || ''}
                    location={draft.destinations?.name || 'Unknown Location'}
                    duration={`${draft.duration_days} days`}
                    imageUrl={
                      draft.destinations?.featured_image_url ||
                      '/images/destinations/default-cover.jpg'
                    }
                    href={`/itineraries/${draft.slug}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    );
  } catch (error) {
    console.error('[Itineraries Page] Unhandled error:', error);
    return <RefreshFallback />;
  }
}
