import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for all logs
const LOG_DIR = path.join(__dirname, '../../test-logs');

// Make sure the directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Log an error to a file with detailed information
 * @param error The error object to log
 * @param testInfo Additional test information (test name, file, etc.)
 * @param context Optional additional context about what was happening
 * @returns The path to the created log file
 */
export function logError(
  error: Error | unknown, 
  testInfo: { 
    name?: string;
    file?: string;
    timestamp?: string;
    browserName?: string;
  }, 
  context: Record<string, any> = {}
): string {
  // Create a timestamped filename
  const timestamp = testInfo.timestamp || new Date().toISOString().replace(/[:.]/g, '-');
  const testName = testInfo.name?.replace(/\s+/g, '-') || 'unknown-test';
  const fileName = `error-${testName}-${timestamp}.json`;
  const filePath = path.join(LOG_DIR, fileName);
  
  // Format the error into a serializable object
  const errorObject = error instanceof Error ? {
    name: error.name,
    message: error.message,
    stack: error.stack,
  } : {
    error: String(error)
  };
  
  // Build a comprehensive log entry
  const logEntry = {
    timestamp: new Date().toISOString(),
    testInfo,
    error: errorObject,
    context
  };
  
  // Write to file
  fs.writeFileSync(filePath, JSON.stringify(logEntry, null, 2));
  console.log(`Error logged to: ${filePath}`);
  
  return filePath;
}

/**
 * Log HTML content of the page at the time of an error
 * @param html The HTML content
 * @param testInfo Information about the test
 */
export function logHtml(html: string, testInfo: { name?: string; timestamp?: string }): string {
  // Create a timestamped filename
  const timestamp = testInfo.timestamp || new Date().toISOString().replace(/[:.]/g, '-');
  const testName = testInfo.name?.replace(/\s+/g, '-') || 'unknown-test';
  const fileName = `page-${testName}-${timestamp}.html`;
  const filePath = path.join(LOG_DIR, fileName);
  
  // Write to file
  fs.writeFileSync(filePath, html);
  console.log(`HTML logged to: ${filePath}`);
  
  return filePath;
}

/**
 * Log detailed diagnostic information about the test environment
 * @param diagnostic Diagnostic information to log
 * @param testInfo Test information
 */
export function logDiagnostic(diagnostic: Record<string, any>, testInfo: { name?: string; timestamp?: string }): string {
  // Create a timestamped filename
  const timestamp = testInfo.timestamp || new Date().toISOString().replace(/[:.]/g, '-');
  const testName = testInfo.name?.replace(/\s+/g, '-') || 'unknown-test';
  const fileName = `diagnostic-${testName}-${timestamp}.json`;
  const filePath = path.join(LOG_DIR, fileName);
  
  // Format the entry with timestamp
  const logEntry = {
    timestamp: new Date().toISOString(),
    testInfo,
    ...diagnostic
  };
  
  // Write to file
  fs.writeFileSync(filePath, JSON.stringify(logEntry, null, 2));
  console.log(`Diagnostic info logged to: ${filePath}`);
  
  return filePath;
}

/**
 * Test summary information
 */
export interface TestSummary {
  passed: number;
  failed: number;
  skipped: number;
  failedTests: Array<{
    name: string;
    error: string;
    file: string;
  }>;
}

/**
 * Log a test run summary to the console
 */
export function logTestRunSummary(summary: TestSummary): void {
  console.log('\n');
  console.log('='.repeat(80));
  console.log('TEST RUN SUMMARY');
  console.log('='.repeat(80));
  
  // Print test counts
  console.log(`Total Tests: ${summary.passed + summary.failed + summary.skipped}`);
  console.log(`  ✅ Passed: ${summary.passed}`);
  console.log(`  ❌ Failed: ${summary.failed}`);
  console.log(`  ⏩ Skipped: ${summary.skipped}`);
  
  // Print failed tests if any
  if (summary.failed > 0) {
    console.log('\nFAILED TESTS:');
    console.log('-'.repeat(80));
    
    summary.failedTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.name}`);
      console.log(`   File: ${test.file}`);
      console.log(`   Error: ${test.error}`);
      console.log('-'.repeat(80));
    });
  }
  
  console.log('\n');
}

/**
 * Log test debug information
 */
export function logTestDebugInfo(testName: string, details: Record<string, any>): void {
  console.log('\n');
  console.log(`DEBUG INFO: ${testName}`);
  console.log('-'.repeat(80));
  
  Object.entries(details).forEach(([key, value]) => {
    console.log(`${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
  });
  
  console.log('-'.repeat(80));
  console.log('\n');
}

/**
 * Log performance metrics
 */
export function logPerformanceMetrics(metrics: Record<string, number>): void {
  console.log('\n');
  console.log('PERFORMANCE METRICS');
  console.log('-'.repeat(80));
  
  Object.entries(metrics).forEach(([key, value]) => {
    console.log(`${key}: ${value}ms`);
  });
  
  console.log('-'.repeat(80));
  console.log('\n');
} 