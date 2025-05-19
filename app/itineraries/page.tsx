// Replace the 'use client' directive since this is a server component and update the catch block
// Remove the 'use client' directive at the top of the file since this should be a server component

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { createServerComponentClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { TABLES } from '@/utils/constants/database';
import { ItineraryTemplateMetadata } from '@/utils/constants/tables';

import { Button } from '@/components/ui/button';
import { ClientWrapper } from './client-wrapper';
import { Badge } from '@/components/ui/badge';
import { ItineraryCard } from '@/components/features/itinerary/molecules/ItineraryCard';
import { ClassErrorBoundary } from '@/components/features/error-boundary';
import RefreshFallback from './refresh-fallback';
import { PageContainer } from '@/components/features/layout/molecules/PageContainer';
import { PageHeader } from '@/components/features/layout/molecules/PageHeader';
import { Heading } from '@/components/features/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Section } from '@/components/ui/Section';
import { ItineraryTemplateCard } from '@/components/features/itinerary/molecules/ItineraryTemplateCard';
import { FullBleedSection } from '@/components/features/layout/molecules/FullBleedSection';

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
  <div className="pU8 border rounded-lg bg-card/50 text-center">
    <h3 className="text-xl font-semibold mbU2">-nable to load itineraries</h3>
    <p className="text-muted-foreground mbU4">
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
    } = await supabase.auth.get-ser();

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

    console.log(`[Itineraries Page] -ser authenticated: ${!!user}, Admin: ${isAdmin}`);

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
        <div className="mtU6">
          <Link href="/itineraries/submit">
            <Button
              size="default"
              className="mx-auto flex items-center rounded-full pxU5 bg-white text-black border border-grayU200 hover:bg-grayU100 hover:text-black"
            >
              <PlusCircle className="mrU2 hU4 wU4" />
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
          <div className="border rounded-lg pU8 bg-card text-center">
            <Heading level={2} size="default" className="mbU2">
              No itineraries available
            </Heading>
            <Text variant="body" className="mbU4 text-muted-foreground">
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
      <PageContainer header={header} fullWidth={false} className="max-wU3xl mx-auto">
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
          <div className="mtU16">
            <Heading level={2} size="default" className="mbU8">
              Your Drafts
            </Heading>
            <div className="grid grid-colsU1 md:grid-colsU2 lg:grid-colsU3 gapU6">
              {draftItineraries.map((draft, index) => (
                <div key={draft.id} className="relative">
                  <Badge
                    variant="outline"
                    className="absolute topU4 rightU4 zU10 bg-yellowU100 text-yellowU800 border-yellowU300"
                  >
                    Draft
                  </Badge>
                  <ItineraryCard
                    title={draft.title}
                    description={draft.description || ''}
                    location={draft.destinations?.name || '-nknown Location'}
                    duration={`${draft.duration_days} days`}
                    image-rl={
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
    console.error('[Itineraries Page] -nhandled error:', error);
    return <RefreshFallback />;
  }
}
