/**
 * Performance Tracking Utilities
 * 
 * Tools for measuring, collecting, and reporting performance metrics
 * during end-to-end testing of survey flows.
 */
import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { TestEnvironment } from '../test-environment';

/**
 * Performance metrics data structure
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit?: 'ms' | 'bytes' | 'count' | 'percent';
}

/**
 * Starts tracking performance metrics for a test
 * 
 * @param page Playwright page object
 * @param testName Name of the test for identification
 */
export async function startPerformanceTracking(page: Page, testName: string): Promise<void> {
  // Clear existing performance data
  await page.evaluate(() => {
    window.performance.clearMarks();
    window.performance.clearMeasures();
    
    // Track test start time
    window.performance.mark('test:start');
    
    // Add custom metric collection if needed
    window.testMetrics = {
      marks: [],
      measures: [],
      recordMark: (name: string) => {
        window.performance.mark(name);
        window.testMetrics.marks.push(name);
      },
      recordMeasure: (name: string, startMark: string, endMark: string) => {
        window.performance.measure(name, startMark, endMark);
        window.testMetrics.measures.push(name);
      }
    };
  });

  // Log test start
  console.log(`[Performance] Started tracking for "${testName}"`);
}

/**
 * Ends performance tracking and collects metrics
 * 
 * @param page Playwright page object
 * @returns Collection of performance metrics
 */
export async function endPerformanceTracking(page: Page): Promise<PerformanceMetric[]> {
  // Mark test end
  await page.evaluate(() => {
    window.performance.mark('test:end');
    window.performance.measure('test:total', 'test:start', 'test:end');
  });

  // Collect web vitals and other metrics
  const metrics = await page.evaluate(() => {
    // Basic metrics collection
    const performanceEntries = window.performance.getEntriesByType('measure');
    const result: any[] = [];
    
    performanceEntries.forEach(entry => {
      result.push({
        name: entry.name,
        value: entry.duration,
        unit: 'ms'
      });
    });
    
    // Add custom collected metrics if available
    if (window.testMetrics && window.testMetrics.measures) {
      window.testMetrics.measures.forEach((measureName: string) => {
        const measure = window.performance.getEntriesByName(measureName, 'measure')[0];
        if (measure) {
          result.push({
            name: measureName,
            value: measure.duration,
            unit: 'ms'
          });
        }
      });
    }

    return result;
  });

  return metrics;
}

/**
 * Reports performance metrics to file
 * 
 * @param metrics Collection of performance metrics
 * @param testName Name of the test for identification
 */
export async function reportPerformanceMetrics(
  metrics: PerformanceMetric[],
  testName: string
): Promise<void> {
  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), 'test-results', 'performance');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create report
  const report = {
    testName,
    timestamp: new Date().toISOString(),
    environment: {
      url: TestEnvironment.getSurveyBaseUrl(),
      // Add other relevant environment info
    },
    metrics
  };

  // Save to file
  const filename = `${testName.replace(/\s+/g, '-')}-${Date.now()}.json`;
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

  // Log summary
  console.log(`[Performance] Report saved to ${filePath}`);
  const totalTestTime = metrics.find(m => m.name === 'test:total')?.value || 0;
  console.log(`[Performance] Total test time: ${totalTestTime.toFixed(2)}ms`);
}

// For backward compatibility with existing API
export class PerformanceMetrics {
  private marks: Record<string, number> = {};
  private measures: Record<string, number> = {};
  
  mark(name: string): void {
    this.marks[name] = Date.now();
  }
  
  measure(markName: string, measureName: string): number {
    if (!this.marks[markName]) {
      console.warn(`Mark "${markName}" doesn't exist. Measurement skipped.`);
      return -1;
    }
    
    const startTime = this.marks[markName];
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    this.measures[measureName] = duration;
    return duration;
  }
  
  getMeasure(name: string): number | undefined {
    return this.measures[name];
  }
  
  getAllMeasures(): Record<string, number> {
    return { ...this.measures };
  }
  
  getAllMarks(): Record<string, number> {
    return { ...this.marks };
  }
  
  getAllMetrics(): Record<string, number> {
    return {
      ...this.marks,
      ...this.measures
    };
  }
  
  reset(): void {
    this.marks = {};
    this.measures = {};
  }
}

// For backward compatibility
export async function recordPerformanceReport(
  page: Page,
  metrics: Record<string, any>,
  testName: string
): Promise<void> {
  // Convert old format to new format
  const convertedMetrics: PerformanceMetric[] = Object.entries(metrics)
    .map(([name, value]) => ({
      name,
      value: typeof value === 'number' ? value : 0,
      unit: 'ms'
    }));
  
  await reportPerformanceMetrics(convertedMetrics, testName);
}

// Add TypeScript interface to augment Window interface
declare global {
  interface Window {
    testMetrics: {
      marks: string[];
      measures: string[];
      recordMark: (name: string) => void;
      recordMeasure: (name: string, startMark: string, endMark: string) => void;
    };
    // Add other extensions as needed
  }
} 