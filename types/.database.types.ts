export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      ab_test_variants: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          study_id: string;
          updated_at: string | null;
          weight: number | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          study_id: string;
          updated_at?: string | null;
          weight?: number | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          study_id?: string;
          updated_at?: string | null;
          weight?: number | null;
        };
        Relationships: [];
      };
      access_requests: {
        Row: {
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          email: string | null;
          id: string;
          message: string | null;
          name: string | null;
          reason: string | null;
          requested_at: string;
          status: string;
          study_id: string | null;
          trip_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          message?: string | null;
          name?: string | null;
          reason?: string | null;
          requested_at?: string;
          status?: string;
          study_id?: string | null;
          trip_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          message?: string | null;
          name?: string | null;
          reason?: string | null;
          requested_at?: string;
          status?: string;
          study_id?: string | null;
          trip_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'access_requests_approved_by_fkey';
            columns: ['approved_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'access_requests_approved_by_fkey';
            columns: ['approved_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'access_requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'access_requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
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
        Relationships: [
          {
            foreignKeyName: 'albums_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'albums_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
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
            foreignKeyName: 'budget_items_paid_by_fkey';
            columns: ['paid_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
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
      cities: {
        Row: {
          admin_name: string | null;
          capital: string | null;
          city_ascii: string | null;
          continent: string | null;
          country: string;
          created_at: string | null;
          description: string | null;
          fts: unknown | null;
          id: string;
          image_url: string | null;
          iso2: string | null;
          iso3: string | null;
          latitude: number | null;
          longitude: number | null;
          name: string;
          population: number | null;
          simple_maps_id: number | null;
          state_province: string | null;
          updated_at: string | null;
        };
        Insert: {
          admin_name?: string | null;
          capital?: string | null;
          city_ascii?: string | null;
          continent?: string | null;
          country: string;
          created_at?: string | null;
          description?: string | null;
          fts?: unknown | null;
          id?: string;
          image_url?: string | null;
          iso2?: string | null;
          iso3?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          population?: number | null;
          simple_maps_id?: number | null;
          state_province?: string | null;
          updated_at?: string | null;
        };
        Update: {
          admin_name?: string | null;
          capital?: string | null;
          city_ascii?: string | null;
          continent?: string | null;
          country?: string;
          created_at?: string | null;
          description?: string | null;
          fts?: unknown | null;
          id?: string;
          image_url?: string | null;
          iso2?: string | null;
          iso3?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          population?: number | null;
          simple_maps_id?: number | null;
          state_province?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cities_continent_fkey';
            columns: ['continent'];
            isOneToOne: false;
            referencedRelation: 'continents';
            referencedColumns: ['name'];
          },
        ];
      };
      collaborative_notes: {
        Row: {
          content: string | null;
          created_at: string;
          created_by: string;
          id: string;
          is_pinned: boolean;
          last_edited_at: string | null;
          last_edited_by: string | null;
          title: string;
          trip_id: string;
          updated_at: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          created_by: string;
          id?: string;
          is_pinned?: boolean;
          last_edited_at?: string | null;
          last_edited_by?: string | null;
          title: string;
          trip_id: string;
          updated_at?: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          is_pinned?: boolean;
          last_edited_at?: string | null;
          last_edited_by?: string | null;
          title?: string;
          trip_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'collaborative_notes_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'collaborative_notes_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'collaborative_notes_last_edited_by_fkey';
            columns: ['last_edited_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'collaborative_notes_last_edited_by_fkey';
            columns: ['last_edited_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'collaborative_notes_trip_id_fkey';
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
      comment_reactions: {
        Row: {
          comment_id: string;
          created_at: string;
          emoji: string;
          id: string;
          user_id: string;
        };
        Insert: {
          comment_id: string;
          created_at?: string;
          emoji: string;
          id?: string;
          user_id: string;
        };
        Update: {
          comment_id?: string;
          created_at?: string;
          emoji?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comment_reactions_comment_id_fkey';
            columns: ['comment_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          attachment_type: string | null;
          attachment_url: string | null;
          content: string;
          content_id: string;
          content_type: string;
          created_at: string;
          id: string;
          is_deleted: boolean;
          is_edited: boolean;
          metadata: Json | null;
          parent_id: string | null;
          reactions_count: number;
          replies_count: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attachment_type?: string | null;
          attachment_url?: string | null;
          content: string;
          content_id: string;
          content_type: string;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          is_edited?: boolean;
          metadata?: Json | null;
          parent_id?: string | null;
          reactions_count?: number;
          replies_count?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attachment_type?: string | null;
          attachment_url?: string | null;
          content?: string;
          content_id?: string;
          content_type?: string;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          is_edited?: boolean;
          metadata?: Json | null;
          parent_id?: string | null;
          reactions_count?: number;
          replies_count?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
        ];
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
          {
            foreignKeyName: 'content_customizations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_customizations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
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
      content_sharing_history: {
        Row: {
          customizations: Json | null;
          id: string;
          item_id: string | null;
          metadata: Json | null;
          shared_at: string | null;
          shared_by: string | null;
          source_trip_id: string | null;
          target_trip_id: string | null;
        };
        Insert: {
          customizations?: Json | null;
          id?: string;
          item_id?: string | null;
          metadata?: Json | null;
          shared_at?: string | null;
          shared_by?: string | null;
          source_trip_id?: string | null;
          target_trip_id?: string | null;
        };
        Update: {
          customizations?: Json | null;
          id?: string;
          item_id?: string | null;
          metadata?: Json | null;
          shared_at?: string | null;
          shared_by?: string | null;
          source_trip_id?: string | null;
          target_trip_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'content_sharing_history_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_sharing_history_shared_by_fkey';
            columns: ['shared_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_sharing_history_shared_by_fkey';
            columns: ['shared_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'content_sharing_history_source_trip_id_fkey';
            columns: ['source_trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_sharing_history_target_trip_id_fkey';
            columns: ['target_trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      content_slugs: {
        Row: {
          content_id: string;
          content_type: Database['public']['Enums']['content_type'];
          created_at: string | null;
          created_by: string | null;
          id: string;
          is_canonical: boolean | null;
          slug: string;
        };
        Insert: {
          content_id: string;
          content_type: Database['public']['Enums']['content_type'];
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          is_canonical?: boolean | null;
          slug: string;
        };
        Update: {
          content_id?: string;
          content_type?: Database['public']['Enums']['content_type'];
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          is_canonical?: boolean | null;
          slug?: string;
        };
        Relationships: [];
      };
      continents: {
        Row: {
          created_at: string | null;
          description: string | null;
          emoji: string | null;
          id: string;
          name: string;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          emoji?: string | null;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          emoji?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      conversion_goals: {
        Row: {
          created_at: string | null;
          description: string | null;
          event_type: string;
          id: string;
          is_primary: boolean | null;
          name: string;
          study_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          event_type: string;
          id?: string;
          is_primary?: boolean | null;
          name: string;
          study_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          event_type?: string;
          id?: string;
          is_primary?: boolean | null;
          name?: string;
          study_id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      countries: {
        Row: {
          avg_trip_cost: number | null;
          best_seasons: string[] | null;
          continent_id: string | null;
          created_at: string | null;
          currency_id: string | null;
          description: string | null;
          emoji: string | null;
          id: string;
          iso_code: string;
          name: string;
          popular_cities: string[] | null;
          safety_rating: number | null;
          slug: string;
          travel_tips: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          avg_trip_cost?: number | null;
          best_seasons?: string[] | null;
          continent_id?: string | null;
          created_at?: string | null;
          currency_id?: string | null;
          description?: string | null;
          emoji?: string | null;
          id?: string;
          iso_code: string;
          name: string;
          popular_cities?: string[] | null;
          safety_rating?: number | null;
          slug: string;
          travel_tips?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          avg_trip_cost?: number | null;
          best_seasons?: string[] | null;
          continent_id?: string | null;
          created_at?: string | null;
          currency_id?: string | null;
          description?: string | null;
          emoji?: string | null;
          id?: string;
          iso_code?: string;
          name?: string;
          popular_cities?: string[] | null;
          safety_rating?: number | null;
          slug?: string;
          travel_tips?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'countries_continent_id_fkey';
            columns: ['continent_id'];
            isOneToOne: false;
            referencedRelation: 'continents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'countries_currency_id_fkey';
            columns: ['currency_id'];
            isOneToOne: false;
            referencedRelation: 'currencies';
            referencedColumns: ['id'];
          },
        ];
      };
      country_languages: {
        Row: {
          country_id: string;
          is_official: boolean | null;
          language_id: string;
        };
        Insert: {
          country_id: string;
          is_official?: boolean | null;
          language_id: string;
        };
        Update: {
          country_id?: string;
          is_official?: boolean | null;
          language_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'country_languages_country_id_fkey';
            columns: ['country_id'];
            isOneToOne: false;
            referencedRelation: 'countries';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'country_languages_language_id_fkey';
            columns: ['language_id'];
            isOneToOne: false;
            referencedRelation: 'languages';
            referencedColumns: ['id'];
          },
        ];
      };
      currencies: {
        Row: {
          code: string;
          created_at: string | null;
          decimal_digits: number | null;
          id: string;
          name: string;
          symbol: string | null;
          updated_at: string | null;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          decimal_digits?: number | null;
          id?: string;
          name: string;
          symbol?: string | null;
          updated_at?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          decimal_digits?: number | null;
          id?: string;
          name?: string;
          symbol?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      destination_tags: {
        Row: {
          added_by: string | null;
          confidence_score: number | null;
          created_at: string | null;
          destination_id: string | null;
          id: string;
          is_verified: boolean | null;
          tag_id: string | null;
          votes_down: number | null;
          votes_up: number | null;
        };
        Insert: {
          added_by?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          destination_id?: string | null;
          id?: string;
          is_verified?: boolean | null;
          tag_id?: string | null;
          votes_down?: number | null;
          votes_up?: number | null;
        };
        Update: {
          added_by?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          destination_id?: string | null;
          id?: string;
          is_verified?: boolean | null;
          tag_id?: string | null;
          votes_down?: number | null;
          votes_up?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'destination_tags_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'destination_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
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
          city_id: string | null;
          continent: string | null;
          country: string | null;
          created_at: string;
          cuisine_rating: number | null;
          cultural_attractions: number | null;
          currency: string | null;
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
          is_featured: boolean | null;
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
          slug: string | null;
          state_province: string | null;
          time_zone: string | null;
          updated_at: string | null;
          viator_destination_id: string | null;
          visa_required: boolean | null;
          walkability: number | null;
          wifi_connectivity: number | null;
        };
        Insert: {
          accessibility?: number | null;
          address?: string | null;
          avg_cost_per_day?: number | null;
          avg_days?: number | null;
          beach_quality?: number | null;
          best_season?: string | null;
          byline?: string | null;
          city?: string | null;
          city_id?: string | null;
          continent?: string | null;
          country?: string | null;
          created_at?: string;
          cuisine_rating?: number | null;
          cultural_attractions?: number | null;
          currency?: string | null;
          description?: string | null;
          digital_nomad_friendly?: boolean | null;
          eco_friendly_options?: number | null;
          emoji?: string | null;
          family_friendly?: boolean | null;
          highlights?: string | null;
          id?: string;
          image_metadata?: Json | null;
          image_url?: string | null;
          instagram_worthy_spots?: number | null;
          is_featured?: boolean | null;
          latitude?: number | null;
          lgbtq_friendliness?: number | null;
          likes_count?: number | null;
          local_language?: string | null;
          longitude?: number | null;
          mapbox_id?: string | null;
          name?: string | null;
          nightlife_rating?: number | null;
          off_peak_appeal?: number | null;
          outdoor_activities?: number | null;
          perfect_for?: string | null;
          popularity?: number | null;
          public_transportation?: number | null;
          safety_rating?: number | null;
          shopping_rating?: number | null;
          slug?: string | null;
          state_province?: string | null;
          time_zone?: string | null;
          updated_at?: string | null;
          viator_destination_id?: string | null;
          visa_required?: boolean | null;
          walkability?: number | null;
          wifi_connectivity?: number | null;
        };
        Update: {
          accessibility?: number | null;
          address?: string | null;
          avg_cost_per_day?: number | null;
          avg_days?: number | null;
          beach_quality?: number | null;
          best_season?: string | null;
          byline?: string | null;
          city?: string | null;
          city_id?: string | null;
          continent?: string | null;
          country?: string | null;
          created_at?: string;
          cuisine_rating?: number | null;
          cultural_attractions?: number | null;
          currency?: string | null;
          description?: string | null;
          digital_nomad_friendly?: boolean | null;
          eco_friendly_options?: number | null;
          emoji?: string | null;
          family_friendly?: boolean | null;
          highlights?: string | null;
          id?: string;
          image_metadata?: Json | null;
          image_url?: string | null;
          instagram_worthy_spots?: number | null;
          is_featured?: boolean | null;
          latitude?: number | null;
          lgbtq_friendliness?: number | null;
          likes_count?: number | null;
          local_language?: string | null;
          longitude?: number | null;
          mapbox_id?: string | null;
          name?: string | null;
          nightlife_rating?: number | null;
          off_peak_appeal?: number | null;
          outdoor_activities?: number | null;
          perfect_for?: string | null;
          popularity?: number | null;
          public_transportation?: number | null;
          safety_rating?: number | null;
          shopping_rating?: number | null;
          slug?: string | null;
          state_province?: string | null;
          time_zone?: string | null;
          updated_at?: string | null;
          viator_destination_id?: string | null;
          visa_required?: boolean | null;
          walkability?: number | null;
          wifi_connectivity?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_destinations_city';
            columns: ['city_id'];
            isOneToOne: false;
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
        ];
      };
      expenses: {
        Row: {
          amount: number;
          category: string | null;
          created_at: string | null;
          currency: string;
          date: string | null;
          id: string;
          paid_by: string | null;
          source: string | null;
          title: string;
          trip_id: string | null;
          updated_at: string;
        };
        Insert: {
          amount: number;
          category?: string | null;
          created_at?: string | null;
          currency?: string;
          date?: string | null;
          id?: string;
          paid_by?: string | null;
          source?: string | null;
          title: string;
          trip_id?: string | null;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          category?: string | null;
          created_at?: string | null;
          currency?: string;
          date?: string | null;
          id?: string;
          paid_by?: string | null;
          source?: string | null;
          title?: string;
          trip_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'expenses_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      feedback: {
        Row: {
          category: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          message: string;
          page: string | null;
          status: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          message: string;
          page?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          message?: string;
          page?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      focus_sessions: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          expires_at: string | null;
          id: string;
          initiated_by: string;
          message: string | null;
          section_id: string;
          section_name: string;
          section_path: string;
          trip_id: string;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          initiated_by: string;
          message?: string | null;
          section_id: string;
          section_name: string;
          section_path: string;
          trip_id: string;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          initiated_by?: string;
          message?: string | null;
          section_id?: string;
          section_name?: string;
          section_path?: string;
          trip_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'focus_sessions_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      form_fields: {
        Row: {
          config: Json | null;
          form_id: string | null;
          id: string;
          label: string;
          milestone: string | null;
          options: Json | null;
          order: number | null;
          required: boolean;
          type: string;
        };
        Insert: {
          config?: Json | null;
          form_id?: string | null;
          id?: string;
          label: string;
          milestone?: string | null;
          options?: Json | null;
          order?: number | null;
          required?: boolean;
          type: string;
        };
        Update: {
          config?: Json | null;
          form_id?: string | null;
          id?: string;
          label?: string;
          milestone?: string | null;
          options?: Json | null;
          order?: number | null;
          required?: boolean;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'form_fields_form_id_fkey';
            columns: ['form_id'];
            isOneToOne: false;
            referencedRelation: 'forms';
            referencedColumns: ['id'];
          },
        ];
      };
      form_responses: {
        Row: {
          created_at: string;
          form_id: string | null;
          id: string;
          milestone: string | null;
          responses: Json;
          session_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          form_id?: string | null;
          id?: string;
          milestone?: string | null;
          responses: Json;
          session_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          form_id?: string | null;
          id?: string;
          milestone?: string | null;
          responses?: Json;
          session_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'form_responses_form_id_fkey';
            columns: ['form_id'];
            isOneToOne: false;
            referencedRelation: 'forms';
            referencedColumns: ['id'];
          },
        ];
      };
      forms: {
        Row: {
          config: Json;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          milestone_trigger: string | null;
          milestones: Json | null;
          name: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          config: Json;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          milestone_trigger?: string | null;
          milestones?: Json | null;
          name: string;
          type: string;
          updated_at?: string;
        };
        Update: {
          config?: Json;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          milestone_trigger?: string | null;
          milestones?: Json | null;
          name?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      friend_requests: {
        Row: {
          created_at: string;
          id: string;
          receiver_id: string;
          responded_at: string | null;
          sender_id: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          receiver_id: string;
          responded_at?: string | null;
          sender_id: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          receiver_id?: string;
          responded_at?: string | null;
          sender_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'friend_requests_receiver_id_fkey';
            columns: ['receiver_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'friend_requests_receiver_id_fkey';
            columns: ['receiver_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'friend_requests_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'friend_requests_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      friends: {
        Row: {
          created_at: string;
          id: string;
          user_id_1: string;
          user_id_2: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          user_id_1: string;
          user_id_2: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          user_id_1?: string;
          user_id_2?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'friends_user_id_1_fkey';
            columns: ['user_id_1'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'friends_user_id_1_fkey';
            columns: ['user_id_1'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'friends_user_id_2_fkey';
            columns: ['user_id_2'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'friends_user_id_2_fkey';
            columns: ['user_id_2'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      group_activities: {
        Row: {
          activity_type: string;
          created_at: string | null;
          details: Json | null;
          group_id: string | null;
          guest_token: string | null;
          id: string;
          trip_id: string | null;
          user_id: string | null;
        };
        Insert: {
          activity_type: string;
          created_at?: string | null;
          details?: Json | null;
          group_id?: string | null;
          guest_token?: string | null;
          id?: string;
          trip_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          activity_type?: string;
          created_at?: string | null;
          details?: Json | null;
          group_id?: string | null;
          guest_token?: string | null;
          id?: string;
          trip_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'group_activities_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'discoverable_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_activities_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_activities_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'user_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_activities_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      group_board_log: {
        Row: {
          action: string;
          created_at: string | null;
          entity_id: string | null;
          entity_type: string;
          error_message: string | null;
          group_id: string;
          guest_token: string | null;
          id: string;
          ip_address: unknown | null;
          new_data: Json | null;
          old_data: Json | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type: string;
          error_message?: string | null;
          group_id: string;
          guest_token?: string | null;
          id?: string;
          ip_address?: unknown | null;
          new_data?: Json | null;
          old_data?: Json | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type?: string;
          error_message?: string | null;
          group_id?: string;
          guest_token?: string | null;
          id?: string;
          ip_address?: unknown | null;
          new_data?: Json | null;
          old_data?: Json | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      group_guest_members: {
        Row: {
          created_at: string | null;
          group_id: string | null;
          guest_token: string;
          id: string;
        };
        Insert: {
          created_at?: string | null;
          group_id?: string | null;
          guest_token: string;
          id?: string;
        };
        Update: {
          created_at?: string | null;
          group_id?: string | null;
          guest_token?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'group_guest_members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'discoverable_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_guest_members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_guest_members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'user_groups';
            referencedColumns: ['id'];
          },
        ];
      };
      group_members: {
        Row: {
          group_id: string;
          guest_token: string | null;
          invitation_email: string | null;
          invitation_expires_at: string | null;
          invitation_token: string | null;
          joined_at: string | null;
          role: string;
          status: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          group_id: string;
          guest_token?: string | null;
          invitation_email?: string | null;
          invitation_expires_at?: string | null;
          invitation_token?: string | null;
          joined_at?: string | null;
          role?: string;
          status?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          group_id?: string;
          guest_token?: string | null;
          invitation_email?: string | null;
          invitation_expires_at?: string | null;
          invitation_token?: string | null;
          joined_at?: string | null;
          role?: string;
          status?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'group_members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'discoverable_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'user_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_members_user_id_fkey1';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_members_user_id_fkey1';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      group_plan_idea_comments: {
        Row: {
          content: string;
          created_at: string | null;
          guest_token: string | null;
          id: string;
          idea_id: string | null;
          parent_id: string | null;
          user_id: string | null;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          guest_token?: string | null;
          id?: string;
          idea_id?: string | null;
          parent_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          guest_token?: string | null;
          id?: string;
          idea_id?: string | null;
          parent_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'group_idea_comments_idea_id_fkey';
            columns: ['idea_id'];
            isOneToOne: false;
            referencedRelation: 'group_plan_ideas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_idea_comments_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'group_plan_idea_comments';
            referencedColumns: ['id'];
          },
        ];
      };
      group_plan_idea_reactions: {
        Row: {
          created_at: string | null;
          emoji: string;
          guest_token: string | null;
          id: string;
          idea_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          emoji: string;
          guest_token?: string | null;
          id?: string;
          idea_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          emoji?: string;
          guest_token?: string | null;
          id?: string;
          idea_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'group_idea_reactions_idea_id_fkey';
            columns: ['idea_id'];
            isOneToOne: false;
            referencedRelation: 'group_plan_ideas';
            referencedColumns: ['id'];
          },
        ];
      };
      group_plan_idea_votes: {
        Row: {
          created_at: string;
          guest_token: string | null;
          id: string;
          idea_id: string;
          user_id: string | null;
          vote_type: string;
        };
        Insert: {
          created_at?: string;
          guest_token?: string | null;
          id?: string;
          idea_id: string;
          user_id?: string | null;
          vote_type: string;
        };
        Update: {
          created_at?: string;
          guest_token?: string | null;
          id?: string;
          idea_id?: string;
          user_id?: string | null;
          vote_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'group_idea_votes_idea_id_fkey';
            columns: ['idea_id'];
            isOneToOne: false;
            referencedRelation: 'group_plan_ideas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_idea_votes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_idea_votes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      group_plan_ideas: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          group_id: string;
          guest_token: string | null;
          id: string;
          meta: Json | null;
          plan_id: string | null;
          position: Json | null;
          title: string;
          type: Database['public']['Enums']['group_idea_type'];
          updated_at: string;
          votes_down: number;
          votes_up: number;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          group_id: string;
          guest_token?: string | null;
          id?: string;
          meta?: Json | null;
          plan_id?: string | null;
          position?: Json | null;
          title: string;
          type?: Database['public']['Enums']['group_idea_type'];
          updated_at?: string;
          votes_down?: number;
          votes_up?: number;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          group_id?: string;
          guest_token?: string | null;
          id?: string;
          meta?: Json | null;
          plan_id?: string | null;
          position?: Json | null;
          title?: string;
          type?: Database['public']['Enums']['group_idea_type'];
          updated_at?: string;
          votes_down?: number;
          votes_up?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'group_ideas_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_ideas_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'group_ideas_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'discoverable_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_ideas_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_ideas_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'user_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_ideas_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'group_plans';
            referencedColumns: ['id'];
          },
        ];
      };
      group_plans: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          created_by_guest_token: string | null;
          description: string | null;
          group_id: string | null;
          guest_token: string | null;
          id: string;
          is_archived: boolean | null;
          name: string;
          slug: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          created_by_guest_token?: string | null;
          description?: string | null;
          group_id?: string | null;
          guest_token?: string | null;
          id?: string;
          is_archived?: boolean | null;
          name: string;
          slug?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          created_by_guest_token?: string | null;
          description?: string | null;
          group_id?: string | null;
          guest_token?: string | null;
          id?: string;
          is_archived?: boolean | null;
          name?: string;
          slug?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'group_idea_plans_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_idea_plans_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'group_idea_plans_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'discoverable_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_idea_plans_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_idea_plans_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'user_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_plans_guest_token_fkey';
            columns: ['guest_token'];
            isOneToOne: false;
            referencedRelation: 'guest_tokens';
            referencedColumns: ['id'];
          },
        ];
      };
      group_plans_log: {
        Row: {
          action: string;
          created_at: string | null;
          error_message: string | null;
          group_id: string;
          guest_token: string | null;
          id: string;
          ip_address: unknown | null;
          new_data: Json | null;
          old_data: Json | null;
          plan_id: string;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          error_message?: string | null;
          group_id: string;
          guest_token?: string | null;
          id?: string;
          ip_address?: unknown | null;
          new_data?: Json | null;
          old_data?: Json | null;
          plan_id: string;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          error_message?: string | null;
          group_id?: string;
          guest_token?: string | null;
          id?: string;
          ip_address?: unknown | null;
          new_data?: Json | null;
          old_data?: Json | null;
          plan_id?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      group_roles: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_custom: boolean;
          is_default: boolean;
          label: string;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_custom?: boolean;
          is_default?: boolean;
          label: string;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_custom?: boolean;
          is_default?: boolean;
          label?: string;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      group_trips: {
        Row: {
          added_at: string | null;
          added_by: string | null;
          display_order: number | null;
          group_id: string;
          is_featured: boolean | null;
          notes: string | null;
          trip_id: string;
          updated_at: string | null;
        };
        Insert: {
          added_at?: string | null;
          added_by?: string | null;
          display_order?: number | null;
          group_id: string;
          is_featured?: boolean | null;
          notes?: string | null;
          trip_id: string;
          updated_at?: string | null;
        };
        Update: {
          added_at?: string | null;
          added_by?: string | null;
          display_order?: number | null;
          group_id?: string;
          is_featured?: boolean | null;
          notes?: string | null;
          trip_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'group_trips_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'discoverable_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_trips_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_trips_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'user_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_trips_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      groups: {
        Row: {
          cover_image_url: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          emoji: string | null;
          guest_token: string | null;
          id: string;
          member_count: number | null;
          name: string;
          primary_city_id: string | null;
          slug: string;
          thumbnail_url: string | null;
          trip_count: number | null;
          updated_at: string | null;
          visibility: string;
        };
        Insert: {
          cover_image_url?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          emoji?: string | null;
          guest_token?: string | null;
          id?: string;
          member_count?: number | null;
          name: string;
          primary_city_id?: string | null;
          slug: string;
          thumbnail_url?: string | null;
          trip_count?: number | null;
          updated_at?: string | null;
          visibility?: string;
        };
        Update: {
          cover_image_url?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          emoji?: string | null;
          guest_token?: string | null;
          id?: string;
          member_count?: number | null;
          name?: string;
          primary_city_id?: string | null;
          slug?: string;
          thumbnail_url?: string | null;
          trip_count?: number | null;
          updated_at?: string | null;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'groups_created_by_fkey1';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'groups_created_by_fkey1';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'groups_primary_city_id_fkey';
            columns: ['primary_city_id'];
            isOneToOne: false;
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
        ];
      };
      guest_tokens: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          expires_at: string | null;
          group_id: string | null;
          id: string;
          token: string;
          trip_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          expires_at?: string | null;
          group_id?: string | null;
          id?: string;
          token: string;
          trip_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          expires_at?: string | null;
          group_id?: string | null;
          id?: string;
          token?: string;
          trip_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'guest_tokens_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'guest_tokens_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'guest_tokens_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'discoverable_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'guest_tokens_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'guest_tokens_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'user_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'guest_tokens_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      image_metadata: {
        Row: {
          alt_text: string | null;
          attribution: string | null;
          attribution_html: string | null;
          created_at: string | null;
          entity_id: string;
          entity_type: Database['public']['Enums']['image_type'];
          focal_point_x: number | null;
          focal_point_y: number | null;
          height: number | null;
          id: string;
          license: string | null;
          photographer_name: string | null;
          photographer_url: string | null;
          source: string;
          source_id: string | null;
          updated_at: string | null;
          url: string;
          width: number | null;
        };
        Insert: {
          alt_text?: string | null;
          attribution?: string | null;
          attribution_html?: string | null;
          created_at?: string | null;
          entity_id: string;
          entity_type: Database['public']['Enums']['image_type'];
          focal_point_x?: number | null;
          focal_point_y?: number | null;
          height?: number | null;
          id?: string;
          license?: string | null;
          photographer_name?: string | null;
          photographer_url?: string | null;
          source: string;
          source_id?: string | null;
          updated_at?: string | null;
          url: string;
          width?: number | null;
        };
        Update: {
          alt_text?: string | null;
          attribution?: string | null;
          attribution_html?: string | null;
          created_at?: string | null;
          entity_id?: string;
          entity_type?: Database['public']['Enums']['image_type'];
          focal_point_x?: number | null;
          focal_point_y?: number | null;
          height?: number | null;
          id?: string;
          license?: string | null;
          photographer_name?: string | null;
          photographer_url?: string | null;
          source?: string;
          source_id?: string | null;
          updated_at?: string | null;
          url?: string;
          width?: number | null;
        };
        Relationships: [];
      };
      images: {
        Row: {
          alt_text: string | null;
          attribution_html: string | null;
          city_id: string | null;
          created_at: string | null;
          created_by: string | null;
          destination_id: string | null;
          external_id: string | null;
          height: number | null;
          id: number;
          image_url: string;
          metadata: Json | null;
          photographer: string | null;
          photographer_url: string | null;
          ref_id: string | null;
          source: string;
          thumb_url: string | null;
          trip_id: string | null;
          updated_at: string | null;
          url: string;
          user_id: string | null;
          width: number | null;
        };
        Insert: {
          alt_text?: string | null;
          attribution_html?: string | null;
          city_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          destination_id?: string | null;
          external_id?: string | null;
          height?: number | null;
          id?: number;
          image_url: string;
          metadata?: Json | null;
          photographer?: string | null;
          photographer_url?: string | null;
          ref_id?: string | null;
          source: string;
          thumb_url?: string | null;
          trip_id?: string | null;
          updated_at?: string | null;
          url: string;
          user_id?: string | null;
          width?: number | null;
        };
        Update: {
          alt_text?: string | null;
          attribution_html?: string | null;
          city_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          destination_id?: string | null;
          external_id?: string | null;
          height?: number | null;
          id?: number;
          image_url?: string;
          metadata?: Json | null;
          photographer?: string | null;
          photographer_url?: string | null;
          ref_id?: string | null;
          source?: string;
          thumb_url?: string | null;
          trip_id?: string | null;
          updated_at?: string | null;
          url?: string;
          user_id?: string | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'images_city_id_fkey';
            columns: ['city_id'];
            isOneToOne: false;
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'images_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'images_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'images_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'images_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      invitations: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          group_id: string | null;
          id: number;
          invitation_status: Database['public']['Enums']['invitation_status'];
          invited_by: string | null;
          inviter_id: string | null;
          metadata: Json | null;
          sender_id: string | null;
          status: Database['public']['Enums']['invitation_status'] | null;
          token: string;
          trip_id: string | null;
          type: Database['public']['Enums']['invitation_type'];
          used: boolean | null;
          used_by: string | null;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          email: string;
          expires_at: string;
          group_id?: string | null;
          id?: number;
          invitation_status?: Database['public']['Enums']['invitation_status'];
          invited_by?: string | null;
          inviter_id?: string | null;
          metadata?: Json | null;
          sender_id?: string | null;
          status?: Database['public']['Enums']['invitation_status'] | null;
          token: string;
          trip_id?: string | null;
          type?: Database['public']['Enums']['invitation_type'];
          used?: boolean | null;
          used_by?: string | null;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          group_id?: string | null;
          id?: number;
          invitation_status?: Database['public']['Enums']['invitation_status'];
          invited_by?: string | null;
          inviter_id?: string | null;
          metadata?: Json | null;
          sender_id?: string | null;
          status?: Database['public']['Enums']['invitation_status'] | null;
          token?: string;
          trip_id?: string | null;
          type?: Database['public']['Enums']['invitation_type'];
          used?: boolean | null;
          used_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'invitations_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'discoverable_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invitations_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invitations_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'user_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invitations_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invitations_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'invitations_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invitations_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'invitations_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      item_popularity_metrics: {
        Row: {
          id: string;
          item_id: string | null;
          last_updated: string | null;
          likes_last_24h: number | null;
          likes_last_30d: number | null;
          likes_last_7d: number | null;
          shares_last_24h: number | null;
          shares_last_30d: number | null;
          shares_last_7d: number | null;
          trending_score: number | null;
          views_last_24h: number | null;
          views_last_30d: number | null;
          views_last_7d: number | null;
        };
        Insert: {
          id?: string;
          item_id?: string | null;
          last_updated?: string | null;
          likes_last_24h?: number | null;
          likes_last_30d?: number | null;
          likes_last_7d?: number | null;
          shares_last_24h?: number | null;
          shares_last_30d?: number | null;
          shares_last_7d?: number | null;
          trending_score?: number | null;
          views_last_24h?: number | null;
          views_last_30d?: number | null;
          views_last_7d?: number | null;
        };
        Update: {
          id?: string;
          item_id?: string | null;
          last_updated?: string | null;
          likes_last_24h?: number | null;
          likes_last_30d?: number | null;
          likes_last_7d?: number | null;
          shares_last_24h?: number | null;
          shares_last_30d?: number | null;
          shares_last_7d?: number | null;
          trending_score?: number | null;
          views_last_24h?: number | null;
          views_last_30d?: number | null;
          views_last_7d?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'item_popularity_metrics_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: true;
            referencedRelation: 'itinerary_items';
            referencedColumns: ['id'];
          },
        ];
      };
      itinerary_item_comment_reactions: {
        Row: {
          comment_id: number;
          created_at: string | null;
          emoji: string;
          id: string;
          user_id: string;
        };
        Insert: {
          comment_id: number;
          created_at?: string | null;
          emoji: string;
          id?: string;
          user_id: string;
        };
        Update: {
          comment_id?: number;
          created_at?: string | null;
          emoji?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'itinerary_item_comment_reactions_comment_id_fkey';
            columns: ['comment_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_item_comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_item_comment_reactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_item_comment_reactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      itinerary_item_comments: {
        Row: {
          content: string | null;
          created_at: string;
          guest_token: string | null;
          id: number;
          item_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          guest_token?: string | null;
          id?: number;
          item_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          guest_token?: string | null;
          id?: number;
          item_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'itinerary_item_comments_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_item_comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_item_comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      itinerary_item_reactions: {
        Row: {
          created_at: string;
          emoji: string;
          id: string;
          itinerary_item_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          emoji: string;
          id?: string;
          itinerary_item_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          emoji?: string;
          id?: string;
          itinerary_item_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_itinerary_item_reactions_profiles';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_itinerary_item_reactions_profiles';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'itinerary_item_reactions_itinerary_item_id_fkey';
            columns: ['itinerary_item_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_item_reactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_item_reactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      itinerary_item_votes: {
        Row: {
          created_at: string;
          id: string;
          itinerary_item_id: string;
          updated_at: string;
          user_id: string;
          vote: Database['public']['Enums']['vote_type'];
        };
        Insert: {
          created_at?: string;
          id?: string;
          itinerary_item_id: string;
          updated_at?: string;
          user_id: string;
          vote: Database['public']['Enums']['vote_type'];
        };
        Update: {
          created_at?: string;
          id?: string;
          itinerary_item_id?: string;
          updated_at?: string;
          user_id?: string;
          vote?: Database['public']['Enums']['vote_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'itinerary_item_votes_itinerary_item_id_fkey';
            columns: ['itinerary_item_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_item_votes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_item_votes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
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
          day: number | null;
          day_number: number | null;
          description: string | null;
          duration_minutes: number | null;
          end_time: string | null;
          estimated_cost: number | null;
          guest_token: string | null;
          id: string;
          is_custom: boolean | null;
          is_favorite: boolean;
          item_type: string | null;
          last_modified_by: string | null;
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
          votes: Json | null;
        };
        Insert: {
          address?: string | null;
          attribution_metadata?: Json | null;
          attribution_type?: string | null;
          canonical_url?: string | null;
          category?: Database['public']['Enums']['itinerary_category'] | null;
          content_layer?: string | null;
          cost?: number | null;
          cover_image_url?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string | null;
          date?: string | null;
          day?: number | null;
          day_number?: number | null;
          description?: string | null;
          duration_minutes?: number | null;
          end_time?: string | null;
          estimated_cost?: number | null;
          guest_token?: string | null;
          id?: string;
          is_custom?: boolean | null;
          is_favorite?: boolean;
          item_type?: string | null;
          last_modified_by?: string | null;
          latitude?: number | null;
          like_count?: number | null;
          location?: string | null;
          longitude?: number | null;
          meta_keywords?: string[] | null;
          notes?: string | null;
          original_id?: string | null;
          place_id?: string | null;
          position?: number | null;
          section_id?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          share_count?: number | null;
          share_status?: string | null;
          slug?: string | null;
          source_trip_id?: string | null;
          start_time?: string | null;
          status?: Database['public']['Enums']['item_status'] | null;
          structured_data?: Json | null;
          title: string;
          trip_id?: string | null;
          type?: string | null;
          updated_at?: string | null;
          view_count?: number | null;
          votes?: Json | null;
        };
        Update: {
          address?: string | null;
          attribution_metadata?: Json | null;
          attribution_type?: string | null;
          canonical_url?: string | null;
          category?: Database['public']['Enums']['itinerary_category'] | null;
          content_layer?: string | null;
          cost?: number | null;
          cover_image_url?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string | null;
          date?: string | null;
          day?: number | null;
          day_number?: number | null;
          description?: string | null;
          duration_minutes?: number | null;
          end_time?: string | null;
          estimated_cost?: number | null;
          guest_token?: string | null;
          id?: string;
          is_custom?: boolean | null;
          is_favorite?: boolean;
          item_type?: string | null;
          last_modified_by?: string | null;
          latitude?: number | null;
          like_count?: number | null;
          location?: string | null;
          longitude?: number | null;
          meta_keywords?: string[] | null;
          notes?: string | null;
          original_id?: string | null;
          place_id?: string | null;
          position?: number | null;
          section_id?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          share_count?: number | null;
          share_status?: string | null;
          slug?: string | null;
          source_trip_id?: string | null;
          start_time?: string | null;
          status?: Database['public']['Enums']['item_status'] | null;
          structured_data?: Json | null;
          title?: string;
          trip_id?: string | null;
          type?: string | null;
          updated_at?: string | null;
          view_count?: number | null;
          votes?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_itinerary_items_creator';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_itinerary_items_creator';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'fk_itinerary_items_trip';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_items_original_id_fkey';
            columns: ['original_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_items_section_id_fkey';
            columns: ['section_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_sections';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_items_source_trip_id_fkey';
            columns: ['source_trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_items_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      itinerary_sections: {
        Row: {
          created_at: string;
          date: string | null;
          day_number: number;
          id: string;
          position: number;
          title: string | null;
          trip_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          date?: string | null;
          day_number: number;
          id?: string;
          position?: number;
          title?: string | null;
          trip_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          date?: string | null;
          day_number?: number;
          id?: string;
          position?: number;
          title?: string | null;
          trip_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'itinerary_sections_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      itinerary_template_items: {
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
          day: number;
          day_number: number | null;
          description: string | null;
          duration_minutes: number | null;
          end_time: string | null;
          estimated_cost: number | null;
          id: string;
          is_custom: boolean | null;
          is_favorite: boolean | null;
          item_order: number;
          item_type: string | null;
          last_modified_by: string | null;
          latitude: number | null;
          like_count: number | null;
          location: string | null;
          longitude: number | null;
          meta_keywords: string[] | null;
          notes: string | null;
          original_id: string | null;
          place_id: string | null;
          position: number | null;
          section_id: number | null;
          seo_description: string | null;
          seo_title: string | null;
          share_count: number | null;
          share_status: string | null;
          slug: string | null;
          source_trip_id: string | null;
          start_time: string | null;
          status: Database['public']['Enums']['item_status'] | null;
          structured_data: Json | null;
          template_id: string;
          title: string | null;
          trip_id: string | null;
          type: string | null;
          updated_at: string | null;
          view_count: number | null;
          votes: Json | null;
        };
        Insert: {
          address?: string | null;
          attribution_metadata?: Json | null;
          attribution_type?: string | null;
          canonical_url?: string | null;
          category?: Database['public']['Enums']['itinerary_category'] | null;
          content_layer?: string | null;
          cost?: number | null;
          cover_image_url?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string | null;
          date?: string | null;
          day: number;
          day_number?: number | null;
          description?: string | null;
          duration_minutes?: number | null;
          end_time?: string | null;
          estimated_cost?: number | null;
          id?: string;
          is_custom?: boolean | null;
          is_favorite?: boolean | null;
          item_order?: number;
          item_type?: string | null;
          last_modified_by?: string | null;
          latitude?: number | null;
          like_count?: number | null;
          location?: string | null;
          longitude?: number | null;
          meta_keywords?: string[] | null;
          notes?: string | null;
          original_id?: string | null;
          place_id?: string | null;
          position?: number | null;
          section_id?: number | null;
          seo_description?: string | null;
          seo_title?: string | null;
          share_count?: number | null;
          share_status?: string | null;
          slug?: string | null;
          source_trip_id?: string | null;
          start_time?: string | null;
          status?: Database['public']['Enums']['item_status'] | null;
          structured_data?: Json | null;
          template_id: string;
          title?: string | null;
          trip_id?: string | null;
          type?: string | null;
          updated_at?: string | null;
          view_count?: number | null;
          votes?: Json | null;
        };
        Update: {
          address?: string | null;
          attribution_metadata?: Json | null;
          attribution_type?: string | null;
          canonical_url?: string | null;
          category?: Database['public']['Enums']['itinerary_category'] | null;
          content_layer?: string | null;
          cost?: number | null;
          cover_image_url?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string | null;
          date?: string | null;
          day?: number;
          day_number?: number | null;
          description?: string | null;
          duration_minutes?: number | null;
          end_time?: string | null;
          estimated_cost?: number | null;
          id?: string;
          is_custom?: boolean | null;
          is_favorite?: boolean | null;
          item_order?: number;
          item_type?: string | null;
          last_modified_by?: string | null;
          latitude?: number | null;
          like_count?: number | null;
          location?: string | null;
          longitude?: number | null;
          meta_keywords?: string[] | null;
          notes?: string | null;
          original_id?: string | null;
          place_id?: string | null;
          position?: number | null;
          section_id?: number | null;
          seo_description?: string | null;
          seo_title?: string | null;
          share_count?: number | null;
          share_status?: string | null;
          slug?: string | null;
          source_trip_id?: string | null;
          start_time?: string | null;
          status?: Database['public']['Enums']['item_status'] | null;
          structured_data?: Json | null;
          template_id?: string;
          title?: string | null;
          trip_id?: string | null;
          type?: string | null;
          updated_at?: string | null;
          view_count?: number | null;
          votes?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_itinerary_template_items_section_id';
            columns: ['section_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_template_sections';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_itinerary_template_items_template_id';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_templates';
            referencedColumns: ['id'];
          },
        ];
      };
      itinerary_template_sections: {
        Row: {
          created_at: string;
          created_by: string | null;
          date: string | null;
          day_number: number;
          destination_id: string | null;
          id: number;
          position: number;
          template_id: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          date?: string | null;
          day_number: number;
          destination_id?: string | null;
          id?: number;
          position?: number;
          template_id: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          date?: string | null;
          day_number?: number;
          destination_id?: string | null;
          id?: number;
          position?: number;
          template_id?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'itinerary_template_sections_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_template_sections_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'itinerary_template_sections_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_template_sections_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_templates';
            referencedColumns: ['id'];
          },
        ];
      };
      itinerary_templates: {
        Row: {
          category: string;
          copied_count: number | null;
          cover_image_url: string | null;
          created_at: string | null;
          created_by: string;
          description: string | null;
          destination_id: string;
          duration_days: number;
          featured: boolean | null;
          groupsize: string | null;
          id: string;
          is_draft: boolean | null;
          is_published: boolean | null;
          last_copied_at: string | null;
          like_count: number | null;
          metadata: Json | null;
          slug: string | null;
          source_trip_id: string | null;
          tags: string[] | null;
          template_type: string | null;
          title: string;
          updated_at: string | null;
          use_count: number | null;
          version: number | null;
          view_count: number | null;
        };
        Insert: {
          category: string;
          copied_count?: number | null;
          cover_image_url?: string | null;
          created_at?: string | null;
          created_by: string;
          description?: string | null;
          destination_id: string;
          duration_days: number;
          featured?: boolean | null;
          groupsize?: string | null;
          id?: string;
          is_draft?: boolean | null;
          is_published?: boolean | null;
          last_copied_at?: string | null;
          like_count?: number | null;
          metadata?: Json | null;
          slug?: string | null;
          source_trip_id?: string | null;
          tags?: string[] | null;
          template_type?: string | null;
          title: string;
          updated_at?: string | null;
          use_count?: number | null;
          version?: number | null;
          view_count?: number | null;
        };
        Update: {
          category?: string;
          copied_count?: number | null;
          cover_image_url?: string | null;
          created_at?: string | null;
          created_by?: string;
          description?: string | null;
          destination_id?: string;
          duration_days?: number;
          featured?: boolean | null;
          groupsize?: string | null;
          id?: string;
          is_draft?: boolean | null;
          is_published?: boolean | null;
          last_copied_at?: string | null;
          like_count?: number | null;
          metadata?: Json | null;
          slug?: string | null;
          source_trip_id?: string | null;
          tags?: string[] | null;
          template_type?: string | null;
          title?: string;
          updated_at?: string | null;
          use_count?: number | null;
          version?: number | null;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'itinerary_templates_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_templates_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'itinerary_templates_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_templates_source_trip_id_fkey';
            columns: ['source_trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      languages: {
        Row: {
          code: string;
          created_at: string | null;
          id: string;
          name: string;
          native_name: string | null;
          updated_at: string | null;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          id?: string;
          name: string;
          native_name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          id?: string;
          name?: string;
          native_name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          created_at: string;
          id: string;
          item_id: string;
          item_type: Database['public']['Enums']['content_type'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_id: string;
          item_type: Database['public']['Enums']['content_type'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string;
          item_type?: Database['public']['Enums']['content_type'];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          parent_id: string | null;
          type: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          parent_id?: string | null;
          type: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          parent_id?: string | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'locations_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
        ];
      };
      milestone_triggers: {
        Row: {
          active: boolean;
          config: Json | null;
          event_type: string;
          form_id: string | null;
          id: string;
        };
        Insert: {
          active?: boolean;
          config?: Json | null;
          event_type: string;
          form_id?: string | null;
          id?: string;
        };
        Update: {
          active?: boolean;
          config?: Json | null;
          event_type?: string;
          form_id?: string | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'milestone_triggers_form_id_fkey';
            columns: ['form_id'];
            isOneToOne: false;
            referencedRelation: 'forms';
            referencedColumns: ['id'];
          },
        ];
      };
      note_tags: {
        Row: {
          assigned_at: string;
          note_id: string;
          tag_id: string;
        };
        Insert: {
          assigned_at?: string;
          note_id: string;
          tag_id: string;
        };
        Update: {
          assigned_at?: string;
          note_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'note_tags_note_id_fkey';
            columns: ['note_id'];
            isOneToOne: false;
            referencedRelation: 'trip_notes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'note_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_analytics: {
        Row: {
          action: string;
          created_at: string;
          device_info: string | null;
          id: string;
          metadata: Json | null;
          notification_id: string;
          notification_type: string | null;
          reference_id: string | null;
          reference_type: string | null;
          user_id: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          device_info?: string | null;
          id?: string;
          metadata?: Json | null;
          notification_id: string;
          notification_type?: string | null;
          reference_id?: string | null;
          reference_type?: string | null;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          device_info?: string | null;
          id?: string;
          metadata?: Json | null;
          notification_id?: string;
          notification_type?: string | null;
          reference_id?: string | null;
          reference_type?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      notification_history: {
        Row: {
          action_url: string | null;
          archived_at: string | null;
          content: string;
          created_at: string | null;
          expires_at: string | null;
          id: string;
          notification_type: string;
          priority: string | null;
          read: boolean | null;
          reference_id: string | null;
          reference_type: string | null;
          sender_id: string | null;
          title: string;
          trip_id: string | null;
          user_id: string;
        };
        Insert: {
          action_url?: string | null;
          archived_at?: string | null;
          content: string;
          created_at?: string | null;
          expires_at?: string | null;
          id: string;
          notification_type: string;
          priority?: string | null;
          read?: boolean | null;
          reference_id?: string | null;
          reference_type?: string | null;
          sender_id?: string | null;
          title: string;
          trip_id?: string | null;
          user_id: string;
        };
        Update: {
          action_url?: string | null;
          archived_at?: string | null;
          content?: string;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          notification_type?: string;
          priority?: string | null;
          read?: boolean | null;
          reference_id?: string | null;
          reference_type?: string | null;
          sender_id?: string | null;
          title?: string;
          trip_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notification_history_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_preferences: {
        Row: {
          comments: boolean | null;
          created_at: string | null;
          digest_frequency: string | null;
          email_enabled: boolean | null;
          focus_events: boolean | null;
          id: string;
          in_app_enabled: boolean | null;
          itinerary_changes: boolean | null;
          member_activity: boolean | null;
          muted_types: string[] | null;
          push_enabled: boolean | null;
          quiet_hours: Json | null;
          trip_updates: boolean | null;
          updated_at: string | null;
          user_id: string;
          votes: boolean | null;
        };
        Insert: {
          comments?: boolean | null;
          created_at?: string | null;
          digest_frequency?: string | null;
          email_enabled?: boolean | null;
          focus_events?: boolean | null;
          id?: string;
          in_app_enabled?: boolean | null;
          itinerary_changes?: boolean | null;
          member_activity?: boolean | null;
          muted_types?: string[] | null;
          push_enabled?: boolean | null;
          quiet_hours?: Json | null;
          trip_updates?: boolean | null;
          updated_at?: string | null;
          user_id: string;
          votes?: boolean | null;
        };
        Update: {
          comments?: boolean | null;
          created_at?: string | null;
          digest_frequency?: string | null;
          email_enabled?: boolean | null;
          focus_events?: boolean | null;
          id?: string;
          in_app_enabled?: boolean | null;
          itinerary_changes?: boolean | null;
          member_activity?: boolean | null;
          muted_types?: string[] | null;
          push_enabled?: boolean | null;
          quiet_hours?: Json | null;
          trip_updates?: boolean | null;
          updated_at?: string | null;
          user_id?: string;
          votes?: boolean | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          action_url: string | null;
          archived: boolean;
          archived_at: string | null;
          content: string;
          created_at: string | null;
          expires_at: string | null;
          group_key: string | null;
          id: string;
          notification_type: string;
          priority: string | null;
          read: boolean | null;
          reference_id: string | null;
          reference_type: string | null;
          sender_id: string | null;
          title: string;
          trip_id: string | null;
          user_id: string;
        };
        Insert: {
          action_url?: string | null;
          archived?: boolean;
          archived_at?: string | null;
          content: string;
          created_at?: string | null;
          expires_at?: string | null;
          group_key?: string | null;
          id?: string;
          notification_type: string;
          priority?: string | null;
          read?: boolean | null;
          reference_id?: string | null;
          reference_type?: string | null;
          sender_id?: string | null;
          title: string;
          trip_id?: string | null;
          user_id: string;
        };
        Update: {
          action_url?: string | null;
          archived?: boolean;
          archived_at?: string | null;
          content?: string;
          created_at?: string | null;
          expires_at?: string | null;
          group_key?: string | null;
          id?: string;
          notification_type?: string;
          priority?: string | null;
          read?: boolean | null;
          reference_id?: string | null;
          reference_type?: string | null;
          sender_id?: string | null;
          title?: string;
          trip_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_notifications_sender_id';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_notifications_sender_id';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'notifications_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      onboarding_events: {
        Row: {
          created_at: string | null;
          event_data: Json | null;
          event_type: string;
          id: string;
          session_id: string | null;
          step_id: string | null;
          tour_id: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          event_data?: Json | null;
          event_type: string;
          id?: string;
          session_id?: string | null;
          step_id?: string | null;
          tour_id?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          event_data?: Json | null;
          event_type?: string;
          id?: string;
          session_id?: string | null;
          step_id?: string | null;
          tour_id?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      onboarding_preferences: {
        Row: {
          feature_id: string;
          id: string;
          is_enabled: boolean | null;
          notification_level: string | null;
          preferences: Json | null;
          show_tours: boolean | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          feature_id: string;
          id?: string;
          is_enabled?: boolean | null;
          notification_level?: string | null;
          preferences?: Json | null;
          show_tours?: boolean | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          feature_id?: string;
          id?: string;
          is_enabled?: boolean | null;
          notification_level?: string | null;
          preferences?: Json | null;
          show_tours?: boolean | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      onboarding_tour_completions: {
        Row: {
          completed_at: string | null;
          id: string;
          is_skipped: boolean | null;
          steps_viewed: number | null;
          time_spent: number | null;
          tour_id: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          id?: string;
          is_skipped?: boolean | null;
          steps_viewed?: number | null;
          time_spent?: number | null;
          tour_id: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          id?: string;
          is_skipped?: boolean | null;
          steps_viewed?: number | null;
          time_spent?: number | null;
          tour_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      participant_status_history: {
        Row: {
          created_at: string | null;
          id: string;
          new_status: string;
          participant_id: string;
          previous_status: string | null;
          reason: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          new_status: string;
          participant_id: string;
          previous_status?: string | null;
          reason?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          new_status?: string;
          participant_id?: string;
          previous_status?: string | null;
          reason?: string | null;
        };
        Relationships: [];
      };
      participant_variants: {
        Row: {
          created_at: string | null;
          id: string;
          participant_id: string;
          variant_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          participant_id: string;
          variant_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          participant_id?: string;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'participant_variants_variant_id_fkey';
            columns: ['variant_id'];
            isOneToOne: false;
            referencedRelation: 'ab_test_variants';
            referencedColumns: ['id'];
          },
        ];
      };
      permission_requests: {
        Row: {
          created_at: string | null;
          id: string;
          message: string | null;
          status: string;
          trip_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          message?: string | null;
          status?: string;
          trip_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          message?: string | null;
          status?: string;
          trip_id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      place_metrics: {
        Row: {
          avg_rating: number | null;
          last_calculated_at: string;
          place_id: string;
          recent_activity_count: number | null;
          review_count: number | null;
          saved_count: number | null;
          total_score: number | null;
          trip_inclusion_count: number | null;
        };
        Insert: {
          avg_rating?: number | null;
          last_calculated_at?: string;
          place_id: string;
          recent_activity_count?: number | null;
          review_count?: number | null;
          saved_count?: number | null;
          total_score?: number | null;
          trip_inclusion_count?: number | null;
        };
        Update: {
          avg_rating?: number | null;
          last_calculated_at?: string;
          place_id?: string;
          recent_activity_count?: number | null;
          review_count?: number | null;
          saved_count?: number | null;
          total_score?: number | null;
          trip_inclusion_count?: number | null;
        };
        Relationships: [];
      };
      place_nominations: {
        Row: {
          auto_nominated: boolean | null;
          id: string;
          metrics_snapshot: Json | null;
          nominated_at: string;
          place_id: string;
          review_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database['public']['Enums']['nomination_status'] | null;
        };
        Insert: {
          auto_nominated?: boolean | null;
          id?: string;
          metrics_snapshot?: Json | null;
          nominated_at?: string;
          place_id: string;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database['public']['Enums']['nomination_status'] | null;
        };
        Update: {
          auto_nominated?: boolean | null;
          id?: string;
          metrics_snapshot?: Json | null;
          nominated_at?: string;
          place_id?: string;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database['public']['Enums']['nomination_status'] | null;
        };
        Relationships: [];
      };
      preference_weights: {
        Row: {
          category: string;
          created_at: string | null;
          id: string;
          subcategory: string | null;
          updated_at: string | null;
          weight: number | null;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          id?: string;
          subcategory?: string | null;
          updated_at?: string | null;
          weight?: number | null;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          id?: string;
          subcategory?: string | null;
          updated_at?: string | null;
          weight?: number | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          cover_image_url: string | null;
          created_at: string | null;
          email: string | null;
          first_name: string | null;
          home_location_data: Json | null;
          home_location_id: string | null;
          home_location_name: string | null;
          id: string;
          interests: Json | null;
          is_admin: boolean | null;
          is_guest: boolean | null;
          is_verified: boolean | null;
          location: string | null;
          name: string | null;
          onboarded: boolean | null;
          onboarding_completed: boolean | null;
          onboarding_completed_at: string | null;
          onboarding_data: Json | null;
          onboarding_entry_point: string | null;
          onboarding_step: number | null;
          referral_bonus: Json | null;
          referral_count: number | null;
          referrer_id: string | null;
          role: Database['public']['Enums']['user_role'] | null;
          subscription_expires_at: string | null;
          subscription_level: Database['public']['Enums']['subscription_level'];
          travel_personality: Database['public']['Enums']['travel_personality_type'] | null;
          travel_squad: Database['public']['Enums']['travel_squad_type'] | null;
          updated_at: string | null;
          username: string | null;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          cover_image_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          home_location_data?: Json | null;
          home_location_id?: string | null;
          home_location_name?: string | null;
          id: string;
          interests?: Json | null;
          is_admin?: boolean | null;
          is_guest?: boolean | null;
          is_verified?: boolean | null;
          location?: string | null;
          name?: string | null;
          onboarded?: boolean | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          onboarding_data?: Json | null;
          onboarding_entry_point?: string | null;
          onboarding_step?: number | null;
          referral_bonus?: Json | null;
          referral_count?: number | null;
          referrer_id?: string | null;
          role?: Database['public']['Enums']['user_role'] | null;
          subscription_expires_at?: string | null;
          subscription_level?: Database['public']['Enums']['subscription_level'];
          travel_personality?: Database['public']['Enums']['travel_personality_type'] | null;
          travel_squad?: Database['public']['Enums']['travel_squad_type'] | null;
          updated_at?: string | null;
          username?: string | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          cover_image_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          home_location_data?: Json | null;
          home_location_id?: string | null;
          home_location_name?: string | null;
          id?: string;
          interests?: Json | null;
          is_admin?: boolean | null;
          is_guest?: boolean | null;
          is_verified?: boolean | null;
          location?: string | null;
          name?: string | null;
          onboarded?: boolean | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          onboarding_data?: Json | null;
          onboarding_entry_point?: string | null;
          onboarding_step?: number | null;
          referral_bonus?: Json | null;
          referral_count?: number | null;
          referrer_id?: string | null;
          role?: Database['public']['Enums']['user_role'] | null;
          subscription_expires_at?: string | null;
          subscription_level?: Database['public']['Enums']['subscription_level'];
          travel_personality?: Database['public']['Enums']['travel_personality_type'] | null;
          travel_squad?: Database['public']['Enums']['travel_squad_type'] | null;
          updated_at?: string | null;
          username?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      question_branching: {
        Row: {
          condition_type: string;
          condition_value: Json;
          created_at: string;
          form_id: string;
          id: string;
          source_question_id: string;
          target_question_id: string;
          updated_at: string;
        };
        Insert: {
          condition_type: string;
          condition_value: Json;
          created_at?: string;
          form_id: string;
          id?: string;
          source_question_id: string;
          target_question_id: string;
          updated_at?: string;
        };
        Update: {
          condition_type?: string;
          condition_value?: Json;
          created_at?: string;
          form_id?: string;
          id?: string;
          source_question_id?: string;
          target_question_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_branching_source_question_id_fkey';
            columns: ['source_question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_branching_target_question_id_fkey';
            columns: ['target_question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
        ];
      };
      questions: {
        Row: {
          allowed_file_types: string[] | null;
          conditional_logic: Json | null;
          created_at: string;
          default_value: string | null;
          description: string | null;
          form_id: string;
          id: string;
          is_required: boolean | null;
          max_character_count: number | null;
          max_file_size: number | null;
          max_files: number | null;
          options: Json | null;
          placeholder: string | null;
          position: number | null;
          question_type: string;
          rating_scale: number | null;
          rating_type: string | null;
          show_character_count: boolean | null;
          title: string;
          updated_at: string;
          validation_rules: Json | null;
        };
        Insert: {
          allowed_file_types?: string[] | null;
          conditional_logic?: Json | null;
          created_at?: string;
          default_value?: string | null;
          description?: string | null;
          form_id: string;
          id?: string;
          is_required?: boolean | null;
          max_character_count?: number | null;
          max_file_size?: number | null;
          max_files?: number | null;
          options?: Json | null;
          placeholder?: string | null;
          position?: number | null;
          question_type: string;
          rating_scale?: number | null;
          rating_type?: string | null;
          show_character_count?: boolean | null;
          title: string;
          updated_at?: string;
          validation_rules?: Json | null;
        };
        Update: {
          allowed_file_types?: string[] | null;
          conditional_logic?: Json | null;
          created_at?: string;
          default_value?: string | null;
          description?: string | null;
          form_id?: string;
          id?: string;
          is_required?: boolean | null;
          max_character_count?: number | null;
          max_file_size?: number | null;
          max_files?: number | null;
          options?: Json | null;
          placeholder?: string | null;
          position?: number | null;
          question_type?: string;
          rating_scale?: number | null;
          rating_type?: string | null;
          show_character_count?: boolean | null;
          title?: string;
          updated_at?: string;
          validation_rules?: Json | null;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          action: string;
          count: number;
          created_at: string | null;
          id: number;
          ip_address: string;
          last_reset: string;
          updated_at: string | null;
        };
        Insert: {
          action: string;
          count?: number;
          created_at?: string | null;
          id?: number;
          ip_address: string;
          last_reset?: string;
          updated_at?: string | null;
        };
        Update: {
          action?: string;
          count?: number;
          created_at?: string | null;
          id?: number;
          ip_address?: string;
          last_reset?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      referrals: {
        Row: {
          converted: boolean | null;
          converted_at: string | null;
          created_at: string | null;
          id: string;
          referral_code: string;
          referred_id: string;
          referrer_id: string;
          trip_id: string | null;
        };
        Insert: {
          converted?: boolean | null;
          converted_at?: string | null;
          created_at?: string | null;
          id?: string;
          referral_code: string;
          referred_id: string;
          referrer_id: string;
          trip_id?: string | null;
        };
        Update: {
          converted?: boolean | null;
          converted_at?: string | null;
          created_at?: string | null;
          id?: string;
          referral_code?: string;
          referred_id?: string;
          referrer_id?: string;
          trip_id?: string | null;
        };
        Relationships: [];
      };
      response_sessions: {
        Row: {
          completed: boolean | null;
          completed_at: string | null;
          created_at: string;
          expires_at: string | null;
          form_id: string;
          id: string;
          ip_address: string | null;
          metadata: Json | null;
          progress: Json | null;
          updated_at: string;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          completed?: boolean | null;
          completed_at?: string | null;
          created_at?: string;
          expires_at?: string | null;
          form_id: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          progress?: Json | null;
          updated_at?: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          completed?: boolean | null;
          completed_at?: string | null;
          created_at?: string;
          expires_at?: string | null;
          form_id?: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          progress?: Json | null;
          updated_at?: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      responses: {
        Row: {
          created_at: string;
          files: string[] | null;
          id: string;
          metadata: Json | null;
          question_id: string;
          session_id: string;
          updated_at: string;
          value: string | null;
          value_json: Json | null;
        };
        Insert: {
          created_at?: string;
          files?: string[] | null;
          id?: string;
          metadata?: Json | null;
          question_id: string;
          session_id: string;
          updated_at?: string;
          value?: string | null;
          value_json?: Json | null;
        };
        Update: {
          created_at?: string;
          files?: string[] | null;
          id?: string;
          metadata?: Json | null;
          question_id?: string;
          session_id?: string;
          updated_at?: string;
          value?: string | null;
          value_json?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'responses_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'responses_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'response_sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      reviews: {
        Row: {
          content: string | null;
          created_at: string;
          id: string;
          item_id: string | null;
          item_type: Database['public']['Enums']['content_type'];
          place_id: string;
          rating: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          id?: string;
          item_id?: string | null;
          item_type: Database['public']['Enums']['content_type'];
          place_id: string;
          rating: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          id?: string;
          item_id?: string | null;
          item_type?: Database['public']['Enums']['content_type'];
          place_id?: string;
          rating?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      spatial_ref_sys: {
        Row: {
          auth_name: string | null;
          auth_srid: number | null;
          proj4text: string | null;
          srid: number;
          srtext: string | null;
        };
        Insert: {
          auth_name?: string | null;
          auth_srid?: number | null;
          proj4text?: string | null;
          srid: number;
          srtext?: string | null;
        };
        Update: {
          auth_name?: string | null;
          auth_srid?: number | null;
          proj4text?: string | null;
          srid?: number;
          srtext?: string | null;
        };
        Relationships: [];
      };
      states_provinces: {
        Row: {
          code: string | null;
          country_code: string;
          created_at: string | null;
          id: string;
          name: string;
          type: Database['public']['Enums']['state_province_type_enum'];
          updated_at: string | null;
        };
        Insert: {
          code?: string | null;
          country_code: string;
          created_at?: string | null;
          id?: string;
          name: string;
          type?: Database['public']['Enums']['state_province_type_enum'];
          updated_at?: string | null;
        };
        Update: {
          code?: string | null;
          country_code?: string;
          created_at?: string | null;
          id?: string;
          name?: string;
          type?: Database['public']['Enums']['state_province_type_enum'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          category: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          emoji: string | null;
          id: string;
          is_verified: boolean | null;
          metadata: Json | null;
          name: string;
          slug: string;
          updated_at: string | null;
          use_count: number | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          emoji?: string | null;
          id?: string;
          is_verified?: boolean | null;
          metadata?: Json | null;
          name: string;
          slug: string;
          updated_at?: string | null;
          use_count?: number | null;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          emoji?: string | null;
          id?: string;
          is_verified?: boolean | null;
          metadata?: Json | null;
          name?: string;
          slug?: string;
          updated_at?: string | null;
          use_count?: number | null;
        };
        Relationships: [];
      };
      template_applications: {
        Row: {
          application_metadata: Json | null;
          applied_at: string | null;
          applied_by: string | null;
          fallbacks_used: number | null;
          id: string;
          optimization_level: string | null;
          success_rate: number | null;
          template_id: string | null;
          trip_id: string | null;
          version_used: number | null;
        };
        Insert: {
          application_metadata?: Json | null;
          applied_at?: string | null;
          applied_by?: string | null;
          fallbacks_used?: number | null;
          id?: string;
          optimization_level?: string | null;
          success_rate?: number | null;
          template_id?: string | null;
          trip_id?: string | null;
          version_used?: number | null;
        };
        Update: {
          application_metadata?: Json | null;
          applied_at?: string | null;
          applied_by?: string | null;
          fallbacks_used?: number | null;
          id?: string;
          optimization_level?: string | null;
          success_rate?: number | null;
          template_id?: string | null;
          trip_id?: string | null;
          version_used?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'template_applications_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_templates';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'template_applications_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_analytics_events: {
        Row: {
          created_at: string | null;
          event_data: Json | null;
          event_type: string;
          id: string;
          trip_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          event_data?: Json | null;
          event_type: string;
          id?: string;
          trip_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          event_data?: Json | null;
          event_type?: string;
          id?: string;
          trip_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_analytics_events_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_analytics_events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_analytics_events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      trip_cities: {
        Row: {
          added_at: string;
          arrival_date: string | null;
          city_id: string;
          departure_date: string | null;
          destination_id: string | null;
          id: number;
          position: number | null;
          trip_id: string;
        };
        Insert: {
          added_at?: string;
          arrival_date?: string | null;
          city_id: string;
          departure_date?: string | null;
          destination_id?: string | null;
          id?: number;
          position?: number | null;
          trip_id: string;
        };
        Update: {
          added_at?: string;
          arrival_date?: string | null;
          city_id?: string;
          departure_date?: string | null;
          destination_id?: string | null;
          id?: number;
          position?: number | null;
          trip_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_cities_city_id_fkey';
            columns: ['city_id'];
            isOneToOne: false;
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_cities_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_cities_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_comment_likes: {
        Row: {
          comment_id: string;
          created_at: string;
          id: string;
          trip_id: string;
          user_id: string;
        };
        Insert: {
          comment_id: string;
          created_at?: string;
          id?: string;
          trip_id: string;
          user_id: string;
        };
        Update: {
          comment_id?: string;
          created_at?: string;
          id?: string;
          trip_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_comment_likes_comment_id_fkey';
            columns: ['comment_id'];
            isOneToOne: false;
            referencedRelation: 'trip_item_comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_comment_likes_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_comment_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_comment_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      trip_history: {
        Row: {
          action_type: Database['public']['Enums']['trip_action_type'];
          created_at: string;
          details: Json | null;
          id: number;
          trip_id: string;
          user_id: string | null;
        };
        Insert: {
          action_type: Database['public']['Enums']['trip_action_type'];
          created_at?: string;
          details?: Json | null;
          id?: number;
          trip_id: string;
          user_id?: string | null;
        };
        Update: {
          action_type?: Database['public']['Enums']['trip_action_type'];
          created_at?: string;
          details?: Json | null;
          id?: number;
          trip_id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_history_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_history_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_history_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      trip_images: {
        Row: {
          album_id: number | null;
          content_type: string;
          created_at: string | null;
          created_by: string;
          description: string | null;
          file_name: string;
          file_path: string;
          height: number | null;
          id: string;
          size_bytes: number;
          trip_id: string;
          width: number | null;
        };
        Insert: {
          album_id?: number | null;
          content_type: string;
          created_at?: string | null;
          created_by: string;
          description?: string | null;
          file_name: string;
          file_path: string;
          height?: number | null;
          id?: string;
          size_bytes: number;
          trip_id: string;
          width?: number | null;
        };
        Update: {
          album_id?: number | null;
          content_type?: string;
          created_at?: string | null;
          created_by?: string;
          description?: string | null;
          file_name?: string;
          file_path?: string;
          height?: number | null;
          id?: string;
          size_bytes?: number;
          trip_id?: string;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_images_album_id_fkey';
            columns: ['album_id'];
            isOneToOne: false;
            referencedRelation: 'albums';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_images_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_item_comments: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          item_id: string;
          trip_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          item_id: string;
          trip_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          item_id?: string;
          trip_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_item_comments_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_logistics: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          data: Json | null;
          description: string | null;
          end_date: string | null;
          id: string;
          location: string | null;
          start_date: string | null;
          title: string;
          trip_id: string;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          data?: Json | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          location?: string | null;
          start_date?: string | null;
          title: string;
          trip_id: string;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          data?: Json | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          location?: string | null;
          start_date?: string | null;
          title?: string;
          trip_id?: string;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_logistics_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_members: {
        Row: {
          created_at: string | null;
          external_email: string | null;
          guest_token: string | null;
          id: string;
          invited_by: string | null;
          is_guest: boolean | null;
          joined_at: string | null;
          last_viewed_at: string | null;
          notification_preferences: Json | null;
          role: Database['public']['Enums']['trip_role'];
          trip_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          external_email?: string | null;
          guest_token?: string | null;
          id?: string;
          invited_by?: string | null;
          is_guest?: boolean | null;
          joined_at?: string | null;
          last_viewed_at?: string | null;
          notification_preferences?: Json | null;
          role?: Database['public']['Enums']['trip_role'];
          trip_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          external_email?: string | null;
          guest_token?: string | null;
          id?: string;
          invited_by?: string | null;
          is_guest?: boolean | null;
          joined_at?: string | null;
          last_viewed_at?: string | null;
          notification_preferences?: Json | null;
          role?: Database['public']['Enums']['trip_role'];
          trip_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_members_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_members_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'trip_members_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      trip_notes: {
        Row: {
          album_id: number | null;
          content: string | null;
          id: string;
          title: string;
          trip_id: string;
          updated_at: string | null;
          updated_by: string | null;
          user_id: string | null;
        };
        Insert: {
          album_id?: number | null;
          content?: string | null;
          id?: string;
          title: string;
          trip_id: string;
          updated_at?: string | null;
          updated_by?: string | null;
          user_id?: string | null;
        };
        Update: {
          album_id?: number | null;
          content?: string | null;
          id?: string;
          title?: string;
          trip_id?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_notes_album_id_fkey';
            columns: ['album_id'];
            isOneToOne: false;
            referencedRelation: 'albums';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_notes_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_notes_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_notes_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'trip_notes_updated_by_fkey1';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_notes_updated_by_fkey1';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'trip_notes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_notes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      trip_tags: {
        Row: {
          assigned_at: string | null;
          tag_id: string;
          trip_id: string;
        };
        Insert: {
          assigned_at?: string | null;
          tag_id: string;
          trip_id: string;
        };
        Update: {
          assigned_at?: string | null;
          tag_id?: string;
          trip_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_tags_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_template_uses: {
        Row: {
          applied_at: string | null;
          applied_by: string | null;
          id: string;
          modifications: Json | null;
          template_id: string | null;
          trip_id: string | null;
          version_used: number | null;
        };
        Insert: {
          applied_at?: string | null;
          applied_by?: string | null;
          id?: string;
          modifications?: Json | null;
          template_id?: string | null;
          trip_id?: string | null;
          version_used?: number | null;
        };
        Update: {
          applied_at?: string | null;
          applied_by?: string | null;
          id?: string;
          modifications?: Json | null;
          template_id?: string | null;
          trip_id?: string | null;
          version_used?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_template_uses_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_templates';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_template_uses_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_vote_options: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          poll_id: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          poll_id: string;
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          poll_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_vote_options_poll_id_fkey';
            columns: ['poll_id'];
            isOneToOne: false;
            referencedRelation: 'trip_vote_polls';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_vote_polls: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          expires_at: string | null;
          id: string;
          is_active: boolean;
          title: string;
          trip_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description?: string | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          title: string;
          trip_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          title?: string;
          trip_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_vote_polls_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_votes: {
        Row: {
          created_at: string;
          id: string;
          option_id: string;
          poll_id: string;
          trip_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          option_id: string;
          poll_id: string;
          trip_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          option_id?: string;
          poll_id?: string;
          trip_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_votes_option_id_fkey';
            columns: ['option_id'];
            isOneToOne: false;
            referencedRelation: 'trip_vote_options';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_votes_poll_id_fkey';
            columns: ['poll_id'];
            isOneToOne: false;
            referencedRelation: 'trip_vote_polls';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_votes_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trips: {
        Row: {
          budget: string | null;
          city_id: string | null;
          color_scheme: string | null;
          comments_count: number | null;
          cover_image_position_y: number | null;
          cover_image_url: string | null;
          created_at: string;
          created_by: string;
          date_flexibility: string | null;
          description: string | null;
          destination_name: string | null;
          duration_days: number | null;
          end_date: string | null;
          guest_token_text: string | null;
          id: string;
          is_archived: boolean;
          is_guest: boolean | null;
          is_public: boolean;
          last_accessed_at: string | null;
          likes_count: number | null;
          member_count: number | null;
          name: string;
          playlist_url: string | null;
          primary_city_id: string | null;
          privacy_setting: Database['public']['Enums']['trip_privacy_setting'];
          public_slug: string | null;
          shared_url: string | null;
          slug: string | null;
          splitwise_group_id: number | null;
          start_date: string | null;
          status: Database['public']['Enums']['trip_status'] | null;
          travelers_count: number | null;
          trip_emoji: string | null;
          trip_type: string | null;
          updated_at: string;
          use_count: number | null;
          vibe: string | null;
          view_count: number | null;
        };
        Insert: {
          budget?: string | null;
          city_id?: string | null;
          color_scheme?: string | null;
          comments_count?: number | null;
          cover_image_position_y?: number | null;
          cover_image_url?: string | null;
          created_at?: string;
          created_by: string;
          date_flexibility?: string | null;
          description?: string | null;
          destination_name?: string | null;
          duration_days?: number | null;
          end_date?: string | null;
          guest_token_text?: string | null;
          id?: string;
          is_archived?: boolean;
          is_guest?: boolean | null;
          is_public?: boolean;
          last_accessed_at?: string | null;
          likes_count?: number | null;
          member_count?: number | null;
          name: string;
          playlist_url?: string | null;
          primary_city_id?: string | null;
          privacy_setting?: Database['public']['Enums']['trip_privacy_setting'];
          public_slug?: string | null;
          shared_url?: string | null;
          slug?: string | null;
          splitwise_group_id?: number | null;
          start_date?: string | null;
          status?: Database['public']['Enums']['trip_status'] | null;
          travelers_count?: number | null;
          trip_emoji?: string | null;
          trip_type?: string | null;
          updated_at?: string;
          use_count?: number | null;
          vibe?: string | null;
          view_count?: number | null;
        };
        Update: {
          budget?: string | null;
          city_id?: string | null;
          color_scheme?: string | null;
          comments_count?: number | null;
          cover_image_position_y?: number | null;
          cover_image_url?: string | null;
          created_at?: string;
          created_by?: string;
          date_flexibility?: string | null;
          description?: string | null;
          destination_name?: string | null;
          duration_days?: number | null;
          end_date?: string | null;
          guest_token_text?: string | null;
          id?: string;
          is_archived?: boolean;
          is_guest?: boolean | null;
          is_public?: boolean;
          last_accessed_at?: string | null;
          likes_count?: number | null;
          member_count?: number | null;
          name?: string;
          playlist_url?: string | null;
          primary_city_id?: string | null;
          privacy_setting?: Database['public']['Enums']['trip_privacy_setting'];
          public_slug?: string | null;
          shared_url?: string | null;
          slug?: string | null;
          splitwise_group_id?: number | null;
          start_date?: string | null;
          status?: Database['public']['Enums']['trip_status'] | null;
          travelers_count?: number | null;
          trip_emoji?: string | null;
          trip_type?: string | null;
          updated_at?: string;
          use_count?: number | null;
          vibe?: string | null;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trips_city_id_fkey';
            columns: ['city_id'];
            isOneToOne: false;
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trips_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trips_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'trips_primary_city_id_fkey';
            columns: ['primary_city_id'];
            isOneToOne: false;
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
        ];
      };
      user_activity_history: {
        Row: {
          created_at: string | null;
          id: string;
          interaction_data: Json | null;
          interaction_type: string;
          item_id: string | null;
          metadata: Json | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          interaction_data?: Json | null;
          interaction_type: string;
          item_id?: string | null;
          metadata?: Json | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          interaction_data?: Json | null;
          interaction_type?: string;
          item_id?: string | null;
          metadata?: Json | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_activity_history_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_activity_history_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_activity_history_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      user_events: {
        Row: {
          created_at: string | null;
          event_data: Json | null;
          event_name: string;
          id: string;
          processed: boolean | null;
          processed_at: string | null;
          source: string | null;
          updated_at: string | null;
          user_email: string;
          user_name: string | null;
        };
        Insert: {
          created_at?: string | null;
          event_data?: Json | null;
          event_name: string;
          id?: string;
          processed?: boolean | null;
          processed_at?: string | null;
          source?: string | null;
          updated_at?: string | null;
          user_email: string;
          user_name?: string | null;
        };
        Update: {
          created_at?: string | null;
          event_data?: Json | null;
          event_name?: string;
          id?: string;
          processed?: boolean | null;
          processed_at?: string | null;
          source?: string | null;
          updated_at?: string | null;
          user_email?: string;
          user_name?: string | null;
        };
        Relationships: [];
      };
      user_interactions: {
        Row: {
          created_at: string | null;
          destination_id: string | null;
          id: string;
          interaction_type: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          destination_id?: string | null;
          id?: string;
          interaction_type: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          destination_id?: string | null;
          id?: string;
          interaction_type?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_interactions_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          },
        ];
      };
      user_interests: {
        Row: {
          created_at: string | null;
          id: string;
          strength: number | null;
          tag_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          strength?: number | null;
          tag_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          strength?: number | null;
          tag_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_interests_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_interests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_interests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      user_login_history: {
        Row: {
          created_at: string;
          id: string;
          ip_address: string | null;
          login_at: string;
          method: string | null;
          success: boolean;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ip_address?: string | null;
          login_at?: string;
          method?: string | null;
          success?: boolean;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          ip_address?: string | null;
          login_at?: string;
          method?: string | null;
          success?: boolean;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_login_history_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_login_history_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      user_preferences: {
        Row: {
          accessibility_needs: string[] | null;
          budget_range: unknown | null;
          created_at: string | null;
          dietary_restrictions: string[] | null;
          id: string;
          metadata: Json | null;
          preferred_activity_types: string[] | null;
          preferred_pace: Database['public']['Enums']['travel_pace'] | null;
          preferred_times_of_day: string[] | null;
          travel_styles: Database['public']['Enums']['travel_style'][] | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          accessibility_needs?: string[] | null;
          budget_range?: unknown | null;
          created_at?: string | null;
          dietary_restrictions?: string[] | null;
          id?: string;
          metadata?: Json | null;
          preferred_activity_types?: string[] | null;
          preferred_pace?: Database['public']['Enums']['travel_pace'] | null;
          preferred_times_of_day?: string[] | null;
          travel_styles?: Database['public']['Enums']['travel_style'][] | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          accessibility_needs?: string[] | null;
          budget_range?: unknown | null;
          created_at?: string | null;
          dietary_restrictions?: string[] | null;
          id?: string;
          metadata?: Json | null;
          preferred_activity_types?: string[] | null;
          preferred_pace?: Database['public']['Enums']['travel_pace'] | null;
          preferred_times_of_day?: string[] | null;
          travel_styles?: Database['public']['Enums']['travel_style'][] | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_preferences_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_preferences_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      user_presence: {
        Row: {
          document_id: string | null;
          id: string;
          last_active: string | null;
          status: string;
          trip_id: string;
          user_id: string;
        };
        Insert: {
          document_id?: string | null;
          id?: string;
          last_active?: string | null;
          status?: string;
          trip_id: string;
          user_id: string;
        };
        Update: {
          document_id?: string | null;
          id?: string;
          last_active?: string | null;
          status?: string;
          trip_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_presence_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_presence_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      user_suggested_tags: {
        Row: {
          admin_notes: string | null;
          category: string;
          created_at: string | null;
          destination_id: string | null;
          id: string;
          name: string;
          slug: string;
          status: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          admin_notes?: string | null;
          category: string;
          created_at?: string | null;
          destination_id?: string | null;
          id?: string;
          name: string;
          slug: string;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          admin_notes?: string | null;
          category?: string;
          created_at?: string | null;
          destination_id?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_suggested_tags_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_suggested_tags_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_suggested_tags_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      user_testing_events: {
        Row: {
          details: Json | null;
          event_type: string;
          id: string;
          milestone: string | null;
          progress: number | null;
          session_id: string | null;
          timestamp: string;
          triggered_form_id: string | null;
        };
        Insert: {
          details?: Json | null;
          event_type: string;
          id?: string;
          milestone?: string | null;
          progress?: number | null;
          session_id?: string | null;
          timestamp?: string;
          triggered_form_id?: string | null;
        };
        Update: {
          details?: Json | null;
          event_type?: string;
          id?: string;
          milestone?: string | null;
          progress?: number | null;
          session_id?: string | null;
          timestamp?: string;
          triggered_form_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_testing_events_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'user_testing_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_testing_events_triggered_form_id_fkey';
            columns: ['triggered_form_id'];
            isOneToOne: false;
            referencedRelation: 'forms';
            referencedColumns: ['id'];
          },
        ];
      };
      user_testing_sessions: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: string;
          metadata: Json | null;
          status: string;
          token: string;
          user_id: string | null;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          status?: string;
          token: string;
          user_id?: string | null;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          status?: string;
          token?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_testing_signups: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          metadata: Json | null;
          name: string;
          signup_date: string | null;
          source: string | null;
          status: string | null;
          tags: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          metadata?: Json | null;
          name: string;
          signup_date?: string | null;
          source?: string | null;
          status?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          metadata?: Json | null;
          name?: string;
          signup_date?: string | null;
          source?: string | null;
          status?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_travel: {
        Row: {
          created_at: string | null;
          destination_id: string | null;
          id: string;
          status: string | null;
          travel_id: string;
          updated_at: string | null;
          user_id: string;
          visited_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          destination_id?: string | null;
          id?: string;
          status?: string | null;
          travel_id: string;
          updated_at?: string | null;
          user_id: string;
          visited_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          destination_id?: string | null;
          id?: string;
          status?: string | null;
          travel_id?: string;
          updated_at?: string | null;
          user_id?: string;
          visited_at?: string | null;
        };
        Relationships: [];
      };
      validation_logs: {
        Row: {
          id: string;
          is_valid: boolean;
          template_id: string | null;
          trip_id: string | null;
          validated_at: string | null;
          validated_by: string | null;
          validation_errors: string[] | null;
        };
        Insert: {
          id?: string;
          is_valid: boolean;
          template_id?: string | null;
          trip_id?: string | null;
          validated_at?: string | null;
          validated_by?: string | null;
          validation_errors?: string[] | null;
        };
        Update: {
          id?: string;
          is_valid?: boolean;
          template_id?: string | null;
          trip_id?: string | null;
          validated_at?: string | null;
          validated_by?: string | null;
          validation_errors?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'validation_logs_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_templates';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'validation_logs_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      votes: {
        Row: {
          created_at: string | null;
          id: string;
          itinerary_item_id: string | null;
          user_id: string | null;
          vote_type: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          itinerary_item_id?: string | null;
          user_id?: string | null;
          vote_type: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          itinerary_item_id?: string | null;
          user_id?: string | null;
          vote_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'votes_itinerary_item_id_fkey';
            columns: ['itinerary_item_id'];
            isOneToOne: false;
            referencedRelation: 'itinerary_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'votes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'votes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
    };
    Views: {
      admin_onboarding_analytics: {
        Row: {
          avg_hours_to_complete: number | null;
          completed_count: number | null;
          completion_date: string | null;
        };
        Relationships: [];
      };
      discoverable_groups: {
        Row: {
          cover_image_url: string | null;
          created_at: string | null;
          creator_avatar: string | null;
          creator_name: string | null;
          description: string | null;
          emoji: string | null;
          id: string | null;
          member_count: number | null;
          name: string | null;
          slug: string | null;
          thumbnail_url: string | null;
          trip_count: number | null;
          visibility: string | null;
        };
        Relationships: [];
      };
      geography_columns: {
        Row: {
          coord_dimension: number | null;
          f_geography_column: unknown | null;
          f_table_catalog: unknown | null;
          f_table_name: unknown | null;
          f_table_schema: unknown | null;
          srid: number | null;
          type: string | null;
        };
        Relationships: [];
      };
      geometry_columns: {
        Row: {
          coord_dimension: number | null;
          f_geometry_column: unknown | null;
          f_table_catalog: string | null;
          f_table_name: unknown | null;
          f_table_schema: unknown | null;
          srid: number | null;
          type: string | null;
        };
        Insert: {
          coord_dimension?: number | null;
          f_geometry_column?: unknown | null;
          f_table_catalog?: string | null;
          f_table_name?: unknown | null;
          f_table_schema?: unknown | null;
          srid?: number | null;
          type?: string | null;
        };
        Update: {
          coord_dimension?: number | null;
          f_geometry_column?: unknown | null;
          f_table_catalog?: string | null;
          f_table_name?: unknown | null;
          f_table_schema?: unknown | null;
          srid?: number | null;
          type?: string | null;
        };
        Relationships: [];
      };
      group_recent_activity: {
        Row: {
          activity_type: string | null;
          created_at: string | null;
          details: Json | null;
          group_id: string | null;
          id: string | null;
          trip_id: string | null;
          trip_name: string | null;
          user_avatar: string | null;
          user_id: string | null;
          user_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'group_activities_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'discoverable_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_activities_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_activities_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'user_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_activities_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      user_feature_preferences: {
        Row: {
          feature_id: string | null;
          is_enabled: boolean | null;
          notification_level: string | null;
          preferences: Json | null;
          show_tours: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          feature_id?: string | null;
          is_enabled?: boolean | null;
          notification_level?: string | null;
          preferences?: Json | null;
          show_tours?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          feature_id?: string | null;
          is_enabled?: boolean | null;
          notification_level?: string | null;
          preferences?: Json | null;
          show_tours?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_groups: {
        Row: {
          cover_image_url: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          emoji: string | null;
          id: string | null;
          joined_at: string | null;
          member_count: number | null;
          name: string | null;
          role: string | null;
          slug: string | null;
          status: string | null;
          thumbnail_url: string | null;
          trip_count: number | null;
          visibility: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'groups_created_by_fkey1';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'groups_created_by_fkey1';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_onboarding_status';
            referencedColumns: ['user_id'];
          },
        ];
      };
      user_onboarding_status: {
        Row: {
          completed_tours: Json | null;
          onboarded: boolean | null;
          onboarding_completed_at: string | null;
          onboarding_data: Json | null;
          onboarding_step: number | null;
          total_events: number | null;
          total_tours_completed: number | null;
          user_id: string | null;
        };
        Insert: {
          completed_tours?: never;
          onboarded?: boolean | null;
          onboarding_completed_at?: string | null;
          onboarding_data?: Json | null;
          onboarding_step?: number | null;
          total_events?: never;
          total_tours_completed?: never;
          user_id?: string | null;
        };
        Update: {
          completed_tours?: never;
          onboarded?: boolean | null;
          onboarding_completed_at?: string | null;
          onboarding_data?: Json | null;
          onboarding_step?: number | null;
          total_events?: never;
          total_tours_completed?: never;
          user_id?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      _postgis_deprecate: {
        Args: { oldname: string; newname: string; version: string };
        Returns: undefined;
      };
      _postgis_index_extent: {
        Args: { tbl: unknown; col: string };
        Returns: unknown;
      };
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      _postgis_selectivity: {
        Args: { tbl: unknown; att_name: string; geom: unknown; mode?: string };
        Returns: number;
      };
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_bestsrid: {
        Args: { '': unknown };
        Returns: number;
      };
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_coveredby: {
        Args: { geog1: unknown; geog2: unknown } | { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_covers: {
        Args: { geog1: unknown; geog2: unknown } | { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_dwithin: {
        Args: {
          geog1: unknown;
          geog2: unknown;
          tolerance: number;
          use_spheroid?: boolean;
        };
        Returns: boolean;
      };
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown };
        Returns: number;
      };
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_pointoutside: {
        Args: { '': unknown };
        Returns: unknown;
      };
      _st_sortablehash: {
        Args: { geom: unknown };
        Returns: number;
      };
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_voronoi: {
        Args: {
          g1: unknown;
          clip?: unknown;
          tolerance?: number;
          return_polygons?: boolean;
        };
        Returns: unknown;
      };
      _st_within: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      accept_group_invitation: {
        Args: { p_invitation_token: string };
        Returns: string;
      };
      add_city_to_trip: {
        Args: {
          p_trip_id: string;
          p_city_id: string;
          p_position?: number;
          p_arrival_date?: string;
          p_departure_date?: string;
        };
        Returns: string;
      };
      add_trip_to_group: {
        Args: {
          p_group_id: string;
          p_trip_id: string;
          p_notes?: string;
          p_is_featured?: boolean;
        };
        Returns: boolean;
      };
      addauth: {
        Args: { '': string };
        Returns: boolean;
      };
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string;
              schema_name: string;
              table_name: string;
              column_name: string;
              new_srid_in: number;
              new_type: string;
              new_dim: number;
              use_typmod?: boolean;
            }
          | {
              schema_name: string;
              table_name: string;
              column_name: string;
              new_srid: number;
              new_type: string;
              new_dim: number;
              use_typmod?: boolean;
            }
          | {
              table_name: string;
              column_name: string;
              new_srid: number;
              new_type: string;
              new_dim: number;
              use_typmod?: boolean;
            };
        Returns: string;
      };
      apply_template_to_trip: {
        Args: {
          p_template_id: string;
          p_trip_id: string;
          p_user_id: string;
          p_options?: Json;
        };
        Returns: Json;
      };
      approve_user_suggested_tag: {
        Args: {
          p_suggestion_id: string;
          p_admin_id: string;
          p_admin_notes?: string;
        };
        Returns: string;
      };
      approve_user_tag: {
        Args: { tag_id: string; admin_id: string; notes?: string };
        Returns: undefined;
      };
      archive_all_read_notifications: {
        Args: { p_user_id: string };
        Returns: number;
      };
      archive_notification: {
        Args: { notification_id: string };
        Returns: undefined;
      };
      batch_archive_notifications: {
        Args: { user_id: string; notification_ids: string[] };
        Returns: number;
      };
      box: {
        Args: { '': unknown } | { '': unknown };
        Returns: unknown;
      };
      box2d: {
        Args: { '': unknown } | { '': unknown };
        Returns: unknown;
      };
      box2d_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      box2d_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      box2df_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      box2df_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      box3d: {
        Args: { '': unknown } | { '': unknown };
        Returns: unknown;
      };
      box3d_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      box3d_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      box3dtobox: {
        Args: { '': unknown };
        Returns: unknown;
      };
      bytea: {
        Args: { '': unknown } | { '': unknown };
        Returns: string;
      };
      calculate_preference_match: {
        Args: { p_item_id: string; p_user_id: string };
        Returns: number;
      };
      can_edit_trip: {
        Args: { p_trip_id: string; p_user_id?: string };
        Returns: boolean;
      };
      can_manage_trip_members: {
        Args: { p_trip_id: string };
        Returns: boolean;
      };
      check_if_user_is_trip_member_with_role: {
        Args: {
          user_id_to_check: string;
          trip_id_to_check: string;
          allowed_roles: Database['public']['Enums']['trip_role'][];
        };
        Returns: boolean;
      };
      claim_guest_data: {
        Args: { guest_token_param: string };
        Returns: boolean;
      };
      cleanup_old_guest_data: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      complete_onboarding: {
        Args: { p_final_data?: Json };
        Returns: boolean;
      };
      complete_onboarding_tour: {
        Args: {
          p_tour_id: string;
          p_is_skipped?: boolean;
          p_time_spent?: number;
          p_steps_viewed?: number;
          p_session_id?: string;
        };
        Returns: boolean;
      };
      convert_ideas_to_itinerary_items: {
        Args: { p_plan_id: string; p_trip_id: string; p_user_id: string };
        Returns: number;
      };
      copy_and_customize_item: {
        Args: {
          p_source_item_id: string;
          p_target_trip_id: string;
          p_user_id: string;
          p_customizations?: Json;
        };
        Returns: string;
      };
      copy_template_to_trip: {
        Args: { p_template_id: string; p_trip_id: string; p_user_id: string };
        Returns: boolean;
      };
      count_item_comments: {
        Args: { p_item_id: string };
        Returns: number;
      };
      create_group: {
        Args: {
          p_name: string;
          p_description?: string;
          p_emoji?: string;
          p_visibility?: string;
        };
        Returns: string;
      };
      create_guest_group: {
        Args: { name: string; description?: string; guest_token_param?: string };
        Returns: string;
      };
      create_guest_trip: {
        Args: {
          name: string;
          destination_id?: string;
          start_date?: string;
          end_date?: string;
          guest_token_param?: string;
        };
        Returns: string;
      };
      create_template_sections_from_items: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      create_trip_with_owner: {
        Args:
          | {
              p_name: string;
              p_description: string;
              p_user_id: string;
              p_start_date?: string;
              p_end_date?: string;
              p_destination_id?: string;
              p_destination_name?: string;
              p_cover_image_url?: string;
              p_trip_type?: Database['public']['Enums']['trip_type'];
              p_privacy_setting?: Database['public']['Enums']['privacy_setting'];
            }
          | { trip_data: Json; p_owner_id: string }
          | {
              trip_name: string;
              user_id: string;
              description_param?: string;
              tags_param?: string[];
              destination_id?: string;
              destination_name_param?: string;
              start_date?: string;
              end_date?: string;
              is_public?: boolean;
              cover_image_url?: string;
              latitude?: number;
              longitude?: number;
            };
        Returns: Json;
      };
      current_guest_token: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      disablelongtransactions: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string;
              schema_name: string;
              table_name: string;
              column_name: string;
            }
          | { schema_name: string; table_name: string; column_name: string }
          | { table_name: string; column_name: string };
        Returns: string;
      };
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string };
        Returns: string;
      };
      enablelongtransactions: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      equals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      exec_sql: {
        Args: { sql: string };
        Returns: undefined;
      };
      execute_sql: {
        Args: { query: string };
        Returns: Json[];
      };
      expire_pending_invitations: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      generate_group_plan_slug: {
        Args: { name: string };
        Returns: string;
      };
      generate_guest_token: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      generate_random_itinerary: {
        Args: { p_trip_id: string; p_user_id: string; p_options?: Json };
        Returns: Json;
      };
      generate_random_slug: {
        Args: { length: number };
        Returns: string;
      };
      generate_slug: {
        Args: { input_text: string };
        Returns: string;
      };
      generate_unique_slug: {
        Args: {
          input_text: string;
          content_type_val: Database['public']['Enums']['content_type'];
          content_id_val: string;
        };
        Returns: string;
      };
      geography: {
        Args: { '': string } | { '': unknown };
        Returns: unknown;
      };
      geography_analyze: {
        Args: { '': unknown };
        Returns: boolean;
      };
      geography_gist_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geography_gist_decompress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geography_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geography_send: {
        Args: { '': unknown };
        Returns: string;
      };
      geography_spgist_compress_nd: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geography_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      geography_typmod_out: {
        Args: { '': number };
        Returns: unknown;
      };
      geometry: {
        Args:
          | { '': string }
          | { '': string }
          | { '': unknown }
          | { '': unknown }
          | { '': unknown }
          | { '': unknown }
          | { '': unknown }
          | { '': unknown };
        Returns: unknown;
      };
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_analyze: {
        Args: { '': unknown };
        Returns: boolean;
      };
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_gist_compress_2d: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_gist_compress_nd: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_gist_decompress_2d: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_gist_decompress_nd: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_gist_sortsupport_2d: {
        Args: { '': unknown };
        Returns: undefined;
      };
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_hash: {
        Args: { '': unknown };
        Returns: number;
      };
      geometry_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_recv: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_send: {
        Args: { '': unknown };
        Returns: string;
      };
      geometry_sortsupport: {
        Args: { '': unknown };
        Returns: undefined;
      };
      geometry_spgist_compress_2d: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_spgist_compress_3d: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_spgist_compress_nd: {
        Args: { '': unknown };
        Returns: unknown;
      };
      geometry_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      geometry_typmod_out: {
        Args: { '': number };
        Returns: unknown;
      };
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometrytype: {
        Args: { '': unknown } | { '': unknown };
        Returns: string;
      };
      geomfromewkb: {
        Args: { '': string };
        Returns: unknown;
      };
      geomfromewkt: {
        Args: { '': string };
        Returns: unknown;
      };
      get_auth_identifier: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_comment_reactions: {
        Args: { p_comment_id: string };
        Returns: {
          id: string;
          comment_id: string;
          user_id: string;
          emoji: string;
          created_at: string;
          user_name: string;
          user_avatar_url: string;
        }[];
      };
      get_comments_with_user: {
        Args: {
          p_content_type: string;
          p_content_id: string;
          p_limit?: number;
          p_offset?: number;
          p_parent_id?: string;
        };
        Returns: {
          id: string;
          content: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          parent_id: string;
          content_type: string;
          content_id: string;
          is_edited: boolean;
          is_deleted: boolean;
          reactions_count: number;
          replies_count: number;
          attachment_url: string;
          attachment_type: string;
          metadata: Json;
          user_name: string;
          user_avatar_url: string;
        }[];
      };
      get_destination_recommendations: {
        Args: { p_user_id: string; p_limit?: number };
        Returns: {
          destination_id: string;
          match_score: number;
          matching_tags: Json;
        }[];
      };
      get_guest_token: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_notification_stats: {
        Args: { p_user_id: string };
        Returns: Json;
      };
      get_pending_survey_triggers: {
        Args: { p_participant_id: string; p_study_id: string };
        Returns: {
          id: string;
          survey_id: string;
          survey_title: string;
          trigger_type: string;
          trigger_source: string;
          created_at: string;
        }[];
      };
      get_poll_results: {
        Args: { poll_id_param: string };
        Returns: Json;
      };
      get_poll_with_options: {
        Args: { poll_id: string };
        Returns: Json;
      };
      get_proj4_from_srid: {
        Args: { '': number };
        Returns: string;
      };
      get_research_tasks_with_completion: {
        Args: { p_study_id: string; p_participant_id: string };
        Returns: {
          id: string;
          study_id: string;
          task_order: number;
          display_text: string;
          description: string;
          milestone_type: string;
          is_completed: boolean;
          completed_at: string;
        }[];
      };
      get_sections_for_template: {
        Args: { p_template_id: string };
        Returns: {
          created_at: string;
          created_by: string | null;
          date: string | null;
          day_number: number;
          destination_id: string | null;
          id: number;
          position: number;
          template_id: string;
          title: string | null;
          updated_at: string;
        }[];
      };
      get_trip_activity_timeline: {
        Args: {
          trip_id_param: string;
          limit_param?: number;
          offset_param?: number;
        };
        Returns: {
          id: number;
          trip_id: string;
          created_at: string;
          user_id: string;
          action_type: Database['public']['Enums']['trip_action_type'];
          details: Json;
          actor_name: string;
          actor_avatar: string;
        }[];
      };
      get_trip_role: {
        Args: { p_trip_id: string; p_user_id?: string };
        Returns: string;
      };
      get_unread_notification_count: {
        Args: { user_id_param: string };
        Returns: number;
      };
      get_user_likes: {
        Args: { p_user_id: string; p_item_type?: string };
        Returns: {
          id: string;
          user_id: string;
          item_id: string;
          item_type: string;
          created_at: string;
        }[];
      };
      get_user_poll_vote: {
        Args: { p_poll_id: string; p_user_id?: string };
        Returns: Json;
      };
      get_user_votes: {
        Args: { trip_id_param: string; user_id_param?: string };
        Returns: {
          poll_id: string;
          option_id: string;
          voted_at: string;
          poll_title: string;
          option_title: string;
        }[];
      };
      gettransactionid: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      gidx_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gidx_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { '': unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      guest_has_group_access: {
        Args: { group_id: string };
        Returns: boolean;
      };
      guest_has_trip_access: {
        Args: { trip_id: string };
        Returns: boolean;
      };
      has_milestone_trigger_fired: {
        Args: {
          p_participant_id: string;
          p_milestone_type: string;
          p_trigger_id: string;
        };
        Returns: boolean;
      };
      has_study_role: {
        Args: { p_user_id: string; p_study_id: string; p_role: string };
        Returns: boolean;
      };
      has_trip_role: {
        Args: {
          p_trip_id: string;
          p_user_id: string;
          p_role: Database['public']['Enums']['trip_role'];
        };
        Returns: boolean;
      };
      has_user_liked_comment: {
        Args: { p_comment_id: string; p_user_id?: string };
        Returns: boolean;
      };
      has_user_voted: {
        Args: { p_poll_id: string; p_user_id?: string };
        Returns: boolean;
      };
      increment_counter: {
        Args: { row_id: string };
        Returns: number;
      };
      insert_tag_if_not_exists: {
        Args: {
          p_name: string;
          p_slug: string;
          p_category: string;
          p_emoji?: string;
          p_description?: string;
        };
        Returns: string;
      };
      invite_to_group: {
        Args: { p_group_id: string; p_email: string; p_role?: string };
        Returns: string;
      };
      is_group_member: {
        Args: { group_id: string };
        Returns: boolean;
      };
      is_poll_expired: {
        Args: { poll_id_param: string };
        Returns: boolean;
      };
      is_study_admin: {
        Args: { p_user_id: string; p_study_id: string };
        Returns: boolean;
      };
      is_trip_member: {
        Args: { p_trip_id: string; p_user_id?: string } | { trip_id: string };
        Returns: boolean;
      };
      is_trip_member_with_role: {
        Args: { _trip_id: string; _user_id: string; _roles: string[] };
        Returns: boolean;
      };
      is_valid_group_guest_token: {
        Args: { group_id: string; guest_token_param: string };
        Returns: boolean;
      };
      is_valid_trip_guest_token: {
        Args: { trip_id: string; guest_token_param: string };
        Returns: boolean;
      };
      json: {
        Args: { '': unknown };
        Returns: Json;
      };
      json_matches_schema: {
        Args: { schema: Json; instance: Json };
        Returns: boolean;
      };
      jsonb: {
        Args: { '': unknown };
        Returns: Json;
      };
      jsonb_matches_schema: {
        Args: { schema: Json; instance: Json };
        Returns: boolean;
      };
      jsonschema_is_valid: {
        Args: { schema: Json };
        Returns: boolean;
      };
      jsonschema_validation_errors: {
        Args: { schema: Json; instance: Json };
        Returns: string[];
      };
      leave_group: {
        Args: { p_group_id: string };
        Returns: boolean;
      };
      log_group_plan_event: {
        Args: {
          p_plan_id: string;
          p_group_id: string;
          p_user_id: string;
          p_event_type: string;
          p_event_data?: Json;
        };
        Returns: string;
      };
      log_notification_action: {
        Args: {
          p_notification_id: string;
          p_user_id: string;
          p_action: string;
          p_device_info?: string;
          p_metadata?: Json;
        };
        Returns: undefined;
      };
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      mark_notification_read_and_archive: {
        Args: { p_notification_id: string; p_archive?: boolean };
        Returns: boolean;
      };
      match_route_survey_triggers: {
        Args: { route_to_match: string; study_id_param: string };
        Returns: {
          id: string;
          route_pattern: string;
          survey_id: string;
          delay_ms: number;
          min_page_time_ms: number;
          max_triggers_per_user: number;
          trigger_frequency: string;
        }[];
      };
      migrate_guest_data_to_user: {
        Args: { guest_token_param: string; user_id_param: string };
        Returns: undefined;
      };
      notification_ctr_stats: {
        Args: { period?: string };
        Returns: {
          notification_type: string;
          sent_count: number;
          clicked_count: number;
          ctr: number;
        }[];
      };
      path: {
        Args: { '': unknown };
        Returns: unknown;
      };
      pg_execute: {
        Args: { query: string };
        Returns: undefined;
      };
      pgis_asflatgeobuf_finalfn: {
        Args: { '': unknown };
        Returns: string;
      };
      pgis_asgeobuf_finalfn: {
        Args: { '': unknown };
        Returns: string;
      };
      pgis_asmvt_finalfn: {
        Args: { '': unknown };
        Returns: string;
      };
      pgis_asmvt_serialfn: {
        Args: { '': unknown };
        Returns: string;
      };
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { '': unknown };
        Returns: unknown[];
      };
      pgis_geometry_clusterwithin_finalfn: {
        Args: { '': unknown };
        Returns: unknown[];
      };
      pgis_geometry_collect_finalfn: {
        Args: { '': unknown };
        Returns: unknown;
      };
      pgis_geometry_makeline_finalfn: {
        Args: { '': unknown };
        Returns: unknown;
      };
      pgis_geometry_polygonize_finalfn: {
        Args: { '': unknown };
        Returns: unknown;
      };
      pgis_geometry_union_parallel_finalfn: {
        Args: { '': unknown };
        Returns: unknown;
      };
      pgis_geometry_union_parallel_serialfn: {
        Args: { '': unknown };
        Returns: string;
      };
      point: {
        Args: { '': unknown };
        Returns: unknown;
      };
      polygon: {
        Args: { '': unknown };
        Returns: unknown;
      };
      populate_geometry_columns: {
        Args: { tbl_oid: unknown; use_typmod?: boolean } | { use_typmod?: boolean };
        Returns: string;
      };
      postgis_addbbox: {
        Args: { '': unknown };
        Returns: unknown;
      };
      postgis_constraint_dims: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string };
        Returns: number;
      };
      postgis_constraint_srid: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string };
        Returns: number;
      };
      postgis_constraint_type: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string };
        Returns: string;
      };
      postgis_dropbbox: {
        Args: { '': unknown };
        Returns: unknown;
      };
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_full_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_geos_noop: {
        Args: { '': unknown };
        Returns: unknown;
      };
      postgis_geos_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_getbbox: {
        Args: { '': unknown };
        Returns: unknown;
      };
      postgis_hasbbox: {
        Args: { '': unknown };
        Returns: boolean;
      };
      postgis_index_supportfn: {
        Args: { '': unknown };
        Returns: unknown;
      };
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_lib_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_noop: {
        Args: { '': unknown };
        Returns: unknown;
      };
      postgis_proj_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_svn_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_type_name: {
        Args: {
          geomname: string;
          coord_dimension: number;
          use_new_name?: boolean;
        };
        Returns: string;
      };
      postgis_typmod_dims: {
        Args: { '': number };
        Returns: number;
      };
      postgis_typmod_srid: {
        Args: { '': number };
        Returns: number;
      };
      postgis_typmod_type: {
        Args: { '': number };
        Returns: string;
      };
      postgis_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      recommend_by_geography: {
        Args: { location_id: string; limit_count?: number };
        Returns: {
          destination_id: string;
          destination_name: string;
          local_popularity: number;
        }[];
      };
      recommend_popular_destinations: {
        Args: { limit_count?: number };
        Returns: {
          destination_id: string;
          destination_name: string;
          popularity_score: number;
        }[];
      };
      record_onboarding_event: {
        Args: {
          p_event_type: string;
          p_tour_id?: string;
          p_step_id?: string;
          p_event_data?: Json;
          p_session_id?: string;
        };
        Returns: string;
      };
      record_route_survey_trigger: {
        Args: {
          trigger_id_param: string;
          participant_id_param: string;
          route_param: string;
        };
        Returns: string;
      };
      record_tour_start: {
        Args: { p_user_id: string; p_tour_id: string };
        Returns: string;
      };
      remove_trip_from_group: {
        Args: { p_group_id: string; p_trip_id: string };
        Returns: boolean;
      };
      reorder_trip_cities: {
        Args: { p_trip_id: string; p_city_ids: string[] };
        Returns: undefined;
      };
      research_analytics_dashboard: {
        Args: { study_id_param: string };
        Returns: {
          metric_name: string;
          metric_value: Json;
        }[];
      };
      search_cities: {
        Args: { query_text: string; result_limit: number };
        Returns: {
          admin_name: string | null;
          capital: string | null;
          city_ascii: string | null;
          continent: string | null;
          country: string;
          created_at: string | null;
          description: string | null;
          fts: unknown | null;
          id: string;
          image_url: string | null;
          iso2: string | null;
          iso3: string | null;
          latitude: number | null;
          longitude: number | null;
          name: string;
          population: number | null;
          simple_maps_id: number | null;
          state_province: string | null;
          updated_at: string | null;
        }[];
      };
      set_feature_preferences: {
        Args: {
          p_feature_id: string;
          p_is_enabled?: boolean;
          p_show_tours?: boolean;
          p_notification_level?: string;
          p_preferences?: Json;
        };
        Returns: boolean;
      };
      set_limit: {
        Args: { '': number };
        Returns: number;
      };
      should_trigger_survey: {
        Args: {
          trigger_id_param: string;
          participant_id_param: string;
          route_param: string;
        };
        Returns: boolean;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { '': string };
        Returns: string[];
      };
      spheroid_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      spheroid_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_3dlength: {
        Args: { '': unknown };
        Returns: number;
      };
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_3dperimeter: {
        Args: { '': unknown };
        Returns: number;
      };
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown };
        Returns: number;
      };
      st_area: {
        Args: { '': string } | { '': unknown } | { geog: unknown; use_spheroid?: boolean };
        Returns: number;
      };
      st_area2d: {
        Args: { '': unknown };
        Returns: number;
      };
      st_asbinary: {
        Args: { '': unknown } | { '': unknown };
        Returns: string;
      };
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number };
        Returns: string;
      };
      st_asewkb: {
        Args: { '': unknown };
        Returns: string;
      };
      st_asewkt: {
        Args: { '': string } | { '': unknown } | { '': unknown };
        Returns: string;
      };
      st_asgeojson: {
        Args:
          | { '': string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              r: Record<string, unknown>;
              geom_column?: string;
              maxdecimaldigits?: number;
              pretty_bool?: boolean;
            };
        Returns: string;
      };
      st_asgml: {
        Args:
          | { '': string }
          | {
              geog: unknown;
              maxdecimaldigits?: number;
              options?: number;
              nprefix?: string;
              id?: string;
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              version: number;
              geog: unknown;
              maxdecimaldigits?: number;
              options?: number;
              nprefix?: string;
              id?: string;
            }
          | {
              version: number;
              geom: unknown;
              maxdecimaldigits?: number;
              options?: number;
              nprefix?: string;
              id?: string;
            };
        Returns: string;
      };
      st_ashexewkb: {
        Args: { '': unknown };
        Returns: string;
      };
      st_askml: {
        Args:
          | { '': string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string };
        Returns: string;
      };
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string };
        Returns: string;
      };
      st_asmarc21: {
        Args: { geom: unknown; format?: string };
        Returns: string;
      };
      st_asmvtgeom: {
        Args: {
          geom: unknown;
          bounds: unknown;
          extent?: number;
          buffer?: number;
          clip_geom?: boolean;
        };
        Returns: unknown;
      };
      st_assvg: {
        Args:
          | { '': string }
          | { geog: unknown; rel?: number; maxdecimaldigits?: number }
          | { geom: unknown; rel?: number; maxdecimaldigits?: number };
        Returns: string;
      };
      st_astext: {
        Args: { '': string } | { '': unknown } | { '': unknown };
        Returns: string;
      };
      st_astwkb: {
        Args:
          | {
              geom: unknown[];
              ids: number[];
              prec?: number;
              prec_z?: number;
              prec_m?: number;
              with_sizes?: boolean;
              with_boxes?: boolean;
            }
          | {
              geom: unknown;
              prec?: number;
              prec_z?: number;
              prec_m?: number;
              with_sizes?: boolean;
              with_boxes?: boolean;
            };
        Returns: string;
      };
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number };
        Returns: string;
      };
      st_azimuth: {
        Args: { geog1: unknown; geog2: unknown } | { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_boundary: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_boundingdiagonal: {
        Args: { geom: unknown; fits?: boolean };
        Returns: unknown;
      };
      st_buffer: {
        Args:
          | { geom: unknown; radius: number; options?: string }
          | { geom: unknown; radius: number; quadsegs: number };
        Returns: unknown;
      };
      st_buildarea: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_centroid: {
        Args: { '': string } | { '': unknown };
        Returns: unknown;
      };
      st_cleangeometry: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_clipbybox2d: {
        Args: { geom: unknown; box: unknown };
        Returns: unknown;
      };
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_clusterintersecting: {
        Args: { '': unknown[] };
        Returns: unknown[];
      };
      st_collect: {
        Args: { '': unknown[] } | { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_collectionextract: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_collectionhomogenize: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_concavehull: {
        Args: {
          param_geom: unknown;
          param_pctconvex: number;
          param_allow_holes?: boolean;
        };
        Returns: unknown;
      };
      st_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_convexhull: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_coorddim: {
        Args: { geometry: unknown };
        Returns: number;
      };
      st_coveredby: {
        Args: { geog1: unknown; geog2: unknown } | { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_covers: {
        Args: { geog1: unknown; geog2: unknown } | { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_curvetoline: {
        Args: { geom: unknown; tol?: number; toltype?: number; flags?: number };
        Returns: unknown;
      };
      st_delaunaytriangles: {
        Args: { g1: unknown; tolerance?: number; flags?: number };
        Returns: unknown;
      };
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_dimension: {
        Args: { '': unknown };
        Returns: number;
      };
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number };
        Returns: number;
      };
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_dump: {
        Args: { '': unknown };
        Returns: Database['public']['CompositeTypes']['geometry_dump'][];
      };
      st_dumppoints: {
        Args: { '': unknown };
        Returns: Database['public']['CompositeTypes']['geometry_dump'][];
      };
      st_dumprings: {
        Args: { '': unknown };
        Returns: Database['public']['CompositeTypes']['geometry_dump'][];
      };
      st_dumpsegments: {
        Args: { '': unknown };
        Returns: Database['public']['CompositeTypes']['geometry_dump'][];
      };
      st_dwithin: {
        Args: {
          geog1: unknown;
          geog2: unknown;
          tolerance: number;
          use_spheroid?: boolean;
        };
        Returns: boolean;
      };
      st_endpoint: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_envelope: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_equals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { geom: unknown; dx: number; dy: number; dz?: number; dm?: number };
        Returns: unknown;
      };
      st_exteriorring: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_flipcoordinates: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_force2d: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_force3d: {
        Args: { geom: unknown; zvalue?: number };
        Returns: unknown;
      };
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number };
        Returns: unknown;
      };
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number };
        Returns: unknown;
      };
      st_force4d: {
        Args: { geom: unknown; zvalue?: number; mvalue?: number };
        Returns: unknown;
      };
      st_forcecollection: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_forcecurve: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_forcepolygonccw: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_forcepolygoncw: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_forcerhr: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_forcesfs: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_generatepoints: {
        Args: { area: unknown; npoints: number } | { area: unknown; npoints: number; seed: number };
        Returns: unknown;
      };
      st_geogfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geogfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geographyfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geohash: {
        Args: { geog: unknown; maxchars?: number } | { geom: unknown; maxchars?: number };
        Returns: string;
      };
      st_geomcollfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomcollfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geometricmedian: {
        Args: {
          g: unknown;
          tolerance?: number;
          max_iter?: number;
          fail_if_not_converged?: boolean;
        };
        Returns: unknown;
      };
      st_geometryfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geometrytype: {
        Args: { '': unknown };
        Returns: string;
      };
      st_geomfromewkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomfromewkt: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomfromgeojson: {
        Args: { '': Json } | { '': Json } | { '': string };
        Returns: unknown;
      };
      st_geomfromgml: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomfromkml: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomfrommarc21: {
        Args: { marc21xml: string };
        Returns: unknown;
      };
      st_geomfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomfromtwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_geomfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_gmltosql: {
        Args: { '': string };
        Returns: unknown;
      };
      st_hasarc: {
        Args: { geometry: unknown };
        Returns: boolean;
      };
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_hexagon: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown };
        Returns: unknown;
      };
      st_hexagongrid: {
        Args: { size: number; bounds: unknown };
        Returns: Record<string, unknown>[];
      };
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown };
        Returns: number;
      };
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_intersects: {
        Args: { geog1: unknown; geog2: unknown } | { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_isclosed: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_iscollection: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_isempty: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_ispolygonccw: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_ispolygoncw: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_isring: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_issimple: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_isvalid: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_isvaliddetail: {
        Args: { geom: unknown; flags?: number };
        Returns: Database['public']['CompositeTypes']['valid_detail'];
      };
      st_isvalidreason: {
        Args: { '': unknown };
        Returns: string;
      };
      st_isvalidtrajectory: {
        Args: { '': unknown };
        Returns: boolean;
      };
      st_length: {
        Args: { '': string } | { '': unknown } | { geog: unknown; use_spheroid?: boolean };
        Returns: number;
      };
      st_length2d: {
        Args: { '': unknown };
        Returns: number;
      };
      st_letters: {
        Args: { letters: string; font?: Json };
        Returns: unknown;
      };
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown };
        Returns: number;
      };
      st_linefromencodedpolyline: {
        Args: { txtin: string; nprecision?: number };
        Returns: unknown;
      };
      st_linefrommultipoint: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_linefromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_linefromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_linemerge: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_linestringfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_linetocurve: {
        Args: { geometry: unknown };
        Returns: unknown;
      };
      st_locatealong: {
        Args: { geometry: unknown; measure: number; leftrightoffset?: number };
        Returns: unknown;
      };
      st_locatebetween: {
        Args: {
          geometry: unknown;
          frommeasure: number;
          tomeasure: number;
          leftrightoffset?: number;
        };
        Returns: unknown;
      };
      st_locatebetweenelevations: {
        Args: { geometry: unknown; fromelevation: number; toelevation: number };
        Returns: unknown;
      };
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_m: {
        Args: { '': unknown };
        Returns: number;
      };
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makeline: {
        Args: { '': unknown[] } | { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makepolygon: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_makevalid: {
        Args: { '': unknown } | { geom: unknown; params: string };
        Returns: unknown;
      };
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_maximuminscribedcircle: {
        Args: { '': unknown };
        Returns: Record<string, unknown>;
      };
      st_memsize: {
        Args: { '': unknown };
        Returns: number;
      };
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number };
        Returns: unknown;
      };
      st_minimumboundingradius: {
        Args: { '': unknown };
        Returns: Record<string, unknown>;
      };
      st_minimumclearance: {
        Args: { '': unknown };
        Returns: number;
      };
      st_minimumclearanceline: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_mlinefromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_mlinefromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_mpointfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_mpointfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_mpolyfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_mpolyfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_multi: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_multilinefromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_multilinestringfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_multipointfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_multipointfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_multipolyfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_multipolygonfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_ndims: {
        Args: { '': unknown };
        Returns: number;
      };
      st_node: {
        Args: { g: unknown };
        Returns: unknown;
      };
      st_normalize: {
        Args: { geom: unknown };
        Returns: unknown;
      };
      st_npoints: {
        Args: { '': unknown };
        Returns: number;
      };
      st_nrings: {
        Args: { '': unknown };
        Returns: number;
      };
      st_numgeometries: {
        Args: { '': unknown };
        Returns: number;
      };
      st_numinteriorring: {
        Args: { '': unknown };
        Returns: number;
      };
      st_numinteriorrings: {
        Args: { '': unknown };
        Returns: number;
      };
      st_numpatches: {
        Args: { '': unknown };
        Returns: number;
      };
      st_numpoints: {
        Args: { '': unknown };
        Returns: number;
      };
      st_offsetcurve: {
        Args: { line: unknown; distance: number; params?: string };
        Returns: unknown;
      };
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_orientedenvelope: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_perimeter: {
        Args: { '': unknown } | { geog: unknown; use_spheroid?: boolean };
        Returns: number;
      };
      st_perimeter2d: {
        Args: { '': unknown };
        Returns: number;
      };
      st_pointfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_pointfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_pointm: {
        Args: {
          xcoordinate: number;
          ycoordinate: number;
          mcoordinate: number;
          srid?: number;
        };
        Returns: unknown;
      };
      st_pointonsurface: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_points: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_pointz: {
        Args: {
          xcoordinate: number;
          ycoordinate: number;
          zcoordinate: number;
          srid?: number;
        };
        Returns: unknown;
      };
      st_pointzm: {
        Args: {
          xcoordinate: number;
          ycoordinate: number;
          zcoordinate: number;
          mcoordinate: number;
          srid?: number;
        };
        Returns: unknown;
      };
      st_polyfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_polyfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_polygonfromtext: {
        Args: { '': string };
        Returns: unknown;
      };
      st_polygonfromwkb: {
        Args: { '': string };
        Returns: unknown;
      };
      st_polygonize: {
        Args: { '': unknown[] };
        Returns: unknown;
      };
      st_project: {
        Args: { geog: unknown; distance: number; azimuth: number };
        Returns: unknown;
      };
      st_quantizecoordinates: {
        Args: {
          g: unknown;
          prec_x: number;
          prec_y?: number;
          prec_z?: number;
          prec_m?: number;
        };
        Returns: unknown;
      };
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number };
        Returns: unknown;
      };
      st_relate: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: string;
      };
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_reverse: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number };
        Returns: unknown;
      };
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number };
        Returns: unknown;
      };
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_shiftlongitude: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_simplifypolygonhull: {
        Args: { geom: unknown; vertex_fraction: number; is_outer?: boolean };
        Returns: unknown;
      };
      st_split: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_square: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown };
        Returns: unknown;
      };
      st_squaregrid: {
        Args: { size: number; bounds: unknown };
        Returns: Record<string, unknown>[];
      };
      st_srid: {
        Args: { geog: unknown } | { geom: unknown };
        Returns: number;
      };
      st_startpoint: {
        Args: { '': unknown };
        Returns: unknown;
      };
      st_subdivide: {
        Args: { geom: unknown; maxvertices?: number; gridsize?: number };
        Returns: unknown[];
      };
      st_summary: {
        Args: { '': unknown } | { '': unknown };
        Returns: string;
      };
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown };
        Returns: unknown;
      };
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_tileenvelope: {
        Args: {
          zoom: number;
          x: number;
          y: number;
          bounds?: unknown;
          margin?: number;
        };
        Returns: unknown;
      };
      st_touches: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_transform: {
        Args:
          | { geom: unknown; from_proj: string; to_proj: string }
          | { geom: unknown; from_proj: string; to_srid: number }
          | { geom: unknown; to_proj: string };
        Returns: unknown;
      };
      st_triangulatepolygon: {
        Args: { g1: unknown };
        Returns: unknown;
      };
      st_union: {
        Args:
          | { '': unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number };
        Returns: unknown;
      };
      st_voronoilines: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown };
        Returns: unknown;
      };
      st_voronoipolygons: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown };
        Returns: unknown;
      };
      st_within: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_wkbtosql: {
        Args: { wkb: string };
        Returns: unknown;
      };
      st_wkttosql: {
        Args: { '': string };
        Returns: unknown;
      };
      st_wrapx: {
        Args: { geom: unknown; wrap: number; move: number };
        Returns: unknown;
      };
      st_x: {
        Args: { '': unknown };
        Returns: number;
      };
      st_xmax: {
        Args: { '': unknown };
        Returns: number;
      };
      st_xmin: {
        Args: { '': unknown };
        Returns: number;
      };
      st_y: {
        Args: { '': unknown };
        Returns: number;
      };
      st_ymax: {
        Args: { '': unknown };
        Returns: number;
      };
      st_ymin: {
        Args: { '': unknown };
        Returns: number;
      };
      st_z: {
        Args: { '': unknown };
        Returns: number;
      };
      st_zmax: {
        Args: { '': unknown };
        Returns: number;
      };
      st_zmflag: {
        Args: { '': unknown };
        Returns: number;
      };
      st_zmin: {
        Args: { '': unknown };
        Returns: number;
      };
      start_onboarding_tour: {
        Args: { p_tour_id: string; p_session_id?: string };
        Returns: boolean;
      };
      sync_event_fields_manual: {
        Args: { event_id: string };
        Returns: undefined;
      };
      text: {
        Args: { '': unknown };
        Returns: string;
      };
      track_research_event_fallback: {
        Args: {
          event_type: string;
          participant_id: string;
          study_id: string;
          event_data?: Json;
          event_name?: string;
        };
        Returns: string;
      };
      transfer_group_ownership: {
        Args: { p_group_id: string; p_new_owner_id: string };
        Returns: boolean;
      };
      unaccent: {
        Args: { '': string };
        Returns: string;
      };
      unaccent_init: {
        Args: { '': unknown };
        Returns: unknown;
      };
      unlockrows: {
        Args: { '': string };
        Returns: number;
      };
      update_itinerary_item_position: {
        Args: {
          p_item_id: string;
          p_trip_id: string;
          p_day_number: number;
          p_position: number;
        };
        Returns: undefined;
      };
      update_onboarding_step: {
        Args: { p_step: string; p_data?: Json };
        Returns: boolean;
      };
      update_popularity_metrics: {
        Args: { p_item_id: string; p_action: string };
        Returns: undefined;
      };
      update_profile_onboarding: {
        Args: {
          p_user_id: string;
          p_first_name?: string;
          p_travel_personality?: Database['public']['Enums']['travel_personality_type'];
          p_travel_squad?: Database['public']['Enums']['travel_squad_type'];
          p_onboarding_step?: number;
          p_complete_onboarding?: boolean;
        };
        Returns: Json;
      };
      updategeometrysrid: {
        Args: {
          catalogn_name: string;
          schema_name: string;
          table_name: string;
          column_name: string;
          new_srid_in: number;
        };
        Returns: string;
      };
      validate_itinerary: {
        Args: { p_trip_id: string; p_template_id: string };
        Returns: {
          is_valid: boolean;
          validation_errors: string[];
        }[];
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
        | 'itinerary'
        | 'place'
        | 'attraction'
        | 'guide';
      group_idea_type: 'destination' | 'date' | 'activity' | 'budget' | 'other';
      image_type: 'destination' | 'trip_cover' | 'user_avatar' | 'template_cover';
      interaction_type: 'like' | 'visit' | 'bookmark' | 'tag';
      invitation_status: 'pending' | 'accepted' | 'declined' | 'expired';
      invitation_type: 'trip' | 'group' | 'referral';
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
      milestone_type:
        | 'COMPLETE_ONBOARDING'
        | 'ITINERARY_MILESTONE_3_ITEMS'
        | 'GROUP_FORMATION_COMPLETE'
        | 'VOTE_PROCESS_USED'
        | 'TRIP_FROM_TEMPLATE_CREATED';
      nomination_status: 'pending' | 'approved' | 'rejected';
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
      published_status: 'draft' | 'pending review' | 'published' | 'archived';
      state_province_type_enum:
        | 'state'
        | 'province'
        | 'territory'
        | 'region'
        | 'department'
        | 'district'
        | 'county'
        | 'prefecture'
        | 'oblast'
        | 'autonomous_region'
        | 'municipality'
        | 'other';
      subscription_level: 'free' | 'premium';
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
      user_role: 'user' | 'admin' | 'moderator' | 'support' | 'guest';
      vote_type: 'up' | 'down';
    };
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null;
        geom: unknown | null;
      };
      valid_detail: {
        valid: boolean | null;
        reason: string | null;
        location: unknown | null;
      };
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      budget_category: [
        'accommodation',
        'transportation',
        'food',
        'activities',
        'shopping',
        'other',
      ],
      content_type: [
        'trip',
        'itinerary_item',
        'destination',
        'collection',
        'itinerary',
        'place',
        'attraction',
        'guide',
      ],
      group_idea_type: ['destination', 'date', 'activity', 'budget', 'other'],
      image_type: ['destination', 'trip_cover', 'user_avatar', 'template_cover'],
      interaction_type: ['like', 'visit', 'bookmark', 'tag'],
      invitation_status: ['pending', 'accepted', 'declined', 'expired'],
      invitation_type: ['trip', 'group', 'referral'],
      item_status: ['suggested', 'confirmed', 'rejected'],
      itinerary_category: [
        'Iconic Landmarks',
        'Local Secrets',
        'Cultural Experiences',
        'Outdoor Adventures',
        'Food & Drink',
        'Nightlife',
        'Relaxation',
        'Shopping',
        'Group Activities',
        'Day Excursions',
        'Accommodations',
        'Transportation',
        'Flexible Options',
        'Special Occasions',
        'Other',
      ],
      itinerary_item_status: ['pending', 'approved', 'rejected'],
      milestone_type: [
        'COMPLETE_ONBOARDING',
        'ITINERARY_MILESTONE_3_ITEMS',
        'GROUP_FORMATION_COMPLETE',
        'VOTE_PROCESS_USED',
        'TRIP_FROM_TEMPLATE_CREATED',
      ],
      nomination_status: ['pending', 'approved', 'rejected'],
      place_category: [
        'attraction',
        'restaurant',
        'cafe',
        'hotel',
        'landmark',
        'shopping',
        'transport',
        'other',
      ],
      privacy_setting: ['private', 'shared_with_link', 'public'],
      published_status: ['draft', 'pending review', 'published', 'archived'],
      state_province_type_enum: [
        'state',
        'province',
        'territory',
        'region',
        'department',
        'district',
        'county',
        'prefecture',
        'oblast',
        'autonomous_region',
        'municipality',
        'other',
      ],
      subscription_level: ['free', 'premium'],
      tag_status: ['pending', 'approved', 'rejected'],
      travel_pace: ['very_slow', 'slow', 'moderate', 'fast', 'very_fast'],
      travel_personality_type: [
        'planner',
        'adventurer',
        'foodie',
        'sightseer',
        'relaxer',
        'culture',
      ],
      travel_squad_type: ['friends', 'family', 'partner', 'solo', 'coworkers', 'mixed'],
      travel_style: [
        'adventurous',
        'relaxed',
        'cultural',
        'luxury',
        'budget',
        'family',
        'solo',
        'nightlife',
        'nature',
        'food_focused',
      ],
      trip_action_type: [
        'TRIP_CREATED',
        'TRIP_UPDATED',
        'ITINERARY_ITEM_ADDED',
        'ITINERARY_ITEM_UPDATED',
        'ITINERARY_ITEM_DELETED',
        'MEMBER_ADDED',
        'MEMBER_REMOVED',
        'MEMBER_ROLE_UPDATED',
        'INVITATION_SENT',
        'ACCESS_REQUEST_SENT',
        'ACCESS_REQUEST_UPDATED',
        'NOTE_CREATED',
        'NOTE_UPDATED',
        'NOTE_DELETED',
        'IMAGE_UPLOADED',
        'TAG_ADDED',
        'TAG_REMOVED',
        'SPLITWISE_GROUP_LINKED',
        'SPLITWISE_GROUP_UNLINKED',
        'SPLITWISE_GROUP_CREATED_AND_LINKED',
        'COMMENT_ADDED',
        'COMMENT_UPDATED',
        'COMMENT_DELETED',
        'VOTE_CAST',
        'FOCUS_INITIATED',
      ],
      trip_privacy_setting: ['private', 'shared_with_link', 'public'],
      trip_role: ['admin', 'editor', 'viewer', 'contributor'],
      trip_status: ['planning', 'upcoming', 'in_progress', 'completed', 'cancelled'],
      trip_type: ['leisure', 'business', 'family', 'solo', 'group', 'other'],
      url_format: ['canonical', 'short', 'social', 'tracking'],
      user_role: ['user', 'admin', 'moderator', 'support', 'guest'],
      vote_type: ['up', 'down'],
    },
  },
} as const;
