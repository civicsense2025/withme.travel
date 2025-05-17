/**
 * Database Type Definitions
 * 
 * This file contains the TypeScript type definitions for the database schema.
 * It provides type safety for database operations and should be kept in sync
 * with the actual database schema.
 * 
 * NOTE: This file should be auto-generated from the database schema.
 */

// Import enum types from status.ts
import {
  BudgetCategory,
  ContentType,
  GroupIdeaType,
  GroupMemberRole,
  GroupMemberStatus,
  GroupVisibility,
  ImageType,
  InvitationStatus,
  InvitationType,
  ItemStatus,
  ItineraryCategory,
  PermissionStatus,
  StateProvinceType,
  TravelPace,
  TripActionType,
  TripPrivacySetting,
  TripRole,
  TripStatus,
  TripType,
  UserRole,
  VoteType,
  ENUMS
} from './status';

/**
 * Generic JSON type for Supabase
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/**
 * Database Schema Type
 * This type represents the structure of the entire Supabase database.
 * 
 * NOTE: In a real implementation, this would be auto-generated from the database schema.
 * The example below is a simplified representation.
 */
export type Database = {
  public: {
    Tables: {
      // Trip related tables
      trips: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          start_date: string | null;
          end_date: string | null;
          status: TripStatus;
          trip_type: TripType;
          privacy_setting: TripPrivacySetting;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by: string;
          start_date?: string | null;
          end_date?: string | null;
          status?: TripStatus;
          trip_type?: TripType;
          privacy_setting?: TripPrivacySetting;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_by?: string;
          start_date?: string | null;
          end_date?: string | null;
          status?: TripStatus;
          trip_type?: TripType;
          privacy_setting?: TripPrivacySetting;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trips_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      
      // Group related tables
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          created_at: string;
          updated_at: string | null;
          visibility: GroupVisibility;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string | null;
          visibility?: GroupVisibility;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string | null;
          visibility?: GroupVisibility;
        };
        Relationships: [
          {
            foreignKeyName: 'groups_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      
      // User related tables
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      
      // Add other tables as needed
    };
    
    /**
     * Enums from the database
     * These should match the ENUMS export from status.ts
     */
    Enums: {
      budget_category: BudgetCategory;
      content_type: ContentType;
      group_idea_type: GroupIdeaType;
      group_member_role: GroupMemberRole; 
      group_member_status: GroupMemberStatus;
      group_visibility: GroupVisibility;
      image_type: ImageType;
      invitation_status: InvitationStatus;
      invitation_type: InvitationType;
      item_status: ItemStatus;
      itinerary_category: ItineraryCategory;
      permission_status: PermissionStatus;
      state_province_type: StateProvinceType;
      travel_pace: TravelPace;
      trip_action_type: TripActionType;
      trip_privacy_setting: TripPrivacySetting;
      trip_role: TripRole;
      trip_status: TripStatus;
      trip_type: TripType;
      user_role: UserRole;
      vote_type: VoteType;
    };
  };
};

// Type aliases for common table rows
export type Trip = Database['public']['Tables']['trips']['Row'];
export type Group = Database['public']['Tables']['groups']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Add more type aliases as needed

/**
 * Task entity (personal or group)
 */
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: typeof ENUMS.TASK_STATUS[keyof typeof ENUMS.TASK_STATUS];
  due_date?: string | null;
  priority: typeof ENUMS.TASK_PRIORITY[keyof typeof ENUMS.TASK_PRIORITY];
  created_at: string;
  updated_at: string;
  owner_id: string;
  assignee_id?: string | null;
  trip_id?: string | null;
  position: number;
  tags?: string[];
  up_votes?: number;
  down_votes?: number;
}

/**
 * TaskVote entity for up/down voting on tasks
 */
export interface TaskVote {
  id: string;
  task_id: string;
  user_id: string;
  vote_type: typeof ENUMS.VOTE_TYPE[keyof typeof ENUMS.VOTE_TYPE];
  created_at: string;
}

/**
 * Tag entity for reusable tags
 */
export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

/**
 * TaskTag entity for task-tag relationships
 */
export interface TaskTag {
  task_id: string;
  tag_id: string;
  created_at: string;
}
