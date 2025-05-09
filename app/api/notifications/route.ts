import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database';
import { createHash } from 'crypto';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per user
const rateLimit = new Map<string, { count: number, timestamp: number }>();

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get user information
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!data.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = data.user.id;
    
    // Check rate limit
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'user-' + userId;
    const rateKey = `${userId}:${clientIp}`;
    const now = Date.now();
    const userRateLimit = rateLimit.get(rateKey);
    
    if (userRateLimit && now - userRateLimit.timestamp < RATE_LIMIT_WINDOW) {
      // User has made requests in the current window
      if (userRateLimit.count >= MAX_REQUESTS_PER_WINDOW) {
        // Rate limit exceeded
        console.log(`Rate limit exceeded for /api/notifications:${clientIp}`);
        
        // Return 429 with appropriate headers
        const response = NextResponse.json(
          { error: 'Too Many Requests' },
          { status: 429 }
        );
        
        // Add headers to guide client behavior
        response.headers.set('Retry-After', '60'); // Retry after 60 seconds
        response.headers.set('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', (Math.ceil(userRateLimit.timestamp / 1000) + 60).toString());
        
        return response;
      }
      
      // Update request count
      userRateLimit.count++;
    } else {
      // New rate limit window
      rateLimit.set(rateKey, { count: 1, timestamp: now });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams?.get('page') || '1');
    const pageSize = parseInt(url.searchParams?.get('pageSize') || '20');
    const unreadOnly = url.searchParams?.get('unread_only') === 'true';
    const offset = (page - 1) * pageSize;

    // Defensive fallback - provide empty notifications if anything fails
    let notifications = [];
    let totalCount = 0;

    try {
      // First attempt - with sender join
      const query = supabase
        .from(TABLES.NOTIFICATIONS)
        .select(`*, sender:sender_id (name, avatar_url)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query.eq('read', false);
      }

      const result = await query.range(offset, offset + pageSize - 1).limit(pageSize);
      
      if (result.error) {
        console.error('Error in first query attempt:', result.error);
        
        // Second attempt - without join if first one fails
        const fallbackResult = await supabase
          .from(TABLES.NOTIFICATIONS)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + pageSize - 1)
          .limit(pageSize);
        
        if (fallbackResult.error) {
          console.error('Error in fallback query:', fallbackResult.error);
          // Continue with empty notifications
        } else {
          notifications = fallbackResult.data || [];
        }
      } else {
        notifications = result.data || [];
      }

      // Get total count for pagination
      const countQuery = supabase
        .from(TABLES.NOTIFICATIONS)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (unreadOnly) {
        countQuery.eq('read', false);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Error fetching count:', countError);
      } else {
        totalCount = count || 0;
      }
    } catch (e) {
      console.error('Unexpected error in notifications query:', e);
      // Continue with empty notifications
    }

    // Generate ETag based on the content and query parameters
    const contentHash = createHash('md5')
      .update(JSON.stringify({
        notifications,
        pagination: { total: totalCount, page, pageSize }
      }))
      .digest('hex');
    const etag = `"notifications-${userId}-${page}-${pageSize}-${unreadOnly ? 'unread' : 'all'}-${contentHash}"`;
    
    // Check if client already has this version
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304, // Not Modified
        headers: {
          'ETag': etag,
          'Cache-Control': 'private, max-age=60'
        }
      });
    }

    // Always return a valid response, even if queries failed
    const response = NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        hasMore: (offset + pageSize) < totalCount
      },
    });
    
    // Add caching headers
    response.headers.set('ETag', etag);
    response.headers.set('Cache-Control', 'private, max-age=60'); // Cache for 1 minute
    
    return response;
  } catch (error) {
    console.error('Top-level error in notifications API:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      notifications: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: 20,
        hasMore: false
      }
    }, { status: 200 }); // Return 200 with empty data instead of 500
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get user information
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!data.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    const { notificationIds, read = true } = body;
    
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Expected non-empty notificationIds array.' },
        { status: 400 }
      );
    }
    
    // Update notifications
    const { data: updatedData, error } = await supabase
      .from(TABLES.NOTIFICATIONS)
      .update({ read })
      .eq('user_id', data.user.id)
      .in('id', notificationIds)
      .select();
    
    if (error) {
      console.error('Error updating notifications:', error);
      return NextResponse.json({ error: 'Failed to update notifications', updated: [] }, { status: 200 });
    }
    
    return NextResponse.json({ updated: updatedData || [] });
  } catch (error) {
    console.error('Top-level error in PATCH notifications API:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      updated: [] 
    }, { status: 200 }); // Return 200 with empty data instead of 500
  }
}
