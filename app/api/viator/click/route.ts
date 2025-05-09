'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createRouteHandlerClient();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Prepare the data to be inserted
    const clickData = {
      user_id: user?.id || body.userId || null, // Use authenticated user if available
      affiliate_url: body.affiliateUrl,
      product_code: body.productCode || null,
      trip_id: body.tripId || null,
      page_context: body.pageContext || 'unknown',
      clicked_at: body.clickedAt || new Date().toISOString(),
      metadata: body.metadata || {}
    };
    
    // Validate required fields
    if (!clickData.affiliate_url) {
      return NextResponse.json(
        { error: 'affiliate_url is required' },
        { status: 400 }
      );
    }
    
    // Insert into the viator_link_clicks table
    const { data, error } = await supabase
      .from('viator_link_clicks')
      .insert(clickData)
      .select('id');
    
    if (error) {
      console.error('Error saving Viator link click:', error);
      return NextResponse.json(
        { error: 'Failed to save click data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, id: data?.[0]?.id });
  } catch (error) {
    console.error('Error processing Viator link click:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 