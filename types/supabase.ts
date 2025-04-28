import { Trip } from './trip'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      albums: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: never
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: never
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      collaborative_sessions: {
        Row: {
          content: Json | null
          created_at: string | null
          document_id: string
          document_type: string
          id: string
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          document_id: string
          document_type: string
          id?: string
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          document_id?: string
          document_type?: string
          id?: string
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      destinations: {
        Row: {
          accessibility: number | null
          avg_cost_per_day: number | null
          beach_quality: number | null
          best_season: string | null
          byline: string | null
          city: string | null
          continent: string | null
          country: string | null
          created_at: string
          cuisine_rating: number | null
          cultural_attractions: number | null
          description: string | null
          digital_nomad_friendly: boolean | null
          eco_friendly_options: number | null
          emoji: string | null
          family_friendly: boolean | null
          highlights: string | null
          id: string
          image_metadata: Json | null
          image_url: string | null
          instagram_worthy_spots: number | null
          lgbtq_friendliness: number | null
          local_language: string | null
          name: string | null
          nightlife_rating: number | null
          off_peak_appeal: number | null
          outdoor_activities: number | null
          perfect_for: string | null
          popularity: number | null
          public_transportation: number | null
          safety_rating: number | null
          shopping_rating: number | null
          state_province: string | null
          time_zone: string | null
          updated_at: string | null
          visa_required: boolean | null
          walkability: number | null
          wifi_connectivity: number | null
        }
        Insert: {
          accessibility?: number | null
          avg_cost_per_day?: number | null
          beach_quality?: number | null
          best_season?: string | null
          byline?: string | null
          city?: string | null
          continent?: string | null
          country?: string | null
          created_at?: string
          cuisine_rating?: number | null
          cultural_attractions?: number | null
          description?: string | null
          digital_nomad_friendly?: boolean | null
          eco_friendly_options?: number | null
          emoji?: string | null
          family_friendly?: boolean | null
          highlights?: string | null
          id?: string
          image_metadata?: Json | null
          image_url?: string | null
          instagram_worthy_spots?: number | null
          lgbtq_friendliness?: number | null
          local_language?: string | null
          name?: string | null
          nightlife_rating?: number | null
          off_peak_appeal?: number | null
          outdoor_activities?: number | null
          perfect_for?: string | null
          popularity?: number | null
          public_transportation?: number | null
          safety_rating?: number | null
          shopping_rating?: number | null
          state_province?: string | null
          time_zone?: string | null
          updated_at?: string | null
          visa_required?: boolean | null
          walkability?: number | null
          wifi_connectivity?: number | null
        }
        Update: {
          accessibility?: number | null
          avg_cost_per_day?: number | null
          beach_quality?: number | null
          best_season?: string | null
          byline?: string | null
          city?: string | null
          continent?: string | null
          country?: string | null
          created_at?: string
          cuisine_rating?: number | null
          cultural_attractions?: number | null
          description?: string | null
          digital_nomad_friendly?: boolean | null
          eco_friendly_options?: number | null
          emoji?: string | null
          family_friendly?: boolean | null
          highlights?: string | null
          id?: string
          image_metadata?: Json | null
          image_url?: string | null
          instagram_worthy_spots?: number | null
          lgbtq_friendliness?: number | null
          local_language?: string | null
          name?: string | null
          nightlife_rating?: number | null
          off_peak_appeal?: number | null
          outdoor_activities?: number | null
          perfect_for?: string | null
          popularity?: number | null
          public_transportation?: number | null
          safety_rating?: number | null
          shopping_rating?: number | null
          state_province?: string | null
          time_zone?: string | null
          updated_at?: string | null
          visa_required?: boolean | null
          walkability?: number | null
          wifi_connectivity?: number | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          date: string | null
          id: string
          paid_by: string | null
          title: string
          trip_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          paid_by?: string | null
          title: string
          trip_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          paid_by?: string | null
          title?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      image_metadata: {
        Row: {
          alt_text: string | null
          attribution: string | null
          created_at: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["image_type"]
          focal_point_x: number | null
          focal_point_y: number | null
          height: number | null
          id: string
          license: string | null
          photographer_name: string | null
          photographer_url: string | null
          source: string
          source_id: string | null
          updated_at: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          attribution?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["image_type"]
          focal_point_x?: number | null
          focal_point_y?: number | null
          height?: number | null
          id?: string
          license?: string | null
          photographer_name?: string | null
          photographer_url?: string | null
          source: string
          source_id?: string | null
          updated_at?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          attribution?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["image_type"]
          focal_point_x?: number | null
          focal_point_y?: number | null
          height?: number | null
          id?: string
          license?: string | null
          photographer_name?: string | null
          photographer_url?: string | null
          source?: string
          source_id?: string | null
          updated_at?: string | null
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: number
          invitation_status: Database["public"]["Enums"]["invitation_status"]
          invited_by: string | null
          token: string
          trip_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: number
          invitation_status?: Database["public"]["Enums"]["invitation_status"]
          invited_by?: string | null
          token: string
          trip_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: number
          invitation_status?: Database["public"]["Enums"]["invitation_status"]
          invited_by?: string | null
          token?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_items: {
        Row: {
          cost: number | null
          created_at: string | null
          created_by: string | null
          date: string | null
          end_time: string | null
          id: string
          item_type: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          notes: string | null
          place_id: string | null
          start_time: string | null
          title: string
          trip_id: string | null
          type: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          end_time?: string | null
          id?: string
          item_type?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          place_id?: string | null
          start_time?: string | null
          title: string
          trip_id?: string | null
          type?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          end_time?: string | null
          id?: string
          item_type?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          place_id?: string | null
          start_time?: string | null
          title?: string
          trip_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_templates: {
        Row: {
          category: string
          copied_count: number | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string
          days: Json
          description: string | null
          destination_id: string
          duration_days: number
          featured: boolean | null
          groupsize: string | null
          id: string
          is_published: boolean | null
          last_copied_at: string | null
          like_count: number | null
          metadata: Json | null
          slug: string
          source_trip_id: string | null
          tags: string[] | null
          template_type: string | null
          title: string
          updated_at: string | null
          use_count: number | null
          version: number | null
          view_count: number | null
        }
        Insert: {
          category: string
          copied_count?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by: string
          days: Json
          description?: string | null
          destination_id: string
          duration_days: number
          featured?: boolean | null
          groupsize?: string | null
          id?: string
          is_published?: boolean | null
          last_copied_at?: string | null
          like_count?: number | null
          metadata?: Json | null
          slug: string
          source_trip_id?: string | null
          tags?: string[] | null
          template_type?: string | null
          title: string
          updated_at?: string | null
          use_count?: number | null
          version?: number | null
          view_count?: number | null
        }
        Update: {
          category?: string
          copied_count?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string
          days?: Json
          description?: string | null
          destination_id?: string
          duration_days?: number
          featured?: boolean | null
          groupsize?: string | null
          id?: string
          is_published?: boolean | null
          last_copied_at?: string | null
          like_count?: number | null
          metadata?: Json | null
          slug?: string
          source_trip_id?: string | null
          tags?: string[] | null
          template_type?: string | null
          title?: string
          updated_at?: string | null
          use_count?: number | null
          version?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_templates_created_by_fkey1"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_templates_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_templates_source_trip_id_fkey"
            columns: ["source_trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      permission_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          status: string
          trip_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          status?: string
          trip_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          status?: string
          trip_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permission_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_image_url: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          is_verified: boolean | null
          location: string | null
          name: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          email?: string | null
          id: string
          is_admin?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          name?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          name?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted: boolean | null
          converted_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          trip_id: string | null
        }
        Insert: {
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          trip_id?: string | null
        }
        Update: {
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      template_activities: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          metadata: Json | null
          position: number | null
          section_id: string | null
          start_time: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          metadata?: Json | null
          position?: number | null
          section_id?: string | null
          start_time?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          metadata?: Json | null
          position?: number | null
          section_id?: string | null
          start_time?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_activities_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "template_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      template_sections: {
        Row: {
          created_at: string | null
          day_number: number
          description: string | null
          id: string
          metadata: Json | null
          position: number | null
          template_id: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_number: number
          description?: string | null
          id?: string
          metadata?: Json | null
          position?: number | null
          template_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_number?: number
          description?: string | null
          id?: string
          metadata?: Json | null
          position?: number | null
          template_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_sections_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "itinerary_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_images: {
        Row: {
          album_id: number | null
          content_type: string
          created_at: string | null
          created_by: string
          description: string | null
          file_name: string
          file_path: string
          height: number | null
          id: string
          size_bytes: number
          trip_id: string
          width: number | null
        }
        Insert: {
          album_id?: number | null
          content_type: string
          created_at?: string | null
          created_by: string
          description?: string | null
          file_name: string
          file_path: string
          height?: number | null
          id?: string
          size_bytes: number
          trip_id: string
          width?: number | null
        }
        Update: {
          album_id?: number | null
          content_type?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          file_name?: string
          file_path?: string
          height?: number | null
          id?: string
          size_bytes?: number
          trip_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_images_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_images_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_members: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          role: Database["public"]["Enums"]["trip_role"]
          trip_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["trip_role"]
          trip_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["trip_role"]
          trip_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_members_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_notes: {
        Row: {
          album_id: number | null
          content: string | null
          trip_id: string
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          album_id?: number | null
          content?: string | null
          trip_id: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          album_id?: number | null
          content?: string | null
          trip_id?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_notes_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_notes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: true
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_template_uses: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          id: string
          modifications: Json | null
          template_id: string | null
          trip_id: string | null
          version_used: number | null
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          id?: string
          modifications?: Json | null
          template_id?: string | null
          trip_id?: string | null
          version_used?: number | null
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          id?: string
          modifications?: Json | null
          template_id?: string | null
          trip_id?: string | null
          version_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_template_uses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "itinerary_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_template_uses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: Trip
        Insert: Omit<Trip, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Trip, 'id' | 'created_at' | 'updated_at'>>
      }
      user_presence: {
        Row: {
          document_id: string | null
          id: string
          last_active: string | null
          status: string
          trip_id: string
          user_id: string
        }
        Insert: {
          document_id?: string | null
          id?: string
          last_active?: string | null
          status?: string
          trip_id: string
          user_id: string
        }
        Update: {
          document_id?: string | null
          id?: string
          last_active?: string | null
          status?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      votes: {
        Row: {
          created_at: string | null
          id: string
          itinerary_item_id: string | null
          user_id: string | null
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          itinerary_item_id?: string | null
          user_id?: string | null
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          itinerary_item_id?: string | null
          user_id?: string | null
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_itinerary_item_id_fkey"
            columns: ["itinerary_item_id"]
            isOneToOne: false
            referencedRelation: "itinerary_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      copy_template_to_trip: {
        Args: { p_template_id: string; p_trip_id: string; p_user_id: string }
        Returns: boolean
      }
      create_trip_with_owner: {
        Args: { trip_data: Json; owner_id: string }
        Returns: Json
      }
      generate_random_slug: {
        Args: { length: number }
        Returns: string
      }
      has_trip_role: {
        Args: {
          p_trip_id: string
          p_user_id: string
          p_role: Database["public"]["Enums"]["trip_role"]
        }
        Returns: boolean
      }
      increment_counter: {
        Args: { row_id: string }
        Returns: number
      }
      is_trip_member: {
        Args: { p_trip_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      image_type:
        | "destination"
        | "trip_cover"
        | "user_avatar"
        | "template_cover"
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      trip_role: "admin" | "editor" | "viewer" | "contributor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      image_type: [
        "destination",
        "trip_cover",
        "user_avatar",
        "template_cover",
      ],
      invitation_status: ["pending", "accepted", "declined", "expired"],
      trip_role: ["admin", "editor", "viewer", "contributor"],
    },
  },
} as const

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Explicitly define and export the ItineraryItem type including calculated fields
export type ItineraryItem = Database['public']['Tables']['itinerary_items']['Row'] & {
  user_vote?: "up" | "down" | null; // Optional field added by getItineraryItems
  votes?: number; // Optional field added by getItineraryItems
};
