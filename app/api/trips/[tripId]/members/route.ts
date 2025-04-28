import { NextResponse } from 'next/server';
import { createApiClient } from "@/utils/supabase/server";
import { DB_TABLES } from '@/utils/constants';

export async function GET(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  const { tripId } = params;
  
  if (!tripId) {
    return NextResponse.json(
      { error: 'Missing tripId parameter' }, 
      { status: 400 }
    );
  }
  
  try {
    const supabase = await createApiClient();
    
    // Fetch trip members with profiles
    const { data: members, error } = await supabase
      .from(DB_TABLES.TRIP_MEMBERS)
      .select(`
        *,
        profiles:${DB_TABLES.PROFILES}(id, name, avatar_url, username)
      `)
      .eq('trip_id', tripId);
    
    if (error) {
      console.error('Error fetching trip members:', error);
      return NextResponse.json(
        { error: 'Failed to fetch trip members' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Unexpected error in trip members API:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred' }, 
      { status: 500 }
    );
  }
} 