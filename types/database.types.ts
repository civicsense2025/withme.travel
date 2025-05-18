/**
 * Database Type Declarations
 * 
 * This file contains TypeScript type definitions for our database schema.
 * Used by Supabase client for type safety.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Core Trip Tables
      trips: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          created_by: string
          created_at: string
          updated_at: string | null
          destination_name: string | null
          destination_id: string | null
          cover_image_url: string | null
          is_public: boolean | null
          status: string | null
          city_id: string | null
          color_scheme: string | null
          budget: string | null
          cover_image_position_y: number | null
          comments_count: number | null
          view_count: number | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string | null
          destination_name?: string | null
          destination_id?: string | null
          cover_image_url?: string | null
          is_public?: boolean | null
          status?: string | null
          city_id?: string | null
          color_scheme?: string | null
          budget?: string | null
          cover_image_position_y?: number | null
          comments_count?: number | null
          view_count?: number | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string | null
          destination_name?: string | null
          destination_id?: string | null
          cover_image_url?: string | null
          is_public?: boolean | null
          status?: string | null
          city_id?: string | null
          color_scheme?: string | null
          budget?: string | null
          cover_image_position_y?: number | null
          comments_count?: number | null
          view_count?: number | null
        }
      }
      
      // Places/Destinations Tables
      places: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          address: string | null
          price_level: number | null
          destination_id: string | null
          is_verified: boolean | null
          suggested_by: string | null
          source: string | null
          latitude: number | null
          longitude: number | null
          rating: number | null
          rating_count: number | null
          place_type: string | null
          website: string | null
          phone_number: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          address?: string | null
          price_level?: number | null
          destination_id?: string | null
          is_verified?: boolean | null
          suggested_by?: string | null
          source?: string | null
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          rating_count?: number | null
          place_type?: string | null
          website?: string | null
          phone_number?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          address?: string | null
          price_level?: number | null
          destination_id?: string | null
          is_verified?: boolean | null
          suggested_by?: string | null
          source?: string | null
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          rating_count?: number | null
          place_type?: string | null
          website?: string | null
          phone_number?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      
      // Other tables can be added here as needed
      // This is a minimal definition to resolve type errors
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 