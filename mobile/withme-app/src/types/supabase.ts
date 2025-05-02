/* eslint-disable prettier/prettier */
// Type definitions for common Supabase tables used in the app
// Basic types for Supabase database tables aligned with the web application
// For table and column names, see: src/constants/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      albums: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: number;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: never;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: never;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      budget_items: {
        Row: {
          amount: number;
          category: Database['public']['Enums']['budget_category'];
          created_at: string;
          currency: string;
          date: string;
          id: string;
          paid_by: string;
          source: string | null;
          title: string;
          trip_id: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          category: Database['public']['Enums']['budget_category'];
          created_at?: string;
          currency?: string;
          date: string;
          id?: string;
          paid_by: string;
          source?: string | null;
          title: string;
          trip_id: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          category?: Database['public']['Enums']['budget_category'];
          created_at?: string;
          currency?: string;
          date?: string;
          id?: string;
          paid_by?: string;
          source?: string | null;
          title?: string;
          trip_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'budget_items_paid_by_fkey';
            columns: ['paid_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'budget_items_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      collaborative_sessions: {
        Row: {
          content: Json | null;
          created_at: string | null;
          document_id: string;
          document_type: string;
          id: string;
          trip_id: string;
          updated_at: string | null;
        };
        Insert: {
          content?: Json | null;
          created_at?: string | null;
          document_id: string;
          document_type: string;
          id?: string;
          trip_id: string;
          updated_at?: string | null;
        };
        Update: {
          content?: Json | null;
          created_at?: string | null;
          document_id?: string;
          document_type?: string;
          id?: string;
          trip_id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      content_customizations: {
        Row: {
          created_at: string | null;
          customization_type: string;
          customized_value: Json | null;
          id: string;
          is_private: boolean | null;
          item_id: string | null;
          metadata: Json | null;
          original_value: Json | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          customization_type: string;
          customized_value?: Json | null;
          id?: string;
          is_private?: boolean | null;
          item_id?: string | null;
          metadata?: Json | null;
          original_value?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          customization_type?: string;
          customized_value?: Json | null;
          id?: string;
          is_private?: boolean | null;
          item_id?: string | null;
          metadata?: Json | null;
          original_value?: Json | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'content_customizations_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_items';
            referencedColumns: ['id'];
          },
        ];
      };
      content_quality_metrics: {
        Row: {
          created_at: string | null;
          engagement_score: number | null;
          id: string;
          item_id: string | null;
          last_used_at: string | null;
          metadata: Json | null;
          popularity_score: number | null;
          quality_score: number | null;
          trip_id: string | null;
          updated_at: string | null;
          usage_count: number | null;
        };
        Insert: {
          created_at?: string | null;
          engagement_score?: number | null;
          id?: string;
          item_id?: string | null;
          last_used_at?: string | null;
          metadata?: Json | null;
          popularity_score?: number | null;
          quality_score?: number | null;
          trip_id?: string | null;
          updated_at?: string | null;
          usage_count?: number | null;
        };
        Update: {
          created_at?: string | null;
          engagement_score?: number | null;
          id?: string;
          item_id?: string | null;
          last_used_at?: string | null;
          metadata?: Json | null;
          popularity_score?: number | null;
          quality_score?: number | null;
          trip_id?: string | null;
          updated_at?: string | null;
          usage_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'content_quality_metrics_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: true;
            referencedRelation: 'itinerary_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_quality_metrics_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      /* Complete Supabase schema is very long - keeping interfaces for common types */
      itinerary_items: {
        Row: {
          address: string | null;
          attribution_metadata: Json | null;
          attribution_type: string | null;
          canonical_url: string | null;
          category: Database['public']['Enums']['itinerary_category'] | null;
          content_layer: string | null;
          cost: number | null;
          cover_image_url: string | null;
          created_at: string | null;
          created_by: string | null;
          currency: string | null;
          date: string | null;
          day_number: number | null;
          duration_minutes: number | null;
          end_time: string | null;
          estimated_cost: number | null;
          id: string;
          is_custom: boolean | null;
          item_type: string | null;
          latitude: number | null;
          like_count: number | null;
          location: string | null;
          longitude: number | null;
          meta_keywords: string[] | null;
          notes: string | null;
          original_id: string | null;
          place_id: string | null;
          position: number | null;
          section_id: string | null;
          seo_description: string | null;
          seo_title: string | null;
          share_count: number | null;
          share_status: string | null;
          slug: string | null;
          source_trip_id: string | null;
          start_time: string | null;
          status: Database['public']['Enums']['item_status'] | null;
          structured_data: Json | null;
          title: string;
          trip_id: string | null;
          type: string | null;
          updated_at: string | null;
          view_count: number | null;
          order_in_day: number | null;
          location_name: string | null;
          description: string | null;
        };
        Insert: {
          // Insert fields
        };
        Update: {
          // Update fields
        };
        Relationships: [];
      };
      trips: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          created_by: string;
          name: string;
          description: string | null;
          trip_emoji: string | null;
          start_date: string | null;
          end_date: string | null;
          duration_days: number | null;
          destination_id: string | null;
          status: string;
          is_public: boolean;
          slug: string | null;
          public_slug: string | null;
          privacy_setting: string;
          likes_count: number;
          view_count: number;
          image_url: string | null;
          destination_city: string | null;
          cover_image_url: string | null;
          destination_name: string | null;
          use_count: number | null;
          comments_count: number | null;
          travelers_count: number | null;
          member_count: number | null;
          is_archived: boolean | null;
          trip_type: string | null;
          budget: number | null;
          vibe: string | null;
          date_flexibility: string | null;
          color_scheme: string | null;
          playlist_url: string | null;
          last_accessed_at: string | null;
          splitwise_group_id: string | null;
          cover_image_position_y: number | null;
          shared_url: string | null;
        };
        Insert: {
          // Insert fields
        };
        Update: {
          // Update fields
        };
        Relationships: [];
      };
      destinations: {
        Row: {
          accessibility: number | null;
          address: string | null;
          avg_cost_per_day: number | null;
          avg_days: number | null;
          beach_quality: number | null;
          best_season: string | null;
          byline: string | null;
          city: string | null;
          continent: string | null;
          country: string | null;
          created_at: string;
          cuisine_rating: number | null;
          cultural_attractions: number | null;
          description: string | null;
          digital_nomad_friendly: boolean | null;
          eco_friendly_options: number | null;
          emoji: string | null;
          family_friendly: boolean | null;
          highlights: string | null;
          id: string;
          image_metadata: Json | null;
          image_url: string | null;
          instagram_worthy_spots: number | null;
          latitude: number | null;
          lgbtq_friendliness: number | null;
          likes_count: number | null;
          local_language: string | null;
          longitude: number | null;
          mapbox_id: string | null;
          name: string | null;
          nightlife_rating: number | null;
          off_peak_appeal: number | null;
          outdoor_activities: number | null;
          perfect_for: string | null;
          popularity: number | null;
          public_transportation: number | null;
          safety_rating: number | null;
          shopping_rating: number | null;
          state_province: string | null;
          time_zone: string | null;
          updated_at: string | null;
          visa_required: boolean | null;
          walkability: number | null;
          wifi_connectivity: number | null;
        };
        Insert: {
          // Insert fields
        };
        Update: {
          // Update fields
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          name: string | null;
          email: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_admin: boolean | null;
          location: string | null;
          website: string | null;
        };
        Insert: {
          // Insert fields
        };
        Update: {
          // Update fields
        };
        Relationships: [];
      };
      itinerary_templates: {
        Row: {
          id: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          description: string | null;
          image_url: string | null;
          duration_days: number | null;
          destination_city: string | null;
          destination_id: string | null;
          tags?: string[] | null;
        };
        Insert: {
          // Insert fields
        };
        Update: {
          // Update fields
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      // Function definitions omitted for brevity
    };
    Enums: {
      budget_category:
        | 'accommodation'
        | 'transportation'
        | 'food'
        | 'activities'
        | 'shopping'
        | 'other';
      content_type: 'trip' | 'itinerary_item' | 'destination' | 'collection' | 'template';
      image_type: 'destination' | 'trip_cover' | 'user_avatar' | 'template_cover';
      interaction_type: 'like' | 'visit' | 'bookmark' | 'tag';
      invitation_status: 'pending' | 'accepted' | 'declined' | 'expired';
      item_status: 'suggested' | 'confirmed' | 'rejected';
      itinerary_category:
        | 'flight'
        | 'accommodation'
        | 'attraction'
        | 'restaurant'
        | 'cafe'
        | 'transportation'
        | 'activity'
        | 'custom'
        | 'other';
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
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// For convenience, these types can be reused in the app code
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Trip = Database['public']['Tables']['trips']['Row']; 
export type ItineraryItem = Database['public']['Tables']['itinerary_items']['Row'];
export type Destination = Database['public']['Tables']['destinations']['Row'];
export type ItineraryTemplate = Database['public']['Tables']['itinerary_templates']['Row'];
