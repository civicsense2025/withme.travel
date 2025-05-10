import { TABLES } from '@/utils/constants/database';
import { SupabaseClient } from '@supabase/supabase-js';
import { ResearchStudy, ResearchTrigger } from '@/types/research';

/**
 * Helper functions for working with research-related tables
 * These functions provide type safety when working with tables that
 * might not be properly typed in the Database definition
 */

// Simplify the type casting to avoid excessive type instantiation depth
type SimpleCast<T = any> = T;

/**
 * Get a reference to the research_studies table with proper typing
 */
export function researchStudiesTable(supabase: SupabaseClient) {
  return supabase.from('research_studies') as SimpleCast;
}

/**
 * Get a reference to the research_triggers table with proper typing
 */
export function researchTriggersTable(supabase: SupabaseClient) {
  return supabase.from('research_triggers') as SimpleCast;
}

/**
 * Get a reference to the survey_definitions table
 */
export function surveyDefinitionsTable(supabase: SupabaseClient) {
  return supabase.from('survey_definitions') as SimpleCast;
}

/**
 * Get a reference to the research_participants table
 */
export function researchParticipantsTable(supabase: SupabaseClient) {
  return supabase.from('research_participants') as SimpleCast;
}

/**
 * Get a reference to the research_events table
 */
export function researchEventsTable(supabase: SupabaseClient) {
  return supabase.from('research_events') as SimpleCast;
}

/**
 * Get a reference to the survey_responses table
 */
export function surveyResponsesTable(supabase: SupabaseClient) {
  return supabase.from('survey_responses') as SimpleCast;
}

/**
 * Helper to access research studies table
 */
export const researchStudiesTableHelper = (supabase: SupabaseClient) => {
  return supabase.from(TABLES.RESEARCH_STUDIES);
};

/**
 * Helper to access research triggers table
 */
export const researchTriggersTableHelper = (supabase: SupabaseClient) => {
  return supabase.from(TABLES.RESEARCH_TRIGGERS);
};

/**
 * Helper to access research events table
 */
export const researchEventsTableHelper = (supabase: SupabaseClient) => {
  return supabase.from(TABLES.RESEARCH_EVENTS);
};

/**
 * Helper to access survey definitions table
 */
export const surveyDefinitionsTableHelper = (supabase: SupabaseClient) => {
  return supabase.from(TABLES.SURVEY_DEFINITIONS);
}; 