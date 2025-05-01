import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, expires: new Date(0) });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const body = await request.json();

    // Get the template
    const { data: template, error: templateError } = await supabase
      .from('itinerary_templates')
      .select('*')
      .eq('slug', slug)
      .single();

    if (templateError) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create a new trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        title: body.title || template.title,
        description: body.description || template.description,
        destination_id: template.destination_id,
        start_date: body.start_date,
        end_date: body.end_date,
        created_by: user.id,
        is_public: false,
        status: 'planning',
      })
      .select()
      .single();

    if (tripError) {
      return NextResponse.json({ error: tripError.message }, { status: 500 });
    }

    // Add the user as a member with owner role
    const { error: memberError } = await supabase.from('trip_members').insert({
      trip_id: trip.id,
      user_id: user.id,
      role: 'owner',
    });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    // Create itinerary items from the template
    const days = template.days;
    const startDate = new Date(body.start_date);

    for (const day of days) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (day.day_number - 1));

      for (const item of day.items) {
        await supabase.from('itinerary_items').insert({
          trip_id: trip.id,
          title: item.title,
          description: item.description,
          location: item.location,
          start_time: item.start_time
            ? `${currentDate.toISOString().split('T')[0]}T${item.start_time}`
            : null,
          end_time: item.end_time
            ? `${currentDate.toISOString().split('T')[0]}T${item.end_time}`
            : null,
          day_number: day.day_number,
          created_by: user.id,
        });
      }
    }

    // Increment the template usage count
    await supabase.rpc('increment_template_uses', { template_id: template.id });

    return NextResponse.json({
      success: true,
      trip_id: trip.id,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
