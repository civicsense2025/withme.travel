import { useState, useCallback } from 'react';
import {
  recordWebVitals,
  recordWebVitalsBatch,
  recordCustomMetric,
  WebVitalsMetric
} from '@/lib/client/analytics';
import { useToast } from '@/hooks/use-toast';
import { Result, createSuccess, createFailure } from '@/lib/client/result';

/**
 * Web vitals data batch with connection and device information
 */
export interface WebVitalsBatch {
  /** Array of web vitals metrics */
  metrics: WebVitalsMetric[];
  /** Connection information */
  connection: {
    effectiveType?: string;
    saveData?: boolean;
    rtt?: number;
    downlink?: number;
  } | null;
  /** Device information */
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
 * Custom analytics metric data
 */
export interface CustomMetric {
  /** The name or event type of the custom metric */
  name: string;
  /** The value to record */
  value?: number | string | boolean;
  /** Category for grouping related metrics */
  category?: string;
  /** Current page or route where the metric was captured */
  page?: string;
  /** Additional properties to record with the metric */
  properties?: Record<string, any>;
  /** Timestamp when the metric was captured */
  timestamp?: number;
}

/**
 * Props for the useAnalytics hook
 */
export interface UseAnalyticsProps {
  /** Whether to show toast messages on success/error */
  showToasts?: boolean;
}

/**
 * Result of the useAnalytics hook
 */
export interface UseAnalyticsResult {
  /** Whether a request is currently in progress */
  isLoading: boolean;
  /** Error message if the last operation failed */
  error: string | null;
  /** Send a single web vitals metric */
  sendWebVitals: (metricsData: WebVitalsMetric) => Promise<Result<{ success: true }>>;
  /** Send a batch of web vitals metrics with additional context information */
  sendWebVitalsBatch: (batchData: WebVitalsBatch) => Promise<Result<{ processed: number }>>;
  /** Send a custom analytics metric */
  sendCustomMetric: (
    analyticsData: CustomMetric, 
    userId?: string, 
    sessionId?: string
  ) => Promise<Result<{ success: true }>>;
  /** Track a page view */
  trackPageView: (pageName: string, properties?: Record<string, any>) => Promise<Result<{ success: true }>>;
  /** Reset loading and error states */
  reset: () => void;
}

/**
 * Hook for tracking analytics data including web vitals and custom metrics
 * 
 * @param props Options for the hook
 * @returns Methods for tracking various analytics metrics
 */
export function useAnalytics({ showToasts = false }: UseAnalyticsProps = {}): UseAnalyticsResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Reset the loading and error states
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  /**
   * Handle common error processing
   */
  const handleError = useCallback((operation: string, err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    setError(errorMessage);
    
    if (showToasts) {
      toast({
        title: `Analytics Error: ${operation}`,
        description: errorMessage,
        variant: 'destructive',
      });
    }
    
    console.error(`Analytics error (${operation}):`, err);
    return errorMessage;
  }, [toast, showToasts]);

  /**
   * Send a single web vitals metric
   */
  const sendWebVitals = useCallback(async (metricsData: WebVitalsMetric): Promise<Result<{ success: true }>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await recordWebVitals(metricsData);
      setIsLoading(false);
      
      if (!result.success) {
        setError(result.error);
        if (showToasts) {
          toast({
            title: 'Analytics Error',
            description: `Failed to record web vitals: ${result.error}`,
            variant: 'destructive',
          });
        }
        return createFailure(result.error);
      }
      
      return result;
    } catch (err) {
      setIsLoading(false);
      const errorMessage = handleError('Record Web Vitals', err);
      return createFailure(errorMessage);
    }
  }, [toast, showToasts, handleError]);

  /**
   * Send a batch of web vitals metrics with connection and device information
   */
  const sendWebVitalsBatch = useCallback(async (batchData: WebVitalsBatch): Promise<Result<{ processed: number }>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await recordWebVitalsBatch(batchData);
      setIsLoading(false);
      
      if (!result.success) {
        setError(result.error);
        if (showToasts) {
          toast({
            title: 'Analytics Error',
            description: `Failed to record web vitals batch: ${result.error}`,
            variant: 'destructive',
          });
        }
        return createFailure(result.error);
      }
      
      return result;
    } catch (err) {
      setIsLoading(false);
      const errorMessage = handleError('Record Web Vitals Batch', err);
      return createFailure(errorMessage);
    }
  }, [toast, showToasts, handleError]);

  /**
   * Send a custom analytics metric
   */
  const sendCustomMetric = useCallback(async (
    analyticsData: CustomMetric,
    userId?: string,
    sessionId?: string
  ): Promise<Result<{ success: true }>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await recordCustomMetric(analyticsData, userId, sessionId);
      setIsLoading(false);
      
      if (!result.success) {
        setError(result.error);
        if (showToasts) {
          toast({
            title: 'Analytics Error',
            description: `Failed to record custom metric: ${result.error}`,
            variant: 'destructive',
          });
        }
        return createFailure(result.error);
      }
      
      return result;
    } catch (err) {
      setIsLoading(false);
      const errorMessage = handleError('Record Custom Metric', err);
      return createFailure(errorMessage);
    }
  }, [toast, showToasts, handleError]);

  /**
   * Track a page view
   */
  const trackPageView = useCallback(async (
    pageName: string, 
    properties?: Record<string, any>
  ): Promise<Result<{ success: true }>> => {
    return sendCustomMetric(
      {
        name: 'page_view',
        page: pageName,
        properties: properties || {},
        timestamp: Date.now()
      }
    );
  }, [sendCustomMetric]);

  return {
    isLoading,
    error,
    sendWebVitals,
    sendWebVitalsBatch,
    sendCustomMetric,
    trackPageView,
    reset
  };
} 