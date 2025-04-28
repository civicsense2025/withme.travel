import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ItineraryDetailClient } from './page-client';
import { DB_TABLES, DB_FIELDS } from '@/utils/constants';

interface ItineraryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ItineraryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const { data: itinerary } = await supabase
    .from(DB_TABLES.ITINERARY_TEMPLATES)
    .select(`
      *,
      ${DB_TABLES.DESTINATIONS}(*)
    `)
    .eq(DB_FIELDS.ITINERARY_TEMPLATES.SLUG, slug)
    .single();
  
  if (!itinerary) {
    return {
      title: 'Itinerary Not Found',
      description: 'The requested itinerary could not be found.'
    };
  }
  
  return {
    title: `${itinerary.title} | withme.travel`,
    description: itinerary.description || `A ${itinerary.duration_days}-day itinerary for ${itinerary?.destination?.city}, ${itinerary?.destination?.country}`,
    openGraph: {
      images: [{
        url: itinerary?.destination?.image_url || '/images/destinations/default-destination.jpg',
        width: 1200,
        height: 630,
        alt: itinerary.title
      }]
    }
  };
}

export default async function ItineraryPage({ params }: ItineraryPageProps) {
  const { slug } = await params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Fetch the itinerary template
  const { data: template, error: templateError } = await supabase
    .from(DB_TABLES.ITINERARY_TEMPLATES)
    .select(`
      *,
      ${DB_TABLES.DESTINATIONS}(*),
      creator:${DB_FIELDS.ITINERARY_TEMPLATES.CREATED_BY}(id, name, avatar_url)
    `)
    .eq(DB_FIELDS.ITINERARY_TEMPLATES.SLUG, slug)
    .single();
  
  if (templateError || !template) {
    console.error("Error fetching template:", templateError);
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
        sections: []
      };
      return <ItineraryDetailClient itinerary={itinerary} />;
    }
    
    // Fetch activities for each section - using the correct table from constants
    const sectionsWithActivities = await Promise.all(
      sections.map(async (section) => {
        try {
          const { data: activities, error: activitiesError } = await supabase
            .from(DB_TABLES.ITINERARY_TEMPLATE_ITEMS)
            .select('*')
            .eq('section_id', section.id)
            .order('item_order', { ascending: true });
          
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
      sections: sectionsWithActivities
    };
    
    return <ItineraryDetailClient itinerary={itinerary} />;
  } catch (err) {
    console.error('Unexpected error in itinerary page:', err);
    // Return a basic version of the template without sections
    const itinerary = {
      ...template,
      sections: []
    };
    return <ItineraryDetailClient itinerary={itinerary} />;
  }
}