/**
 * Performance Testing Utilities for Research System
 * 
 * This module provides functions to track and analyze performance metrics
 * for our research and survey pages.
 */
import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export interface PerformanceMetrics {
  /** Navigation timing metrics */
  navigationTiming?: {
    navigationStart?: number;
    fetchStart?: number;
    domContentLoadedEventEnd?: number;
    loadEventEnd?: number;
    duration?: number;
  };
  /** Core Web Vitals and other UX metrics */
  webVitals?: {
    lcp?: number;  // Largest Contentful Paint
    fid?: number;  // First Input Delay
    cls?: number;  // Cumulative Layout Shift
    fcp?: number;  // First Contentful Paint
    ttfb?: number; // Time to First Byte
  };
  /** Resource loading metrics */
  resources?: {
    totalRequests?: number;
    totalSize?: number;
    imageSize?: number;
    scriptSize?: number;
    cssSize?: number;
    fontSize?: number;
    otherSize?: number;
  };
  /** Custom interaction metrics */
  interactions?: {
    [key: string]: {
      startTime: number;
      endTime: number;
      duration: number;
    };
  };
  /** Raw performance entries (for debugging) */
  rawEntries?: any[];
}

/**
 * Start tracking performance metrics
 * 
 * @param page The Playwright page object
 * @param testName Name of the test for tracking multiple interactions
 */
export async function startPerformanceTracking(
  page: Page,
  testName: string
): Promise<void> {
  // Clear existing performance entries
  await page.evaluate(() => {
    window.performance.clearMarks();
    window.performance.clearMeasures();
  });
  
  // Start tracking
  await page.evaluate((name) => {
    // Mark the start of tracking
    performance.mark(`${name}-start`);
    
    // Store the test name in a global variable
    // @ts-ignore
    window.__testName = name;
    
    // Set up CLS tracking
    let clsValue = 0;
    let clsEntries = [];
    
    // Only add PerformanceObserver if supported
    if (typeof PerformanceObserver !== 'undefined') {
      // Create observer for layout-shift entries
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Only count layout shifts without recent user input
            if (!entry.hadRecentInput) {
              // @ts-ignore - layout shift specific property
              const impact = entry.value;
              clsValue += impact;
              // @ts-ignore - add to entries array
              clsEntries.push(entry);
            }
          }
        });
        
        observer.observe({ type: 'layout-shift', buffered: true });
        
        // @ts-ignore - store cls data globally
        window.__clsData = {
          value: () => clsValue,
          entries: () => clsEntries
        };
      } catch (e) {
        console.error('Error setting up CLS observer:', e);
      }
    }
  }, testName);
}

/**
 * End performance tracking and collect metrics
 * 
 * @param page The Playwright page object
 * @returns Promise resolving to the collected performance metrics
 */
