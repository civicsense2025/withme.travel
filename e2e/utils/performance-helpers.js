/**
 * Performance Tracking Utilities
 * 
 * Tools for measuring, collecting, and reporting performance metrics
 * during end-to-end testing of survey flows.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Starts tracking performance metrics for a test
 * 
 * @param {import('@playwright/test').Page} page Playwright page object
 * @param {string} testName Name of the test for identification
 * @returns {Promise<void>}
 */
export async function startPerformanceTracking(page, testName) {
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
      recordMark: (name) => {
        window.performance.mark(name);
        window.testMetrics.marks.push(name);
      },
      recordMeasure: (name, startMark, endMark) => {
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
 * @param {import('@playwright/test').Page} page Playwright page object
 * @returns {Promise<Array<{name: string, value: number, unit: string}>>}
 */
export async function endPerformanceTracking(page) {
  // Mark test end
  await page.evaluate(() => {
    window.performance.mark('test:end');
    window.performance.measure('test:total', 'test:start', 'test:end');
  });

  // Collect web vitals and other metrics
  const metrics = await page.evaluate(() => {
    // Basic metrics collection
    const performanceEntries = window.performance.getEntriesByType('measure');
    const result = [];
    
    performanceEntries.forEach(entry => {
      result.push({
        name: entry.name,
        value: entry.duration,
        unit: 'ms'
      });
    });
    
    // Add custom collected metrics if available
    if (window.testMetrics && window.testMetrics.measures) {
      window.testMetrics.measures.forEach(measureName => {
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
 * @param {Array<{name: string, value: number, unit: string}>} metrics Collection of performance metrics
 * @param {string} testName Name of the test for identification
 * @returns {Promise<void>}
 */
export async function reportPerformanceMetrics(metrics, testName) {
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
      url: process.env.SURVEY_BASE_URL || 'http://localhost:3000',
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

/**
 * Performance Metrics class for legacy compatibility
 */
export class PerformanceMetrics {
  constructor() {
    this.marks = {};
    this.measures = {};
  }
  
  mark(name) {
    this.marks[name] = Date.now();
  }
  
  measure(markName, measureName) {
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
  
  getMeasure(name) {
    return this.measures[name];
  }
  
  getAllMeasures() {
    return { ...this.measures };
  }
  
  getAllMarks() {
    return { ...this.marks };
  }
  
  getAllMetrics() {
    return {
      ...this.marks,
      ...this.measures
    };
  }
  
  reset() {
    this.marks = {};
    this.measures = {};
  }
}

/**
 * Record performance report from legacy metrics
 * @param {import('@playwright/test').Page} page Playwright page object
 * @param {Object} metrics Performance metrics
 * @param {string} testName Test name for identification
 * @returns {Promise<void>}
 */
export async function recordPerformanceReport(page, metrics, testName) {
  // Convert legacy metrics format to new format
  const formattedMetrics = Object.entries(metrics).map(([name, value]) => ({
    name,
    value: typeof value === 'number' ? value : 0,
    unit: 'ms'
  }));
  
  await reportPerformanceMetrics(formattedMetrics, testName);
}

/**
 * Record browser-side performance metrics
 */
export async function recordBrowserPerformanceMetrics(page) {
  try {
    const performanceJson = await page.evaluate(() => {
      const timing = window.performance.timing;
      const navigationStart = timing.navigationStart;
      
      const timingMetrics = {
        // Navigation timing
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnection: timing.connectEnd - timing.connectStart,
        serverResponse: timing.responseStart - timing.requestStart,
        domLoad: timing.domComplete - timing.domLoading,
        resourceLoad: timing.loadEventEnd - timing.loadEventStart,
        
        // User-centric metrics
        firstPaint: timing.responseEnd - navigationStart,
        domInteractive: timing.domInteractive - navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
        domComplete: timing.domComplete - navigationStart,
        loadComplete: timing.loadEventEnd - navigationStart
      };
      
      // Add any custom marks and measures
      const marks = {};
      const measures = {};
      
      performance.getEntriesByType('mark').forEach(mark => {
        marks[mark.name] = mark.startTime;
      });
      
      performance.getEntriesByType('measure').forEach(measure => {
        measures[measure.name] = {
          duration: measure.duration,
          startTime: measure.startTime
        };
      });
      
      // Add resource timing information for specific resource types
      const resources = {
        scripts: [],
        stylesheets: [],
        images: [],
        fonts: [],
        xhr: []
      };
      
      performance.getEntriesByType('resource').forEach(resource => {
        const type = getResourceType(resource.name);
        if (type && resources[type]) {
          resources[type].push({
            name: resource.name.split('/').pop(),
            duration: resource.duration,
            size: resource.transferSize
          });
        }
      });
      
      function getResourceType(url) {
        if (url.match(/\.(js|mjs)(\?|$)/)) return 'scripts';
        if (url.match(/\.(css)(\?|$)/)) return 'stylesheets';
        if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/)) return 'images';
        if (url.match(/\.(woff|woff2|ttf|otf)(\?|$)/)) return 'fonts';
        if (url.match(/api\/|\/api\//)) return 'xhr';
        return null;
      }
      
      return {
        timing: timingMetrics,
        marks,
        measures,
        resources
      };
    });
    
    return performanceJson;
  } catch (error) {
    console.error('Error recording browser performance metrics:', error);
    return null;
  }
}
