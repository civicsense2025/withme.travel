/**
 * Database Types and Constants
 *
 * This file provides TypeScript types for the database schema and re-exports
 * table constants from tables.ts. It serves as the central type definition
 * for all database interactions.
 *
 * IMPORTANT:
 * - Import types from this file for database operations
 * - Use these typed constants for table and field references
 * - Do not modify the Database type directly; it should match your Supabase schema
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Generic JSON type for Supabase
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ============================================================================
// TABLE CONSTANTS
// ============================================================================

/**
 * Re-export common fields and enums from tables.ts
 */
export { FIELDS, ENUMS, TABLE_NAMES } from './tables';
export type { CommentableContentType } from './tables';

// Import the base tables from tables.ts
import { TABLES as BASE_TABLES } from './tables';

/**
 * Complete table constants for database access
 * Merges the core tables from tables.ts with additional tables
 */
export const TABLES = {
  ...BASE_TABLES,

  // ============================================================================
  // CORE ENTITIES
  // ============================================================================

  /** Main trips table */
  TRIPS: 'trips',
  /** Places and points of interest */
  PLACES: 'places',
  /** Cities information */
  CITIES: 'cities',

  // ============================================================================
  // FORM & SURVEY SYSTEM
  // ============================================================================

  /** Forms definitions */
  FORMS: 'forms',
  /** Form fields/questions */
  FORM_FIELDS: 'form_fields',
  /** Form questions */
  FORM_QUESTIONS: 'form_questions',
  /** Form responses from users */
  FORM_RESPONSES: 'form_responses',
  /** Individual question responses */
  FORM_QUESTION_RESPONSES: 'form_question_responses',
  /** Question relationships for branching logic */
  QUESTION_BRANCHING: 'question_branching',
  /** Questions definition */
  QUESTIONS: 'questions',
  /** Response sessions (form submission tracking) */
  RESPONSE_SESSIONS: 'response_sessions',
  /** Individual responses to questions */
  RESPONSES: 'responses',

  // ============================================================================
  // SOCIAL & RELATIONSHIPS
  // ============================================================================

  /** Friend request management */
  FRIEND_REQUESTS: 'friend_requests',
  /** Established friend connections */
  FRIENDS: 'friends',
  /** Place reviews by users */
  REVIEWS: 'reviews',
  /** User referrals */
  REFERRALS: 'referrals',

  // ============================================================================
  // GROUP PLANNING
  // ============================================================================

  /** Reactions to group plan ideas */
  GROUP_PLAN_IDEA_REACTIONS: 'group_plan_idea_reactions',
  /** Comments on group plans */
  GROUP_PLAN_COMMENTS: 'group_plan_comments',
  /** Votes on group plan ideas */
  GROUP_PLAN_IDEA_VOTES: 'group_plan_idea_votes',
  /** Group activities log */
  GROUP_ACTIVITIES: 'group_activities',
  /** Group board activity log */
  GROUP_BOARD_LOG: 'group_board_log',
  /** Group plans change log */
  GROUP_PLANS_LOG: 'group_plans_log',
  /** Group roles definitions */
  GROUP_ROLES: 'group_roles',
  /** Group-trip relationships */
  GROUP_TRIPS: 'group_trips',
  /** Plan events */
  PLAN_EVENTS: 'plan_events',

  // ============================================================================
  // RESEARCH & TESTING SYSTEM
  // ============================================================================

  /** A/B test variants */
  AB_TEST_VARIANTS: 'ab_test_variants',
  /** Conversion goals for A/B tests */
  CONVERSION_GOALS: 'conversion_goals',
  /** Research milestone triggers */
  MILESTONE_TRIGGERS: 'milestone_triggers',
  /** Completed research milestones */
  MILESTONE_COMPLETIONS: 'milestone_completions',
  /** Milestone trigger history */
  MILESTONE_TRIGGER_HISTORY: 'milestone_trigger_history',
  /** Research triggers */
  RESEARCH_TRIGGERS: 'research_triggers',
  /** Research events */
  RESEARCH_EVENTS: 'research_events',
  /** Research link tracking */
  RESEARCH_LINKS: 'research_links',
  /** Research link click tracking */
  RESEARCH_LINK_CLICKS: 'research_link_clicks',
  /** Research milestones */
  RESEARCH_MILESTONES: 'research_milestones',
  /** Survey definitions */
  SURVEYS: 'surveys',
  /** Research study participants */
  RESEARCH_PARTICIPANTS: 'research_participants',
  /** Research studies */
  RESEARCH_STUDIES: 'research_studies',
  /** Research tasks */
  RESEARCH_TASKS: 'research_tasks',
  /** Survey responses */
  SURVEY_RESPONSES: 'survey_responses',
  /** Survey handoffs */
  SURVEY_HANDOFFS: 'survey_handoffs',
  /** Route-based survey triggers */
  ROUTE_SURVEY_TRIGGERS: 'route_survey_triggers',
  /** History of route survey triggers */
  ROUTE_SURVEY_TRIGGER_HISTORY: 'route_survey_trigger_history',
  /** Survey definitions */
  SURVEY_DEFINITIONS: 'survey_definitions',
  /** Survey questions */
  SURVEY_QUESTIONS: 'survey_questions',
  /** Research analytics */
  RESEARCH_ANALYTICS: 'research_analytics',
  /** Research event logs */
  RESEARCH_EVENT_LOGS: 'research_event_logs',
  /** Research study administrators */
  RESEARCH_STUDY_ADMINS: 'research_study_admins',
  /** Research survey triggers */
  RESEARCH_SURVEY_TRIGGERS: 'research_survey_triggers',
  /** Participant status history */
  PARTICIPANT_STATUS_HISTORY: 'participant_status_history',
  /** Participant variant assignments */
  PARTICIPANT_VARIANTS: 'participant_variants',
  /** User testing sessions */
  USER_TESTING_SESSIONS: 'user_testing_sessions',
  /** User testing events */
  USER_TESTING_EVENTS: 'user_testing_events',

  // ============================================================================
  // TRIP COMPONENTS
  // ============================================================================

  /** Trip cities relationships */
  TRIP_CITIES: 'trip_cities',
  /** Trip comment likes */
  TRIP_COMMENT_LIKES: 'trip_comment_likes',
  /** Trip history log */
  TRIP_HISTORY: 'trip_history',
  /** Trip images */
  TRIP_IMAGES: 'trip_images',
  /** Trip item comments */
  TRIP_ITEM_COMMENTS: 'trip_item_comments',
  /** Trip logistics */
  TRIP_LOGISTICS: 'trip_logistics',
  /** Trip notes */
  TRIP_NOTES: 'trip_notes',
  /** Trip tags */
  TRIP_TAGS: 'trip_tags',
  /** Trip template usage tracking */
  TRIP_TEMPLATE_USES: 'trip_template_uses',
  /** Trip voting options */
  TRIP_VOTE_OPTIONS: 'trip_vote_options',
  /** Trip voting polls */
  TRIP_VOTE_POLLS: 'trip_vote_polls',
  /** Trip votes */
  TRIP_VOTES: 'trip_votes',
  /** Trip analytics events */
  TRIP_ANALYTICS_EVENTS: 'trip_analytics_events',

  // ============================================================================
  // ITINERARY COMPONENTS
  // ============================================================================

  /** Itinerary sections */
  ITINERARY_SECTIONS: 'itinerary_sections',
  /** Itinerary item comment reactions */
  ITINERARY_ITEM_COMMENT_REACTIONS: 'itinerary_item_comment_reactions',
  /** Note tags relationships */
  NOTE_TAGS: 'note_tags',
  /** Template applications */
  TEMPLATE_APPLICATIONS: 'template_applications',

  // ============================================================================
  // GLOBAL REFERENCE DATA
  // ============================================================================

  /** Country-language relationships */
  COUNTRY_LANGUAGES: 'country_languages',
  /** Currency information */
  CURRENCIES: 'currencies',
  /** Language information */
  LANGUAGES: 'languages',
  /** States and provinces */
  STATES_PROVINCES: 'states_provinces',

  // ============================================================================
  // ANALYTICS & METRICS
  // ============================================================================

  /** Item popularity metrics */
  ITEM_POPULARITY_METRICS: 'item_popularity_metrics',
  /** Notification analytics */
  NOTIFICATION_ANALYTICS: 'notification_analytics',
  /** Notification history */
  NOTIFICATION_HISTORY: 'notification_history',
  /** Onboarding events */
  ONBOARDING_EVENTS: 'onboarding_events',
  /** Permission requests */
  PERMISSION_REQUESTS: 'permission_requests',
  /** Place metrics */
  PLACE_METRICS: 'place_metrics',
  /** Place nominations */
  PLACE_NOMINATIONS: 'place_nominations',
  /** Preference weights */
  PREFERENCE_WEIGHTS: 'preference_weights',
  /** Rate limits */
  RATE_LIMITS: 'rate_limits',
} as const;

