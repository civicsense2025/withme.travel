import { createSupabaseServerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  const tripId = params.tripId;
  const url = new URL(request.url);
  const itemId = url.searchParams.get('itemId');
  
  if (!itemId) {
    return NextResponse.json(
      { error: 'Item ID is required' }, 
      { status: 400 }
    );
  }
  
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {    
    const { data, error } = await supabase
      .from('trip_item_comments')
      .select(`
        *,
        profiles:user_id (
          name,
          avatar_url
        ),
        likes:trip_comment_likes (
          id,
          user_id
        )
      `)
      .eq('trip_id', tripId)
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' }, 
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  const tripId = params.tripId;
  const { itemId, content } = await request.json();
  
  if (!itemId || !content) {
    return NextResponse.json(
      { error: 'Item ID and content are required' }, 
      { status: 400 }
    );
  }
  
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check if user is a member of this trip
  const { data: member, error: memberError } = await supabase
    .from('trip_members')
    .select()
    .eq('trip_id', tripId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (memberError || !member) {
    return NextResponse.json(
      { error: "You don't have access to this trip" }, 
      { status: 403 }
    );
  }
  
  try {
    const { data, error } = await supabase
      .from('trip_item_comments')
      .insert({
        trip_id: tripId,
        item_id: itemId,
        user_id: session.user.id,
        content: content.trim()
      })
      .select(`
        *,
        profiles:user_id (
          name,
          avatar_url
        )
      `)
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' }, 
      { status: 500 }
    );
  }
} 