/**
 * Research Seed Utilities
 * 
 * Functions for seeding and cleaning up research test data for e2e tests.
 * These functions create test surveys, survey responses, and testing tokens.
 */
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FORM_TABLES } from '../../utils/constants/research-tables';

// ESM-compatible __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Token file path
const TOKEN_FILE_PATH = path.join(__dirname, '../test-tokens.json');

// Logger levels
type LogLevel = 'none' | 'error' | 'warn' | 'info' | 'debug';

// Options for seed and cleanup functions
interface ResearchSeedOptions {
  logLevel?: LogLevel;
  maxRetries?: number;
  useTransaction?: boolean;
  removeTokenFile?: boolean;
}

// Define tables with proper mapping to FORM_TABLES
const TABLES = {
  RESEARCH_FORMS: FORM_TABLES.FORMS,
  RESEARCH_SESSIONS: FORM_TABLES.USER_TESTING_SESSIONS,
  RESEARCH_TOKENS: 'research_tokens', // Assuming this is a valid table name
  RESEARCH_RESPONSES: FORM_TABLES.FORM_RESPONSES
};

/**
 * Create a supabase client for research operations
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Check your environment variables.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Logger utility for research seed functions
 */
function createLogger(level: LogLevel = 'info') {
  const levels = {
    none: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4
  };
  
  const selectedLevel = levels[level];
  
  return {
    error: (...args: any[]) => {
      if (selectedLevel >= levels.error) console.error('[Research Seed]', ...args);
    },
    warn: (...args: any[]) => {
      if (selectedLevel >= levels.warn) console.warn('[Research Seed]', ...args);
    },
    info: (...args: any[]) => {
      if (selectedLevel >= levels.info) console.info('[Research Seed]', ...args);
    },
    debug: (...args: any[]) => {
      if (selectedLevel >= levels.debug) console.debug('[Research Seed]', ...args);
    }
  };
}

/**
 * Seed research test data
 * 
 * Creates test survey forms, sessions, and tokens for e2e tests
 * 
 * @param options Options for seeding data
 * @returns Object containing test tokens
 */
export async function seedResearchTestData(
  options: ResearchSeedOptions = {}
): Promise<Record<string, string>> {
  const {
    logLevel = 'info',
    useTransaction = false,
    maxRetries = 2
  } = options;
  
  const logger = createLogger(logLevel);
  logger.info('Starting to seed research test data');
  
  const supabase = getSupabaseClient();
  let transaction = null;
  
  try {
    // Start transaction if requested
    if (useTransaction) {
      transaction = await supabase.rpc('begin_transaction');
      logger.debug('Transaction started');
    }
    
    // Create test survey form
    const formId = uuidv4();
    const { error: formError } = await supabase
      .from(TABLES.RESEARCH_FORMS)
      .insert({
        id: formId,
        title: 'E2E Test Survey',
        description: 'This survey was created for e2e testing',
        status: 'active',
        created_at: new Date().toISOString(),
        questions: [
          {
            id: uuidv4(),
            type: 'text',
            question: 'What do you like most about travel planning?',
            required: true,
            order: 1
          },
          {
            id: uuidv4(),
            type: 'rating',
            question: 'How would you rate your experience with travel planning tools?',
            required: true,
            order: 2,
            options: {
              min: 1,
              max: 5,
              minLabel: 'Poor',
              maxLabel: 'Excellent'
            }
          },
          {
            id: uuidv4(),
            type: 'select',
            question: 'Which features are most important to you?',
            required: true,
            order: 3,
            options: {
              choices: [
                'Itinerary planning',
                'Budget tracking',
                'Group coordination',
                'Destination research',
                'Activity recommendations'
              ],
              multiple: true
            }
          }
        ]
      });
    
    if (formError) {
      throw new Error(`Failed to create test form: ${formError.message}`);
    }
    
    logger.info(`Created test form with ID: ${formId}`);
    
    // Create test session
    const sessionId = uuidv4();
    const { error: sessionError } = await supabase
      .from(TABLES.RESEARCH_SESSIONS)
      .insert({
        id: sessionId,
        form_id: formId,
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      });
    
    if (sessionError) {
      throw new Error(`Failed to create test session: ${sessionError.message}`);
    }
    
    logger.info(`Created test session with ID: ${sessionId}`);
    
    // Create test tokens
    const validToken = uuidv4();
    const expiredToken = uuidv4();
    
    // Valid token
    const { error: validTokenError } = await supabase
      .from(TABLES.RESEARCH_TOKENS)
      .insert({
        id: validToken,
        session_id: sessionId,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        status: 'active'
      });
    
    if (validTokenError) {
      throw new Error(`Failed to create valid token: ${validTokenError.message}`);
    }
    
    // Expired token
    const { error: expiredTokenError } = await supabase
      .from(TABLES.RESEARCH_TOKENS)
      .insert({
        id: expiredToken,
        session_id: sessionId,
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
        status: 'expired'
      });
    
    if (expiredTokenError) {
      throw new Error(`Failed to create expired token: ${expiredTokenError.message}`);
    }
    
    logger.info(`Created test tokens: valid=${validToken}, expired=${expiredToken}`);
    
    // Commit transaction if used
    if (useTransaction) {
      await supabase.rpc('commit_transaction');
      logger.debug('Transaction committed');
    }
    
    // Save tokens to file for tests to use
    const tokens = {
      VALID: validToken,
      EXPIRED: expiredToken,
      INVALID: 'invalid-token-12345'
    };
    
    fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokens, null, 2));
    logger.info(`Saved tokens to ${TOKEN_FILE_PATH}`);
    
    return tokens;
  } catch (error) {
    logger.error('Error seeding research test data:', error);
    
    // Rollback transaction if used
    if (useTransaction && transaction) {
      await supabase.rpc('rollback_transaction');
      logger.debug('Transaction rolled back');
    }
    
    throw error;
  }
}

