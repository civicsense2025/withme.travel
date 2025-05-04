import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/error-logger';
import { TABLES, FIELDS } from '@/utils/constants/database';
import { rateLimit } from '@/lib/rate-limit';

// Edge cache: revalidate GET every 10s
const REVALIDATE_SECONDS = 10;

// Helper to get current user ID or throw
async function getCurrentUserId(supabase: any): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Unauthorized');
  return data.user.id;
}

// GET /api/likes?type=destination
// Returns array of liked item IDs for the current user (optionally filtered by type)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const userId = await getCurrentUserId(supabase);
    const type = req.nextUrl.searchParams.get('type') ?? undefined;
    let q = supabase
      .from(TABLES.LIKES)
      .select(FIELDS.LIKES.ITEM_ID)
      .eq(FIELDS.LIKES.USER_ID, userId);
    if (type) q = q.eq(FIELDS.LIKES.ITEM_TYPE, type);
    const { data: likes, error } = await q;
    if (error) throw error;
    // Only return array of item IDs
    const ids = Array.isArray(likes)
      ? likes.map((r: any) => r[FIELDS.LIKES.ITEM_ID])
      : [];
    return NextResponse.json(
      { data: ids },
      {
        status: 200,
        headers: { 'Cache-Control': `public, max-age=0, s-maxage=${REVALIDATE_SECONDS}` },
      }
    );
  } catch (err: any) {
    logger.error('GET /api/likes', err);
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 });
  }
}

// POST /api/likes
// Upserts a like for the current user (idempotent)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const userId = await getCurrentUserId(supabase);
    // Rate limit: 10 writes/min per user
    const rateRes = await rateLimit.applyLimit(req, `likes:${userId}`, 10, 60);
    if (rateRes) return rateRes;
    const { itemId, itemType } = await req.json();
    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'Missing itemId or itemType' }, { status: 400 });
    }
    // Upsert: insert or ignore if already exists
    const { error } = await supabase
      .from(TABLES.LIKES)
      .upsert({
        [FIELDS.LIKES.USER_ID]: userId,
        [FIELDS.LIKES.ITEM_ID]: itemId,
        [FIELDS.LIKES.ITEM_TYPE]: itemType,
      })
      .select();
    if (error) throw error;
    // Optionally: revalidate edge cache (if using Next.js cache tags)
    // NextResponse.revalidateTag(`user:${userId}:likes${itemType ? `:${itemType}` : ''}`);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    logger.error('POST /api/likes', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/likes?itemId=123&itemType=destination
// Deletes a like for the current user
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const userId = await getCurrentUserId(supabase);
    const rateRes = await rateLimit.applyLimit(req, `likes:del:${userId}`, 10, 60);
    if (rateRes) return rateRes;
    const itemId = req.nextUrl.searchParams.get('itemId');
    const itemType = req.nextUrl.searchParams.get('itemType');
    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'Missing itemId or itemType' }, { status: 400 });
    }
    const { error, count } = await supabase
      .from(TABLES.LIKES)
      .delete({ count: 'exact' })
      .eq(FIELDS.LIKES.USER_ID, userId)
      .eq(FIELDS.LIKES.ITEM_ID, itemId)
      .eq(FIELDS.LIKES.ITEM_TYPE, itemType);
    if (error) throw error;
    if (count === 0) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 });
    }
    // Optionally: revalidate edge cache
    // NextResponse.revalidateTag(`user:${userId}:likes${itemType}`);
    return NextResponse.json(null, { status: 204 });
  } catch (err: any) {
    logger.error('DELETE /api/likes', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
