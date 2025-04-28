export interface Profile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  is_admin?: boolean
  bio?: string | null
  location?: string | null
  website?: string | null
  referred_by?: string | null
}

export interface Trip {
  id: string
  created_by: string | null
  name: string
  destination_id: string | null
  destination_name: string | null
  start_date: string | null
  end_date: string | null
  date_flexibility: string | null
  travelers_count: number
  vibe: string | null
  budget: string | null
  is_public: boolean
  slug: string | null
  cover_image_url: string | null
  created_at: string
  updated_at: string
  member_count: number | null
  description: string | null
  trip_emoji: string | null
  duration_days: number
  status: 'planning' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
  likes_count: number
  comments_count: number
  view_count: number
  use_count: number
  shared_url: string | null
  public_slug: string | null
  trip_type: string | null
  privacy_setting?: 'private' | 'shared_with_link' | 'public' | null
}

export interface ItineraryTemplate {
  id: string
  title: string
  slug: string
  description: string | null
  destination_id: string
  duration_days: number
  category: string | null
  created_by: string
  created_at: string
  updated_at: string
  is_published: boolean
  view_count: number
  use_count: number
  like_count: number
  featured: boolean
  cover_image_url: string | null
  groupsize: string | null
  tags: string[] | null
  template_type: 'official' | 'user_created' | 'trip_based' | null
  source_trip_id: string | null
  version: number
  copied_count: number
  last_copied_at: string | null
  metadata: Record<string, any> | null
}

