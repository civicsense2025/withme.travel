/**
 * web-vitals.ts
 * Utilities for tracking Core Web Vitals and performance metrics
 */

import { NextWebVitalsMetric } from 'next/app';
import { ErrorCategory, logError } from './error-logger';

// Define performance thresholds (based on Google's recommended values)
export const PERFORMANCE_THRESHOLDS = {
  // Largest Contentful Paint (loading performance)
  LCP: {
    GOOD: 2500, // Good: <= 2.5s
    POOR: 4000, // Poor: > 4s, Needs improvement: between these values
  },
  // First Input Delay (interactivity)
  FID: {
    GOOD: 100, // Good: <= 100ms
    POOR: 300, // Poor: > 300ms
  },
  // Cumulative Layout Shift (visual stability)
  CLS: {
    GOOD: 0.1, // Good: <= 0.1
    POOR: 0.25, // Poor: > 0.25
  },
  // Time to First Byte (server response time)
  TTFB: {
    GOOD: 800, // Good: <= 800ms
    POOR: 1800, // Poor: > 1800ms
  },
  // First Contentful Paint
  FCP: {
    GOOD: 1800, // Good: <= 1.8s
    POOR: 3000, // Poor: > 3s
  },
  // Interaction to Next Paint
  INP: {
    GOOD: 200, // Good: <= 200ms
    POOR: 500, // Poor: > 500ms
  },
};

// Type definition for Web Vitals metrics
interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  delta: number;
  entries: PerformanceEntry[];
  navigationType?: string;
}

// Get performance rating based on metric value and thresholds
export function getPerformanceRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS];

  if (!thresholds) return 'needs-improvement';

  if (value <= thresholds.GOOD) return 'good';
  if (value > thresholds.POOR) return 'poor';
  return 'needs-improvement';
}

// Get user connection information
export function getConnectionInfo(): {
  effectiveType: string;
  saveData: boolean;
  rtt: number;
  downlink: number;
} | null {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return null;
  }

  // TypeScript doesn't know about the Navigator connection property
  const connection = (navigator as any).connection;

  if (!connection) return null;

  return {
    effectiveType: connection.effectiveType || 'unknown',
    saveData: !!connection.saveData,
    rtt: connection.rtt || 0,
    downlink: connection.downlink || 0,
  };
}

// Collect browser and device information
export function getDeviceInfo() {
  if (typeof window === 'undefined') return null;

  return {
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    devicePixelRatio: window.devicePixelRatio,
  };
}

// Get the current page path from the URL
export function getCurrentPage(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

// Function to track web vitals metrics
export function trackWebVitals({
  id,
  name,
  label,
  value,
  startTime,
  attribution,
}: NextWebVitalsMetric) {
  console.log(`${name}: ${value}`);

  if (typeof window === 'undefined') {
    return;
  }

  try {
    const rating = getPerformanceRating(name, value);
    const page = getCurrentPage();
    const connectionInfo = getConnectionInfo();
    const deviceInfo = getDeviceInfo();

    // Only send metrics to analytics for production
    if (process.env.NODE_ENV === 'production') {
      // Send metrics to your analytics endpoint
      fetch('/api/analytics/vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          name,
          label,
          value,
          rating,
          page,
          startTime,
          connection: connectionInfo,
          device: deviceInfo,
          attribution,
        }),
        // Use keepalive to ensure the request completes even during page unloads
        keepalive: true,
      }).catch((error) => {
        return console.error('Failed to send Web Vitals:', error);
      });
    }

    // Additionally, report poor metrics for monitoring
    if (rating === 'poor') {
      logError(`Poor ${name} detected: ${value}`, ErrorCategory.UNKNOWN, 'web-vitals', {
        metric: {
          id,
          name,
          value,
          rating,
          page,
        },
        connection: connectionInfo,
        device: deviceInfo,
      });
    }
  } catch (error) {
    console.error('Error tracking web vitals:', error);
  }
}

/**
 * Initialize performance monitoring by setting up the appropriate
 * performance observers
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  try {
    // Using dynamic import to avoid requiring the package server-side
    // We don't need type checking for this dynamic import
    const importWebVitals = async () => {
      try {
        // @ts-ignore - web-vitals may not be installed yet
        const webVitals = await import('web-vitals');

        webVitals.onCLS((metric: WebVitalsMetric) => {
          console.log('CLS:', metric.value);
          trackCustomMetric('CLS', metric.value);
        });

        webVitals.onFID((metric: WebVitalsMetric) => {
          console.log('FID:', metric.value);
          trackCustomMetric('FID', metric.value);
        });

        webVitals.onLCP((metric: WebVitalsMetric) => {
          console.log('LCP:', metric.value);
          trackCustomMetric('LCP', metric.value);
        });

        webVitals.onTTFB((metric: WebVitalsMetric) => {
          console.log('TTFB:', metric.value);
          trackCustomMetric('TTFB', metric.value);
        });

        webVitals.onFCP((metric: WebVitalsMetric) => {
          console.log('FCP:', metric.value);
          trackCustomMetric('FCP', metric.value);
        });

        webVitals.onINP((metric: WebVitalsMetric) => {
          console.log('INP:', metric.value);
          trackCustomMetric('INP', metric.value);
        });
      } catch (error) {
        console.warn('Web Vitals library not available:', error);
      }
    };

    importWebVitals();
  } catch (error) {
    console.error('Failed to initialize performance monitoring:', error);
  }
}

/**
 * Track a custom performance metric
 */
export function trackCustomMetric(name: string, value: number): void {
  if (typeof window === 'undefined') return;

  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Custom Metric] ${name}: ${value}`);
    }

    // Add to browser's performance entries if available
    if ('performance' in window && 'mark' in window.performance) {
      performance.mark(`${name}:${value}`);
    }

    // In production, send to analytics
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/custom-metric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          value,
          page: getCurrentPage(),
          timestamp: Date.now(),
        }),
        keepalive: true,
      }).catch((error) => {
        console.error('Failed to send custom metric:', error);
      });
    }
  } catch (error) {
    console.error('Error tracking custom metric:', error);
  }
}
