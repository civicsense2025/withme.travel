/**
 * Research Survey Seed Utilities
 * 
 * Helper functions to seed test data for E2E tests of the user testing
 * and research flows. Includes robust error handling, retries, and
 * cleanup strategies.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../test-config';
import { retry } from './test-helpers';

// ESM-compatible __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate fixed UUIDs for testing (this ensures consistent IDs)
const BASIC_SURVEY_ID = uuidv4();
const MULTI_MILESTONE_SURVEY_ID = uuidv4();

// Helper to generate a unique suffix for this test run
function getTestRunSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

// Survey Templates
export const TEST_SURVEYS = {
  BASIC: {
    id: BASIC_SURVEY_ID,
    name: 'Basic User Feedback Survey',
    description: 'A simple one-milestone survey for testing',
    type: 'survey',
    milestone_trigger: 'trip_created',
    milestones: ['basic_milestone'],
    is_active: true,
    config: {
      welcome_message: 'Welcome to our survey!',
      completion_message: 'Thank you for your feedback!',
      button_text: {
        start: 'Start',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        home: 'Return Home'
      }
    }
  },
  MULTI_MILESTONE: {
    id: MULTI_MILESTONE_SURVEY_ID,
    name: 'Progressive User Research Survey',
    description: 'A multi-milestone survey for testing progress tracking',
    type: 'user_testing',
    milestones: ['onboarding_complete', 'trip_created', 'itinerary_edited'],
    is_active: true,
    config: {
      welcome_message: 'Welcome to our user research session!',
      completion_message: 'Thank you for participating!',
      button_text: {
        start: 'Begin Session',
        next: 'Continue',
        previous: 'Go Back',
        submit: 'Complete Survey',
        home: 'Finish'
      }
    }
  }
};

// Test Fields
export const TEST_FIELDS = {
  BASIC_SURVEY: [
    {
      id: uuidv4(),
      form_id: BASIC_SURVEY_ID,
      label: 'How satisfied are you with your experience?',
      type: 'rating',
      required: true,
      order: 1,
      milestone: 'basic_milestone',
      config: {
        max_rating: 5,
        icons: 'star'
      }
    },
    {
      id: uuidv4(),
      form_id: BASIC_SURVEY_ID,
      label: 'What would you like us to improve?',
      type: 'text',
      required: false,
      order: 2,
      milestone: 'basic_milestone',
      config: {
        multiline: true,
        placeholder: 'Share your thoughts here...'
      }
    }
  ],
  MULTI_MILESTONE: [
    // Milestone 1: Onboarding
    {
      id: uuidv4(),
      form_id: MULTI_MILESTONE_SURVEY_ID,
      label: 'How easy was it to sign up?',
      type: 'rating',
      required: true,
      order: 1,
      milestone: 'onboarding_complete',
      config: {
        max_rating: 5,
        icons: 'star'
      }
    },
    {
      id: uuidv4(),
      form_id: MULTI_MILESTONE_SURVEY_ID,
      label: 'What could we improve about the signup process?',
      type: 'text',
      required: false,
      order: 2,
      milestone: 'onboarding_complete',
      config: {
        multiline: true
      }
    },
    // Milestone 2: Trip Creation
    {
      id: uuidv4(),
      form_id: MULTI_MILESTONE_SURVEY_ID,
      label: 'How was your experience creating a trip?',
      type: 'radio',
      required: true,
      order: 3,
      milestone: 'trip_created',
      config: {
        options: [
          { value: 'very_easy', label: 'Very Easy' },
          { value: 'easy', label: 'Easy' },
          { value: 'neutral', label: 'Neutral' },
          { value: 'difficult', label: 'Difficult' },
          { value: 'very_difficult', label: 'Very Difficult' }
        ]
      }
    },
    {
      id: uuidv4(),
      form_id: MULTI_MILESTONE_SURVEY_ID,
      label: 'What features would you like to see in trip creation?',
      type: 'checkbox',
      required: false,
      order: 4,
      milestone: 'trip_created',
      config: {
        options: [
          { value: 'templates', label: 'More templates' },
          { value: 'ai_suggestions', label: 'AI-powered suggestions' },
          { value: 'budget', label: 'Budget planning' },
          { value: 'sharing', label: 'Better sharing options' }
        ]
      }
    },
    // Milestone 3: Itinerary Editing
    {
      id: uuidv4(),
      form_id: MULTI_MILESTONE_SURVEY_ID,
      label: 'How intuitive was the itinerary editor?',
      type: 'select',
      required: true,
      order: 5,
      milestone: 'itinerary_edited',
      config: {
        options: [
          { value: 'very_intuitive', label: 'Very Intuitive' },
          { value: 'intuitive', label: 'Intuitive' },
          { value: 'neutral', label: 'Neutral' },
          { value: 'confusing', label: 'Confusing' },
          { value: 'very_confusing', label: 'Very Confusing' }
        ]
      }
    },
    {
      id: uuidv4(),
      form_id: MULTI_MILESTONE_SURVEY_ID,
      label: 'Any additional feedback about the itinerary editor?',
      type: 'text',
      required: false,
      order: 6,
      milestone: 'itinerary_edited',
      config: {
        multiline: true,
        placeholder: 'Your feedback helps us improve!'
      }
    }
  ]
};

/**
 * Robust, idempotent cleanup for all test data related to research surveys.
 * Handles foreign key constraints, retries, and logs any failures for manual cleanup.
 */
