import { tryCatch } from '@/lib/client/result';
import type { Result } from '@/lib/client/result';

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: string;
  page: string;
  timestamp: number;
}

export async function recordWebVitals(metricsData: any): Promise<Result<{ success: true }>> {
  return tryCatch(
    fetch('/api/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metricsData),
    }).then((res) => res.json())
  );
}

export async function recordWebVitalsBatch(batchData: any): Promise<Result<{ processed: number }>> {
  return tryCatch(
    fetch('/api/analytics/vitals/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData),
    }).then((res) => res.json())
  );
}

export async function recordCustomMetric(analyticsData: any, userId?: string, sessionId?: string): Promise<Result<{ success: true }>> {
  return tryCatch(
    fetch('/api/analytics/custom-metric', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...analyticsData, userId, sessionId }),
    }).then((res) => res.json())
  );
}

/**
 * Type guard to check if an object is an AnalyticsEvent
 */
export function isAnalyticsEvent(obj: any): obj is AnalyticsEvent {
  return obj && typeof obj.event === 'string' && typeof obj.timestamp === 'string';
} 