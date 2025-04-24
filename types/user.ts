export interface User {
  id: string
  email: string
  full_name: string
  display_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  last_sign_in_at?: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    currency: string
    language: string
    notifications: {
      email: boolean
      push: boolean
      trip_updates: boolean
      trip_reminders: boolean
      friend_requests: boolean
      trip_invites: boolean
    }
    privacy: {
      profile_visibility: 'private' | 'friends' | 'public'
      show_trips: boolean
      show_location: boolean
    }
  }
  bio?: string
  location?: string
  website?: string
  social_links?: {
    instagram?: string
    twitter?: string
    facebook?: string
    linkedin?: string
  }
  stats?: {
    trips_count: number
    countries_visited: number
    followers_count: number
    following_count: number
  }
  verified_email: boolean
  is_admin: boolean
} 