import { NextResponse } from 'next/server';
import { ApiError } from '@/utils/api-error';
import { recordWebVitalsBatch } from '@/lib/api/analytics';

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
    const batchData = await req.json();
    
    // Use the API module function to handle the business logic
    const result = await recordWebVitalsBatch(batchData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        processed: result.data.processed,
      });
    } else {
      return ApiError.badRequest(result.error).toResponse();
    }
  } catch (error) {
    console.error('Error processing web vitals batch:', error);
    return ApiError.internal('Failed to process batched web vitals data').toResponse();
  }
}