export async function endPerformanceTracking(
  page: Page
): Promise<PerformanceMetrics> {
  return page.evaluate(() => {
    // @ts-ignore - access the test name we set
    const testName = window.__testName || 'unknown';
    
    // Mark the end of tracking
    performance.mark(`${testName}-end`);
    performance.measure(testName, `${testName}-start`, `${testName}-end`);
    
    // Get all performance entries
    const entries = performance.getEntriesByType('resource');
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    const paintEntries = performance.getEntriesByType('paint');
    
    // Calculate resource sizes
    let totalSize = 0;
    let imageSize = 0;
    let scriptSize = 0;
    let cssSize = 0;
    let fontSize = 0;
    let otherSize = 0;
    
    entries.forEach((entry) => {
      // @ts-ignore - encodedBodySize property exists on PerformanceResourceTiming
      const size = entry.encodedBodySize || 0;
      totalSize += size;
      
      if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)) {
        imageSize += size;
      } else if (entry.name.match(/\.(js)/i)) {
        scriptSize += size;
      } else if (entry.name.match(/\.(css)/i)) {
        cssSize += size;
      } else if (entry.name.match(/\.(woff|woff2|ttf|otf)/i)) {
        fontSize += size;
      } else {
        otherSize += size;
      }
    });
    
    // Get key paint metrics
    let fcp = 0;
    let lcp = 0;
    
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        fcp = entry.startTime;
      }
    });
    
    // Try to get LCP from specific entry or estimate it
    // @ts-ignore - accessing LCP data
    const lcpEntry = window.__lcpEntry;
    if (lcpEntry) {
      lcp = lcpEntry.startTime;
    }
    
    // Get CLS value
    // @ts-ignore - accessing CLS data
    let cls = window.__clsData?.value() || 0;
    
    // Get navigation timing metrics
    const navTiming = navigationEntry ? {
      // @ts-ignore - these properties exist on PerformanceNavigationTiming
      navigationStart: 0,
      // @ts-ignore
      fetchStart: navigationEntry.fetchStart,
      // @ts-ignore
      domContentLoadedEventEnd: navigationEntry.domContentLoadedEventEnd,
      // @ts-ignore
      loadEventEnd: navigationEntry.loadEventEnd,
      // @ts-ignore
      duration: navigationEntry.duration
    } : {};
    
    // Assemble metrics object
    return {
      navigationTiming: navTiming,
      webVitals: {
        lcp,
        fid: 0, // FID requires real user interaction, hard to measure in tests
        cls,
        fcp,
        // @ts-ignore - TTFB property
        ttfb: navigationEntry ? navigationEntry.responseStart - navigationEntry.requestStart : 0
      },
      resources: {
        totalRequests: entries.length,
        totalSize,
        imageSize,
        scriptSize,
        cssSize,
        fontSize,
        otherSize
      },
      // Include raw entries for debugging (limited to avoid large objects)
      rawEntries: entries.slice(0, 10).map(e => ({
        name: e.name,
        // @ts-ignore - these properties exist
        duration: e.duration,
        // @ts-ignore
        size: e.encodedBodySize
      }))
    };
  });
}

/**
 * Mark the start of a specific interaction
 * 
 * @param page The Playwright page object
 * @param interactionName Name of the interaction to track
 */
export async function startInteraction(
  page: Page,
  interactionName: string
): Promise<void> {
  await page.evaluate((name) => {
    performance.mark(`interaction-${name}-start`);
  }, interactionName);
}

/**
 * Mark the end of a specific interaction and measure its duration
 * 
 * @param page The Playwright page object
 * @param interactionName Name of the interaction to measure
 * @returns Promise resolving to the interaction duration in milliseconds
 */
export async function endInteraction(
  page: Page,
  interactionName: string
): Promise<number> {
  return page.evaluate((name) => {
    performance.mark(`interaction-${name}-end`);
    performance.measure(
      `interaction-${name}`,
      `interaction-${name}-start`,
      `interaction-${name}-end`
    );
    
    const measures = performance.getEntriesByName(`interaction-${name}`);
    if (measures.length > 0) {
      return measures[0].duration;
    }
    return 0;
  }, interactionName);
}

/**
 * Create a performance report with thresholds
 * 
 * @param metrics Performance metrics to report
 * @param options Report options with thresholds
 * @returns Performance report object with pass/fail indicators
 */