export interface ItineraryTemplateSection {
  id: string
  template_id: string
  day_number: number
  title: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface ItineraryTemplateItem {
  id: string
  template_id: string
  section_id: string
  day: number
  item_order: number
  title: string | null
  description: string | null
  start_time: string | null
  end_time: string | null
  location: string | null
  place_id: string | null
  created_at: string
  updated_at: string
  category?: string | null
  estimated_cost?: number | null
  currency?: string | null
  duration_minutes?: number | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  links?: string[] | null
}

export interface ItinerarySection {
  id: string
  trip_id: string
  day_number: number
  date: string | null
  title: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface ItineraryItem {
  id: string
  trip_id: string
  section_id: string | null
  day_number: number | null
  position: number | null
  title: string
  description: string | null
  original_description: string | null
  personal_notes: string | null
  start_time: string | null
  end_time: string | null
  duration_minutes: number | null
  location: string | null
  address: string | null
  place_id: string | null
  latitude: number | null
  longitude: number | null
  cost: number | null
  estimated_cost: number | null
  currency: string | null
  category: string | null
  status: string | null
  cover_image_url: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  content_layer: string | null
  source_template_item_id: string | null
  source_item_id: string | null
  original_creator_id: string | null
  attribution_type: string | null
  attribution_metadata: Record<string, any> | null
  quality_tier: string | null
  quality_score: number | null
  popularity_score: number | null
  view_count: number | null
  like_count: number | null
  share_count: number | null
  public_slug: string | null
  canonical_id: string | null
  canonical_url: string | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[] | null
  structured_data: Record<string, any> | null
}

export interface TemplateApplication {
  id: string
  trip_id: string
  template_id: string
  applied_at: string
  applied_by: string | null
  template_version_used: number | null
  success_rate: number | null
  optimization_level: string | null
  fallbacks_used: number | null
  application_metadata: Record<string, any> | null
}

export interface ValidationLog {
  id: string
  trip_id: string | null
  template_id: string | null
  item_id: string | null
  is_valid: boolean
  validation_errors: string[] | null
  validated_at: string
  validated_by: string | null
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'created_at' | 'updated_at'>>
      }
      trips: {
        Row: Trip
        Insert: Omit<Trip, 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'view_count' | 'use_count'>
        Update: Partial<Omit<Trip, 'created_at' | 'updated_at'>>
      }
      itinerary_templates: {
        Row: ItineraryTemplate
        Insert: Omit<ItineraryTemplate, 'created_at' | 'updated_at' | 'view_count' | 'use_count' | 'like_count' | 'copied_count' | 'last_copied_at' | 'version'>
        Update: Partial<Omit<ItineraryTemplate, 'created_at' | 'updated_at'>>
      }
      itinerary_template_sections: {
        Row: ItineraryTemplateSection
        Insert: Omit<ItineraryTemplateSection, 'created_at' | 'updated_at'>
        Update: Partial<Omit<ItineraryTemplateSection, 'created_at' | 'updated_at'>>
      }
      itinerary_template_items: {
        Row: ItineraryTemplateItem
        Insert: Omit<ItineraryTemplateItem, 'created_at' | 'updated_at'>
        Update: Partial<Omit<ItineraryTemplateItem, 'created_at' | 'updated_at'>>
      }
      itinerary_sections: {
        Row: ItinerarySection
        Insert: Omit<ItinerarySection, 'created_at' | 'updated_at'>
        Update: Partial<Omit<ItinerarySection, 'created_at' | 'updated_at'>>
      }
      itinerary_items: {
        Row: ItineraryItem
        Insert: Omit<ItineraryItem, 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'share_count'>
        Update: Partial<Omit<ItineraryItem, 'created_at' | 'updated_at'>>
      }
      template_applications: {
        Row: TemplateApplication
        Insert: Omit<TemplateApplication, 'id'>
        Update: Partial<TemplateApplication>
      }
      validation_logs: {
        Row: ValidationLog
        Insert: Omit<ValidationLog, 'id' | 'validated_at'>
        Update: Partial<ValidationLog>
      }
    }
    Views: {
      // Add view definitions if needed...
    }
    Functions: {
      // Add function definitions if needed...
    }
    Enums: {
      image_type: 'destination' | 'trip_cover' | 'user_avatar' | 'template_cover'
      interaction_type: 'like' | 'visit' | 'bookmark' | 'tag'
      invitation_status: 'pending' | 'accepted' | 'declined' | 'expired'
      item_status: 'suggested' | 'confirmed' | 'rejected'
      itinerary_category: 'flight' | 'accommodation' | 'attraction' | 'restaurant' | 'cafe' | 'transportation' | 'activity' | 'custom' | 'other'
      place_category: 'attraction' | 'restaurant' | 'cafe' | 'hotel' | 'landmark' | 'shopping' | 'transport' | 'other'
      tag_status: 'pending' | 'approved' | 'rejected'
      travel_personality_type: 'planner' | 'adventurer' | 'foodie' | 'sightseer' | 'relaxer' | 'culture'
      travel_squad_type: 'friends' | 'family' | 'partner' | 'solo' | 'coworkers' | 'mixed'
      trip_action_type: 'TRIP_CREATED' | 'TRIP_UPDATED' | 'ITINERARY_ITEM_ADDED' | 'ITINERARY_ITEM_UPDATED' | 'ITINERARY_ITEM_DELETED' | 'MEMBER_ADDED' | 'MEMBER_REMOVED' | 'MEMBER_ROLE_UPDATED' | 'INVITATION_SENT' | 'ACCESS_REQUEST_SENT' | 'ACCESS_REQUEST_UPDATED' | 'NOTE_CREATED' | 'NOTE_UPDATED' | 'NOTE_DELETED' | 'IMAGE_UPLOADED' | 'TAG_ADDED' | 'TAG_REMOVED' | 'SPLITWISE_GROUP_LINKED' | 'SPLITWISE_GROUP_UNLINKED' | 'SPLITWISE_GROUP_CREATED_AND_LINKED'
      trip_role: 'admin' | 'editor' | 'viewer' | 'contributor'
      trip_status: 'planning' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
      vote_type: 'up' | 'down'
    }
    CompositeTypes: {
      // Add composite type definitions if needed...
    }
  }
} 