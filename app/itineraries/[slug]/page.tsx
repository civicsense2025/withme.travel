import { createApiClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ItineraryDetailClient } from './page-client';
import { DB_TABLES, DB_FIELDS } from '@/utils/constants/database';

export interface ItineraryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ItineraryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createApiClient();

  try {
    // Fetch the itinerary template
    const { data: template, error: templateError } = await supabase
      .from(DB_TABLES.ITINERARY_TEMPLATES)
      .select(
        `
        *,
        ${DB_TABLES.DESTINATIONS}(*),
        creator:${DB_FIELDS.ITINERARY_TEMPLATES.CREATED_BY}(id, name, avatar_url)
      `
      )
      .eq(DB_FIELDS.ITINERARY_TEMPLATES.SLUG, slug)
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
        images: template.cover_image_url ? [template.cover_image_url] : [],
      },
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
  const supabase = await createApiClient();

  // Fetch the itinerary template
  const { data: template, error: templateError } = await supabase
    .from(DB_TABLES.ITINERARY_TEMPLATES)
    .select(
      `
      *,
      ${DB_TABLES.DESTINATIONS}(*),
      creator:${DB_FIELDS.ITINERARY_TEMPLATES.CREATED_BY}(id, name, avatar_url)
    `
    )
    .eq(DB_FIELDS.ITINERARY_TEMPLATES.SLUG, slug)
    .single();

  if (templateError || !template) {
    console.error('Error fetching template:', templateError);
    notFound();
  }

  try {
    // Fetch template sections - using the correct table from constants
    const { data: sections, error: sectionsError } = await supabase
      .from(DB_TABLES.ITINERARY_TEMPLATE_SECTIONS)
      .select('*')
      .eq('template_id', template.id)
      .order('position', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching template sections:', sectionsError);
      // Continue with empty sections rather than notFound()
      const itinerary = {
        ...template,
        sections: [],
      };
      return <ItineraryDetailClient itinerary={itinerary} />;
    }

    // Fetch activities for each section - using the correct table from constants
    const sectionsWithActivities = await Promise.all(
      sections.map(async (section) => {
        try {
          const { data: activities, error: activitiesError } = await supabase
            .from(DB_TABLES.TEMPLATE_ACTIVITIES)
            .select('*')
            .eq('section_id', section.id)
            .order('position', { ascending: true });

          if (activitiesError) {
            console.error('Error fetching template activities:', activitiesError);
            return { ...section, activities: [] };
          }

          return { ...section, activities };
        } catch (err) {
          console.error('Exception fetching activities:', err);
          return { ...section, activities: [] };
        }
      })
    );

    // Increment view count
    try {
      await supabase
        .from(DB_TABLES.ITINERARY_TEMPLATES)
        .update({ view_count: (template.view_count || 0) + 1 })
        .eq('id', template.id);
    } catch (err) {
      console.error('Error incrementing view count:', err);
      // Continue even if view count update fails
    }

    const itinerary = {
      ...template,
      sections: sectionsWithActivities,
    };

    return <ItineraryDetailClient itinerary={itinerary} />;
  } catch (err) {
    console.error('Unexpected error in itinerary page:', err);
    // Return a basic version of the template without sections
    const itinerary = {
      ...template,
      sections: [],
    };
    return <ItineraryDetailClient itinerary={itinerary} />;
  }
}