export function createPerformanceReport(
  metrics: PerformanceMetrics,
  options: {
    name: string;
    thresholds?: {
      loadTime?: number;
      fcp?: number;
      lcp?: number;
      cls?: number;
      resourceCount?: number;
      totalResourceSize?: number;
    };
  }
): any {
  const {
    name,
    thresholds = {
      loadTime: 3000,
      fcp: 1000,
      lcp: 2500,
      cls: 0.1,
      resourceCount: 50,
      totalResourceSize: 1500000 // 1.5MB
    }
  } = options;
  
  // Check metrics against thresholds
  const loadTime = metrics.navigationTiming?.loadEventEnd || 0;
  const fcp = metrics.webVitals?.fcp || 0;
  const lcp = metrics.webVitals?.lcp || 0;
  const cls = metrics.webVitals?.cls || 0;
  const resourceCount = metrics.resources?.totalRequests || 0;
  const totalResourceSize = metrics.resources?.totalSize || 0;
  
  // Generate report
  const report = {
    name,
    timestamp: new Date().toISOString(),
    metrics: {
      loadTime: {
        value: loadTime,
        threshold: thresholds.loadTime,
        passes: loadTime <= (thresholds.loadTime || Infinity)
      },
      fcp: {
        value: fcp,
        threshold: thresholds.fcp,
        passes: fcp <= (thresholds.fcp || Infinity)
      },
      lcp: {
        value: lcp,
        threshold: thresholds.lcp,
        passes: lcp <= (thresholds.lcp || Infinity)
      },
      cls: {
        value: cls,
        threshold: thresholds.cls,
        passes: cls <= (thresholds.cls || Infinity)
      },
      resourceCount: {
        value: resourceCount,
        threshold: thresholds.resourceCount,
        passes: resourceCount <= (thresholds.resourceCount || Infinity)
      },
      totalResourceSize: {
        value: totalResourceSize,
        threshold: thresholds.totalResourceSize,
        passes: totalResourceSize <= (thresholds.totalResourceSize || Infinity)
      }
    },
    resourceBreakdown: {
      images: metrics.resources?.imageSize || 0,
      scripts: metrics.resources?.scriptSize || 0,
      styles: metrics.resources?.cssSize || 0,
      fonts: metrics.resources?.fontSize || 0,
      other: metrics.resources?.otherSize || 0
    },
    passed: true,
    summary: ''
  };
  
  // Check overall pass/fail status
  let failedChecks = 0;
  for (const [name, check] of Object.entries(report.metrics)) {
    // @ts-ignore - dynamic access
    if (!check.passes) {
      failedChecks++;
    }
  }
  
  report.passed = failedChecks === 0;
  report.summary = failedChecks === 0
    ? `All performance checks passed`
    : `${failedChecks} performance checks failed`;
  
  return report;
}

/**
 * Save performance report to file
 * 
 * @param report Performance report object
 * @param fileName Optional file name (defaults to timestamp)
 * @returns Path to the saved report file
 */
export function savePerformanceReport(
  report: any,
  fileName?: string
): string {
  // Create directory if it doesn't exist
  const reportsDir = path.join(process.cwd(), 'performance-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Generate file name with timestamp if not provided
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFileName = fileName || `performance-report-${timestamp}.json`;
  const reportPath = path.join(reportsDir, reportFileName);
  
  // Write report to file
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return reportPath;
}

/**
 * Report performance metrics with threshold checks
 * 
 * @param metrics Performance metrics to report
 * @param testName Name of the test for report identification
 * @param thresholds Optional performance thresholds
 */
export async function reportPerformanceMetrics(
  metrics: PerformanceMetrics,
  testName: string,
  thresholds?: {
    loadTime?: number;
    fcp?: number;
    lcp?: number;
    cls?: number;
    resourceCount?: number;
    totalResourceSize?: number;
  }
): Promise<void> {
  // Create report
  const report = createPerformanceReport(metrics, {
    name: testName,
    thresholds
  });
  
  // Save report to file
  const reportPath = savePerformanceReport(report);
  
  // Log summary
  console.log(`Performance report for "${testName}": ${report.summary}`);
  console.log(`Report saved to: ${reportPath}`);
  
  // Log detailed metrics
  console.log('Key metrics:');
  console.log(`- Load time: ${metrics.navigationTiming?.loadEventEnd}ms`);
  console.log(`- First Contentful Paint: ${metrics.webVitals?.fcp}ms`);
  console.log(`- Largest Contentful Paint: ${metrics.webVitals?.lcp}ms`);
  console.log(`- Cumulative Layout Shift: ${metrics.webVitals?.cls}`);
  console.log(`- Resources: ${metrics.resources?.totalRequests} requests, ${(metrics.resources?.totalSize || 0) / 1024}KB`);
} 