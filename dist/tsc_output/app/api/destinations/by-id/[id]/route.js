import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
export async function GET(request, props) {
    const supabase = createClient();
    const { id } = props.params;
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
        return NextResponse.json({ error: 'Invalid destination ID format' }, { status: 400 });
    }
    try {
        console.log('API: Fetching destination with ID:', id);
        // Only select columns that we know exist in the database
        const { data: destination, error } = await supabase
            .from('destinations')
            .select(`
        id,
        name,
        city,
        state_province,
        country,
        image_url,
        continent
      `)
            .eq('id', id)
            .single(); // We expect only one destination per ID
        if (error) {
            console.error('Supabase error fetching destination by ID:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            // Handle specific errors like not found (PGRST116) differently if needed
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
            }
            return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
        }
        if (!destination) {
            return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
        }
        // Ensure required fields are present
        if (!destination.id || !destination.city || !destination.country) {
            console.error('API: Destination data incomplete:', destination);
            return NextResponse.json({ error: 'Destination data incomplete' }, { status: 500 });
        }
        // If name is empty, use city + country as the name
        if (!destination.name || destination.name.trim() === '') {
            destination.name = `${destination.city}, ${destination.country}`;
        }
        console.log('API: Successfully found destination:', destination.id, destination.name);
        return NextResponse.json({ destination });
    }
    catch (error) {
        console.error('API error fetching destination by ID:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
