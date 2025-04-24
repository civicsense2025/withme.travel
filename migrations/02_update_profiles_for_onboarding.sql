-- Drop existing types and dependent objects if they exist
DROP TYPE IF EXISTS public.travel_personality_type CASCADE;
DROP TYPE IF EXISTS public.travel_squad_type CASCADE;

-- Create enum for travel personality types
CREATE TYPE public.travel_personality_type AS ENUM (
  'planner',
  'adventurer',
  'foodie',
  'sightseer',
  'relaxer',
  'culture'
);

-- Create enum for travel squad types
CREATE TYPE public.travel_squad_type AS ENUM (
  'friends',
  'family',
  'partner',
  'solo',
  'coworkers',
  'mixed'
);

-- Update profiles table with onboarding information
-- The types must exist before altering the table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS travel_personality public.travel_personality_type,
  ADD COLUMN IF NOT EXISTS travel_squad public.travel_squad_type,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 1;

-- Drop the function if it exists to avoid issues with type changes
DROP FUNCTION IF EXISTS public.update_profile_onboarding(uuid, text, public.travel_personality_type, public.travel_squad_type, integer, boolean);

-- Create function to update profile during onboarding
-- Function needs to be SECURITY DEFINER to update profiles table
CREATE OR REPLACE FUNCTION public.update_profile_onboarding(
  p_user_id uuid,
  p_first_name text DEFAULT NULL,
  p_travel_personality public.travel_personality_type DEFAULT NULL,
  p_travel_squad public.travel_squad_type DEFAULT NULL,
  p_onboarding_step integer DEFAULT NULL,
  p_complete_onboarding boolean DEFAULT false
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
-- Set search_path to public to ensure it finds the profiles table
SET search_path = public
AS $$
DECLARE
  v_profile json;
BEGIN
  -- Ensure the function is called by the user whose profile is being updated
  IF auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'You can only update your own profile.';
  END IF;

  -- Update the profile
  UPDATE public.profiles
  SET
    first_name = COALESCE(p_first_name, first_name),
    travel_personality = COALESCE(p_travel_personality, travel_personality),
    travel_squad = COALESCE(p_travel_squad, travel_squad),
    onboarding_step = COALESCE(p_onboarding_step, onboarding_step),
    onboarding_completed = CASE
      WHEN p_complete_onboarding THEN true
      ELSE onboarding_completed
    END,
    onboarding_completed_at = CASE
      WHEN p_complete_onboarding THEN now()
      ELSE onboarding_completed_at
    END,
    updated_at = now()
  WHERE id = p_user_id
  RETURNING json_build_object(
    'id', id,
    'first_name', first_name,
    'travel_personality', travel_personality,
    'travel_squad', travel_squad,
    'onboarding_step', onboarding_step,
    'onboarding_completed', onboarding_completed,
    'onboarding_completed_at', onboarding_completed_at
  ) INTO v_profile;

  RETURN v_profile;
END;
$$;

-- RLS Policies for profiles table updates
-- Ensure existing select/insert policies are appropriate
-- Assuming a policy exists like: CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
-- Assuming a policy exists like: CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Add policy for updating onboarding fields
DROP POLICY IF EXISTS "Users can update their own profile onboarding info." ON public.profiles;
CREATE POLICY "Users can update their own profile onboarding info." ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id) -- Ensures the user owns the row they are trying to update
  WITH CHECK (auth.uid() = id); -- Ensures the final row still belongs to the user (redundant here but good practice)
  -- The check inside the `update_profile_onboarding` function handles the authorization for updates via RPC.
  -- Direct updates not matching this policy (or other UPDATE policies) would be denied.

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.update_profile_onboarding(
  p_user_id uuid,
  p_first_name text,
  p_travel_personality public.travel_personality_type,
  p_travel_squad public.travel_squad_type,
  p_onboarding_step integer,
  p_complete_onboarding boolean
) TO authenticated; 