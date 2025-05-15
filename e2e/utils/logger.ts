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
 * Create a daily test run summary log file
 * @param results Summary of test results
 */
export function logTestRunSummary(results: {
  passed: number;
  failed: number;
  skipped: number;
  failedTests: Array<{ name: string; error: string; file: string }>;
}): string {
  const today = new Date().toISOString().split('T')[0];
  const fileName = `summary-${today}.json`;
  const filePath = path.join(LOG_DIR, fileName);
  
  // Check if file exists, and if so, read it
  let existingData: any = { 
    date: today,
    runs: [],
    totalExecuted: 0,
    totalPassed: 0,
    totalFailed: 0,
    totalSkipped: 0,
    failedTests: []
  };
  
  if (fs.existsSync(filePath)) {
    try {
      existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error('Error reading existing summary file:', e);
    }
  }
  
  // Add new run data
  const runData = {
    timestamp: new Date().toISOString(),
    passed: results.passed,
    failed: results.failed,
    skipped: results.skipped,
    failedTests: results.failedTests
  };
  
  existingData.runs.push(runData);
  existingData.totalExecuted += results.passed + results.failed + results.skipped;
  existingData.totalPassed += results.passed;
  existingData.totalFailed += results.failed;
  existingData.totalSkipped += results.skipped;
  
  // Add failed tests to the list if not already there
  for (const test of results.failedTests) {
    if (!existingData.failedTests.some((t: any) => t.name === test.name && t.file === test.file)) {
      existingData.failedTests.push(test);
    }
  }
  
  // Write updated data
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
  console.log(`Test run summary logged to: ${filePath}`);
  
  return filePath;
} 