// ============================================================================
// NOTIFICATION CONSTANTS
// ============================================================================

/**
 * Notification types for the system
 * Used for categorizing and routing notifications
 */
export const NOTIFICATION_TYPES = {
  /** Friend request received */
  FRIEND_REQUEST: 'friend_request',
  /** Friend request accepted */
  FRIEND_ACCEPTED: 'friend_accepted',
  /** Invitation to join a trip */
  TRIP_INVITE: 'trip_invite',
  /** Updates to a trip you're part of */
  TRIP_UPDATE: 'trip_update',
  /** New comment on an itinerary item */
  ITINERARY_COMMENT: 'itinerary_comment',
  /** New reaction on an itinerary item */
  ITINERARY_REACTION: 'itinerary_reaction',
  /** Request to access a trip */
  ACCESS_REQUEST: 'access_request',
  /** Access granted to a trip */
  ACCESS_GRANTED: 'access_granted',
  /** User mentioned in comment */
  MENTION: 'mention',
  /** Invitation to join a group */
  GROUP_INVITE: 'group_invite',
  /** Updates to a group you're part of */
  GROUP_UPDATE: 'group_update',
  /** New idea added to a group */
  GROUP_IDEA: 'group_idea',
  /** New comment on a group idea */
  GROUP_COMMENT: 'group_comment',
  /** New reaction on a group comment */
  GROUP_REACTION: 'group_reaction',
} as const;

