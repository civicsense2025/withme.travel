/**
 * Custom database declarations to fix TypeScript issues with Supabase
 */
import { TABLES } from '@/utils/constants/database';
import {
  ResearchStudy,
  ResearchTrigger,
  ResearchEvent,
  ResearchParticipant,
  Survey,
  SurveyResponse,
} from '@/types/research';
import { Database as BaseDatabase } from './database.types';

// Define interfaces for PostgrestQueryBuilder and FilterBuilder
declare module '@supabase/supabase-js' {
  // Override the PostgrestQueryBuilder from type
  interface PostgrestQueryBuilder<T> {
    from(
      relation:
        | typeof TABLES.RESEARCH_STUDIES
        | typeof TABLES.RESEARCH_TRIGGERS
        | typeof TABLES.RESEARCH_EVENTS
        | typeof TABLES.RESEARCH_PARTICIPANTS
        | typeof TABLES.SURVEYS
        | typeof TABLES.SURVEY_RESPONSES
        | string
    ): PostgrestQueryBuilder<T>;
  }

  // Override the filter builder with proper research type support
  interface PostgrestFilterBuilder<T> {
    select<U = T>(columns?: string): PostgrestFilterBuilder<U>;
    single<U = T>(): PostgrestSingleResponse<U>;
    eq(column: string, value: any): PostgrestFilterBuilder<T>;
    order(column: string, options?: { ascending?: boolean }): PostgrestFilterBuilder<T>;
    insert<U extends Record<string, any>>(
      values: U | U[],
      options?: any
    ): PostgrestFilterBuilder<T>;
    update<U extends Record<string, any>>(values: U, options?: any): PostgrestFilterBuilder<T>;
    delete(options?: any): PostgrestFilterBuilder<T>;
  }

  // Define the single response type
  interface PostgrestSingleResponse<T> {
    data: T | null;
    error: Error | null;
  }
}

// Map research table names to their corresponding return types
declare global {
  type TableTypeMap = {
    [TABLES.RESEARCH_STUDIES]: ResearchStudy;
    [TABLES.RESEARCH_TRIGGERS]: ResearchTrigger;
    [TABLES.RESEARCH_EVENTS]: ResearchEvent;
    [TABLES.RESEARCH_PARTICIPANTS]: ResearchParticipant;
    [TABLES.SURVEYS]: Survey;
    [TABLES.SURVEY_RESPONSES]: SurveyResponse;
  };

  // Provide extension points for type inference
  interface ResearchStudyResult extends ResearchStudy {}
  interface ResearchTriggerResult extends ResearchTrigger {}
  interface ResearchEventResult extends ResearchEvent {}
  interface ResearchParticipantResult extends ResearchParticipant {}
  interface SurveyResult extends Survey {}
  interface SurveyResponseResult extends SurveyResponse {}
}

// Extend the default Database type with our custom tables
export interface Database extends BaseDatabase {
  public: {
    Tables: BaseDatabase['public']['Tables'] & {
      // Add research tables definitions
      research_studies: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      research_triggers: {
        Row: {
          id: string;
          study_id: string;
          trigger_event: string;
          survey_id: string;
          min_delay_ms: number | null;
          max_triggers: number | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          study_id: string;
          trigger_event: string;
          survey_id: string;
          min_delay_ms?: number | null;
          max_triggers?: number | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          study_id?: string;
          trigger_event?: string;
          survey_id?: string;
          min_delay_ms?: number | null;
          max_triggers?: number | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      survey_definitions: {
        Row: {
          id: string;
          survey_id: string;
          title: string;
          description: string | null;
          questions: unknown;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          survey_id: string;
          title: string;
          description?: string | null;
          questions: unknown;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          survey_id?: string;
          title?: string;
          description?: string | null;
          questions?: unknown;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
