// ============================================================================
// PLAYWRIGHT GLOBAL TEARDOWN: Cleanup research test data after all tests
// ============================================================================
import { FullConfig } from '@playwright/test';
import { cleanupResearchTestDataAfterTests } from './utils/research-seed';
import { retry } from './utils/test-helpers';
import { config } from './test-config';
import { logTestRunSummary } from './utils/logger';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global teardown for Playwright tests
 * Runs once after all tests to clean up test data
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test cleanup...');
  
  // Collect test results if available
  try {
    const resultsPath = path.join(__dirname, '../test-results/report.json');
    if (fs.existsSync(resultsPath)) {
      // Parse the test results
      const testReport = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
      
      // Extract summary information
      const summary = {
        passed: 0,
        failed: 0,
        skipped: 0,
        failedTests: [] as Array<{ name: string; error: string; file: string }>
      };
      
      // Process test results
      if (testReport.suites) {
        processTestSuites(testReport.suites, summary);
      }
      
      // Log test summary
      logTestRunSummary(summary);
      console.log('📊 Test summary generated:', summary);
    }
  } catch (error) {
    console.warn('⚠️ Could not generate test summary:', error);
  }
  
  // Add timeout and retry logic for cleanup
  const maxRetries = 3;
  
  // Setup timeout for the entire cleanup process
  const timeoutMs = 30000; // 30 seconds
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Cleanup timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Only clean up if environment variables are available
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('⚠️ Missing required environment variables for test cleanup.');
        console.warn('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
        return;
      }
      
      // Clean up research survey test data
      console.log(`🔄 Cleanup attempt ${attempt}/${maxRetries}...`);
      
      const cleanupPromise = cleanupResearchTestDataAfterTests({
        logLevel: 'info',
        maxRetries: 2,
        useTransaction: true,
        removeTokenFile: false
      });
      
      // Race against timeout
      await Promise.race([cleanupPromise, timeoutPromise]);
      
      console.log('✅ Global teardown completed successfully');
      return;
    } catch (error) {
      console.error(`❌ Cleanup attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries) {
        const waitTime = 1000 * attempt; // Exponential backoff
        console.log(`⏳ Waiting ${waitTime}ms before retry ${attempt + 1}...`);
        await new Promise(r => setTimeout(r, waitTime));
      } else {
        console.error('❌ All cleanup attempts failed. Manual cleanup may be required.');
      }
    }
  }
}

/**
 * Recursively process test suites to extract results
 */
function processTestSuites(suites: any[], summary: any) {
  for (const suite of suites) {
    // Process nested suites
    if (suite.suites && suite.suites.length > 0) {
      processTestSuites(suite.suites, summary);
    }
    
    // Process tests in this suite
    if (suite.specs && suite.specs.length > 0) {
      for (const spec of suite.specs) {
        for (const test of spec.tests || []) {
          if (test.status === 'passed') {
            summary.passed++;
          } else if (test.status === 'failed') {
            summary.failed++;
            
            // Add to failed tests list
            summary.failedTests.push({
              name: test.title,
              error: test.error?.message || 'Unknown error',
              file: spec.file || 'Unknown file'
            });
          } else if (test.status === 'skipped') {
            summary.skipped++;
          }
        }
      }
    }
  }
}

export default globalTeardown; 