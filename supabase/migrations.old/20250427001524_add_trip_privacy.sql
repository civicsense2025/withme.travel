ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS privacy_setting text DEFAULT 'private';
-- Add other manually added columns or changes here if known 