/**
 * Clean up research test data after tests
 * 
 * @param options Options for cleaning up data
 */
export async function cleanupResearchTestDataAfterTests(
  options: ResearchSeedOptions = {}
): Promise<void> {
  const {
    logLevel = 'info',
    useTransaction = false,
    removeTokenFile = true,
    maxRetries = 2
  } = options;
  
  const logger = createLogger(logLevel);
  logger.info('Starting to clean up research test data');
  
  const supabase = getSupabaseClient();
  let transaction = null;
  
  try {
    // Load test tokens to identify data to clean up
    let tokens: Record<string, string> = {};
    
    try {
      if (fs.existsSync(TOKEN_FILE_PATH)) {
        tokens = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, 'utf8'));
        logger.debug('Loaded tokens from file:', tokens);
      } else {
        logger.warn(`Token file not found at ${TOKEN_FILE_PATH}`);
        return;
      }
    } catch (error) {
      logger.error('Failed to load tokens from file:', error);
      return;
    }
    
    // Get session IDs from tokens
    const validToken = tokens.VALID;
    const expiredToken = tokens.EXPIRED;
    
    if (!validToken && !expiredToken) {
      logger.warn('No valid tokens found for cleanup');
      return;
    }
    
    // Start transaction if requested
    if (useTransaction) {
      transaction = await supabase.rpc('begin_transaction');
      logger.debug('Transaction started');
    }
    
    // Get sessions to delete
    const sessionIds: string[] = [];
    
    for (const token of [validToken, expiredToken]) {
      if (!token || token === 'invalid-token-12345') continue;
      
      const { data, error } = await supabase
        .from(TABLES.RESEARCH_TOKENS)
        .select('session_id')
        .eq('id', token)
        .single();
      
      if (error) {
        logger.warn(`Failed to find session for token ${token}:`, error);
        continue;
      }
      
      if (data && data.session_id) {
        sessionIds.push(data.session_id);
      }
    }
    
    // Get form IDs to delete
    const formIds: string[] = [];
    
    for (const sessionId of sessionIds) {
      const { data, error } = await supabase
        .from(TABLES.RESEARCH_SESSIONS)
        .select('form_id')
        .eq('id', sessionId)
        .single();
      
      if (error) {
        logger.warn(`Failed to find form for session ${sessionId}:`, error);
        continue;
      }
      
      if (data && data.form_id) {
        formIds.push(data.form_id);
      }
    }
    
    logger.info(`Found ${sessionIds.length} sessions and ${formIds.length} forms to delete`);
    
    // Delete in reverse order of dependencies
    
    // Delete responses
    if (sessionIds.length > 0) {
      const { error: responsesError } = await supabase
        .from(TABLES.RESEARCH_RESPONSES)
        .delete()
        .in('session_id', sessionIds);
      
      if (responsesError) {
        logger.error('Failed to delete responses:', responsesError);
      } else {
        logger.info('Deleted test responses');
      }
    }
    
    // Delete tokens
    for (const token of [validToken, expiredToken]) {
      if (!token || token === 'invalid-token-12345') continue;
      
      const { error: tokenError } = await supabase
        .from(TABLES.RESEARCH_TOKENS)
        .delete()
        .eq('id', token);
      
      if (tokenError) {
        logger.error(`Failed to delete token ${token}:`, tokenError);
      } else {
        logger.info(`Deleted token: ${token}`);
      }
    }
    
    // Delete sessions
    for (const sessionId of sessionIds) {
      const { error: sessionError } = await supabase
        .from(TABLES.RESEARCH_SESSIONS)
        .delete()
        .eq('id', sessionId);
      
      if (sessionError) {
        logger.error(`Failed to delete session ${sessionId}:`, sessionError);
      } else {
        logger.info(`Deleted session: ${sessionId}`);
      }
    }
    
    // Delete forms
    for (const formId of formIds) {
      const { error: formError } = await supabase
        .from(TABLES.RESEARCH_FORMS)
        .delete()
        .eq('id', formId);
      
      if (formError) {
        logger.error(`Failed to delete form ${formId}:`, formError);
      } else {
        logger.info(`Deleted form: ${formId}`);
      }
    }
    
    // Commit transaction if used
    if (useTransaction) {
      await supabase.rpc('commit_transaction');
      logger.debug('Transaction committed');
    }
    
    // Remove token file if requested
    if (removeTokenFile && fs.existsSync(TOKEN_FILE_PATH)) {
      fs.unlinkSync(TOKEN_FILE_PATH);
      logger.info(`Deleted token file: ${TOKEN_FILE_PATH}`);
    }
    
    logger.info('Research test data cleanup completed');
  } catch (error) {
    logger.error('Error cleaning up research test data:', error);
    
    // Rollback transaction if used
    if (useTransaction && transaction) {
      await supabase.rpc('rollback_transaction');
      logger.debug('Transaction rolled back');
    }
    
    throw error;
  }
} 