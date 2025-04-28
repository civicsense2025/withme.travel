import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { DB_TABLES, DB_FIELDS } from '@/utils/constants';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get user for authorization
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get published itineraries
  const { data, error } = await supabase
    .from(DB_TABLES.ITINERARY_TEMPLATES)
    .select(`
      *,
      ${DB_TABLES.DESTINATIONS}(*)
    `)
    .eq(DB_FIELDS.ITINERARY_TEMPLATES.IS_PUBLISHED, true)
    .order(DB_FIELDS.ITINERARY_TEMPLATES.CREATED_AT, { ascending: false });
  
  if (error) {
    console.error('Error fetching itineraries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get user for authorization
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const itineraryData = await request.json();
    
    // Validate required fields
    if (!itineraryData.title || !itineraryData.destination_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Start a transaction
    // 1. Insert the itinerary template
    const { data: template, error: templateError } = await supabase
      .from(DB_TABLES.ITINERARY_TEMPLATES)
      .insert({
        [DB_FIELDS.ITINERARY_TEMPLATES.TITLE]: itineraryData.title,
        [DB_FIELDS.ITINERARY_TEMPLATES.SLUG]: itineraryData.slug || generateSlug(itineraryData.title),
        [DB_FIELDS.ITINERARY_TEMPLATES.DESCRIPTION]: itineraryData.description,
        [DB_FIELDS.ITINERARY_TEMPLATES.DESTINATION_ID]: itineraryData.destination_id,
        [DB_FIELDS.ITINERARY_TEMPLATES.DURATION_DAYS]: itineraryData.duration_days,
        [DB_FIELDS.ITINERARY_TEMPLATES.CATEGORY]: itineraryData.category,
        [DB_FIELDS.ITINERARY_TEMPLATES.IS_PUBLISHED]: itineraryData.is_published,
        [DB_FIELDS.ITINERARY_TEMPLATES.CREATED_BY]: user.id,
        [DB_FIELDS.ITINERARY_TEMPLATES.TEMPLATE_TYPE]: 'user_created'
      })
      .select()
      .single();
    
    if (templateError) {
      console.error('Error creating itinerary template:', templateError);
      return NextResponse.json({ error: templateError.message }, { status: 500 });
    }
    
    // 2. Insert sections
    const sectionsToInsert = itineraryData.sections.map((section: any, index: number) => ({
      [DB_FIELDS.TEMPLATE_SECTIONS.TEMPLATE_ID]: template.id,
      [DB_FIELDS.TEMPLATE_SECTIONS.DAY_NUMBER]: section.day_number,
      [DB_FIELDS.TEMPLATE_SECTIONS.TITLE]: section.title,
      [DB_FIELDS.TEMPLATE_SECTIONS.POSITION]: index
    }));
    
    const { data: sections, error: sectionsError } = await supabase
      .from(DB_TABLES.TEMPLATE_SECTIONS)
      .insert(sectionsToInsert)
      .select();
    
    if (sectionsError) {
      console.error('Error creating template sections:', sectionsError);
      return NextResponse.json({ error: sectionsError.message }, { status: 500 });
    }
    
    // 3. Insert activities for each section
    let allActivities: Array<any> = [];
    for (let i = 0; i < sections.length; i++) {
      const sectionItems = itineraryData.sections[i].items || [];
      
      if (sectionItems.length > 0) {
        const activitiesToInsert = sectionItems.map((item: any, itemIndex: number) => ({
          [DB_FIELDS.TEMPLATE_ACTIVITIES.SECTION_ID]: sections[i].id,
          [DB_FIELDS.TEMPLATE_ACTIVITIES.TITLE]: item.title,
          [DB_FIELDS.TEMPLATE_ACTIVITIES.DESCRIPTION]: item.description,
          [DB_FIELDS.TEMPLATE_ACTIVITIES.LOCATION]: item.location,
          [DB_FIELDS.TEMPLATE_ACTIVITIES.START_TIME]: item.start_time || null,
          [DB_FIELDS.TEMPLATE_ACTIVITIES.POSITION]: itemIndex,
          [DB_FIELDS.TEMPLATE_ACTIVITIES.CATEGORY]: item.category || 'activity'
        }));
        
        const { data: activities, error: activitiesError } = await supabase
          .from(DB_TABLES.TEMPLATE_ACTIVITIES)
          .insert(activitiesToInsert)
          .select();
        
        if (activitiesError) {
          console.error('Error creating template activities:', activitiesError);
          return NextResponse.json({ error: activitiesError.message }, { status: 500 });
        }
        
        allActivities = [...allActivities, ...(activities || [])];
      }
    }
    
    return NextResponse.json({
      data: {
        ...template,
        sections: sections.map((section, idx) => ({
          ...section,
          items: allActivities.filter(activity => activity.section_id === section.id)
        }))
      }
    });
    
  } catch (error) {
    console.error('Error processing itinerary creation:', error);
    return NextResponse.json(
      { error: 'Failed to create itinerary' },
      { status: 500 }
    );
  }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
