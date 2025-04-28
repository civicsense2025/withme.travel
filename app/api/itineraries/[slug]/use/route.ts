import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { DB_TABLES, DB_FIELDS } from '@/utils/constants';

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get user for authorization
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { tripId } = await request.json();
    
    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user has access to the trip
    const { data: tripMember, error: memberError } = await supabase
      .from(DB_TABLES.TRIP_MEMBERS)
      .select('role')
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .single();
    
    if (memberError || !tripMember) {
      return NextResponse.json(
        { error: 'You do not have access to this trip' },
        { status: 403 }
      );
    }
    
    // Get the template
    const { data: template, error: templateError } = await supabase
      .from(DB_TABLES.ITINERARY_TEMPLATES)
      .select('*')
      .eq(DB_FIELDS.ITINERARY_TEMPLATES.SLUG, slug)
      .single();
    
    if (templateError) {
      if (templateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      console.error('Error fetching template:', templateError);
      return NextResponse.json({ error: templateError.message }, { status: 500 });
    }
    
    // Get template sections - using correct table from constants
    const { data: sections, error: sectionsError } = await supabase
      .from(DB_TABLES.ITINERARY_TEMPLATE_SECTIONS)
      .select('*')
      .eq('template_id', template.id)
      .order('position', { ascending: true });
    
    if (sectionsError) {
      console.error('Error fetching template sections:', sectionsError);
      return NextResponse.json({ error: sectionsError.message }, { status: 500 });
    }
    
    // Create trip sections
    const tripSectionsToInsert = sections.map(section => ({
      [DB_FIELDS.ITINERARY_SECTIONS.TRIP_ID]: tripId,
      [DB_FIELDS.ITINERARY_SECTIONS.DAY_NUMBER]: section.day_number,
      [DB_FIELDS.ITINERARY_SECTIONS.TITLE]: section.title,
      [DB_FIELDS.ITINERARY_SECTIONS.POSITION]: section.position
    }));
    
    const { data: tripSections, error: tripSectionsError } = await supabase
      .from(DB_TABLES.ITINERARY_SECTIONS)
      .insert(tripSectionsToInsert)
      .select();
    
    if (tripSectionsError) {
      console.error('Error creating trip sections:', tripSectionsError);
      return NextResponse.json({ error: tripSectionsError.message }, { status: 500 });
    }
    
    // Get activities for each section and create trip items - using correct table from constants
    let allItems: Array<any> = [];
    for (let i = 0; i < sections.length; i++) {
      const { data: activities, error: activitiesError } = await supabase
        .from(DB_TABLES.ITINERARY_TEMPLATE_ITEMS)
        .select('*')
        .eq('section_id', sections[i].id)
        .order('item_order', { ascending: true });
      
      if (activitiesError) {
        console.error('Error fetching template activities:', activitiesError);
        return NextResponse.json({ error: activitiesError.message }, { status: 500 });
      }
      
      if (activities && activities.length > 0) {
        const itemsToInsert = activities.map(activity => ({
          [DB_FIELDS.ITINERARY_ITEMS.TRIP_ID]: tripId,
          [DB_FIELDS.ITINERARY_ITEMS.TITLE]: activity.title,
          "description": activity.description,
          [DB_FIELDS.ITINERARY_ITEMS.LOCATION]: activity.location,
          [DB_FIELDS.ITINERARY_ITEMS.START_TIME]: activity.start_time,
          [DB_FIELDS.ITINERARY_ITEMS.DAY_NUMBER]: sections[i].day_number,
          [DB_FIELDS.ITINERARY_ITEMS.SECTION_ID]: tripSections[i].id,
          [DB_FIELDS.ITINERARY_ITEMS.POSITION]: activity.item_order || i,
          [DB_FIELDS.ITINERARY_ITEMS.CREATED_BY]: user.id,
          [DB_FIELDS.ITINERARY_ITEMS.CATEGORY]: activity.category || 'activity',
          [DB_FIELDS.ITINERARY_ITEMS.STATUS]: 'suggested'
        }));
        
        const { data: items, error: itemsError } = await supabase
          .from(DB_TABLES.ITINERARY_ITEMS)
          .insert(itemsToInsert)
          .select();
        
        if (itemsError) {
          console.error('Error creating trip items:', itemsError);
          return NextResponse.json({ error: itemsError.message }, { status: 500 });
        }
        
        allItems = [...allItems, ...(items || [])];
      }
    }
    
    // Record template usage
    await supabase
      .from(DB_TABLES.TRIP_TEMPLATE_USES)
      .insert({
        [DB_FIELDS.TRIP_TEMPLATE_USES.TRIP_ID]: tripId,
        [DB_FIELDS.TRIP_TEMPLATE_USES.TEMPLATE_ID]: template.id,
        [DB_FIELDS.TRIP_TEMPLATE_USES.APPLIED_BY]: user.id,
        [DB_FIELDS.TRIP_TEMPLATE_USES.VERSION_USED]: template.version || 1
      });
    
    // Increment template copied count
    await supabase
      .from(DB_TABLES.ITINERARY_TEMPLATES)
      .update({
        copied_count: (template.copied_count || 0) + 1,
        last_copied_at: new Date().toISOString()
      })
      .eq('id', template.id);
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Template applied successfully',
        sections: tripSections,
        items: allItems
      }
    });
    
  } catch (error) {
    console.error('Error applying template:', error);
    return NextResponse.json(
      { error: 'Failed to apply template' },
      { status: 500 }
    );
  }
}