async function robustCleanupResearchTestData(
  supabase: SupabaseClient, 
  options: {
    testTokens?: Record<string, string>,
    maxRetries?: number,
    useTransaction?: boolean,
    logLevel?: 'error' | 'warn' | 'info' | 'debug'
  } = {}
) {
  const { 
    testTokens, 
    maxRetries = config.retries.cleanupRetries, 
    useTransaction = true,
    logLevel = 'info' 
  } = options;
  
  // Configure logging based on logLevel
  const log = {
    error: (...args: any[]) => console.error(...args),
    warn: (...args: any[]) => logLevel !== 'error' ? console.warn(...args) : null,
    info: (...args: any[]) => ['info', 'debug'].includes(logLevel) ? console.log(...args) : null,
    debug: (...args: any[]) => logLevel === 'debug' ? console.log(...args) : null
  };
  
  // If testTokens is provided, use those values, otherwise try to load from file
  let tokensToClean: string[] = [];
  
  if (testTokens) {
    tokensToClean = Object.values(testTokens);
  } else {
    try {
      const tokensPath = path.join(__dirname, '../.test-seed.json');
      if (fs.existsSync(tokensPath)) {
        const fileData = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
        if (fileData.TEST_TOKENS) {
          tokensToClean = Object.values(fileData.TEST_TOKENS);
          log.info(`[Cleanup] Found ${tokensToClean.length} tokens in seed file`);
        }
      }
    } catch (error) {
      log.warn('[Cleanup] Failed to load tokens from seed file:', error);
      // Continue with empty tokens array - will still clean up by form IDs
    }
  }
  
  const testFormIds = [BASIC_SURVEY_ID, MULTI_MILESTONE_SURVEY_ID];
  let attempt = 0;
  let remainingTokens: string[] = [];
  let remainingFormIds: string[] = [];

  while (attempt < maxRetries) {
    attempt++;
    log.info(`[Cleanup Attempt ${attempt}] Starting cleanup of research test data...`);
    
    // Start transaction if enabled
    if (useTransaction) {
      try {
        await supabase.rpc('begin');
        log.debug('[Cleanup] Started transaction');
      } catch (e) {
        log.warn('[Cleanup] Failed to start transaction, continuing without transaction:', e);
        // Continue without transaction if it fails
      }
    }
    
    try {
      // 1. Delete events (by session and event_type)
      const { data: sessions } = await supabase
        .from('user_testing_sessions')
        .select('id, token')
        .in('token', tokensToClean);
      
      const sessionIds = sessions?.map(s => s.id) ?? [];
      if (sessionIds.length > 0) {
        log.info(`[Cleanup] Found ${sessionIds.length} sessions to clean up`);
        await supabase.from('user_testing_events').delete().in('session_id', sessionIds);
      }
      await supabase.from('user_testing_events').delete().in('event_type', ['test_event', 'trip_created', 'onboarding_complete', 'itinerary_edited']);

      // 2. Delete form responses (by session and form)
      if (sessionIds.length > 0) {
        await supabase.from('form_responses').delete().in('session_id', sessionIds);
      }
      await supabase.from('form_responses').delete().in('form_id', testFormIds);

      // 3. Delete milestone triggers (by form)
      await supabase.from('milestone_triggers').delete().in('form_id', testFormIds);

      // 4. Delete test sessions
      await supabase.from('user_testing_sessions').delete().in('token', tokensToClean);

      // 5. Delete form fields
      await supabase.from('form_fields').delete().in('form_id', testFormIds);

      // 6. Delete forms
      await supabase.from('forms').delete().in('id', testFormIds);

      // Commit transaction if using transactions
      if (useTransaction) {
        try {
          await supabase.rpc('commit');
          log.debug('[Cleanup] Committed transaction');
        } catch (e) {
          log.warn('[Cleanup] Failed to commit transaction:', e);
          // Continue even if commit fails
        }
      }

      // 7. Check for lingering sessions/forms
      const { data: lingeringSessions } = await supabase
        .from('user_testing_sessions')
        .select('token')
        .in('token', tokensToClean);
      const { data: lingeringForms } = await supabase
        .from('forms')
        .select('id')
        .in('id', testFormIds);
      remainingTokens = lingeringSessions?.map(s => s.token) ?? [];
      remainingFormIds = lingeringForms?.map(f => f.id) ?? [];

      if (remainingTokens.length === 0 && remainingFormIds.length === 0) {
        log.info(`[Cleanup Attempt ${attempt}] All test data cleaned up successfully.`);
        return;
      } else {
        log.warn(`[Cleanup Attempt ${attempt}] Still found lingering tokens:`, remainingTokens, 'and forms:', remainingFormIds);
        await new Promise(res => setTimeout(res, 500)); // Wait before retry
      }
    } catch (error) {
      log.error(`[Cleanup Attempt ${attempt}] Error during cleanup:`, error);
      
      // Rollback transaction if using transactions
      if (useTransaction) {
        try {
          await supabase.rpc('rollback');
          log.debug('[Cleanup] Rolled back transaction after error');
        } catch (e) {
          log.warn('[Cleanup] Failed to rollback transaction:', e);
        }
      }
    }
  }
  
  if (remainingTokens.length > 0 || remainingFormIds.length > 0) {
    log.error('Failed to clean up all test data after retries. Manual DB cleanup required.', { remainingTokens, remainingFormIds });
    throw new Error(`Failed to clean up all test data after ${maxRetries} attempts.`);
  }
}

