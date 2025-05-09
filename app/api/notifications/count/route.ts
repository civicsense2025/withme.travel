import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database';

// Simple in-memory cache for rate limiting
const rateLimit = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 5; // 5 requests per minute per user

/**
 * Lightweight GET route handler for fetching notification counts
 * Performance-optimized to only count unread notifications
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createRouteHandlerClient();
  
  // Authenticate the user
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = userData.user.id;
  // Get client IP from the NextRequest headers, falling back to a user-specific identifier
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'user-' + userId;
  const rateKey = `${userId}:${clientIp}`;
  
  // Check rate limit
  const now = Date.now();
  const userRateLimit = rateLimit.get(rateKey);
  
  if (userRateLimit && now - userRateLimit.timestamp < RATE_LIMIT_WINDOW) {
    // User has made requests in the current window
    if (userRateLimit.count >= MAX_REQUESTS_PER_WINDOW) {
      // Rate limit exceeded
      console.log(`Rate limit exceeded for /api/notifications/count:${clientIp}`);
      
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
  
  try {
    // Only get unread notification count - more performant
    const { count, error } = await supabase
      .from(TABLES.NOTIFICATIONS)
      .select('id', { count: 'exact', head: true }) // Use head:true to avoid fetching data
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Error fetching notification count:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notification count' },
        { status: 500 }
      );
    }
    
    const unreadCount = count || 0;
    
    // Generate ETag for conditional requests
    const etag = `"notification-count-${userId}-${unreadCount}"`;
    
    // Check if client already has this version
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304, // Not Modified
        headers: {
          'ETag': etag,
          'Cache-Control': 'private, max-age=30'
        }
      });
    }
    
    // Return count with caching headers
    const response = NextResponse.json({
      unreadCount: unreadCount
    });
    
    // Add cache headers
    response.headers.set('ETag', etag);
    response.headers.set('Cache-Control', 'private, max-age=30'); // 30 seconds
    
    return response;
  } catch (err) {
    console.error('Unexpected error fetching notification counts:', err);
    return NextResponse.json(
      { unreadCount: 0 }, // Return 0 as fallback
      { status: 200 } // Return 200 with fallback data instead of 500
    );
  }
}
