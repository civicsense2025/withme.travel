import { createServerComponentClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ItineraryTemplatePageClient from './page-client';

// Import types for our data model
interface ItineraryTemplateItem {
  id: string;
  template_id: string;
  section_id: string;
  day: number;
  item_order: number;
  title: string | null;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  place_id: string | null;
  created_at: string;
  updated_at: string;
  category?: string | null;
  estimated_cost?: number | null;
  currency?: string | null;
  duration_minutes?: number | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  links?: string[] | null;
}

interface ItineraryTemplateSection {
  id: string;
  template_id: string;
  day_number: number;
  title: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  // Additional field for joined data
  itinerary_template_items?: ItineraryTemplateItem[];
  // Field for processed data
  items?: ItineraryTemplateItem[];
}

interface Destination {
  id: string;
  city: string;
  country: string;
  image_url: string | null;
  [key: string]: any;
}

// Client-compatible type definitions
interface ClientItineraryTemplateItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  item_order: number;
}

interface ClientItineraryTemplateSection {
  id: string;
  title: string;
  day_number: number;
  position: number;
  items: ClientItineraryTemplateItem[];
}

interface ClientItineraryTemplate {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  destination_id: string;
  duration_days: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  view_count: number;
  like_count: number;
  tags: string[];
  created_by: string;
  metadata: Record<string, any>;
  destination?: {
    id: string;
    city: string;
    country: string;
    image_url: string | null;
  };
}

export interface ItineraryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ItineraryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerComponentClient();

  try {
    // Fetch the itinerary template
    const { data: template, error: templateError } = await supabase
      .from('itinerary_templates')
      .select(`*, destinations(*)`)
      .eq('slug', slug)
      .single();

    if (templateError || !template) {
      return {
        title: 'Itinerary Not Found',
        description: 'The requested itinerary could not be found',
      };
    }

    return {
      title: template.title || 'Itinerary Template',
      description: template.description || 'View this trip itinerary template',
      openGraph: {
        images: template.destinations?.image_url ? [template.destinations.image_url] : [],
      }
  };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Itinerary',
      description: 'View this trip itinerary template',
    };
  }
}

export default async function ItineraryPage({ params }: ItineraryPageProps) {
  const { slug } = await params;
  console.log('[DEBUG] slug =', slug);
  const supabase = await createServerComponentClient();

  // ——————— 1. Fetch the template itself (with its destination) ———————
  const { data: tmpl, error: tmplErr } = await supabase
    .from('itinerary_templates')
    .select(`*, destinations(*)`)
    .eq('slug', slug)
    .single();

  console.log('[DEBUG] template fetch →', { tmpl: tmpl?.id, tmplErr });

  if (tmplErr || !tmpl) {
    console.error('Error fetching template:', tmplErr);
    notFound();
  }

  // ----- Step 2: Skip fetching sections directly -----
  console.log('[DEBUG] Skipping direct section fetch.');

  // ----- Step 3: Fetch ALL items for the TEMPLATE directly -----
  const { data: allItems, error: itemsErr } = await supabase
    .from('itinerary_template_items')
    .select('*')
    .eq('template_id', tmpl.id) // Fetch by template_id now
    .order('day', { ascending: true }) // Order by day first
    .order('item_order', { ascending: true }); // Then by item_order

  console.log('[DEBUG] All items fetch by template_id →', {
    itemCount: allItems?.length,
    itemsErr,
  });

  if (itemsErr) {
    console.error('Failed to load items for template:', itemsErr);
    // Decide how to handle this - maybe show template without items?
  }

  // ----- Step 4: Shape data for the client (adjust for flat items list) -----
  const template: ClientItineraryTemplate = {
    id: tmpl.id,
    title: tmpl.title,
    description: tmpl.description,
    slug: tmpl.slug,
    destination_id: tmpl.destination_id,
    duration_days: tmpl.duration_days,
    created_at: tmpl.created_at,
    updated_at: tmpl.updated_at,
    is_published: tmpl.is_published,
    view_count: tmpl.view_count,
    like_count: tmpl.like_count,
    created_by: tmpl.created_by,
    tags: tmpl.tags || [],
    metadata: tmpl.metadata || {},
    destination: tmpl.destinations
      ? {
          id: tmpl.destinations.id,
          city: tmpl.destinations.city,
          country: tmpl.destinations.country,
          image_url: tmpl.destinations.image_url,
        }
      : undefined,
  };

  // We need to reconstruct sections from the flat list of items
  const sectionsMap = new Map<string, ClientItineraryTemplateSection>();

  (allItems || []).forEach((item: ItineraryTemplateItem) => {
    // Attempt to find or create a section based on day number.
    // NOTE: This assumes items have a 'day' property. We might need section_id if not.
    // Also, we don't have section titles here!
    const dayKey = `day-${item.day}`; // Using day number as a key
    if (!sectionsMap.has(dayKey)) {
      sectionsMap.set(dayKey, {
        id: dayKey, // Fake section ID based on day
        title: `Day ${item.day}`, // Generic title
        day_number: item.day,
        position: item.day, // Assuming position aligns with day number
        items: [],
      });
    }

    const section = sectionsMap.get(dayKey)!;
    section.items.push({
      id: item.id,
      title: item.title || '',
      description: item.description,
      start_time: item.start_time,
      end_time: item.end_time,
      location: item.location,
      item_order: item.item_order,
    });
  });

  const sections_client: ClientItineraryTemplateSection[] = Array.from(sectionsMap.values()).sort(
    (a, b) => a.position - b.position
  ); // Sort sections by day/position

  console.log(
    '[DEBUG] Reconstructed client sections →',
    sections_client.map((s) => ({ id: s.id, count: s.items.length }))
  );

  // ----- Step 5: Increment view count (don't await this) -----
  const incrementViewCount = async () => {
    try {
      await supabase
        .from('itinerary_templates')
        .update({ view_count: (tmpl.view_count || 0) + 1 })
        .eq('id', tmpl.id);
      console.log('[DEBUG] View count incremented');
    } catch (err: unknown) {
      console.error('Error incrementing view count:', err);
    }
  };

  // Fire and forget - don't await this
  incrementViewCount();

  return <ItineraryTemplatePageClient template={template} sections={sections_client} />;
}
