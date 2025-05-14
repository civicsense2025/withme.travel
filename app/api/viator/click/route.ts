import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

interface ViatorLinkClick {
  affiliateUrl: string;
  userId?: string;
  tripId?: string;
  productCode?: string;
  pageContext: string;
  metadata?: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  referer?: string;
  ip?: string;
}

/**
 * POST handler for tracking Viator link clicks
 * This endpoint records every time a user clicks on a Viator affiliate link.
 */
export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as ViatorLinkClick;

    // Basic validation
    if (!data.affiliateUrl) {
      return NextResponse.json({ error: 'Affiliate URL is required' }, { status: 400 });
    }

    // Add additional tracking details
    const trackingData: ViatorLinkClick = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || undefined,
      referer: request.headers.get('referer') || undefined,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined,
    };

    console.log('Viator link click tracked:', trackingData);

    // Optional: Save to database
    try {
      const supabase = await createRouteHandlerClient();

      // Use the JavaScript-style object access to bypass TypeScript's schema validation
      // @ts-ignore - Suppress TypeScript error for table not in schema
      await supabase['from']('viator_link_clicks').insert([trackingData]);
    } catch (dbError) {
      // Log the error but don't fail the request
      console.error('Error saving click to database:', dbError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking Viator link click:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track link click' },
      { status: 500 }
    );
  }
}
