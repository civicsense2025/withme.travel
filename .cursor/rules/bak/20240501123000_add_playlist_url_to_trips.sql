-- Supabase migration: Add playlist_url column to trips table
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS playlist_url TEXT DEFAULT NULL; 