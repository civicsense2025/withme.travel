import { NextResponse } from 'next/server';
import { ApiError } from '@/utils/api-error';
import { getPerformanceRating } from '@/utils/web-vitals';

interface BatchedMetric {
  id: string;
  name: string;
  value: number;
  rating: string;
  page: string;
  timestamp: number;
}

interface BatchedRequest {
  metrics: BatchedMetric[];
  connection: {
    effectiveType?: string;
    saveData?: boolean;
    rtt?: number;
    downlink?: number;
  } | null;
  device: {
    viewport?: {
      width: number;
      height: number;
    };
    devicePixelRatio?: number;
    memory?: {
      jsHeapSizeLimit?: number;
      totalJSHeapSize?: number;
      usedJSHeapSize?: number;
      usagePercentage?: number;
    } | null;
  } | null;
}

/**
 * API route for processing batched Web Vitals metrics
 * POST /api/analytics/vitals/batch
 */
export async function POST(req: Request) {
  try {
    // Parse the batched metrics data from the request body
    const batchData: BatchedRequest = await req.json();

    // Basic validation
    if (!Array.isArray(batchData.metrics) || batchData.metrics.length === 0) {
      return ApiError.badRequest('Invalid batched metrics data').toResponse();
    }

    // Add timestamp if not provided and calculate rating for metrics that need it
    const processedMetrics = batchData.metrics.map((metric) => {
      // Ensure each metric has a valid rating
      if (!metric.rating || metric.rating === 'custom') {
        metric.rating = getPerformanceRating(metric.name, metric.value);
      }

      // Make sure we have a timestamp
      if (!metric.timestamp) {
        metric.timestamp = Date.now();
      }

      return metric;
    });

    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals Batch]', {
        count: processedMetrics.length,
        metrics: processedMetrics,
        connection: batchData.connection,
        device: batchData.device,
      });
    }

    // Track any critical metrics
    const criticalMetrics = processedMetrics.filter((metric) => metric.rating === 'poor');

    if (criticalMetrics.length > 0) {
      // In a production app, you might:
      // 1. Send alerts for poor performance
      // 2. Log to a separate critical metrics table
      console.warn(
        `[Critical Web Vitals] ${criticalMetrics.length} poor metrics detected:`,
        criticalMetrics.map((m) => `${m.name}: ${m.value}`)
      );
    }

    // Process memory usage data if provided
    if (
      batchData.device?.memory?.usagePercentage &&
      batchData.device.memory.usagePercentage > 0.9
    ) {
      console.warn(
        `[Critical Memory Usage] ${Math.round(
          batchData.device.memory.usagePercentage * 100
        )}% memory used on page ${processedMetrics[0]?.page || 'unknown'}`
      );
    }

    // In a real application, you would:
    // 1. Store metrics in a database for analysis (batch insert)
    // 2. Send to an analytics service
    // 3. Aggregate metrics before storing to reduce database size

    // Example: Store in database (with Supabase)
    // const { data, error } = await supabase
    //   .from('performance_metrics')
    //   .insert(processedMetrics);

    // Return success with count of processed metrics
    return NextResponse.json({
      success: true,
      processed: processedMetrics.length,
    });
  } catch (error) {
    console.error('Error processing web vitals batch:', error);
    return ApiError.internal('Failed to process batched web vitals data').toResponse();
  }
}