// ============================================================================
// SOCIAL RELATIONSHIP CONSTANTS
// ============================================================================

/**
 * Friend request status values
 * Used to track the state of friend requests
 */
export const FRIEND_REQUEST_STATUS = {
  /** Request sent but not yet acted upon */
  PENDING: 'pending',
  /** Request was accepted by the recipient */
  ACCEPTED: 'accepted',
  /** Request was declined by the recipient */
  DECLINED: 'declined',
  /** User was blocked (extended functionality) */
  BLOCKED: 'blocked',
} as const;

// ============================================================================
// DATABASE SCHEMA TYPES
// ============================================================================

/**
 * Complete Database type definition
 * This type represents the structure of the entire Supabase database
 */
export type Database = {
  public: {
    Tables: {
      access_requests: {
        Row: {
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          id: string;
          requester_email: string;
          requester_name: string | null;
          status: string;
        };
        Insert: {
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          id?: string;
          requester_email: string;
          requester_name?: string | null;
          status?: string;
        };
        Update: {
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          id?: string;
          requester_email?: string;
          requester_name?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'access_requests_approved_by_fkey';
            columns: ['approved_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      auth_modal_analytics: {
        Row: {
          id: string;
          event_name: string;
          event_data: any;
          user_id: string | null;
          timestamp: string;
          url: string | null;
          ab_test_variant: string;
          context: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_name: string;
          event_data?: any;
          user_id?: string | null;
          timestamp?: string;
          url?: string | null;
          ab_test_variant?: string;
          context?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_name?: string;
          event_data?: any;
          user_id?: string | null;
          timestamp?: string;
          url?: string | null;
          ab_test_variant?: string;
          context?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'auth_modal_analytics_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      activities: {
        Row: {
          id: string;
          name: string;
          description: string;
          destination_id: string | null;
          location: string | null;
          image_url: string | null;
          url: string | null;
          category: string | null;
          duration_minutes: number | null;
          price_range: string | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string | null;
          is_featured: boolean;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          destination_id?: string | null;
          location?: string | null;
          image_url?: string | null;
          url?: string | null;
          category?: string | null;
          duration_minutes?: number | null;
          price_range?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string | null;
          is_featured?: boolean;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          destination_id?: string | null;
          location?: string | null;
          image_url?: string | null;
          url?: string | null;
          category?: string | null;
          duration_minutes?: number | null;
          price_range?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string | null;
          is_featured?: boolean;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'activities_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activities_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Enums: {
      budget_category:
        | 'accommodation'
        | 'transportation'
        | 'food'
        | 'activities'
        | 'shopping'
        | 'other';
      content_type:
        | 'trip'
        | 'itinerary_item'
        | 'destination'
        | 'collection'
        | 'template'
        | 'group_idea';
      group_idea_type:
        | 'destination'
        | 'date'
        | 'activity'
        | 'budget'
        | 'other'
        | 'question'
        | 'note'
        | 'place';
      image_type: 'destination' | 'trip_cover' | 'user_avatar' | 'template_cover';
      interaction_type: 'like' | 'visit' | 'bookmark' | 'tag';
      invitation_status: 'pending' | 'accepted' | 'declined' | 'expired';
      item_status: 'suggested' | 'confirmed' | 'rejected';
      itinerary_category:
        | 'Iconic Landmarks'
        | 'Local Secrets'
        | 'Cultural Experiences'
        | 'Outdoor Adventures'
        | 'Food & Drink'
        | 'Nightlife'
        | 'Relaxation'
        | 'Shopping'
        | 'Group Activities'
        | 'Day Excursions'
        | 'Accommodations'
        | 'Transportation'
        | 'Flexible Options'
        | 'Special Occasions'
        | 'Other';
      itinerary_item_status: 'pending' | 'approved' | 'rejected';
      place_category:
        | 'attraction'
        | 'restaurant'
        | 'cafe'
        | 'hotel'
        | 'landmark'
        | 'shopping'
        | 'transport'
        | 'other';
      privacy_setting: 'private' | 'shared_with_link' | 'public';
      research_participant_status: 'invited' | 'active' | 'completed' | 'dropped';
      research_study_status: 'active' | 'paused' | 'completed' | 'draft';
      milestone_type:
        | 'COMPLETE_ONBOARDING'
        | 'ITINERARY_MILESTONE_3_ITEMS'
        | 'GROUP_FORMATION_COMPLETE'
        | 'VOTE_PROCESS_USED'
        | 'TRIP_FROM_TEMPLATE_CREATED';
      tag_status: 'pending' | 'approved' | 'rejected';
      travel_pace: 'very_slow' | 'slow' | 'moderate' | 'fast' | 'very_fast';
      travel_personality_type:
        | 'planner'
        | 'adventurer'
        | 'foodie'
        | 'sightseer'
        | 'relaxer'
        | 'culture';
      travel_squad_type: 'friends' | 'family' | 'partner' | 'solo' | 'coworkers' | 'mixed';
      travel_style:
        | 'adventurous'
        | 'relaxed'
        | 'cultural'
        | 'luxury'
        | 'budget'
        | 'family'
        | 'solo'
        | 'nightlife'
        | 'nature'
        | 'food_focused';
      trip_action_type:
        | 'TRIP_CREATED'
        | 'TRIP_UPDATED'
        | 'ITINERARY_ITEM_ADDED'
        | 'ITINERARY_ITEM_UPDATED'
        | 'ITINERARY_ITEM_DELETED'
        | 'MEMBER_ADDED'
        | 'MEMBER_REMOVED'
        | 'MEMBER_ROLE_UPDATED'
        | 'INVITATION_SENT'
        | 'ACCESS_REQUEST_SENT'
        | 'ACCESS_REQUEST_UPDATED'
        | 'NOTE_CREATED'
        | 'NOTE_UPDATED'
        | 'NOTE_DELETED'
        | 'IMAGE_UPLOADED'
        | 'TAG_ADDED'
        | 'TAG_REMOVED'
        | 'SPLITWISE_GROUP_LINKED'
        | 'SPLITWISE_GROUP_UNLINKED'
        | 'SPLITWISE_GROUP_CREATED_AND_LINKED'
        | 'COMMENT_ADDED'
        | 'COMMENT_UPDATED'
        | 'COMMENT_DELETED'
        | 'VOTE_CAST'
        | 'FOCUS_INITIATED';
      trip_privacy_setting: 'private' | 'shared_with_link' | 'public';
      trip_role: 'admin' | 'editor' | 'viewer' | 'contributor';
      trip_status: 'planning' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
      trip_type: 'leisure' | 'business' | 'family' | 'solo' | 'group' | 'other';
      url_format: 'canonical' | 'short' | 'social' | 'tracking';
      vote_type: 'up' | 'down';
      FRIEND_REQUEST_STATUS: {
        PENDING: 'pending';
        ACCEPTED: 'accepted';
        DECLINED: 'declined';
      };
    };
  };
};
