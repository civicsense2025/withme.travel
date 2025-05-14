import { getTypedDbClient } from '@/utils/supabase/server';
import { handleQueryResult } from '@/utils/type-safety';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/error-logger';
import { rateLimit } from '@/lib/rate-limit';
import { TABLES } from '@/utils/constants/tables';
// Edge cache: revalidate GET every 10s
const REVALIDATE_SECONDS = 10;

// --- Types ---
interface Like {
  id?: string;
  user_id: string;
  item_id: string;
  item_type: string;
}

interface LikeResponse {
  data: Like[] | Like | null;
  success: true;
  message?: string;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

// Helper to get current user ID or throw
async function getCurrentUserId(supabase: any): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Unauthorized');
  return data.user.id;
}

// GET /api/likes - Get all likes for current user
// GET /api/likes?itemType=destination - Filter by type
export async function GET(req: NextRequest) {
  try {
    const db = await getTypedDbClient();
    const supabase = await getTypedDbClient(); // For auth
    const userId = await getCurrentUserId(supabase);
    const itemType = req.nextUrl.searchParams.get('itemType') ?? undefined;

    // Query to get all user's likes
    let query = db.from(TABLES.LIKES).select('*').eq('user_id', userId);

    // Filter by item_type if provided
    if (itemType) {
      query = query.eq('item_type', itemType);
    }

    const { data, error } = await query;
    const likes = handleQueryResult({ data, error }, []);

    return NextResponse.json({ data: likes }, { status: 200 });
  } catch (err: any) {
    console.error('GET /api/likes error:', err);
    return NextResponse.json({ error: err.message || 'Error fetching likes' }, { status: 401 });
  }
}

// POST /api/likes - Add a new like
export async function POST(req: NextRequest) {
  try {
    const db = await getTypedDbClient();
    const supabase = await getTypedDbClient(); // For auth
    const userId = await getCurrentUserId(supabase);

    const body = await req.json();
    const { itemId, itemType } = body;

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'Missing itemId or itemType' }, { status: 400 });
    }

    // Create the like record
    const { data, error } = await db
      .from(TABLES.LIKES)
      .upsert({
        user_id: userId,
        item_id: itemId,
        item_type: itemType,
      })
      .select()
      .single();
    const like = handleQueryResult({ data, error });

    // --- Notification trigger for template likes ---
    if (itemType === 'template') {
      // Get the template owner
      const { data: template, error: templateError } = await db
        .from(TABLES.ITINERARY_TEMPLATES)
        .select('id, user_id, title')
        .eq('id', itemId)
        .single();
      // (Notification logic omitted for brevity)
    }
    // --- End notification trigger ---

    return NextResponse.json(like, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/likes error:', err);
    return NextResponse.json({ error: err.message || 'Error adding like' }, { status: 500 });
  }
}

// DELETE /api/likes?itemId=123&itemType=destination - Remove a like
export async function DELETE(req: NextRequest) {
  try {
    const db = await getTypedDbClient();
    const supabase = await getTypedDbClient(); // For auth
    const userId = await getCurrentUserId(supabase);

    const itemId = req.nextUrl.searchParams.get('itemId');
    const itemType = req.nextUrl.searchParams.get('itemType');

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'Missing itemId or itemType' }, { status: 400 });
    }

    // Delete the like record
    const { error } = await db
      .from(TABLES.LIKES)
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType);

    if (error) {
      console.error('Error deleting like:', error);
      throw error;
    }

    return NextResponse.json(null, { status: 204 });
  } catch (err: any) {
    console.error('DELETE /api/likes error:', err);
    return NextResponse.json({ error: err.message || 'Error removing like' }, { status: 500 });
  }
}
