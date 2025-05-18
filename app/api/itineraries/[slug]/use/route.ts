import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

// --- Types ---
interface UseTemplateRequest {
  name: string;
  description?: string;
  start_date?: string;
}

interface UseTemplateResponse {
  tripId: string;
  success: true;
  message?: string;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const supabase = await createRouteHandlerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  console.log(`[DEBUG] Processing template use for slug: ${slug}`);

  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Trip title is required' }, { status: 400 });
    }

    console.log(`[DEBUG] Creating trip from template with title: ${body.name}`);

    // Get the template with its sections and items
    const { data: template, error: templateError } = await supabase
      .from('itinerary_templates')
      .select('*, destinations(*)')
      .eq('slug', slug)
      .single();

    if (templateError) {
      console.error('[DEBUG] Error fetching template:', templateError);
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    console.log(`[DEBUG] Found template: ${template.id}, title: ${template.title}`);

    // Calculate end date if start date is provided
    let endDate = null;
    if (body.start_date) {
      const startDate = new Date(body.start_date);
      const duration = typeof template.duration_days === 'number' ? template.duration_days : 1;
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (duration - 1));
    }

    // Create a new trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        name: body.name,
        description: body.description || template.description,
        destination_id: template.destination_id,
        start_date: body.start_date || null,
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        created_by: user.id,
        is_public: false,
        status: 'planning',
        duration_days: typeof template.duration_days === 'number' ? template.duration_days : 1,
      })
      .select()
      .single();

    if (tripError) {
      console.error('[DEBUG] Error creating trip:', tripError);
      const message = tripError.message.includes(
        'duplicate key value violates unique constraint "trips_slug_key"'
      )
        ? 'A trip with this name might already exist. Try a different name.'
        : tripError.message;
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (!trip) {
      console.error('[DEBUG] Trip data is null after insert without error.');
      return NextResponse.json(
        { error: 'Failed to retrieve trip data after creation.' },
        { status: 500 }
      );
    }

    console.log(`[DEBUG] Created new trip: ${trip.id}`);

    // Add the user as a member with admin role
    const { error: memberError } = await supabase.from(TABLES.TRIP_MEMBERS).insert({
      trip_id: trip.id,
      user_id: user.id,
      role: 'admin',
      status: 'active',
    });

    if (memberError) {
      console.error('[CRITICAL] Error adding creator as trip member:', memberError);
      console.error(`[DEBUG] Trip ID: ${trip.id}, User ID: ${user.id}`);
      return NextResponse.json(
        { error: `Trip created, but failed to add you as a member: ${memberError.message}` },
        { status: 500 }
      );
    }

    // Fetch template sections (or items directly if sections fail)
    let templateSections: any[] = [];
    console.log('[DEBUG] Fetching items directly for template:', template.id);
    const { data: templateItemsFlat, error: itemsFlatError } = await supabase
      .from('itinerary_template_items')
      .select('*')
      .eq('template_id', template.id)
      .order('day', { ascending: true })
      .order('item_order', { ascending: true });

    if (itemsFlatError) {
      console.error('[DEBUG] Error fetching flat items:', itemsFlatError);
      // Proceed without items if fetch fails
    } else if (templateItemsFlat && templateItemsFlat.length > 0) {
      console.log(`[DEBUG] Found ${templateItemsFlat.length} items directly.`);
      // Group items by day to reconstruct sections
      const itemsByDay = templateItemsFlat.reduce((acc: any, item: any) => {
        const day = item.day || 1;
        if (!acc[day]) acc[day] = [];
        acc[day].push(item);
        return acc;
      }, {});
      templateSections = Object.keys(itemsByDay).map((day) => ({
        id: `synth-sec-day-${day}`,
        day_number: parseInt(day, 10),
        itinerary_template_items: itemsByDay[day],
      }));
    }

    if (templateSections.length === 0) {
      console.log('[DEBUG] No sections or items found for template. Proceeding without itinerary.');
    } else {
      console.log(`[DEBUG] Found ${templateSections.length} sections (real or synthetic)`);
      const allItemsToInsert: any[] = [];

      for (const section of templateSections) {
        const items = section.itinerary_template_items || [];
        console.log(`[DEBUG] Processing section day ${section.day_number}, items: ${items.length}`);

        // Calculate the actual date for this day if we have a start date
        let itemDateStr = null;
        if (body.start_date && section.day_number) {
          const startDate = new Date(body.start_date);
          const itemDate = new Date(startDate);
          itemDate.setDate(startDate.getDate() + (section.day_number - 1));
          itemDateStr = itemDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }

        const itemsToInsertForSection = items.map((item: any) => ({
          trip_id: trip.id,
          title: item.title,
          description: item.description,
          location: item.location,
          place_id: item.place_id,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          start_time:
            item.start_time && itemDateStr ? `${itemDateStr}T${item.start_time}` : item.start_time,
          end_time:
            item.end_time && itemDateStr ? `${itemDateStr}T${item.end_time}` : item.end_time,
          day_number: section.day_number || 1,
          position: item.item_order || 0,
          created_by: user.id,
          category: item.category,
          estimated_cost: item.estimated_cost,
          currency: item.currency,
          duration_minutes: item.duration_minutes,
          status: 'suggested',
        }));

        allItemsToInsert.push(...itemsToInsertForSection);
      }

      if (allItemsToInsert.length > 0) {
        console.log(
          `[DEBUG] Inserting ${allItemsToInsert.length} total items for new trip ${trip.id}`
        );
        const { error: insertItemsError } = await supabase
          .from('itinerary_items')
          .insert(allItemsToInsert);

        if (insertItemsError) {
          console.error('[WARN] Error inserting itinerary items:', insertItemsError);
          return NextResponse.json(
            {
              success: true,
              trip_id: trip.id,
              warning: `Trip created, but failed to add itinerary items: ${insertItemsError.message}`,
            },
            { status: 500 }
          );
        } else {
          console.log('[DEBUG] Successfully inserted items.');
        }
      } else {
        console.log('[DEBUG] No items to insert.');
      }
    }

    console.log(`[DEBUG] Template use process completed for trip: ${trip.id}`);
    return NextResponse.json({
      success: true,
      trip_id: trip.id,
    });
  } catch (error: any) {
    console.error('[DEBUG] Error processing template use:', error);
    const message = error.message || 'An unexpected error occurred processing the template.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