// Main seed function
export async function seedResearchTestData(options: {
  logLevel?: 'error' | 'warn' | 'info' | 'debug',
  skipCleanup?: boolean,
  uniqueSuffix?: string,
  useTransaction?: boolean,
  cleanupRetries?: number
} = {}) {
  const { 
    logLevel = 'info',
    skipCleanup = false,
    uniqueSuffix = getTestRunSuffix(),
    useTransaction = true,
    cleanupRetries = config.retries.cleanupRetries
  } = options;
  
  // Configure logging based on logLevel
  const log = {
    error: (...args: any[]) => console.error(...args),
    warn: (...args: any[]) => logLevel !== 'error' ? console.warn(...args) : null,
    info: (...args: any[]) => ['info', 'debug'].includes(logLevel) ? console.log(...args) : null,
    debug: (...args: any[]) => logLevel === 'debug' ? console.log(...args) : null
  };
  
  log.info('[Seed] Starting research test data seeding process');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log.error('[Seed] Missing environment variables for Supabase connection');
    throw new Error('Missing environment variables for Supabase connection');
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Generate unique tokens for this run
  log.info(`[Seed] Using unique suffix for this test run: ${uniqueSuffix}`);
  
  const TEST_TOKENS = {
    VALID: `test-survey-token-${uniqueSuffix}`,
    EXPIRED: `expired-survey-token-${uniqueSuffix}`,
    INVALID: `invalid-survey-token-${uniqueSuffix}`,
    MULTI_MILESTONE: `multi-milestone-token-${uniqueSuffix}`,
  };
  
  log.info('[Seed] Generated test tokens:', TEST_TOKENS);

  // Write the generated tokens to a file for Playwright to use
  // IMPORTANT: Do this before creating sessions so if session creation fails, the file still exists
  function writeSeedDataFile(tokens: Record<string, string>) {
    const outPath = path.join(__dirname, '../.test-seed.json');
    try {
      fs.writeFileSync(outPath, JSON.stringify({ TEST_TOKENS: tokens }, null, 2));
      log.info(`[Seed] Successfully wrote tokens to ${outPath}`);
    } catch (error) {
      log.error(`[Seed] Failed to write tokens to ${outPath}:`, error);
      throw error;
    }
  }

  // Generate fresh test sessions with new UUIDs for this test run
  function createTestSessions(tokens: Record<string, string>) {
    return {
      VALID: {
        id: uuidv4(),
        token: tokens.VALID,
        status: 'active',
        metadata: {
          device: 'e2e-test',
          browser: 'playwright',
          survey_id: BASIC_SURVEY_ID
        }
      },
      EXPIRED: {
        id: uuidv4(),
        token: tokens.EXPIRED,
        status: 'expired',
        metadata: {
          device: 'e2e-test',
          browser: 'playwright',
          survey_id: BASIC_SURVEY_ID
        }
      },
      MULTI_MILESTONE: {
        id: uuidv4(),
        token: tokens.MULTI_MILESTONE,
        status: 'active',
        metadata: {
          device: 'e2e-test',
          browser: 'playwright',
          progress: 0,
          survey_id: MULTI_MILESTONE_SURVEY_ID
        }
      }
    };
  }

  try {
    // Robust, idempotent cleanup before seeding
    if (!skipCleanup) {
      log.info('[Seed] Starting cleanup of existing test data');
      await robustCleanupResearchTestData(supabase, { 
        testTokens: TEST_TOKENS, 
        maxRetries: cleanupRetries,
        useTransaction,
        logLevel
      });
    } else {
      log.info('[Seed] Skipping cleanup (skipCleanup=true)');
    }
    
    // First, write the tokens to file so they're available even if seeding fails
    log.info('[Seed] Writing tokens to file');
    writeSeedDataFile(TEST_TOKENS);

    // Now create the sessions with these tokens
    log.info('[Seed] Creating test sessions');
    const TEST_SESSIONS = createTestSessions(TEST_TOKENS);

    // Start transaction if enabled
    if (useTransaction) {
      try {
        await supabase.rpc('begin');
        log.debug('[Seed] Started transaction');
      } catch (e) {
        log.warn('[Seed] Failed to start transaction, continuing without transaction:', e);
        // Continue without transaction if it fails
      }
    }

    try {
      // Insert test surveys
      log.info('[Seed] Inserting test surveys');
      const { error: surveysError } = await supabase
        .from('forms')
        .insert([
          TEST_SURVEYS.BASIC,
          TEST_SURVEYS.MULTI_MILESTONE
        ]);
      if (surveysError) throw new Error(`Error inserting test surveys: ${surveysError.message}`);

      // Insert test fields
      log.info('[Seed] Inserting test fields');
      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert([
          ...TEST_FIELDS.BASIC_SURVEY,
          ...TEST_FIELDS.MULTI_MILESTONE
        ]);
      if (fieldsError) throw new Error(`Error inserting test fields: ${fieldsError.message}`);

      // Defensive: delete any lingering sessions with these tokens before insert
      log.info('[Seed] Cleaning up any existing sessions with same tokens');
      await supabase.from('user_testing_sessions').delete().in('token', [
        TEST_SESSIONS.VALID.token,
        TEST_SESSIONS.EXPIRED.token,
        TEST_SESSIONS.MULTI_MILESTONE.token
      ]);
      
      log.info('[Seed] Inserting test sessions');
      const { error: sessionsError } = await supabase
        .from('user_testing_sessions')
        .insert([
          TEST_SESSIONS.VALID,
          TEST_SESSIONS.EXPIRED,
          TEST_SESSIONS.MULTI_MILESTONE
        ]);
      if (sessionsError) throw new Error(`Error inserting test sessions: ${sessionsError.message}`);

      // Insert milestone triggers
      log.info('[Seed] Inserting milestone triggers');
      const { error: triggersError } = await supabase
        .from('milestone_triggers')
        .insert([
          {
            id: uuidv4(),
            event_type: 'trip_created',
            form_id: BASIC_SURVEY_ID,
            active: true
          }
        ]);
      if (triggersError) throw new Error(`Error inserting test triggers: ${triggersError.message}`);

      // Commit transaction if using transactions
      if (useTransaction) {
        try {
          await supabase.rpc('commit');
          log.debug('[Seed] Committed transaction');
        } catch (e) {
          log.warn('[Seed] Failed to commit transaction:', e);
          // If commit fails, don't throw - the operations might have worked
        }
      }

      log.info('[Seed] Successfully seeded all research test data');
      return true;
    } catch (error) {
      // Rollback transaction if using transactions
      if (useTransaction) {
        try {
          await supabase.rpc('rollback');
          log.debug('[Seed] Rolled back transaction after error');
        } catch (e) {
          log.warn('[Seed] Failed to rollback transaction:', e);
        }
      }
      throw error;
    }
  } catch (error) {
    log.error('[Seed] Error seeding research test data:', error);
    throw error;
  }
}

