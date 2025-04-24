import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Import your SSR client creator
import { DB_TABLES } from '@/utils/constants';
// Fetch all existing tags
export async function GET(request) {
    // Use your SSR-compatible createClient function
    const supabase = createClient();
    try {
        // No need to pass cookies explicitly here
        const { data: tags, error } = await supabase
            .from(DB_TABLES.TAGS)
            .select('id, name')
            .order('name', { ascending: true });
        if (error) {
            console.error('Error fetching tags:', error);
            return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
        }
        return NextResponse.json(tags || []);
    }
    catch (error) {
        console.error('Unexpected error fetching tags:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
