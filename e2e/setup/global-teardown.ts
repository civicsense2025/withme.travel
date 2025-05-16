/**
 * Global Teardown for Research System E2E Tests
 * 
 * This file runs once after all tests and is responsible for cleaning up the
 * test environment, such as removing test data and resources.
 */
import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Environment cleanup that runs after all tests
 */
async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 Cleaning up research test environment...');
  
  // Calculate test duration
  const startTime = process.env.TEST_START_TIME ? new Date(process.env.TEST_START_TIME) : new Date();
  const endTime = new Date();
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationFormatted = formatDuration(durationMs);
  
  console.log(`⏱️ Total test duration: ${durationFormatted}`);
  
  // Clean up test data if needed
  if (process.env.CLEANUP_TEST_DATA) {
    try {
      console.log('🗑️ Removing test data from database...');
      execSync('npm run cleanup:test-research', { stdio: 'inherit' });
      console.log('✅ Test data removed successfully');
    } catch (error) {
      console.error('❌ Failed to remove test data:', error);
    }
  } else {
    console.log('ℹ️ Skipping test data cleanup (set CLEANUP_TEST_DATA=true to enable)');
  }
  
  // Generate a test summary file
  const testSummaryPath = path.join(process.cwd(), 'test-results', 'summary.json');
  const summary = {
    timestamp: new Date().toISOString(),
    duration: durationMs,
    durationFormatted,
    environment: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      nodeEnv: process.env.NODE_ENV,
    }
  };
  
  try {
    fs.writeFileSync(testSummaryPath, JSON.stringify(summary, null, 2));
    console.log(`📊 Test summary written to: ${testSummaryPath}`);
  } catch (error) {
    console.error('❌ Failed to write test summary:', error);
  }
  
  console.log('✅ Test environment cleanup complete\n');
}

/**
 * Format milliseconds into a readable duration string
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;
  const remainingMs = ms % 1000;
  
  let result = '';
  
  if (hours > 0) {
    result += `${hours}h `;
  }
  
  if (hours > 0 || remainingMinutes > 0) {
    result += `${remainingMinutes}m `;
  }
  
  result += `${remainingSeconds}.${remainingMs.toString().padStart(3, '0')}s`;
  
  return result;
}

export default globalTeardown; 