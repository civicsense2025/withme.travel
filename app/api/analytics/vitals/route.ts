import { NextResponse } from 'next/server';
import { ApiError, createApiRouter } from '@/utils/api-error';
import { getPerformanceRating } from '@/utils/web-vitals';

/**
 * API route for collecting Web Vitals metrics
 * POST /api/analytics/vitals
 */
async function POST(req: Request) {
  try {
    // Parse the web vitals data from the request body
    const metricsData = await req.json();

    // Basic validation
    if (!metricsData.name || typeof metricsData.value !== 'number') {
      return ApiError.badRequest('Invalid metrics data').toResponse();
    }

    // Calculate the rating if not provided
    if (!metricsData.rating) {
      metricsData.rating = getPerformanceRating(metricsData.name, metricsData.value);
    }

    // Add timestamp if not provided
    if (!metricsData.timestamp) {
      metricsData.timestamp = new Date().toISOString();
    }

    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', metricsData);
    }

    // In a real application, you would:
    // 1. Store metrics in a database for analysis
    // 2. Send to an analytics service
    // 3. Alert on poor metrics

    // Example: Store in database
    // const { data, error } = await supabase
    //   .from('performance_metrics')
    //   .insert([metricsData]);

    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing web vitals:', error);
    return ApiError.internal('Failed to process web vitals data').toResponse();
  }
}

export { POST };
