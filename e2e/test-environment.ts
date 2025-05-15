/**
 * Test Environment Configuration
 * 
 * Centralized configuration for test environment variables, paths, and settings.
 * This helps us maintain consistency across test files and simplifies environment setup.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Try to load environment variables from .env files
dotenv.config({ path: '.env.test' });
dotenv.config({ path: '.env.local' });
dotenv.config();

// Calculate file paths for ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Default environment variables
const DEFAULT_ENVIRONMENT = {
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.OXBO4nMx8VOpdCJJG7TRfm7wefGr2nxP-jvYcpZCq4U',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  
  // Research-specific flags
  ENABLE_RESEARCH_FEATURES: process.env.ENABLE_RESEARCH_FEATURES || 'true', 
  ENABLE_RESEARCH_SEEDING: process.env.ENABLE_RESEARCH_SEEDING || 'true',
  RESEARCH_TEST_MODE: process.env.RESEARCH_TEST_MODE || 'true',
  
  // Test configuration
  TEST_TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '60000', 10),
  RETRY_COUNT: parseInt(process.env.RETRY_COUNT || '2', 10),
  HEADLESS_MODE: process.env.HEADLESS_MODE !== 'false',
  SCREENSHOT_ON_FAILURE: process.env.SCREENSHOT_ON_FAILURE !== 'false',
  ACCESSIBILITY_CHECKS: process.env.ACCESSIBILITY_CHECKS !== 'false',
  PERFORMANCE_CHECKS: process.env.PERFORMANCE_CHECKS !== 'false',
  
  // Path configuration
  TEST_RESULTS_DIR: process.env.TEST_RESULTS_DIR || path.join(projectRoot, 'test-results'),
  TEST_LOGS_DIR: process.env.TEST_LOGS_DIR || path.join(projectRoot, 'test-logs'),
  TOKENS_FILE: process.env.TOKENS_FILE || path.join(projectRoot, 'e2e/test-tokens.json'),
};

// Ensure required directories exist
[DEFAULT_ENVIRONMENT.TEST_RESULTS_DIR, DEFAULT_ENVIRONMENT.TEST_LOGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * TestEnvironment provides a centralized way to access environment variables
 * and configuration settings for tests.
 */
export class TestEnvironment {
  /**
   * Get the base URL for survey tests
   */
  static getSurveyBaseUrl(): string {
    return process.env.SURVEY_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Get the Supabase URL
   */
  static getSupabaseUrl(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  }

  /**
   * Get the Supabase anon key
   */
  static getSupabaseAnonKey(): string {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    );
  }

  /**
   * Get the Supabase service role key
   */
  static getSupabaseServiceRoleKey(): string {
    return (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    );
  }

  /**
   * Get a default survey token for testing
   */
  static getDefaultSurveyToken(): string {
    return process.env.TEST_SURVEY_TOKEN || 'test-valid-token';
  }

  /**
   * Get the timeouts configuration
   */
  static getTimeouts(): {
    defaultTimeout: number;
    navigationTimeout: number;
    animationTimeout: number;
  } {
    return {
      defaultTimeout: parseInt(process.env.TEST_DEFAULT_TIMEOUT || '30000', 10),
      navigationTimeout: parseInt(process.env.TEST_NAVIGATION_TIMEOUT || '60000', 10),
      animationTimeout: parseInt(process.env.TEST_ANIMATION_TIMEOUT || '1000', 10),
    };
  }

  /**
   * Check if we're running in CI environment
   */
  static isCI(): boolean {
    return Boolean(process.env.CI);
  }

  /**
   * Get the browser to use for tests
   */
  static getBrowser(): string {
    return process.env.TEST_BROWSER || 'chromium';
  }

  /**
   * Get the log level for tests
   */
  static getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
    const level = (process.env.TEST_LOG_LEVEL || 'info').toLowerCase();
    
    if (level === 'debug' || level === 'info' || level === 'warn' || level === 'error') {
      return level as 'debug' | 'info' | 'warn' | 'error';
    }
    
    return 'info';
  }

  /**
   * Get a temporary directory for test artifacts
   */
  static getTempDir(): string {
    const tempDir = path.join(process.cwd(), 'test-results');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    return tempDir;
  }

  /**
   * Log environment information for debugging
   */
  static logEnvironmentInfo(): void {
    console.log('====== Environment Information ======');
    console.log(`Survey Base URL: ${this.getSurveyBaseUrl()}`);
    console.log(`Supabase URL: ${this.getSupabaseUrl()}`);
    console.log(`Debug Mode: ${this.isDebugMode()}`);
    console.log(`Node Version: ${process.version}`);
    console.log(`Platform: ${process.platform}`);
    
    // Check environment validity
    const isValid = this.isEnvironmentValid();
    console.log(`Environment Valid: ${isValid ? 'Yes' : 'No'}`);
    
    // Check if test data directory exists
    const testDataDir = this.getTestDataDir();
    const testDataExists = fs.existsSync(testDataDir);
    console.log(`Test Data Directory: ${testDataDir} (${testDataExists ? 'Exists' : 'Missing'})`);
    
    console.log('===================================');
  }

  /**
   * Get the debug mode setting
   */
  static isDebugMode(): boolean {
    return process.env.DEBUG_SURVEY_TESTS === 'true';
  }

  /**
   * Get test data directory
   */
  static getTestDataDir(): string {
    return path.join(process.cwd(), 'e2e', 'test-data');
  }

  /**
   * Get test results directory
   */
  static getTestResultsDir(): string {
    return path.join(process.cwd(), 'test-results');
  }

  /**
   * Check if environment is properly configured
   */
  static isEnvironmentValid(): boolean {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
      return false;
    }
    
    return true;
  }

  /**
   * Create a test data file
   */
  static saveTestData(filename: string, data: any): void {
    const dir = this.getTestDataDir();
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Load test data from file
   */
  static loadTestData<T>(filename: string): T | null {
    const filePath = path.join(this.getTestDataDir(), filename);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error loading test data from ${filePath}:`, error);
      return null;
    }
  }
}

/**
 * Test environment configuration
 */
export const testEnvironment = {
  ...DEFAULT_ENVIRONMENT,
  
  // Helper methods
  isCI: () => process.env.CI === 'true',
  isDebug: () => process.env.DEBUG === 'true',
  
  // Path helpers
  getTestResultPath: (filename: string) => path.join(DEFAULT_ENVIRONMENT.TEST_RESULTS_DIR, filename),
  getTestLogPath: (filename: string) => path.join(DEFAULT_ENVIRONMENT.TEST_LOGS_DIR, filename),
  
  // File helpers
  getTestTokens: () => {
    try {
      if (fs.existsSync(DEFAULT_ENVIRONMENT.TOKENS_FILE)) {
        const tokens = JSON.parse(fs.readFileSync(DEFAULT_ENVIRONMENT.TOKENS_FILE, 'utf-8'));
        return tokens.TEST_TOKENS || {};
      }
    } catch (error) {
      console.warn('Error loading test tokens:', error);
    }
    return {};
  },
  
  // Test feature flags
  shouldCheckAccessibility: () => DEFAULT_ENVIRONMENT.ACCESSIBILITY_CHECKS,
  shouldMeasurePerformance: () => DEFAULT_ENVIRONMENT.PERFORMANCE_CHECKS,
  shouldTakeScreenshots: () => DEFAULT_ENVIRONMENT.SCREENSHOT_ON_FAILURE
};

export default testEnvironment; 