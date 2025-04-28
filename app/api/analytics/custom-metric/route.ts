import { NextResponse } from 'next/server';
import { ApiError } from '@/utils/api-error';

/**
 * API route for collecting custom performance metrics
 * POST /api/analytics/custom-metric
 */
async function POST(req: Request) {
  try {
    // Parse the metric data from the request body
    const metricData = await req.json();
    
    // Basic validation
    if (!metricData.name || typeof metricData.value !== 'number') {
      return ApiError.badRequest('Invalid metric data').toResponse();
    }
    
    // Add timestamp if not provided
    if (!metricData.timestamp) {
      metricData.timestamp = Date.now();
    }
    
    // Add additional context for analysis
    metricData.userAgent = req.headers.get('user-agent') || null;
    
    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Custom Metric]', metricData);
    }
    
    // In a real application, you would:
    // 1. Store metrics in a database
    // 2. Send to an analytics service
    // 3. Generate reports on performance
    
    // Example: Store in database
    // const { data, error } = await supabase
    //   .from('custom_metrics')
    //   .insert([metricData]);
    
    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing custom metric:', error);
    return ApiError.internal('Failed to process custom metric data').toResponse();
  }
}

export { POST }; 