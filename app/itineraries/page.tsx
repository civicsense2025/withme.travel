'use client';

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { createServerComponentClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { TABLES } from '@/utils/constants/database';

import { Button } from '@/components/ui/button';
import { ClientWrapper } from './client-wrapper';
import { Badge } from '@/components/ui/badge';
import { ItineraryCard } from '@/components/features/itinerary/molecules/ItineraryCard';
import RefreshFallback from './refresh-fallback';
import { PageContainer } from '@/components/features/layout/molecules/PageContainer';
import { PageHeader } from '@/components/features/layout/molecules/PageHeader';
import { Heading } from '@/components/features/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Section } from '@/components/ui/Section';

export const dynamic = 'force-dynamic';
export const revalidate = 600;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ItineraryProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export interface ItineraryDestination {
  id: string;
  name: string;
  country: string;
  state: string | null;
  featured_image_url: string | null;
}

export interface ItineraryMetadata {
  title?: string;
  description?: string;
  days?: number;
  destination?: string;
  tags?: string[];
  // Add other expected metadata properties
}

export interface ProcessedMetadata extends ItineraryMetadata {
  name: string; // Required in processed format
  duration: number; // Required in processed format
}

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
  metadata: ItineraryMetadata | null;
  profile?: ItineraryProfile | null;
  destinations?: ItineraryDestination | null;
}

export interface ProcessedItinerary extends Omit<Itinerary, 'metadata'> {
  slug: string; // Guaranteed to be non-empty
  is_published: boolean; // Guaranteed to be boolean
  metadata: ProcessedMetadata | null;
}

// ============================================================================
// COMPONENTS
// ============================================================================
// Simple local error boundary component
import React from 'react';

interface LocalErrorBoundaryProps {
  children: React.ReactNode;
}

interface LocalErrorBoundaryState {
  hasError: boolean;
}

class LocalErrorBoundary extends React.Component<LocalErrorBoundaryProps, LocalErrorBoundaryState> {
  constructor(props: LocalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 border rounded-lg bg-card/50 text-center">
          <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-4">
            There was a problem loading this section.
          </p>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

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

// ============================================================================
// DATA FETCHING & PROCESSING
// ============================================================================

async function fetchUserData() {
  const supabase = await createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { user: null, isAdmin: false };
  
  const { data: profileData } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  
  return { 
    user, 
    isAdmin: Boolean(profileData?.is_admin) 
  };
}

async function fetchItineraries(userId: string | null, isAdmin: boolean) {
  const supabase = await createServerComponentClient();
  let query = supabase
    .from('itinerary_templates')
    .select('*, destinations(*)')
    .order('created_at', { ascending: false });
  
  // Apply correct filters based on auth state
  if (!userId) {
    // Public users only see published itineraries
    query = query.eq('is_published', true);
  } else if (!isAdmin) {
    // Regular users see published + their own
    query = query.or(`is_published.eq.true,created_by.eq.${userId}`);
  }
  // Admins see everything (no additional filter)
  
  const { data, error } = await query;
  
  if (error) throw new Error(`Failed to fetch itineraries: ${error.message}`);
  if (!data) return [];
  
  return data;
}

async function enrichWithProfiles(templates: any[]) {
  if (templates.length === 0) return templates;
  
  const supabase = await createServerComponentClient();
  const creatorIds = Array.from(new Set(templates.map(t => t.created_by)));
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', creatorIds);
  
  if (error || !profiles) return templates;
  
  const profileMap = new Map(profiles.map(p => [p.id, p]));
  
  return templates.map(template => ({
    ...template,
    profile: profileMap.get(template.created_by) || null
  }));
}

function processItinerary(item: any): Itinerary {
  return {
    id: item.id,
    title: item.title || '',
    slug: item.slug || '',
    description: item.description,
    destination_id: item.destination_id || '',
    duration_days: item.duration_days || 0,
    created_by: item.created_by || '',
    is_published: Boolean(item.is_published),
    tags: Array.isArray(item.tags) ? item.tags : [],
    metadata: item.metadata || null,
    profile: item.profile,
    destinations: item.destinations,
  };
}

function formatForClientWrapper(itinerary: Itinerary): ProcessedItinerary {
  return {
    ...itinerary,
    slug: itinerary.slug || '',
    is_published: Boolean(itinerary.is_published),
    metadata: itinerary.metadata ? {
      ...itinerary.metadata,
      name: itinerary.metadata.title || '',
      duration: itinerary.metadata.days || 0
    } : null
  };
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function ItinerariesPage() {
  try {
    // Fetch user data and itineraries in parallel
    const { user, isAdmin } = await fetchUserData();
    let itineraryData = await fetchItineraries(user?.id || null, isAdmin);
    
    // Enrich with profile data if we have any itineraries
    if (itineraryData.length > 0) {
      itineraryData = await enrichWithProfiles(itineraryData);
    }
    
    // Process and validate all itineraries
    const processedItineraries = itineraryData.map(processItinerary);
    
    // Header component is the same for all states
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

    // Handle empty state
    if (processedItineraries.length === 0) {
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

    // Filter published and draft itineraries
    const publishedItineraries = processedItineraries.filter(i => i.is_published);
    const draftItineraries = user 
      ? processedItineraries.filter(i => !i.is_published && i.created_by === user.id)
      : [];

    // Render main page with itineraries
    return (
      <PageContainer header={header} fullWidth={false} className="max-w-3xl mx-auto">
        <LocalErrorBoundary>
          <ClientWrapper
            itineraries={processedItineraries.map(i => ({
              ...i,
              slug: i.slug || '',
              is_published: i.is_published ?? false,
              metadata: i.metadata ? {
                ...i.metadata,
                name: i.metadata.title || '',
                duration: i.metadata.days || 0
              } : null
            }))}
            isAdmin={isAdmin}
            userId={user?.id || null}
          />
        </LocalErrorBoundary>

        {user && draftItineraries.length > 0 && (
          <div className="mt-16">
            <Heading level={2} size="default" className="mb-8">
              Your Drafts
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftItineraries.map((draft) => (
                <div key={draft.id} className="relative">
                  <Badge
                    variant="outline"
                    className="absolute top-2 right-2 z-10 bg-yellow-100 text-yellow-800 border-yellow-300"
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
    // Properly handle and log errors
    console.error('[ItinerariesPage]', error instanceof Error ? error.message : String(error));
    return <RefreshFallback />;
  }
}