/**
 * Cleanup function to remove all seeded test data after tests
 * Can be called in Playwright global teardown or afterEach hooks
 */
export async function cleanupResearchTestDataAfterTests(options: {
  logLevel?: 'error' | 'warn' | 'info' | 'debug',
  maxRetries?: number,
  useTransaction?: boolean,
  removeTokenFile?: boolean
} = {}) {
  const { 
    logLevel = 'info',
    maxRetries = config.retries.cleanupRetries,
    useTransaction = true,
    removeTokenFile = false
  } = options;
  
  // Configure logging based on logLevel
  const log = {
    error: (...args: any[]) => console.error(...args),
    warn: (...args: any[]) => logLevel !== 'error' ? console.warn(...args) : null,
    info: (...args: any[]) => ['info', 'debug'].includes(logLevel) ? console.log(...args) : null,
    debug: (...args: any[]) => logLevel === 'debug' ? console.log(...args) : null
  };
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log.error('[Cleanup] Missing environment variables for Supabase connection');
    return false;
  }
  
  // Use retry logic for cleanup to make it more robust
  try {
    await retry(
      async () => {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await robustCleanupResearchTestData(supabase, { 
          maxRetries,
          useTransaction,
          logLevel
        });
      },
      {
        retries: 2,
        delay: 1000,
        onRetry: (attempt, error) => {
          log.warn(`[Cleanup] Retry attempt ${attempt} after error:`, error);
        }
      }
    );
    
    // Optionally, remove the .test-seed.json file
    if (removeTokenFile) {
      try {
        fs.unlinkSync(path.join(__dirname, '../.test-seed.json'));
        log.info('[Cleanup] Removed .test-seed.json file');
      } catch (e) {
        // Ignore if file doesn't exist
        log.debug('[Cleanup] No .test-seed.json file to remove');
      }
    }
    
    return true;
  } catch (error) {
    log.error('[Cleanup] Failed all cleanup attempts:', error);
    return false;
  }
} 