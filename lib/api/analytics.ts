/**
 * Analytics API module
 * Centralizes business logic for analytics endpoints (web vitals, custom metrics)
 * @module lib/api/analytics
 */

import { Result } from './_shared';
import { getPerformanceRating } from '@/utils/web-vitals';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * Records a web vitals metric
 * @param metricsData - The web vitals metric data
 * @returns Result<{ success: true }>
 */
export async function recordWebVitals(metricsData: any): Promise<Result<{ success: true }>> {
  try {
    if (!metricsData.name || typeof metricsData.value !== 'number') {
      return { success: false, error: 'Invalid metrics data' };
    }
    if (!metricsData.rating) {
      metricsData.rating = getPerformanceRating(metricsData.name, metricsData.value);
    }
    if (!metricsData.timestamp) {
      metricsData.timestamp = new Date().toISOString();
    }
    // TODO: Store in DB if needed
    // Example: await supabase.from('performance_metrics').insert([metricsData]);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', metricsData);
    }
    return { success: true, data: { success: true } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Interface for batched web vitals metrics
 */
interface BatchedMetric {
  id: string;
  name: string;
  value: number;
  rating: string;
  page: string;
  timestamp: number;
}

/**
 * Interface for batched request data
 */
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
 * Records a batch of web vitals metrics
 * @param batchData - The batched web vitals data
 * @returns Result<{ processed: number }>
 */
export async function recordWebVitalsBatch(batchData: BatchedRequest): Promise<Result<{ processed: number }>> {
  try {
    // Basic validation
    if (!Array.isArray(batchData.metrics) || batchData.metrics.length === 0) {
      return { success: false, error: 'Invalid batched metrics data' };
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

    // Example: Store in database
    // const supabase = await createRouteHandlerClient();
    // const { data, error } = await supabase
    //   .from('performance_metrics')
    //   .insert(processedMetrics);

    return { success: true, data: { processed: processedMetrics.length } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Records a custom analytics metric/event
 * @param analyticsData - The custom analytics event data
 * @param userId - The user ID (optional)
 * @param sessionId - The analytics session ID (optional)
 * @returns Result<{ success: true }>
 */
export async function recordCustomMetric(analyticsData: any, userId?: string, sessionId?: string): Promise<Result<{ success: true }>> {
  try {
    if (!analyticsData.name) {
      return { success: false, error: 'Event name is required' };
    }
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase.from(TABLES.TRIP_ANALYTICS_EVENTS).insert({
      user_id: userId || null,
      event_name: analyticsData.name,
      event_category: analyticsData.category || 'uncategorized',
      properties: analyticsData.properties || {},
      page_url: analyticsData.properties?.pathname || null,
      session_id: sessionId || null,
      created_at: new Date().toISOString(),
    });
    if (error) {
      return { success: false, error: 'Failed to save analytics event' };
    }
    return { success: true, data: { success: true } };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
} 