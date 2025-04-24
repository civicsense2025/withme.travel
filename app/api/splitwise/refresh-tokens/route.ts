import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { refreshAccessToken } from '@/lib/services/splitwise';
import { DB_TABLES, DB_FIELDS } from '@/utils/constants';

// Use Edge Runtime for Vercel Cron Jobs
export const runtime = 'edge';

// Define the threshold for refreshing tokens (e.g., 1 hour before expiration)
const REFRESH_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour in milliseconds

export async function GET(request: Request) {
  // 1. Authenticate the request (using Vercel Cron Secret)
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization');

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    console.warn('Unauthorized attempt to access refresh-tokens endpoint.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Create Supabase Admin Client (using Service Role Key)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key for refresh-tokens job.');
    return NextResponse.json({ error: 'Internal Server Configuration Error' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // 3. Find connections needing refresh
  const thresholdTime = new Date(Date.now() + REFRESH_THRESHOLD_MS);
  let connectionsToRefresh: any[] = [];
  try {
    const { data, error } = await supabaseAdmin
      .from(DB_TABLES.SPLITWISE_CONNECTIONS)
      .select(`${DB_FIELDS.SPLITWISE_CONNECTIONS.USER_ID}, ${DB_FIELDS.SPLITWISE_CONNECTIONS.REFRESH_TOKEN}`)
      .is(DB_FIELDS.SPLITWISE_CONNECTIONS.EXPIRES_AT, 'not.null')
      .lt(DB_FIELDS.SPLITWISE_CONNECTIONS.EXPIRES_AT, thresholdTime.toISOString())
      .is(DB_FIELDS.SPLITWISE_CONNECTIONS.REFRESH_TOKEN, 'not.null');

    if (error) throw error;
    connectionsToRefresh = data || [];
  } catch (error) {
    console.error('Error fetching Splitwise connections to refresh:', error);
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
  }

  if (connectionsToRefresh.length === 0) {
    console.log('No Splitwise tokens require proactive refresh at this time.');
    return NextResponse.json({ message: 'No tokens needed refresh', refreshed: 0, failed: 0 });
  }

  console.log(`Found ${connectionsToRefresh.length} Splitwise connections potentially needing refresh.`);

  // 4. Attempt to refresh each token
  const refreshPromises = connectionsToRefresh.map(conn => 
    refreshAccessToken(conn.user_id, conn.refresh_token)
      .then(newAccessToken => ({ status: 'fulfilled', userId: conn.user_id, value: newAccessToken }))
      .catch(error => ({ status: 'rejected', userId: conn.user_id, reason: error?.message || String(error) }))
  );

  const results = await Promise.allSettled(refreshPromises);

  // 5. Log results and respond
  let refreshedCount = 0;
  let failedCount = 0;

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      // The actual refresh logic is inside the function called by Promise.allSettled
      // Here we just count based on the promise outcome
      refreshedCount++;
      console.log(`Successfully processed refresh for user ${result.value.userId}`); // Access userId from fulfilled value
    } else {
      failedCount++;
      console.warn(`Failed to refresh token for user ${result.reason.userId}: ${result.reason.reason}`); // Access userId from rejected reason
    }
  });

  console.log(`Splitwise Token Refresh Job Complete: Refreshed=${refreshedCount}, Failed=${failedCount}`);

  return NextResponse.json({
    message: 'Token refresh job completed.',
    refreshed: refreshedCount,
    failed: failedCount,
  });
} 