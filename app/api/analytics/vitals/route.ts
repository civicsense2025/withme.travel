import { NextResponse } from 'next/server';
import { recordWebVitals } from '@/lib/api/analytics';

/**
 * API route for collecting Web Vitals metrics
 * POST /api/analytics/vitals
 */
export async function POST(req: Request) {
  try {
    const metricsData = await req.json();
    const result = await recordWebVitals(metricsData);
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing web vitals:', error);
    return NextResponse.json({ error: 'Failed to process web vitals data' }, { status: 500 });
  }
}
