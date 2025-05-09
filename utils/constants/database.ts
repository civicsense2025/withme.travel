export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Re-export the tables, fields, and enums from tables.ts
export { FIELDS, ENUMS } from './tables';
export type { CommentableContentType } from './tables';

// Import the TABLES from tables.ts
import { TABLES as BASE_TABLES } from './tables';

// Create a merged TABLES object with all constants
export const TABLES = {
  ...BASE_TABLES,
  // Add any additional tables that aren't in the base file
  FORMS: 'forms',
  FORM_QUESTIONS: 'form_questions', 
  FORM_RESPONSES: 'form_responses',
  FORM_QUESTION_RESPONSES: 'form_question_responses',
  LIKES: 'likes',
  FRIEND_REQUESTS: 'friend_requests',
  FRIENDS: 'friends'
};

// Export database types
export type Database = {
  public: {
    Tables: {
      access_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          requester_email: string
          requester_name: string | null
          status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          requester_email: string
          requester_name?: string | null
          status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          requester_email?: string
          requester_name?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Enums: {
      budget_category:
        | "accommodation"
        | "transportation"
        | "food"
        | "activities"
        | "shopping"
        | "other"
      content_type:
        | "trip"
        | "itinerary_item"
        | "destination"
        | "collection"
        | "template"
        | "group_idea"
      group_idea_type:
        | "destination"
        | "date"
        | "activity"
        | "budget"
        | "other"
        | "question"
        | "note"
        | "place"
      image_type:
        | "destination"
        | "trip_cover"
        | "user_avatar"
        | "template_cover"
      interaction_type: "like" | "visit" | "bookmark" | "tag"
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      item_status: "suggested" | "confirmed" | "rejected"
      itinerary_category:
        | "Iconic Landmarks"
        | "Local Secrets"
        | "Cultural Experiences"
        | "Outdoor Adventures"
        | "Food & Drink"
        | "Nightlife"
        | "Relaxation"
        | "Shopping"
        | "Group Activities"
        | "Day Excursions"
        | "Accommodations"
        | "Transportation"
        | "Flexible Options"
        | "Special Occasions"
        | "Other"
      itinerary_item_status: "pending" | "approved" | "rejected"
      place_category:
        | "attraction"
        | "restaurant"
        | "cafe"
        | "hotel"
        | "landmark"
        | "shopping"
        | "transport"
        | "other"
      privacy_setting: "private" | "shared_with_link" | "public"
      tag_status: "pending" | "approved" | "rejected"
      travel_pace: "very_slow" | "slow" | "moderate" | "fast" | "very_fast"
      travel_personality_type:
        | "planner"
        | "adventurer"
        | "foodie"
        | "sightseer"
        | "relaxer"
        | "culture"
      travel_squad_type:
        | "friends"
        | "family"
        | "partner"
        | "solo"
        | "coworkers"
        | "mixed"
      travel_style:
        | "adventurous"
        | "relaxed"
        | "cultural"
        | "luxury"
        | "budget"
        | "family"
        | "solo"
        | "nightlife"
        | "nature"
        | "food_focused"
      trip_action_type:
        | "TRIP_CREATED"
        | "TRIP_UPDATED"
        | "ITINERARY_ITEM_ADDED"
        | "ITINERARY_ITEM_UPDATED"
        | "ITINERARY_ITEM_DELETED"
        | "MEMBER_ADDED"
        | "MEMBER_REMOVED"
        | "MEMBER_ROLE_UPDATED"
        | "INVITATION_SENT"
        | "ACCESS_REQUEST_SENT"
        | "ACCESS_REQUEST_UPDATED"
        | "NOTE_CREATED"
        | "NOTE_UPDATED"
        | "NOTE_DELETED"
        | "IMAGE_UPLOADED"
        | "TAG_ADDED"
        | "TAG_REMOVED"
        | "SPLITWISE_GROUP_LINKED"
        | "SPLITWISE_GROUP_UNLINKED"
        | "SPLITWISE_GROUP_CREATED_AND_LINKED"
        | "COMMENT_ADDED"
        | "COMMENT_UPDATED"
        | "COMMENT_DELETED"
        | "VOTE_CAST"
        | "FOCUS_INITIATED"
      trip_privacy_setting: "private" | "shared_with_link" | "public"
      trip_role: "admin" | "editor" | "viewer" | "contributor"
      trip_status:
        | "planning"
        | "upcoming"
        | "in_progress"
        | "completed"
        | "cancelled"
      trip_type: "leisure" | "business" | "family" | "solo" | "group" | "other"
      url_format: "canonical" | "short" | "social" | "tracking"
      vote_type: "up" | "down"
      FRIEND_REQUEST_STATUS: {
        PENDING: 'pending',
        ACCEPTED: 'accepted',
        DECLINED: 'declined',
      },
    }
  }
} 