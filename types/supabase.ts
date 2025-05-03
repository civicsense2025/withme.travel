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
          accessibility?: number | null;
          address?: string | null;
          avg_cost_per_day?: number | null;
          avg_days?: number | null;
          beach_quality?: number | null;
          best_season?: string | null;
          byline?: string | null;
          city?: string | null;
          continent?: string | null;
          country?: string | null;
          created_at?: string;
          cuisine_rating?: number | null;
          cultural_attractions?: number | null;
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
          state_province?: string | null;
          time_zone?: string | null;
          updated_at?: string | null;
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
          continent?: string | null;
          country?: string | null;
          created_at?: string;
          cuisine_rating?: number | null;
          cultural_attractions?: number | null;
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
          state_province?: string | null;
          time_zone?: string | null;
          updated_at?: string | null;
          visa_required?: boolean | null;
          walkability?: number | null;
          wifi_connectivity?: number | null;
        };
        Relationships: [];
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
            foreignKeyName: 'expenses_paid_by_fkey';
            columns: ['paid_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'expenses_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
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
      invitations: {
        Row: {
          created_at: string;
          email: string;
          expires_at: string;
          id: number;
          invitation_status: Database['public']['Enums']['invitation_status'];
          invited_by: string | null;
          token: string;
          trip_id: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          expires_at: string;
          id?: number;
          invitation_status?: Database['public']['Enums']['invitation_status'];
          invited_by?: string | null;
          token: string;
          trip_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: number;
          invitation_status?: Database['public']['Enums']['invitation_status'];
          invited_by?: string | null;
          token?: string;
          trip_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'invitations_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
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
          day_number?: number | null;
          duration_minutes?: number | null;
          end_time?: string | null;
          estimated_cost?: number | null;
          id?: string;
          is_custom?: boolean | null;
          item_type?: string | null;
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
          day_number?: number | null;
          duration_minutes?: number | null;
          end_time?: string | null;
          estimated_cost?: number | null;
          id?: string;
          is_custom?: boolean | null;
          item_type?: string | null;
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
            foreignKeyName: 'fk_itinerary_items_place';
            columns: ['place_id'];
            isOneToOne: false;
            referencedRelation: 'places';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_itinerary_items_trip';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'itinerary_items_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
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
          created_at: string | null;
          day: number;
          description: string | null;
          end_time: string | null;
          id: string;
          item_order: number;
          location: string | null;
          place_id: string | null;
          start_time: string | null;
          template_id: string;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          day: number;
          description?: string | null;
          end_time?: string | null;
          id?: string;
          item_order?: number;
          location?: string | null;
          place_id?: string | null;
          start_time?: string | null;
          template_id: string;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          day?: number;
          description?: string | null;
          end_time?: string | null;
          id?: string;
          item_order?: number;
          location?: string | null;
          place_id?: string | null;
          start_time?: string | null;
          template_id?: string;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_itinerary_template_items_place_id';
            columns: ['place_id'];
            isOneToOne: false;
            referencedRelation: 'places';
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
          id: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
        };
        Update: {
          created_at?: string;
          id?: number;
        };
        Relationships: [];
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
          is_published: boolean | null;
          last_copied_at: string | null;
          like_count: number | null;
          metadata: Json | null;
          slug: string;
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
          is_published?: boolean | null;
          last_copied_at?: string | null;
          like_count?: number | null;
          metadata?: Json | null;
          slug: string;
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
          is_published?: boolean | null;
          last_copied_at?: string | null;
          like_count?: number | null;
          metadata?: Json | null;
          slug?: string;
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
            foreignKeyName: 'itinerary_templates_created_by_fkey1';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
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
      likes: {
        Row: {
          created_at: string;
          id: string;
          item_id: string;
          item_type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_id: string;
          item_type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string;
          item_type?: string;
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
      notification_preferences: {
        Row: {
          comments: boolean | null;
          created_at: string | null;
          email_enabled: boolean | null;
          focus_events: boolean | null;
          id: string;
          in_app_enabled: boolean | null;
          itinerary_changes: boolean | null;
          member_activity: boolean | null;
          push_enabled: boolean | null;
          trip_updates: boolean | null;
          updated_at: string | null;
          user_id: string;
          votes: boolean | null;
        };
        Insert: {
          comments?: boolean | null;
          created_at?: string | null;
          email_enabled?: boolean | null;
          focus_events?: boolean | null;
          id?: string;
          in_app_enabled?: boolean | null;
          itinerary_changes?: boolean | null;
          member_activity?: boolean | null;
          push_enabled?: boolean | null;
          trip_updates?: boolean | null;
          updated_at?: string | null;
          user_id: string;
          votes?: boolean | null;
        };
        Update: {
          comments?: boolean | null;
          created_at?: string | null;
          email_enabled?: boolean | null;
          focus_events?: boolean | null;
          id?: string;
          in_app_enabled?: boolean | null;
          itinerary_changes?: boolean | null;
          member_activity?: boolean | null;
          push_enabled?: boolean | null;
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
          content: string;
          created_at?: string | null;
          expires_at?: string | null;
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
            foreignKeyName: 'notifications_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
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
        Relationships: [
          {
            foreignKeyName: 'permission_requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      places: {
        Row: {
          address: string | null;
          category: Database['public']['Enums']['place_category'] | null;
          created_at: string;
          description: string | null;
          destination_id: string | null;
          id: string;
          images: string[] | null;
          is_verified: boolean | null;
          latitude: number | null;
          longitude: number | null;
          name: string;
          opening_hours: Json | null;
          price_level: number | null;
          rating: number | null;
          rating_count: number | null;
          source: string | null;
          source_id: string | null;
          suggested_by: string | null;
          tags: string[] | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          category?: Database['public']['Enums']['place_category'] | null;
          created_at?: string;
          description?: string | null;
          destination_id?: string | null;
          id?: string;
          images?: string[] | null;
          is_verified?: boolean | null;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          opening_hours?: Json | null;
          price_level?: number | null;
          rating?: number | null;
          rating_count?: number | null;
          source?: string | null;
          source_id?: string | null;
          suggested_by?: string | null;
          tags?: string[] | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          category?: Database['public']['Enums']['place_category'] | null;
          created_at?: string;
          description?: string | null;
          destination_id?: string | null;
          id?: string;
          images?: string[] | null;
          is_verified?: boolean | null;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          opening_hours?: Json | null;
          price_level?: number | null;
          rating?: number | null;
          rating_count?: number | null;
          source?: string | null;
          source_id?: string | null;
          suggested_by?: string | null;
          tags?: string[] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'places_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'places_suggested_by_fkey';
            columns: ['suggested_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
          email: string | null;
          first_name: string | null;
          home_location_id: string | null;
          id: string;
          is_admin: boolean | null;
          is_verified: boolean | null;
          location: string | null;
          name: string | null;
          onboarding_completed: boolean | null;
          onboarding_completed_at: string | null;
          onboarding_step: number | null;
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
          email?: string | null;
          first_name?: string | null;
          home_location_id?: string | null;
          id: string;
          is_admin?: boolean | null;
          is_verified?: boolean | null;
          location?: string | null;
          name?: string | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          onboarding_step?: number | null;
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
          email?: string | null;
          first_name?: string | null;
          home_location_id?: string | null;
          id?: string;
          is_admin?: boolean | null;
          is_verified?: boolean | null;
          location?: string | null;
          name?: string | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          onboarding_step?: number | null;
          travel_personality?: Database['public']['Enums']['travel_personality_type'] | null;
          travel_squad?: Database['public']['Enums']['travel_squad_type'] | null;
          updated_at?: string | null;
          username?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_home_location_id_fkey';
            columns: ['home_location_id'];
            isOneToOne: false;
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'referrals_referred_id_fkey';
            columns: ['referred_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'referrals_referrer_id_fkey';
            columns: ['referrer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
      trip_members: {
        Row: {
          created_at: string | null;
          external_email: string | null;
          id: string;
          invited_by: string | null;
          joined_at: string | null;
          role: Database['public']['Enums']['trip_role'];
          trip_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          external_email?: string | null;
          id?: string;
          invited_by?: string | null;
          joined_at?: string | null;
          role?: Database['public']['Enums']['trip_role'];
          trip_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          external_email?: string | null;
          id?: string;
          invited_by?: string | null;
          joined_at?: string | null;
          role?: Database['public']['Enums']['trip_role'];
          trip_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_members_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_members_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trip_members_user_id_fkey1';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
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
            foreignKeyName: 'trip_notes_updated_by_fkey1';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
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
          comments_count: number | null;
          cover_image_position_y: number | null;
          cover_image_url: string | null;
          created_at: string;
          created_by: string;
          date_flexibility: string | null;
          description: string | null;
          destination_id: string | null;
          destination_name: string | null;
          duration_days: number | null;
          end_date: string | null;
          id: string;
          is_public: boolean;
          likes_count: number | null;
          member_count: number | null;
          name: string;
          playlist_url: string | null;
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
          comments_count?: number | null;
          cover_image_position_y?: number | null;
          cover_image_url?: string | null;
          created_at?: string;
          created_by: string;
          date_flexibility?: string | null;
          description?: string | null;
          destination_id?: string | null;
          destination_name?: string | null;
          duration_days?: number | null;
          end_date?: string | null;
          id?: string;
          is_public?: boolean;
          likes_count?: number | null;
          member_count?: number | null;
          name: string;
          playlist_url?: string | null;
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
          comments_count?: number | null;
          cover_image_position_y?: number | null;
          cover_image_url?: string | null;
          created_at?: string;
          created_by?: string;
          date_flexibility?: string | null;
          description?: string | null;
          destination_id?: string | null;
          destination_name?: string | null;
          duration_days?: number | null;
          end_date?: string | null;
          id?: string;
          is_public?: boolean;
          likes_count?: number | null;
          member_count?: number | null;
          name?: string;
          playlist_url?: string | null;
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
            foreignKeyName: 'trips_cover_image_url_fkey';
            columns: ['cover_image_url'];
            isOneToOne: true;
            referencedRelation: 'trips';
            referencedColumns: ['cover_image_url'];
          },
          {
            foreignKeyName: 'trips_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
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
        ];
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
        Relationships: [];
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
            referencedRelation: 'users';
            referencedColumns: ['id'];
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
        ];
      };
      user_travel: {
        Row: {
          destination_id: string;
          user_id: string;
          visited_at: string;
        };
        Insert: {
          destination_id: string;
          user_id: string;
          visited_at?: string;
        };
        Update: {
          destination_id?: string;
          user_id?: string;
          visited_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_travel_destination_id_fkey';
            columns: ['destination_id'];
            isOneToOne: false;
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_travel_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          interests: string[] | null;
          is_admin: boolean | null;
          last_sign_in_at: string | null;
          location: string | null;
          name: string | null;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id?: string;
          interests?: string[] | null;
          is_admin?: boolean | null;
          last_sign_in_at?: string | null;
          location?: string | null;
          name?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          interests?: string[] | null;
          is_admin?: boolean | null;
          last_sign_in_at?: string | null;
          location?: string | null;
          name?: string | null;
          updated_at?: string | null;
          username?: string | null;
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
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
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
      calculate_preference_match: {
        Args: { p_item_id: string; p_user_id: string };
        Returns: number;
      };
      can_manage_trip_members: {
        Args: { p_trip_id: string };
        Returns: boolean;
      };
      cleanup_old_metrics: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
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
      get_destination_recommendations: {
        Args: { p_user_id: string; p_limit?: number };
        Returns: {
          destination_id: string;
          match_score: number;
          matching_tags: Json;
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
      get_unread_notification_count: {
        Args: { user_id_param: string };
        Returns: number;
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
      is_poll_expired: {
        Args: { poll_id_param: string };
        Returns: boolean;
      };
      is_trip_member: {
        Args: { p_trip_id: string } | { p_trip_id: string; p_user_id: string };
        Returns: boolean;
      };
      is_trip_member_with_role: {
        Args: { _trip_id: string; _user_id: string; _roles: string[] };
        Returns: boolean;
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
      update_itinerary_item_position: {
        Args: {
          p_item_id: string;
          p_trip_id: string;
          p_day_number: number;
          p_position: number;
        };
        Returns: undefined;
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
      content_type: ['trip', 'itinerary_item', 'destination', 'collection', 'template'],
      image_type: ['destination', 'trip_cover', 'user_avatar', 'template_cover'],
      interaction_type: ['like', 'visit', 'bookmark', 'tag'],
      invitation_status: ['pending', 'accepted', 'declined', 'expired'],
      item_status: ['suggested', 'confirmed', 'rejected'],
      itinerary_category: [
        'flight',
        'accommodation',
        'attraction',
        'restaurant',
        'cafe',
        'transportation',
        'activity',
        'custom',
        'other',
      ],
      itinerary_item_status: ['pending', 'approved', 'rejected'],
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
      vote_type: ['up', 'down'],
    },
  },
} as const;