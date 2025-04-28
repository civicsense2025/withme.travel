--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgsodium WITH SCHEMA pgsodium;


--
-- Name: EXTENSION pgsodium; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgsodium IS 'Pgsodium is a modern cryptography library for Postgres.';


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: budget_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.budget_category AS ENUM (
    'accommodation',
    'transportation',
    'food',
    'activities',
    'shopping',
    'other'
);


ALTER TYPE public.budget_category OWNER TO postgres;

--
-- Name: image_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.image_type AS ENUM (
    'destination',
    'trip_cover',
    'user_avatar',
    'template_cover'
);


ALTER TYPE public.image_type OWNER TO postgres;

--
-- Name: interaction_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.interaction_type AS ENUM (
    'like',
    'visit',
    'bookmark',
    'tag'
);


ALTER TYPE public.interaction_type OWNER TO postgres;

--
-- Name: invitation_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.invitation_status AS ENUM (
    'pending',
    'accepted',
    'declined',
    'expired'
);


ALTER TYPE public.invitation_status OWNER TO postgres;

--
-- Name: item_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.item_status AS ENUM (
    'suggested',
    'confirmed',
    'rejected'
);


ALTER TYPE public.item_status OWNER TO postgres;

--
-- Name: itinerary_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.itinerary_category AS ENUM (
    'flight',
    'accommodation',
    'attraction',
    'restaurant',
    'cafe',
    'transportation',
    'activity',
    'custom',
    'other'
);


ALTER TYPE public.itinerary_category OWNER TO postgres;

--
-- Name: itinerary_item_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.itinerary_item_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.itinerary_item_status OWNER TO postgres;

--
-- Name: place_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.place_category AS ENUM (
    'attraction',
    'restaurant',
    'cafe',
    'hotel',
    'landmark',
    'shopping',
    'transport',
    'other'
);


ALTER TYPE public.place_category OWNER TO postgres;

--
-- Name: privacy_setting; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.privacy_setting AS ENUM (
    'private',
    'shared_with_link',
    'public'
);


ALTER TYPE public.privacy_setting OWNER TO postgres;

--
-- Name: tag_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tag_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.tag_status OWNER TO postgres;

--
-- Name: travel_personality_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.travel_personality_type AS ENUM (
    'planner',
    'adventurer',
    'foodie',
    'sightseer',
    'relaxer',
    'culture'
);


ALTER TYPE public.travel_personality_type OWNER TO postgres;

--
-- Name: travel_squad_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.travel_squad_type AS ENUM (
    'friends',
    'family',
    'partner',
    'solo',
    'coworkers',
    'mixed'
);


ALTER TYPE public.travel_squad_type OWNER TO postgres;

--
-- Name: trip_action_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.trip_action_type AS ENUM (
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
    'SPLITWISE_GROUP_CREATED_AND_LINKED'
);


ALTER TYPE public.trip_action_type OWNER TO postgres;

--
-- Name: trip_privacy_setting; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.trip_privacy_setting AS ENUM (
    'private',
    'shared_with_link',
    'public'
);


ALTER TYPE public.trip_privacy_setting OWNER TO postgres;

--
-- Name: trip_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.trip_role AS ENUM (
    'admin',
    'editor',
    'viewer',
    'contributor'
);


ALTER TYPE public.trip_role OWNER TO postgres;

--
-- Name: TYPE trip_role; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TYPE public.trip_role IS 'role in a trip group';


--
-- Name: trip_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.trip_status AS ENUM (
    'planning',
    'upcoming',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE public.trip_status OWNER TO postgres;

--
-- Name: trip_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.trip_type AS ENUM (
    'leisure',
    'business',
    'family',
    'solo',
    'group',
    'other'
);


ALTER TYPE public.trip_type OWNER TO postgres;

--
-- Name: vote_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.vote_type AS ENUM (
    'up',
    'down'
);


ALTER TYPE public.vote_type OWNER TO postgres;

--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RAISE WARNING 'PgBouncer auth request: %', p_usename;

    RETURN QUERY
    SELECT usename::TEXT, passwd::TEXT FROM pg_catalog.pg_shadow
    WHERE usename = p_usename;
END;
$$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: approve_user_suggested_tag(uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.approve_user_suggested_tag(p_suggestion_id uuid, p_admin_id uuid, p_admin_notes text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_tag_id uuid;
    v_destination_id uuid;
BEGIN
    -- Update the suggestion status
    UPDATE public.user_suggested_tags
    SET status = 'approved',
        reviewed_by = p_admin_id,
        reviewed_at = now(),
        admin_notes = COALESCE(p_admin_notes, admin_notes)
    WHERE id = p_suggestion_id
    RETURNING tag_id, destination_id INTO v_tag_id, v_destination_id;

    -- Create or update the destination tag
    INSERT INTO public.destination_tags (destination_id, tag_id, added_by, is_verified)
    VALUES (v_destination_id, v_tag_id, p_admin_id, true)
    ON CONFLICT (destination_id, tag_id) 
    DO UPDATE SET
        is_verified = true,
        votes_up = destination_tags.votes_up + 1;

    -- Update tag use count
    UPDATE public.tags
    SET use_count = use_count + 1
    WHERE id = v_tag_id;

    RETURN v_tag_id;
END;
$$;


ALTER FUNCTION public.approve_user_suggested_tag(p_suggestion_id uuid, p_admin_id uuid, p_admin_notes text) OWNER TO postgres;

--
-- Name: approve_user_tag(uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.approve_user_tag(tag_id uuid, admin_id uuid, notes text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  tag_record RECORD;
BEGIN
  -- Get the tag details
  SELECT * INTO tag_record FROM user_suggested_tags WHERE id = tag_id;
  
  -- Check if tag exists in tags table
  IF NOT EXISTS (SELECT 1 FROM tags WHERE slug = tag_record.slug) THEN
    -- Add to official tags
    INSERT INTO tags (name, slug, category, priority)
    VALUES (tag_record.name, tag_record.slug, tag_record.category, 50);
  END IF;
  
  -- Add tag to destination
  INSERT INTO destination_tags (destination_id, tag_id)
  SELECT tag_record.destination_id, id FROM tags WHERE slug = tag_record.slug
  ON CONFLICT DO NOTHING;
  
  -- Update status
  UPDATE user_suggested_tags 
  SET 
    status = 'approved',
    admin_notes = notes,
    updated_at = now()
  WHERE id = tag_id;
END;
$$;


ALTER FUNCTION public.approve_user_tag(tag_id uuid, admin_id uuid, notes text) OWNER TO postgres;

--
-- Name: calculate_trip_duration(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_trip_duration() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN

-- NEW LOGIC (correct)
IF NEW.end_date IS NOT NULL AND NEW.start_date IS NOT NULL AND NEW.end_date >= NEW.start_date THEN
  -- Calculate the interval and extract the number of full days
  NEW.duration_days := EXTRACT(DAY FROM (NEW.end_date - NEW.start_date)); 
  -- Optionally add 1 if you want inclusive duration (e.g., start/end on same day = 1 day)
  -- NEW.duration_days := EXTRACT(DAY FROM (NEW.end_date - NEW.start_date)) + 1; 
ELSE
  -- Handle cases where dates are invalid or null (set duration to 0, 1, or NULL as appropriate)
  NEW.duration_days := NULL; -- Or 0 or 1 depending on desired logic
END IF;
  RETURN NEW;
END;$$;


ALTER FUNCTION public.calculate_trip_duration() OWNER TO postgres;

--
-- Name: can_manage_trip_members(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.can_manage_trip_members(p_trip_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members
    WHERE trip_id = p_trip_id
      AND user_id = auth.uid()
      AND (role = 'admin'::public.trip_role OR role = 'editor'::public.trip_role)
  );
$$;


ALTER FUNCTION public.can_manage_trip_members(p_trip_id uuid) OWNER TO postgres;

--
-- Name: copy_template_to_trip(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.copy_template_to_trip(p_template_id uuid, p_trip_id uuid, p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_template_version INTEGER;
BEGIN
    -- Get template version
    SELECT version INTO v_template_version
    FROM itinerary_templates
    WHERE id = p_template_id;

    -- Insert usage record
    INSERT INTO trip_template_uses (
        trip_id,
        template_id,
        applied_by,
        version_used
    ) VALUES (
        p_trip_id,
        p_template_id,
        p_user_id,
        v_template_version
    );

    -- Copy template activities to trip itinerary items
    INSERT INTO itinerary_items (
        trip_id,
        title,
        description,
        location,
        start_time,
        category,
        created_by,
        position,
        metadata
    )
    SELECT 
        p_trip_id,
        ta.title,
        ta.description,
        ta.location,
        ta.start_time,
        ta.category,
        p_user_id,
        ta.position,
        jsonb_build_object(
            'template_activity_id', ta.id,
            'template_section_id', ts.id,
            'day_number', ts.day_number
        )
    FROM template_activities ta
    JOIN template_sections ts ON ta.section_id = ts.id
    WHERE ts.template_id = p_template_id
    ORDER BY ts.day_number, ta.position;

    -- Update template stats
    UPDATE itinerary_templates
    SET 
        copied_count = copied_count + 1,
        last_copied_at = NOW()
    WHERE id = p_template_id;

    RETURN TRUE;
END;
$$;


ALTER FUNCTION public.copy_template_to_trip(p_template_id uuid, p_trip_id uuid, p_user_id uuid) OWNER TO postgres;

--
-- Name: create_trip_with_owner(jsonb, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_trip_with_owner(trip_data jsonb, p_owner_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  new_trip_id UUID;
  result JSONB;
  final_slug TEXT;
  trip_name TEXT;
  destination_id UUID;
  destination_name TEXT;
BEGIN
  -- Validation...
  trip_name := trip_data->>'name';
  IF trip_name IS NULL OR trim(trip_name) = '' THEN RETURN jsonb_build_object('success', false, 'error', 'Trip name is required.'); END IF;
  final_slug := trip_data->>'slug';
  IF final_slug IS NULL OR trim(final_slug) = '' THEN RETURN jsonb_build_object('success', false, 'error', 'Trip slug is required.'); END IF;
  BEGIN destination_id := (trip_data->>'destination_id')::UUID; EXCEPTION WHEN others THEN RETURN jsonb_build_object('success', false, 'error', 'Destination ID is required or invalid.'); END;
  destination_name := trip_data->>'destination_name';
  IF destination_name IS NULL OR trim(destination_name) = '' THEN RETURN jsonb_build_object('success', false, 'error', 'Destination name is required.'); END IF;
  IF EXISTS (SELECT 1 FROM public.trips WHERE slug = final_slug) THEN final_slug := final_slug || '-' || substr(md5(random()::text), 1, 6); END IF;

  -- Transaction block
  BEGIN
    INSERT INTO public.trips ( name, slug, description, destination_id, destination_name, start_date, end_date, date_flexibility, travelers_count, vibe, budget, is_public, created_by )
    VALUES ( trip_name, final_slug, trip_data->>'description', destination_id, destination_name, (trip_data->>'start_date')::TIMESTAMP WITH TIME ZONE, (trip_data->>'end_date')::TIMESTAMP WITH TIME ZONE, trip_data->>'date_flexibility', (trip_data->>'travelers_count')::INTEGER, trip_data->>'vibe', trip_data->>'budget', (trip_data->>'is_public')::BOOLEAN, p_owner_id )
    RETURNING id INTO new_trip_id;

    INSERT INTO public.trip_members ( trip_id, user_id, role )
    VALUES ( new_trip_id, p_owner_id, 'admin'::trip_role );

    result := jsonb_build_object( 'trip_id', new_trip_id, 'success', true, 'slug', final_slug );
    RETURN result;
  EXCEPTION
    WHEN unique_violation THEN RAISE WARNING 'Unique violation during trip creation: %', SQLERRM; RETURN jsonb_build_object('success', false, 'error', 'Failed to create trip due to conflicting data.', 'detail', SQLSTATE || ': ' || SQLERRM);
    WHEN foreign_key_violation THEN RAISE WARNING 'Foreign key violation during trip creation: %', SQLERRM; RETURN jsonb_build_object('success', false, 'error', 'Failed to create trip due to invalid reference.', 'detail', SQLSTATE || ': ' || SQLERRM);
    WHEN invalid_text_representation THEN RAISE WARNING 'Invalid text representation during trip creation: %', SQLERRM; RETURN jsonb_build_object('success', false, 'error', 'Failed to create trip due to invalid data format.', 'detail', SQLSTATE || ': ' || SQLERRM);
    WHEN check_violation THEN RAISE WARNING 'Check violation during trip creation: %', SQLERRM; RETURN jsonb_build_object('success', false, 'error', 'Failed to create trip due to data constraint violation.', 'detail', SQLSTATE || ': ' || SQLERRM);
    WHEN OTHERS THEN RAISE WARNING 'Unexpected error during trip creation: %', SQLERRM; RETURN jsonb_build_object('success', false, 'error', 'An unexpected database error occurred.', 'detail', SQLSTATE || ': ' || SQLERRM);
  END;
END;
$$;


ALTER FUNCTION public.create_trip_with_owner(trip_data jsonb, p_owner_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION create_trip_with_owner(trip_data jsonb, p_owner_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.create_trip_with_owner(trip_data jsonb, p_owner_id uuid) IS 'Creates a trip and adds the creator as an admin in a single transaction. Validates required fields and handles common errors.';


--
-- Name: create_trip_with_owner(text, text, uuid, date, date, uuid, text, text, public.trip_type, public.privacy_setting); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_trip_with_owner(p_name text, p_description text, p_user_id uuid, p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT NULL::date, p_destination_id uuid DEFAULT NULL::uuid, p_destination_name text DEFAULT NULL::text, p_cover_image_url text DEFAULT NULL::text, p_trip_type public.trip_type DEFAULT NULL::public.trip_type, p_privacy_setting public.privacy_setting DEFAULT 'private'::public.privacy_setting) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_trip_id UUID;
  v_slug TEXT;
BEGIN
  -- Generate a unique slug
  v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || 
            substring(md5(random()::text) from 1 for 8);
  
  -- Create the trip
  INSERT INTO trips (
    name, 
    description, 
    created_by, 
    start_date, 
    end_date, 
    destination_id, 
    destination_name, 
    cover_image_url,
    trip_type,
    privacy_setting,
    slug
  )
  VALUES (
    p_name, 
    p_description, 
    p_user_id, 
    p_start_date, 
    p_end_date, 
    p_destination_id, 
    p_destination_name, 
    p_cover_image_url,
    p_trip_type,
    p_privacy_setting,
    v_slug
  )
  RETURNING id INTO v_trip_id;
  
  -- Add the creator as an admin
  INSERT INTO trip_members (trip_id, user_id, role, invited_by)
  VALUES (v_trip_id, p_user_id, 'admin', p_user_id);
  
  RETURN v_trip_id;
END;
$$;


ALTER FUNCTION public.create_trip_with_owner(p_name text, p_description text, p_user_id uuid, p_start_date date, p_end_date date, p_destination_id uuid, p_destination_name text, p_cover_image_url text, p_trip_type public.trip_type, p_privacy_setting public.privacy_setting) OWNER TO postgres;

--
-- Name: create_trip_with_owner(text, uuid, text, text[], uuid, text, date, date, boolean, text, numeric, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_trip_with_owner(trip_name text, user_id uuid, description_param text DEFAULT NULL::text, tags_param text[] DEFAULT NULL::text[], destination_id uuid DEFAULT NULL::uuid, destination_name_param text DEFAULT NULL::text, start_date date DEFAULT NULL::date, end_date date DEFAULT NULL::date, is_public boolean DEFAULT false, cover_image_url text DEFAULT NULL::text, latitude numeric DEFAULT NULL::numeric, longitude numeric DEFAULT NULL::numeric) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  new_trip_id uuid;
BEGIN
  -- Insert the new trip
  INSERT INTO public.trips (
    name, created_by, description, tags, destination_id, 
    destination_name, start_date, end_date, is_public, 
    cover_image_url, latitude, longitude
  )
  VALUES (
    trip_name, user_id, description_param, tags_param, destination_id, 
    destination_name_param, start_date, end_date, is_public, 
    cover_image_url, latitude, longitude
  )
  RETURNING id INTO new_trip_id;

  -- Add the creator as an ADMIN member
  IF new_trip_id IS NOT NULL AND user_id IS NOT NULL THEN
    INSERT INTO public.trip_members (trip_id, user_id, role, joined_at)
    VALUES (new_trip_id, user_id, 'admin'::public.trip_role, now());
  END IF;

  RETURN new_trip_id;
END;
$$;


ALTER FUNCTION public.create_trip_with_owner(trip_name text, user_id uuid, description_param text, tags_param text[], destination_id uuid, destination_name_param text, start_date date, end_date date, is_public boolean, cover_image_url text, latitude numeric, longitude numeric) OWNER TO postgres;

--
-- Name: decrement_travelers_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.decrement_travelers_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE public.destinations
  SET travelers_count = GREATEST(travelers_count - 1, 0)
  WHERE id = OLD.destination_id;
  RETURN OLD;
END;
$$;


ALTER FUNCTION public.decrement_travelers_count() OWNER TO postgres;

--
-- Name: generate_public_slug(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_public_slug() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.is_public = true AND (NEW.public_slug IS NULL OR NEW.public_slug = '') THEN
    -- Try to generate a unique slug (retry up to 5 times if collision)
    FOR i IN 1..5 LOOP
      NEW.public_slug := generate_random_slug(10);
      
      -- Check if slug exists
      IF NOT EXISTS (SELECT 1 FROM trips WHERE public_slug = NEW.public_slug) THEN
        RETURN NEW;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_public_slug() OWNER TO postgres;

--
-- Name: generate_random_slug(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_random_slug(length integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;


ALTER FUNCTION public.generate_random_slug(length integer) OWNER TO postgres;

--
-- Name: generate_trip_slug(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_trip_slug() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    base_slug TEXT;
    slug TEXT;
    count INT := 1;
BEGIN
    -- Generate the base slug from the trip name
    base_slug := LOWER(REPLACE(NEW.name, ' ', '-'));

    -- Initialize the slug with the base slug
    slug := base_slug;

    -- Check for existing slugs and handle duplicates
    WHILE EXISTS (SELECT 1 FROM public.trips WHERE slug = slug) LOOP
        slug := base_slug || '-' || count;
        count := count + 1;
    END LOOP;

    -- Set the slug for the new or updated trip
    NEW.slug := slug;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_trip_slug() OWNER TO postgres;

--
-- Name: get_destination_recommendations(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_destination_recommendations(p_user_id uuid, p_limit integer DEFAULT 10) RETURNS TABLE(destination_id uuid, match_score double precision, matching_tags jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    WITH user_tag_preferences AS (
        SELECT 
            ui.tag_id,
            ui.strength::float / 10 as preference_weight
        FROM user_interests ui
        WHERE ui.user_id = p_user_id
    ),
    destination_scores AS (
        SELECT 
            dt.destination_id,
            SUM(
                utp.preference_weight * 
                dt.confidence_score * 
                (dt.votes_up::float / NULLIF(dt.votes_up + dt.votes_down, 0))
            ) as match_score,
            jsonb_agg(
                jsonb_build_object(
                    'tag_id', t.id,
                    'name', t.name,
                    'weight', utp.preference_weight
                )
            ) as matching_tags
        FROM destination_tags dt
        JOIN tags t ON t.id = dt.tag_id
        JOIN user_tag_preferences utp ON utp.tag_id = dt.tag_id
        GROUP BY dt.destination_id
    )
    SELECT 
        ds.destination_id,
        ds.match_score,
        ds.matching_tags
    FROM destination_scores ds
    ORDER BY ds.match_score DESC
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION public.get_destination_recommendations(p_user_id uuid, p_limit integer) OWNER TO postgres;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
      INSERT INTO public.profiles (id, name, avatar_url)
      VALUES (
        new.id, 
        new.raw_user_meta_data->>'name', 
        new.raw_user_meta_data->>'avatar_url'
      );
      RETURN new;
    END;
    $$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: handle_splitwise_connections_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_splitwise_connections_update() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION public.handle_splitwise_connections_update() OWNER TO postgres;

--
-- Name: has_trip_role(uuid, uuid, public.trip_role); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.has_trip_role(p_trip_id uuid, p_user_id uuid, p_role public.trip_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members tm
    WHERE tm.trip_id = p_trip_id AND tm.user_id = p_user_id AND tm.role = p_role
  );
$$;


ALTER FUNCTION public.has_trip_role(p_trip_id uuid, p_user_id uuid, p_role public.trip_role) OWNER TO postgres;

--
-- Name: increment_counter(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_counter(row_id uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  current_value INTEGER;
BEGIN
  SELECT popularity INTO current_value FROM destinations WHERE id = row_id;
  RETURN COALESCE(current_value, 0) + 1;
END;
$$;


ALTER FUNCTION public.increment_counter(row_id uuid) OWNER TO postgres;

--
-- Name: increment_travelers_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_travelers_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE public.destinations
  SET travelers_count = travelers_count + 1
  WHERE id = NEW.destination_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.increment_travelers_count() OWNER TO postgres;

--
-- Name: insert_tag_if_not_exists(text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_tag_if_not_exists(p_name text, p_slug text, p_category text, p_emoji text DEFAULT NULL::text, p_description text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_tag_id uuid;
BEGIN
  -- Check if tag with the slug already exists
  SELECT id INTO v_tag_id FROM public.tags WHERE slug = p_slug;

  -- If tag doesn't exist, insert it
  IF v_tag_id IS NULL THEN
    INSERT INTO public.tags (name, slug, category, emoji, description, is_verified)
    VALUES (p_name, p_slug, p_category, p_emoji, p_description, true) -- Assume initial tags are verified
    RETURNING id INTO v_tag_id;
  END IF;

  RETURN v_tag_id;
END;
$$;


ALTER FUNCTION public.insert_tag_if_not_exists(p_name text, p_slug text, p_category text, p_emoji text, p_description text) OWNER TO postgres;

--
-- Name: is_trip_member(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_trip_member(p_trip_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members
    WHERE trip_id = p_trip_id AND user_id = auth.uid()
  );
$$;


ALTER FUNCTION public.is_trip_member(p_trip_id uuid) OWNER TO postgres;

--
-- Name: is_trip_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_trip_member(p_trip_id uuid, p_user_id uuid) RETURNS boolean
    LANGUAGE sql
    SET search_path TO 'public'
    AS $$ 
SELECT EXISTS (SELECT 1 FROM public.trip_members tm WHERE tm.trip_id = p_trip_id AND tm.user_id = p_user_id); 
$$;


ALTER FUNCTION public.is_trip_member(p_trip_id uuid, p_user_id uuid) OWNER TO postgres;

--
-- Name: is_trip_member_with_role(uuid, uuid, text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_trip_member_with_role(_trip_id uuid, _user_id uuid, _roles text[]) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    member_role text;
BEGIN
    SELECT role INTO member_role
    FROM public.trip_members
    WHERE trip_id = _trip_id AND user_id = _user_id;

    RETURN member_role = ANY(_roles);
END;
$$;


ALTER FUNCTION public.is_trip_member_with_role(_trip_id uuid, _user_id uuid, _roles text[]) OWNER TO postgres;

--
-- Name: moddatetime(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.moddatetime() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.moddatetime() OWNER TO postgres;

--
-- Name: recommend_by_geography(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recommend_by_geography(location_id uuid, limit_count integer DEFAULT 10) RETURNS TABLE(destination_id uuid, destination_name text, local_popularity integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS destination_id,
    d.name AS destination_name,
    COUNT(ui.id) AS local_popularity
  FROM 
    destinations d
  JOIN 
    user_interactions ui ON d.id = ui.destination_id
  JOIN 
    profiles p ON ui.user_id = p.user_id
  WHERE 
    p.home_location_id = recommend_by_geography.location_id
    OR p.home_location_id IN (SELECT id FROM locations WHERE parent_id = recommend_by_geography.location_id)
  GROUP BY 
    d.id, d.name
  ORDER BY 
    local_popularity DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION public.recommend_by_geography(location_id uuid, limit_count integer) OWNER TO postgres;

--
-- Name: recommend_popular_destinations(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recommend_popular_destinations(limit_count integer DEFAULT 10) RETURNS TABLE(destination_id uuid, destination_name text, popularity_score integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS destination_id,
    d.name AS destination_name,
    d.likes_count + COUNT(ui.id) AS popularity_score
  FROM 
    destinations d
  LEFT JOIN 
    user_interactions ui ON d.id = ui.destination_id
  GROUP BY 
    d.id, d.name, d.likes_count
  ORDER BY 
    popularity_score DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION public.recommend_popular_destinations(limit_count integer) OWNER TO postgres;

--
-- Name: sync_user_to_profile(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_user_to_profile() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Insert or update profile
  INSERT INTO public.profiles (
    id,
    email,
    name,
    avatar_url,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = EXCLUDED.updated_at;
    
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.sync_user_to_profile() OWNER TO postgres;

--
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_set_timestamp() OWNER TO postgres;

--
-- Name: update_itinerary_item_position(uuid, uuid, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_itinerary_item_position(p_item_id uuid, p_trip_id uuid, p_day_number integer, p_position integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_old_day_number integer;
  v_old_position integer;
  v_old_section_id uuid;
  v_new_section_id uuid; -- Target section_id
BEGIN
  -- 1. Get the old state of the item being moved
  SELECT day_number, "position", section_id
  INTO v_old_day_number, v_old_position, v_old_section_id
  FROM public.itinerary_items
  WHERE id = p_item_id AND trip_id = p_trip_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Itinerary item with id % not found for trip %', p_item_id, p_trip_id;
    RETURN;
  END IF;

  -- 2. Determine the target section_id based on p_day_number
  IF p_day_number IS NULL THEN
    v_new_section_id := NULL; -- Moving to unscheduled
  ELSE
    -- Find the section for the target day
    SELECT id
    INTO v_new_section_id
    FROM public.itinerary_sections
    WHERE trip_id = p_trip_id AND day_number = p_day_number;

    -- Optional: Create section if it doesn't exist? Or raise error?
    IF v_new_section_id IS NULL THEN
       RAISE EXCEPTION 'Target itinerary section for trip %, day % not found.', p_trip_id, p_day_number;
       -- Alternatively, you could insert a new section here:
       -- INSERT INTO public.itinerary_sections (trip_id, day_number, position)
       -- VALUES (p_trip_id, p_day_number, p_day_number) -- Simple position based on day
       -- RETURNING id INTO v_new_section_id;
       RETURN; -- Exit if section not found (or after creating)
    END IF;
  END IF;

  -- 3. Check if a meaningful change is actually happening
  IF v_old_day_number IS NOT DISTINCT FROM p_day_number AND
     v_old_position IS NOT DISTINCT FROM p_position AND
     v_old_section_id IS NOT DISTINCT FROM v_new_section_id THEN
     -- RAISE NOTICE 'No change needed for item %', p_item_id;
     RETURN; -- Exit if no change
  END IF;

  -- 4. Adjust positions in the OLD location (day/section or unscheduled)
  UPDATE public.itinerary_items
  SET "position" = "position" - 1,
      updated_at = now()
  WHERE trip_id = p_trip_id
    AND id != p_item_id
    AND day_number IS NOT DISTINCT FROM v_old_day_number -- Match old day (handles NULL)
    AND section_id IS NOT DISTINCT FROM v_old_section_id -- Match old section (handles NULL)
    AND "position" > v_old_position;                 -- Only items after the old position

  -- 5. Adjust positions in the NEW location (day/section or unscheduled)
  UPDATE public.itinerary_items
  SET "position" = "position" + 1,
      updated_at = now()
  WHERE trip_id = p_trip_id
    AND id != p_item_id
    AND day_number IS NOT DISTINCT FROM p_day_number -- Match new day (handles NULL)
    AND section_id IS NOT DISTINCT FROM v_new_section_id -- Match new section (handles NULL)
    AND "position" >= p_position;                -- Items at or after the new position

  -- 6. Update the target item itself
  UPDATE public.itinerary_items
  SET
    day_number = p_day_number,      -- New day number (or NULL)
    "position" = p_position,        -- New position
    section_id = v_new_section_id,  -- New section_id (or NULL)
    updated_at = now()              -- Update timestamp
  WHERE id = p_item_id AND trip_id = p_trip_id;

END;
$$;


ALTER FUNCTION public.update_itinerary_item_position(p_item_id uuid, p_trip_id uuid, p_day_number integer, p_position integer) OWNER TO postgres;

--
-- Name: update_likes_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_likes_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_likes_updated_at() OWNER TO postgres;

--
-- Name: update_profile_from_interaction(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_profile_from_interaction() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  dest_tags RECORD;
  current_interests JSONB;
  tag_value INTEGER;
BEGIN
  -- Get user's current interests
  SELECT interests INTO current_interests FROM profiles WHERE user_id = NEW.user_id;
  
  -- For each tag on the destination, update user interests
  FOR dest_tags IN (
    SELECT t.slug, t.category 
    FROM destination_tags dt
    JOIN tags t ON dt.tag_id = t.id
    WHERE dt.destination_id = NEW.destination_id
  ) LOOP
    -- Get current value or default to 0
    tag_value := COALESCE((current_interests->dest_tags.slug)::INTEGER, 0);
    
    -- Increase interest value (max 10)
    IF NEW.interaction_type = 'like' THEN
      tag_value := LEAST(tag_value + 2, 10);
    ELSIF NEW.interaction_type = 'visit' THEN
      tag_value := LEAST(tag_value + 3, 10);
    ELSIF NEW.interaction_type = 'bookmark' THEN
      tag_value := LEAST(tag_value + 1, 10);
    END IF;
    
    -- Update interest value
    current_interests := jsonb_set(current_interests, ARRAY[dest_tags.slug], to_jsonb(tag_value));
  END LOOP;
  
  -- Update profile
  UPDATE profiles SET 
    interests = current_interests,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  -- Increment like count on destination
  IF NEW.interaction_type = 'like' THEN
    UPDATE destinations SET likes_count = likes_count + 1 WHERE id = NEW.destination_id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_profile_from_interaction() OWNER TO postgres;

--
-- Name: update_profile_onboarding(uuid, text, public.travel_personality_type, public.travel_squad_type, integer, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_profile_onboarding(p_user_id uuid, p_first_name text DEFAULT NULL::text, p_travel_personality public.travel_personality_type DEFAULT NULL::public.travel_personality_type, p_travel_squad public.travel_squad_type DEFAULT NULL::public.travel_squad_type, p_onboarding_step integer DEFAULT NULL::integer, p_complete_onboarding boolean DEFAULT false) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.update_profile_onboarding(p_user_id uuid, p_first_name text, p_travel_personality public.travel_personality_type, p_travel_squad public.travel_squad_type, p_onboarding_step integer, p_complete_onboarding boolean) OWNER TO postgres;

--
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_timestamp() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: validate_image_metadata_entity(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_image_metadata_entity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Check if the entity_id exists in the corresponding table based on entity_type
  CASE NEW.entity_type
    WHEN 'user_avatar' THEN
      IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.entity_id) THEN
        RAISE EXCEPTION 'Invalid user_id: %', NEW.entity_id;
      END IF;
    WHEN 'trip_cover' THEN
      IF NOT EXISTS (SELECT 1 FROM trips WHERE id = NEW.entity_id) THEN
        RAISE EXCEPTION 'Invalid trip_id: %', NEW.entity_id;
      END IF;
    WHEN 'destination' THEN
      IF NOT EXISTS (SELECT 1 FROM destinations WHERE id = NEW.entity_id) THEN
        RAISE EXCEPTION 'Invalid destination_id: %', NEW.entity_id;
      END IF;
    WHEN 'template_cover' THEN
      IF NOT EXISTS (SELECT 1 FROM itinerary_templates WHERE id = NEW.entity_id) THEN
        RAISE EXCEPTION 'Invalid template_id: %', NEW.entity_id;
      END IF;
  END CASE;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_image_metadata_entity() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: albums; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.albums (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.albums OWNER TO postgres;

--
-- Name: albums_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.albums ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.albums_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: budget_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.budget_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trip_id uuid NOT NULL,
    title text NOT NULL,
    amount numeric NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    category public.budget_category NOT NULL,
    paid_by uuid NOT NULL,
    date date NOT NULL,
    source text DEFAULT 'manual'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT budget_items_amount_check CHECK ((amount >= (0)::numeric))
);


ALTER TABLE public.budget_items OWNER TO postgres;

--
-- Name: TABLE budget_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.budget_items IS 'Stores individual expense items for trips, including manual entries.';


--
-- Name: COLUMN budget_items.paid_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.budget_items.paid_by IS 'The profile ID of the user who paid for the expense.';


--
-- Name: COLUMN budget_items.source; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.budget_items.source IS 'Indicates if the expense was entered manually or imported (e.g., splitwise).';


--
-- Name: collaborative_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collaborative_sessions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    trip_id uuid NOT NULL,
    document_type text NOT NULL,
    document_id text NOT NULL,
    content jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.collaborative_sessions OWNER TO postgres;

--
-- Name: destination_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destination_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    destination_id uuid,
    tag_id uuid,
    added_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    confidence_score double precision DEFAULT 1.0,
    votes_up integer DEFAULT 0,
    votes_down integer DEFAULT 0,
    is_verified boolean DEFAULT false
);


ALTER TABLE public.destination_tags OWNER TO postgres;

--
-- Name: destinations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destinations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    city text,
    state_province text,
    country text,
    popularity integer,
    lgbtq_friendliness numeric(3,1),
    accessibility numeric(3,1),
    continent text,
    best_season text,
    avg_cost_per_day numeric,
    local_language text,
    time_zone text,
    cuisine_rating numeric(3,1),
    cultural_attractions numeric(3,1),
    nightlife_rating numeric(3,1),
    family_friendly boolean,
    outdoor_activities numeric(3,1),
    beach_quality numeric(3,1),
    shopping_rating numeric(3,1),
    safety_rating numeric(3,1),
    wifi_connectivity numeric(3,1),
    public_transportation numeric(3,1),
    eco_friendly_options numeric(3,1),
    walkability numeric(3,1),
    instagram_worthy_spots numeric(3,1),
    off_peak_appeal numeric(3,1),
    digital_nomad_friendly boolean,
    name text,
    description text,
    image_url text,
    updated_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    emoji text,
    visa_required boolean,
    image_metadata jsonb,
    byline character varying(100),
    highlights text,
    perfect_for text,
    likes_count integer DEFAULT 0,
    latitude double precision,
    longitude double precision,
    avg_days integer,
    address text,
    mapbox_id text,
    CONSTRAINT destinations_accessibility_check CHECK (((accessibility >= 1.0) AND (accessibility <= 5.0))),
    CONSTRAINT destinations_beach_quality_check CHECK (((beach_quality >= 1.0) AND (beach_quality <= 5.0))),
    CONSTRAINT destinations_cuisine_rating_check CHECK (((cuisine_rating >= 1.0) AND (cuisine_rating <= 5.0))),
    CONSTRAINT destinations_cultural_attractions_check CHECK (((cultural_attractions >= 1.0) AND (cultural_attractions <= 5.0))),
    CONSTRAINT destinations_eco_friendly_options_check CHECK (((eco_friendly_options >= 1.0) AND (eco_friendly_options <= 5.0))),
    CONSTRAINT destinations_instagram_worthy_spots_check CHECK (((instagram_worthy_spots >= 1.0) AND (instagram_worthy_spots <= 5.0))),
    CONSTRAINT destinations_lgbtq_friendliness_check CHECK (((lgbtq_friendliness >= 1.0) AND (lgbtq_friendliness <= 5.0))),
    CONSTRAINT destinations_nightlife_rating_check CHECK (((nightlife_rating >= 1.0) AND (nightlife_rating <= 5.0))),
    CONSTRAINT destinations_off_peak_appeal_check CHECK (((off_peak_appeal >= 1.0) AND (off_peak_appeal <= 5.0))),
    CONSTRAINT destinations_outdoor_activities_check CHECK (((outdoor_activities >= 1.0) AND (outdoor_activities <= 5.0))),
    CONSTRAINT destinations_public_transportation_check CHECK (((public_transportation >= 1.0) AND (public_transportation <= 5.0))),
    CONSTRAINT destinations_safety_rating_check CHECK (((safety_rating >= 1.0) AND (safety_rating <= 5.0))),
    CONSTRAINT destinations_shopping_rating_check CHECK (((shopping_rating >= 1.0) AND (shopping_rating <= 5.0))),
    CONSTRAINT destinations_walkability_check CHECK (((walkability >= 1.0) AND (walkability <= 5.0))),
    CONSTRAINT destinations_wifi_connectivity_check CHECK (((wifi_connectivity >= 1.0) AND (wifi_connectivity <= 5.0)))
);


ALTER TABLE public.destinations OWNER TO postgres;

--
-- Name: COLUMN destinations.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.id IS 'Unique identifier for the destination';


--
-- Name: COLUMN destinations.city; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.city IS 'Primary city name';


--
-- Name: COLUMN destinations.state_province; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.state_province IS 'State, province, or region (if applicable)';


--
-- Name: COLUMN destinations.country; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.country IS 'Country name';


--
-- Name: COLUMN destinations.popularity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.popularity IS 'General popularity score/indicator';


--
-- Name: COLUMN destinations.lgbtq_friendliness; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.lgbtq_friendliness IS 'Rating (1-5) for LGBTQ+ friendliness';


--
-- Name: COLUMN destinations.accessibility; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.accessibility IS 'Rating (1-5) for physical accessibility';


--
-- Name: COLUMN destinations.continent; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.continent IS 'Continent';


--
-- Name: COLUMN destinations.best_season; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.best_season IS 'Recommended travel season(s)';


--
-- Name: COLUMN destinations.avg_cost_per_day; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.avg_cost_per_day IS 'Estimated average daily cost for a tourist';


--
-- Name: COLUMN destinations.local_language; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.local_language IS 'Primary local language(s)';


--
-- Name: COLUMN destinations.time_zone; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.time_zone IS 'Time zone identifier (e.g., Europe/Paris)';


--
-- Name: COLUMN destinations.cuisine_rating; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.cuisine_rating IS 'Rating (1-5) for local cuisine';


--
-- Name: COLUMN destinations.cultural_attractions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.cultural_attractions IS 'Rating (1-5) for cultural attractions';


--
-- Name: COLUMN destinations.nightlife_rating; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.nightlife_rating IS 'Rating (1-5) for nightlife';


--
-- Name: COLUMN destinations.family_friendly; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.family_friendly IS 'Is the destination generally family-friendly?';


--
-- Name: COLUMN destinations.outdoor_activities; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.outdoor_activities IS 'Rating (1-5) for outdoor activity availability/quality';


--
-- Name: COLUMN destinations.beach_quality; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.beach_quality IS 'Rating (1-5) for beach quality (if applicable)';


--
-- Name: COLUMN destinations.shopping_rating; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.shopping_rating IS 'Rating (1-5) for shopping options';


--
-- Name: COLUMN destinations.safety_rating; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.safety_rating IS 'Rating (1-5) for general safety';


--
-- Name: COLUMN destinations.wifi_connectivity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.wifi_connectivity IS 'Rating (1-5) for WiFi availability/speed';


--
-- Name: COLUMN destinations.public_transportation; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.public_transportation IS 'Rating (1-5) for public transportation quality';


--
-- Name: COLUMN destinations.eco_friendly_options; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.eco_friendly_options IS 'Rating (1-5) for availability of eco-friendly options';


--
-- Name: COLUMN destinations.walkability; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.walkability IS 'Rating (1-5) for how walkable the main areas are';


--
-- Name: COLUMN destinations.instagram_worthy_spots; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.instagram_worthy_spots IS 'Rating (1-5) for photogenic spots';


--
-- Name: COLUMN destinations.off_peak_appeal; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.off_peak_appeal IS 'Rating (1-5) for appeal during off-peak seasons';


--
-- Name: COLUMN destinations.digital_nomad_friendly; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.digital_nomad_friendly IS 'Is the destination suitable for digital nomads?';


--
-- Name: COLUMN destinations.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.name IS 'Primary display name for the destination (e.g., "Paris, France")';


--
-- Name: COLUMN destinations.image_metadata; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.image_metadata IS 'Stores metadata about the destination image, like alt text and attribution.';


--
-- Name: COLUMN destinations.latitude; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.latitude IS 'Latitude coordinate for the destination.';


--
-- Name: COLUMN destinations.longitude; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.longitude IS 'Longitude coordinate for the destination.';


--
-- Name: COLUMN destinations.avg_days; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.destinations.avg_days IS 'Estimated average number of days recommended for a trip.';


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    trip_id uuid,
    title text NOT NULL,
    amount numeric(10,2) NOT NULL,
    category text,
    date date,
    paid_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    currency text DEFAULT 'USD'::text NOT NULL,
    source text DEFAULT 'manual'::text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: image_metadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.image_metadata (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    entity_id uuid NOT NULL,
    entity_type public.image_type NOT NULL,
    url text NOT NULL,
    alt_text text,
    attribution text,
    photographer_name text,
    photographer_url text,
    license text,
    source text NOT NULL,
    source_id text,
    width integer,
    height integer,
    focal_point_x double precision,
    focal_point_y double precision,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    attribution_html text
);


ALTER TABLE public.image_metadata OWNER TO postgres;

--
-- Name: COLUMN image_metadata.attribution_html; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.image_metadata.attribution_html IS 'HTML-formatted attribution with clickable links';


--
-- Name: invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invitations (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    invited_by uuid,
    trip_id uuid,
    invitation_status public.invitation_status DEFAULT 'pending'::public.invitation_status NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL
);


ALTER TABLE public.invitations OWNER TO postgres;

--
-- Name: invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.invitations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invitations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: itinerary_item_votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itinerary_item_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    itinerary_item_id uuid NOT NULL,
    user_id uuid NOT NULL,
    vote public.vote_type NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE ONLY public.itinerary_item_votes FORCE ROW LEVEL SECURITY;


ALTER TABLE public.itinerary_item_votes OWNER TO postgres;

--
-- Name: itinerary_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itinerary_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    trip_id uuid,
    title text NOT NULL,
    type text,
    date date,
    start_time time without time zone,
    end_time time without time zone,
    location text,
    place_id uuid,
    latitude numeric(10,8),
    longitude numeric(11,8),
    cost numeric(10,2),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    item_type text,
    is_custom boolean DEFAULT false,
    day_number integer,
    address text,
    category public.itinerary_category,
    status public.item_status DEFAULT 'suggested'::public.item_status,
    "position" numeric,
    estimated_cost numeric,
    currency text,
    duration_minutes integer,
    section_id uuid,
    updated_at timestamp with time zone,
    cover_image_url text
);


ALTER TABLE public.itinerary_items OWNER TO postgres;

--
-- Name: TABLE itinerary_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.itinerary_items IS 'Stores individual items within a trip itinerary.';


--
-- Name: COLUMN itinerary_items.trip_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_items.trip_id IS 'Foreign key linking to the parent trip.';


--
-- Name: COLUMN itinerary_items.title; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_items.title IS 'Primary name or title of the item.';


--
-- Name: COLUMN itinerary_items.start_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_items.start_time IS 'Start date and time for the event/booking.';


--
-- Name: COLUMN itinerary_items.end_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_items.end_time IS 'End date and time for the event/booking.';


--
-- Name: COLUMN itinerary_items.latitude; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_items.latitude IS 'Geographic coordinates (longitude, latitude). Requires PostGIS or use separate numeric fields.';


--
-- Name: COLUMN itinerary_items.longitude; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_items.longitude IS 'Geographic coordinates (longitude, latitude). Requires PostGIS or use separate numeric fields.';


--
-- Name: COLUMN itinerary_items.created_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_items.created_by IS 'User who originally added this item.';


--
-- Name: COLUMN itinerary_items.item_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_items.item_type IS 'Categorizes the itinerary item.';


--
-- Name: COLUMN itinerary_items.estimated_cost; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_items.estimated_cost IS 'Estimated cost for the itinerary item.';


--
-- Name: COLUMN itinerary_items.currency; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_items.currency IS 'Currency code for the estimated cost (e.g., USD, EUR).';


--
-- Name: COLUMN itinerary_items.duration_minutes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_items.duration_minutes IS 'Estimated duration of the activity in minutes.';


--
-- Name: itinerary_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itinerary_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trip_id uuid NOT NULL,
    day_number integer NOT NULL,
    date date,
    title text,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT itinerary_sections_day_number_check CHECK ((day_number > 0))
);


ALTER TABLE public.itinerary_sections OWNER TO postgres;

--
-- Name: itinerary_template_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itinerary_template_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    day integer NOT NULL,
    item_order integer DEFAULT 0 NOT NULL,
    title text,
    description text,
    start_time time without time zone,
    end_time time without time zone,
    location text,
    place_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT itinerary_template_items_day_check CHECK ((day > 0))
);


ALTER TABLE public.itinerary_template_items OWNER TO postgres;

--
-- Name: COLUMN itinerary_template_items.item_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_template_items.item_order IS 'Order of the item within a specific day of the template';


--
-- Name: COLUMN itinerary_template_items.location; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_template_items.location IS 'Text-based location name (e.g., "Eiffel Tower")';


--
-- Name: COLUMN itinerary_template_items.place_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.itinerary_template_items.place_id IS 'Optional reference to a structured place entry in the places table';


--
-- Name: itinerary_template_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itinerary_template_sections (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.itinerary_template_sections OWNER TO postgres;

--
-- Name: itinerary_template_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.itinerary_template_sections ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.itinerary_template_sections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: itinerary_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itinerary_templates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    slug text NOT NULL,
    description text,
    destination_id uuid NOT NULL,
    duration_days integer NOT NULL,
    category character varying(50) NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_published boolean DEFAULT false,
    view_count integer DEFAULT 0,
    use_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    featured boolean DEFAULT false,
    cover_image_url text,
    groupsize text,
    tags text[],
    template_type character varying(50),
    source_trip_id uuid,
    version integer DEFAULT 1,
    copied_count integer DEFAULT 0,
    last_copied_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT itinerary_templates_template_type_check CHECK (((template_type)::text = ANY (ARRAY[('official'::character varying)::text, ('user_created'::character varying)::text, ('trip_based'::character varying)::text])))
);


ALTER TABLE public.itinerary_templates OWNER TO postgres;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    item_id uuid NOT NULL,
    item_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT likes_item_type_check CHECK ((item_type = ANY (ARRAY['destination'::text, 'itinerary'::text, 'attraction'::text])))
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    parent_id uuid,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: note_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.note_tags (
    note_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.note_tags OWNER TO postgres;

--
-- Name: permission_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission_requests (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    trip_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    message text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.permission_requests OWNER TO postgres;

--
-- Name: places; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.places (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    category public.place_category,
    address text,
    latitude numeric(9,6),
    longitude numeric(9,6),
    destination_id uuid,
    price_level integer,
    rating numeric(2,1),
    rating_count integer DEFAULT 0,
    images text[],
    tags text[],
    opening_hours jsonb,
    is_verified boolean DEFAULT false,
    suggested_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    source text,
    source_id text,
    CONSTRAINT places_price_level_check CHECK (((price_level >= 1) AND (price_level <= 5))),
    CONSTRAINT places_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric)))
);


ALTER TABLE public.places OWNER TO postgres;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    updated_at timestamp with time zone,
    name text,
    avatar_url text,
    is_admin boolean DEFAULT false,
    email text,
    username text,
    cover_image_url text,
    bio text,
    location text,
    website text,
    is_verified boolean DEFAULT false,
    home_location_id uuid,
    first_name text,
    travel_personality public.travel_personality_type,
    travel_squad public.travel_squad_type,
    onboarding_completed boolean DEFAULT false,
    onboarding_completed_at timestamp with time zone,
    onboarding_step integer DEFAULT 1
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: TABLE profiles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.profiles IS 'Public profiles of users with additional metadata';


--
-- Name: COLUMN profiles.is_admin; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profiles.is_admin IS 'Flags if the user has administrative privileges.';


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.referrals (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    referrer_id uuid NOT NULL,
    referred_id uuid NOT NULL,
    referral_code text NOT NULL,
    trip_id uuid,
    converted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    converted_at timestamp with time zone
);


ALTER TABLE public.referrals OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    category text,
    emoji text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    is_verified boolean DEFAULT false,
    use_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: TABLE tags; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tags IS 'Stores unique tags that can be applied to trips.';


--
-- Name: COLUMN tags.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tags.id IS 'Unique identifier for the tag.';


--
-- Name: COLUMN tags.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tags.name IS 'The unique name of the tag.';


--
-- Name: COLUMN tags.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tags.created_at IS 'Timestamp when the tag was created.';


--
-- Name: template_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_activities (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    section_id uuid,
    title character varying(255) NOT NULL,
    description text,
    location character varying(255),
    duration_minutes integer,
    start_time time without time zone,
    "position" integer,
    category character varying(50),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.template_activities OWNER TO postgres;

--
-- Name: template_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_sections (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    template_id uuid,
    day_number integer NOT NULL,
    title character varying(255),
    description text,
    "position" integer,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.template_sections OWNER TO postgres;

--
-- Name: trip_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_history (
    id bigint NOT NULL,
    trip_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    action_type public.trip_action_type NOT NULL,
    details jsonb
);


ALTER TABLE public.trip_history OWNER TO postgres;

--
-- Name: TABLE trip_history; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.trip_history IS 'Stores audit log/history of events related to trips.';


--
-- Name: COLUMN trip_history.trip_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_history.trip_id IS 'The trip this history event belongs to.';


--
-- Name: COLUMN trip_history.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_history.user_id IS 'The user who performed the action (can be null for system actions).';


--
-- Name: COLUMN trip_history.action_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_history.action_type IS 'The type of action performed.';


--
-- Name: COLUMN trip_history.details; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_history.details IS 'JSON object containing details specific to the action type (e.g., changed fields, added item ID).';


--
-- Name: trip_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trip_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_history_id_seq OWNER TO postgres;

--
-- Name: trip_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trip_history_id_seq OWNED BY public.trip_history.id;


--
-- Name: trip_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_images (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    trip_id uuid NOT NULL,
    file_path text NOT NULL,
    file_name text NOT NULL,
    content_type text NOT NULL,
    size_bytes integer NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    width integer,
    height integer,
    description text,
    album_id bigint
);


ALTER TABLE public.trip_images OWNER TO postgres;

--
-- Name: trip_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_members (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    trip_id uuid,
    user_id uuid,
    role public.trip_role DEFAULT 'viewer'::public.trip_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    invited_by uuid,
    joined_at timestamp with time zone,
    external_email text
);

ALTER TABLE ONLY public.trip_members FORCE ROW LEVEL SECURITY;


ALTER TABLE public.trip_members OWNER TO postgres;

--
-- Name: trip_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_notes (
    trip_id uuid NOT NULL,
    content text,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    album_id bigint,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL
);

ALTER TABLE ONLY public.trip_notes FORCE ROW LEVEL SECURITY;


ALTER TABLE public.trip_notes OWNER TO postgres;

--
-- Name: COLUMN trip_notes.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_notes.user_id IS 'The user who created the note.';


--
-- Name: trip_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_tags (
    trip_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.trip_tags OWNER TO postgres;

--
-- Name: TABLE trip_tags; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.trip_tags IS 'Join table linking trips to tags.';


--
-- Name: COLUMN trip_tags.trip_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_tags.trip_id IS 'Foreign key referencing the trip.';


--
-- Name: COLUMN trip_tags.tag_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_tags.tag_id IS 'Foreign key referencing the tag.';


--
-- Name: COLUMN trip_tags.assigned_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trip_tags.assigned_at IS 'Timestamp when the tag was assigned to the trip.';


--
-- Name: trip_template_uses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_template_uses (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    trip_id uuid,
    template_id uuid,
    applied_at timestamp with time zone DEFAULT now(),
    applied_by uuid,
    version_used integer,
    modifications jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.trip_template_uses OWNER TO postgres;

--
-- Name: trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trips (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_by uuid NOT NULL,
    name text NOT NULL,
    destination_id uuid,
    destination_name text,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    date_flexibility text,
    travelers_count integer DEFAULT 1,
    vibe text,
    budget text,
    is_public boolean DEFAULT false NOT NULL,
    slug text,
    cover_image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    member_count numeric,
    description text,
    trip_emoji text,
    splitwise_group_id bigint,
    duration_days integer DEFAULT 1,
    status public.trip_status DEFAULT 'planning'::public.trip_status,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    view_count integer DEFAULT 0,
    use_count integer DEFAULT 0,
    shared_url text,
    public_slug text,
    trip_type text,
    cover_image_position_y numeric,
    privacy_setting public.trip_privacy_setting DEFAULT 'private'::public.trip_privacy_setting NOT NULL,
    playlist_url text,
    CONSTRAINT trips_cover_image_position_y_check CHECK (((cover_image_position_y >= (0)::numeric) AND (cover_image_position_y <= (100)::numeric))),
    CONSTRAINT trips_date_flexibility_check CHECK ((date_flexibility = ANY (ARRAY['fixed'::text, 'month'::text, 'season'::text, 'undecided'::text]))),
    CONSTRAINT trips_name_check CHECK ((char_length(name) > 0)),
    CONSTRAINT trips_travelers_count_check CHECK ((travelers_count >= 0))
);


ALTER TABLE public.trips OWNER TO postgres;

--
-- Name: COLUMN trips.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.id IS 'Unique identifier for the trip';


--
-- Name: COLUMN trips.created_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.created_by IS 'Creator of the trip (references profiles.id)';


--
-- Name: COLUMN trips.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.name IS 'User-defined name for the trip';


--
-- Name: COLUMN trips.destination_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.destination_id IS 'Foreign key referencing the primary destination';


--
-- Name: COLUMN trips.destination_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.destination_name IS 'Stored name of the destination (city, country)';


--
-- Name: COLUMN trips.start_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.start_date IS 'Planned start date of the trip (if specific)';


--
-- Name: COLUMN trips.end_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.end_date IS 'Planned end date of the trip (if specific)';


--
-- Name: COLUMN trips.date_flexibility; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.date_flexibility IS 'Indicates date specificity (fixed, month, season, undecided)';


--
-- Name: COLUMN trips.travelers_count; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.travelers_count IS 'Number of people associated with the trip';


--
-- Name: COLUMN trips.vibe; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.vibe IS 'General vibe or type of the trip';


--
-- Name: COLUMN trips.budget; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.budget IS 'Budget category for the trip';


--
-- Name: COLUMN trips.is_public; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.is_public IS 'Whether the trip itinerary is publicly viewable';


--
-- Name: COLUMN trips.slug; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.slug IS 'URL-friendly identifier for public trips';


--
-- Name: COLUMN trips.cover_image_url; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.cover_image_url IS 'URL for the trip''s cover image';


--
-- Name: COLUMN trips.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.created_at IS 'Timestamp of creation';


--
-- Name: COLUMN trips.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.updated_at IS 'Timestamp of last update';


--
-- Name: COLUMN trips.splitwise_group_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.splitwise_group_id IS 'Stores the linked Splitwise group ID for the trip.';


--
-- Name: COLUMN trips.duration_days; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.duration_days IS 'Explicit number of days for the trip itinerary.';


--
-- Name: COLUMN trips.cover_image_position_y; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.cover_image_position_y IS 'Vertical position (0-100%) for the cover image focal point.';


--
-- Name: COLUMN trips.privacy_setting; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.privacy_setting IS 'Controls the visibility of the trip: private (default), shared_with_link, or public.';


--
-- Name: COLUMN trips.playlist_url; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trips.playlist_url IS 'tidal or spotify';


--
-- Name: user_interactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_interactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    destination_id uuid,
    interaction_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_interactions OWNER TO postgres;

--
-- Name: user_interests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_interests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    tag_id uuid,
    strength integer DEFAULT 5,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_interests_strength_check CHECK (((strength >= 0) AND (strength <= 10)))
);


ALTER TABLE public.user_interests OWNER TO postgres;

--
-- Name: user_presence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_presence (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    trip_id uuid NOT NULL,
    document_id text,
    status text DEFAULT 'viewing'::text NOT NULL,
    last_active timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_presence OWNER TO postgres;

--
-- Name: user_suggested_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_suggested_tags (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    destination_id uuid,
    name text NOT NULL,
    slug text NOT NULL,
    category text NOT NULL,
    status text DEFAULT 'pending'::text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_suggested_tags OWNER TO postgres;

--
-- Name: user_travel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_travel (
    user_id uuid NOT NULL,
    destination_id uuid NOT NULL,
    visited_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_travel OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT auth.uid() NOT NULL,
    email text NOT NULL,
    name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    is_admin boolean DEFAULT false,
    bio text,
    location text,
    interests text[] DEFAULT '{}'::text[],
    updated_at timestamp with time zone,
    username text,
    full_name text,
    last_sign_in_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'Public profile information for users, extending auth.users.';


--
-- Name: COLUMN users.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.id IS 'References the internal Supabase auth user ID.';


--
-- Name: COLUMN users.avatar_url; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.avatar_url IS 'URL for the user''s profile picture.';


--
-- Name: COLUMN users.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.created_at IS 'Timestamp of profile creation.';


--
-- Name: COLUMN users.is_admin; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.is_admin IS 'Indicates if the user has administrative privileges.';


--
-- Name: COLUMN users.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.updated_at IS 'Timestamp of last profile update.';


--
-- Name: COLUMN users.username; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.username IS 'Optional public username.';


--
-- Name: COLUMN users.full_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.full_name IS 'User''s full name.';


--
-- Name: COLUMN users.last_sign_in_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.last_sign_in_at IS 'Timestamp of the user''s most recent sign in, updated by middleware';


--
-- Name: votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.votes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    itinerary_item_id uuid,
    user_id uuid,
    vote_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.votes OWNER TO postgres;

--
-- Name: trip_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_history ALTER COLUMN id SET DEFAULT nextval('public.trip_history_id_seq'::regclass);


--
-- Name: albums albums_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_pkey PRIMARY KEY (id);


--
-- Name: budget_items budget_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_items
    ADD CONSTRAINT budget_items_pkey PRIMARY KEY (id);


--
-- Name: collaborative_sessions collaborative_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collaborative_sessions
    ADD CONSTRAINT collaborative_sessions_pkey PRIMARY KEY (id);


--
-- Name: collaborative_sessions collaborative_sessions_trip_id_document_type_document_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collaborative_sessions
    ADD CONSTRAINT collaborative_sessions_trip_id_document_type_document_id_key UNIQUE (trip_id, document_type, document_id);


--
-- Name: destination_tags destination_tags_destination_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_tags
    ADD CONSTRAINT destination_tags_destination_id_tag_id_key UNIQUE (destination_id, tag_id);


--
-- Name: destination_tags destination_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_tags
    ADD CONSTRAINT destination_tags_pkey PRIMARY KEY (id);


--
-- Name: destinations destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: image_metadata image_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image_metadata
    ADD CONSTRAINT image_metadata_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_token_key UNIQUE (token);


--
-- Name: itinerary_item_votes itinerary_item_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_item_votes
    ADD CONSTRAINT itinerary_item_votes_pkey PRIMARY KEY (id);


--
-- Name: itinerary_items itinerary_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_items
    ADD CONSTRAINT itinerary_items_pkey PRIMARY KEY (id);


--
-- Name: itinerary_sections itinerary_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_sections
    ADD CONSTRAINT itinerary_sections_pkey PRIMARY KEY (id);


--
-- Name: itinerary_sections itinerary_sections_trip_id_day_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_sections
    ADD CONSTRAINT itinerary_sections_trip_id_day_number_key UNIQUE (trip_id, day_number);


--
-- Name: itinerary_template_items itinerary_template_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_template_items
    ADD CONSTRAINT itinerary_template_items_pkey PRIMARY KEY (id);


--
-- Name: itinerary_template_sections itinerary_template_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_template_sections
    ADD CONSTRAINT itinerary_template_sections_pkey PRIMARY KEY (id);


--
-- Name: itinerary_templates itinerary_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_templates
    ADD CONSTRAINT itinerary_templates_pkey PRIMARY KEY (id);


--
-- Name: itinerary_templates itinerary_templates_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_templates
    ADD CONSTRAINT itinerary_templates_slug_key UNIQUE (slug);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: likes likes_user_id_item_id_item_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_item_id_item_type_key UNIQUE (user_id, item_id, item_type);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: note_tags note_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_tags
    ADD CONSTRAINT note_tags_pkey PRIMARY KEY (note_id, tag_id);


--
-- Name: permission_requests permission_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_requests
    ADD CONSTRAINT permission_requests_pkey PRIMARY KEY (id);


--
-- Name: permission_requests permission_requests_trip_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_requests
    ADD CONSTRAINT permission_requests_trip_id_user_id_key UNIQUE (trip_id, user_id);


--
-- Name: places places_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_referrer_id_referred_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_referred_id_key UNIQUE (referrer_id, referred_id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- Name: template_activities template_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_activities
    ADD CONSTRAINT template_activities_pkey PRIMARY KEY (id);


--
-- Name: template_sections template_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_sections
    ADD CONSTRAINT template_sections_pkey PRIMARY KEY (id);


--
-- Name: template_sections template_sections_template_id_day_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_sections
    ADD CONSTRAINT template_sections_template_id_day_number_key UNIQUE (template_id, day_number);


--
-- Name: trip_history trip_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_history
    ADD CONSTRAINT trip_history_pkey PRIMARY KEY (id);


--
-- Name: trip_images trip_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_images
    ADD CONSTRAINT trip_images_pkey PRIMARY KEY (id);


--
-- Name: trip_images trip_images_trip_id_idx; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_images
    ADD CONSTRAINT trip_images_trip_id_idx UNIQUE (trip_id, file_path);


--
-- Name: trip_members trip_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_members
    ADD CONSTRAINT trip_members_pkey PRIMARY KEY (id);


--
-- Name: trip_members trip_members_trip_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_members
    ADD CONSTRAINT trip_members_trip_id_user_id_key UNIQUE (trip_id, user_id);


--
-- Name: trip_notes trip_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_notes
    ADD CONSTRAINT trip_notes_pkey PRIMARY KEY (id);


--
-- Name: trip_tags trip_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_tags
    ADD CONSTRAINT trip_tags_pkey PRIMARY KEY (trip_id, tag_id);


--
-- Name: trip_template_uses trip_template_uses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_template_uses
    ADD CONSTRAINT trip_template_uses_pkey PRIMARY KEY (id);


--
-- Name: trip_template_uses trip_template_uses_trip_id_template_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_template_uses
    ADD CONSTRAINT trip_template_uses_trip_id_template_id_key UNIQUE (trip_id, template_id);


--
-- Name: trips trips_cover_image_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_cover_image_url_key UNIQUE (cover_image_url);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: trips trips_public_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_public_slug_key UNIQUE (public_slug);


--
-- Name: trips trips_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_slug_key UNIQUE (slug);


--
-- Name: itinerary_templates unique_itinerary_template_slug; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_templates
    ADD CONSTRAINT unique_itinerary_template_slug UNIQUE (slug);


--
-- Name: itinerary_item_votes unique_user_vote_per_item; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_item_votes
    ADD CONSTRAINT unique_user_vote_per_item UNIQUE (itinerary_item_id, user_id);


--
-- Name: user_interactions user_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_interactions
    ADD CONSTRAINT user_interactions_pkey PRIMARY KEY (id);


--
-- Name: user_interests user_interests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_interests
    ADD CONSTRAINT user_interests_pkey PRIMARY KEY (id);


--
-- Name: user_interests user_interests_user_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_interests
    ADD CONSTRAINT user_interests_user_id_tag_id_key UNIQUE (user_id, tag_id);


--
-- Name: user_presence user_presence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_presence
    ADD CONSTRAINT user_presence_pkey PRIMARY KEY (id);


--
-- Name: user_presence user_presence_user_id_trip_id_document_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_presence
    ADD CONSTRAINT user_presence_user_id_trip_id_document_id_key UNIQUE (user_id, trip_id, document_id);


--
-- Name: user_suggested_tags user_suggested_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_suggested_tags
    ADD CONSTRAINT user_suggested_tags_pkey PRIMARY KEY (id);


--
-- Name: user_travel user_travel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_travel
    ADD CONSTRAINT user_travel_pkey PRIMARY KEY (user_id, destination_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: votes votes_itinerary_item_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_itinerary_item_id_user_id_key UNIQUE (itinerary_item_id, user_id);


--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- Name: destinations_mapbox_id_unique_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX destinations_mapbox_id_unique_idx ON public.destinations USING btree (mapbox_id);


--
-- Name: idx_albums_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_albums_user_id ON public.albums USING btree (user_id);


--
-- Name: idx_budget_items_paid_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_budget_items_paid_by ON public.budget_items USING btree (paid_by);


--
-- Name: idx_budget_items_trip_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_budget_items_trip_id ON public.budget_items USING btree (trip_id);


--
-- Name: idx_destination_tags_destination_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destination_tags_destination_id ON public.destination_tags USING btree (destination_id);


--
-- Name: idx_destination_tags_tag_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destination_tags_tag_id ON public.destination_tags USING btree (tag_id);


--
-- Name: idx_destinations_city; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_city ON public.destinations USING btree (city);


--
-- Name: idx_destinations_continent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_continent ON public.destinations USING btree (continent);


--
-- Name: idx_destinations_coordinates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_coordinates ON public.destinations USING btree (latitude, longitude);


--
-- Name: idx_destinations_country; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_country ON public.destinations USING btree (country);


--
-- Name: idx_expenses_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_category ON public.expenses USING btree (category);


--
-- Name: idx_expenses_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_date ON public.expenses USING btree (date);


--
-- Name: idx_expenses_paid_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_paid_by ON public.expenses USING btree (paid_by);


--
-- Name: idx_expenses_trip_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_trip_id ON public.expenses USING btree (trip_id);


--
-- Name: idx_itinerary_item_votes_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_item_votes_item_id ON public.itinerary_item_votes USING btree (itinerary_item_id);


--
-- Name: idx_itinerary_item_votes_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_item_votes_user_id ON public.itinerary_item_votes USING btree (user_id);


--
-- Name: idx_itinerary_items_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_category ON public.itinerary_items USING btree (category);


--
-- Name: idx_itinerary_items_coordinates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_coordinates ON public.itinerary_items USING btree (latitude, longitude);


--
-- Name: idx_itinerary_items_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_created_by ON public.itinerary_items USING btree (created_by);


--
-- Name: idx_itinerary_items_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_date ON public.itinerary_items USING btree (date);


--
-- Name: idx_itinerary_items_day_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_day_number ON public.itinerary_items USING btree (day_number);


--
-- Name: idx_itinerary_items_day_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_day_position ON public.itinerary_items USING btree (trip_id, day_number, "position");


--
-- Name: idx_itinerary_items_item_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_item_type ON public.itinerary_items USING btree (item_type);


--
-- Name: idx_itinerary_items_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_position ON public.itinerary_items USING btree ("position");


--
-- Name: idx_itinerary_items_section_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_section_id ON public.itinerary_items USING btree (section_id);


--
-- Name: idx_itinerary_items_start_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_start_time ON public.itinerary_items USING btree (start_time);


--
-- Name: idx_itinerary_items_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_status ON public.itinerary_items USING btree (status);


--
-- Name: idx_itinerary_items_trip_day_pos; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_trip_day_pos ON public.itinerary_items USING btree (trip_id, day_number, section_id, "position");


--
-- Name: idx_itinerary_items_trip_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_trip_id ON public.itinerary_items USING btree (trip_id);


--
-- Name: idx_itinerary_sections_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_sections_date ON public.itinerary_sections USING btree (date);


--
-- Name: idx_itinerary_sections_day_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_sections_day_number ON public.itinerary_sections USING btree (day_number);


--
-- Name: idx_itinerary_sections_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_sections_position ON public.itinerary_sections USING btree ("position");


--
-- Name: idx_itinerary_sections_trip_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_sections_trip_id ON public.itinerary_sections USING btree (trip_id);


--
-- Name: idx_itinerary_template_items_day_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_template_items_day_order ON public.itinerary_template_items USING btree (template_id, day, item_order);


--
-- Name: idx_itinerary_template_items_place_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_template_items_place_id ON public.itinerary_template_items USING btree (place_id);


--
-- Name: idx_itinerary_template_items_template_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_template_items_template_id ON public.itinerary_template_items USING btree (template_id);


--
-- Name: idx_note_tags_note_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_note_tags_note_id ON public.note_tags USING btree (note_id);


--
-- Name: idx_note_tags_tag_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_note_tags_tag_id ON public.note_tags USING btree (tag_id);


--
-- Name: idx_places_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_places_category ON public.places USING btree (category);


--
-- Name: idx_places_destination; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_places_destination ON public.places USING btree (destination_id);


--
-- Name: idx_places_source; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_places_source ON public.places USING btree (source, source_id);


--
-- Name: idx_places_tags; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_places_tags ON public.places USING gin (tags);


--
-- Name: idx_profiles_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);


--
-- Name: idx_profiles_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_username ON public.profiles USING btree (username);


--
-- Name: idx_tags_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tags_slug ON public.tags USING btree (slug);


--
-- Name: idx_trip_history_action_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_history_action_type ON public.trip_history USING btree (action_type);


--
-- Name: idx_trip_history_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_history_created_at ON public.trip_history USING btree (created_at DESC);


--
-- Name: idx_trip_history_trip_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_history_trip_id ON public.trip_history USING btree (trip_id);


--
-- Name: idx_trip_history_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_history_user_id ON public.trip_history USING btree (user_id);


--
-- Name: idx_trip_members_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_members_role ON public.trip_members USING btree (role);


--
-- Name: idx_trip_members_trip_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_members_trip_id ON public.trip_members USING btree (trip_id);


--
-- Name: idx_trip_members_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_members_user_id ON public.trip_members USING btree (user_id);


--
-- Name: idx_trip_notes_trip_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_notes_trip_id ON public.trip_notes USING btree (trip_id);


--
-- Name: idx_trip_notes_updated_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_notes_updated_by ON public.trip_notes USING btree (updated_by);


--
-- Name: idx_trip_notes_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_notes_user_id ON public.trip_notes USING btree (user_id);


--
-- Name: idx_trip_tags_tag_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_tags_tag_id ON public.trip_tags USING btree (tag_id);


--
-- Name: idx_trip_tags_trip_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_tags_trip_id ON public.trip_tags USING btree (trip_id);


--
-- Name: idx_trips_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_created_by ON public.trips USING btree (created_by);


--
-- Name: idx_trips_destination_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_destination_id ON public.trips USING btree (destination_id);


--
-- Name: idx_trips_is_public; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_is_public ON public.trips USING btree (is_public);


--
-- Name: idx_trips_privacy_setting; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_privacy_setting ON public.trips USING btree (privacy_setting) WHERE (privacy_setting = ANY (ARRAY['shared_with_link'::public.trip_privacy_setting, 'public'::public.trip_privacy_setting]));


--
-- Name: idx_trips_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_slug ON public.trips USING btree (slug);


--
-- Name: idx_trips_splitwise_group_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_splitwise_group_id ON public.trips USING btree (splitwise_group_id);


--
-- Name: idx_trips_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_status ON public.trips USING btree (status);


--
-- Name: idx_user_interactions_destination_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_interactions_destination_id ON public.user_interactions USING btree (destination_id);


--
-- Name: idx_user_interactions_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_interactions_type ON public.user_interactions USING btree (interaction_type);


--
-- Name: idx_user_interactions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_interactions_user_id ON public.user_interactions USING btree (user_id);


--
-- Name: idx_user_interests_tag_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_interests_tag_id ON public.user_interests USING btree (tag_id);


--
-- Name: idx_user_interests_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_interests_user_id ON public.user_interests USING btree (user_id);


--
-- Name: idx_users_last_sign_in; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_last_sign_in ON public.users USING btree (last_sign_in_at);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: idx_votes_itinerary_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_votes_itinerary_item ON public.votes USING btree (itinerary_item_id);


--
-- Name: idx_votes_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_votes_user ON public.votes USING btree (user_id);


--
-- Name: image_metadata_entity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX image_metadata_entity_idx ON public.image_metadata USING btree (entity_id, entity_type);


--
-- Name: likes_item_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX likes_item_id_idx ON public.likes USING btree (item_id);


--
-- Name: likes_item_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX likes_item_type_idx ON public.likes USING btree (item_type);


--
-- Name: likes_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX likes_user_id_idx ON public.likes USING btree (user_id);


--
-- Name: user_interactions after_user_interaction; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER after_user_interaction AFTER INSERT ON public.user_interactions FOR EACH ROW EXECUTE FUNCTION public.update_profile_from_interaction();


--
-- Name: itinerary_item_votes handle_updated_at_itinerary_item_votes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_updated_at_itinerary_item_votes BEFORE UPDATE ON public.itinerary_item_votes FOR EACH ROW EXECUTE FUNCTION public.moddatetime();


--
-- Name: destinations set_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: itinerary_items set_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.itinerary_items FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: trips set_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: users set_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: user_travel trg_decrement_travelers; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_decrement_travelers AFTER DELETE ON public.user_travel FOR EACH ROW EXECUTE FUNCTION public.decrement_travelers_count();


--
-- Name: user_travel trg_increment_travelers; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_increment_travelers AFTER INSERT ON public.user_travel FOR EACH ROW EXECUTE FUNCTION public.increment_travelers_count();


--
-- Name: budget_items update_budget_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON public.budget_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: image_metadata update_image_metadata_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_image_metadata_updated_at BEFORE UPDATE ON public.image_metadata FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: likes update_likes_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_likes_updated_at BEFORE UPDATE ON public.likes FOR EACH ROW EXECUTE FUNCTION public.update_likes_updated_at();


--
-- Name: trips update_trip_duration; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_trip_duration BEFORE INSERT OR UPDATE OF start_date, end_date ON public.trips FOR EACH ROW EXECUTE FUNCTION public.calculate_trip_duration();


--
-- Name: trips update_trips_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_trips_timestamp BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: image_metadata validate_image_metadata_entity; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER validate_image_metadata_entity BEFORE INSERT OR UPDATE ON public.image_metadata FOR EACH ROW EXECUTE FUNCTION public.validate_image_metadata_entity();


--
-- Name: albums albums_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: budget_items budget_items_paid_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_items
    ADD CONSTRAINT budget_items_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES public.profiles(id);


--
-- Name: budget_items budget_items_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.budget_items
    ADD CONSTRAINT budget_items_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: destination_tags destination_tags_added_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_tags
    ADD CONSTRAINT destination_tags_added_by_fkey FOREIGN KEY (added_by) REFERENCES auth.users(id);


--
-- Name: destination_tags destination_tags_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_tags
    ADD CONSTRAINT destination_tags_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE CASCADE;


--
-- Name: destination_tags destination_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_tags
    ADD CONSTRAINT destination_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_paid_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: itinerary_items fk_itinerary_items_creator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_items
    ADD CONSTRAINT fk_itinerary_items_creator FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: itinerary_items fk_itinerary_items_place; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_items
    ADD CONSTRAINT fk_itinerary_items_place FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE SET NULL;


--
-- Name: itinerary_items fk_itinerary_items_trip; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_items
    ADD CONSTRAINT fk_itinerary_items_trip FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: itinerary_template_items fk_itinerary_template_items_place_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_template_items
    ADD CONSTRAINT fk_itinerary_template_items_place_id FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE SET NULL;


--
-- Name: itinerary_template_items fk_itinerary_template_items_template_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_template_items
    ADD CONSTRAINT fk_itinerary_template_items_template_id FOREIGN KEY (template_id) REFERENCES public.itinerary_templates(id) ON DELETE CASCADE;


--
-- Name: invitations invitations_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invitations invitations_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: itinerary_item_votes itinerary_item_votes_itinerary_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_item_votes
    ADD CONSTRAINT itinerary_item_votes_itinerary_item_id_fkey FOREIGN KEY (itinerary_item_id) REFERENCES public.itinerary_items(id) ON DELETE CASCADE;


--
-- Name: itinerary_item_votes itinerary_item_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_item_votes
    ADD CONSTRAINT itinerary_item_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT itinerary_item_votes_user_id_fkey ON itinerary_item_votes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT itinerary_item_votes_user_id_fkey ON public.itinerary_item_votes IS 'Ensures that the user_id in itinerary_item_votes refers to a valid user in the profiles table. Deletes votes if the user profile is deleted.';


--
-- Name: itinerary_items itinerary_items_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_items
    ADD CONSTRAINT itinerary_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: itinerary_items itinerary_items_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_items
    ADD CONSTRAINT itinerary_items_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.itinerary_sections(id) ON DELETE SET NULL;


--
-- Name: itinerary_items itinerary_items_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_items
    ADD CONSTRAINT itinerary_items_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: itinerary_sections itinerary_sections_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_sections
    ADD CONSTRAINT itinerary_sections_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: itinerary_templates itinerary_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_templates
    ADD CONSTRAINT itinerary_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: itinerary_templates itinerary_templates_created_by_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_templates
    ADD CONSTRAINT itinerary_templates_created_by_fkey1 FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: itinerary_templates itinerary_templates_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_templates
    ADD CONSTRAINT itinerary_templates_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id);


--
-- Name: itinerary_templates itinerary_templates_source_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_templates
    ADD CONSTRAINT itinerary_templates_source_trip_id_fkey FOREIGN KEY (source_trip_id) REFERENCES public.trips(id);


--
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: locations locations_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.locations(id);


--
-- Name: note_tags note_tags_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_tags
    ADD CONSTRAINT note_tags_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.trip_notes(id) ON DELETE CASCADE;


--
-- Name: note_tags note_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.note_tags
    ADD CONSTRAINT note_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: permission_requests permission_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_requests
    ADD CONSTRAINT permission_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: places places_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE SET NULL;


--
-- Name: places places_suggested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_suggested_by_fkey FOREIGN KEY (suggested_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_home_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_home_location_id_fkey FOREIGN KEY (home_location_id) REFERENCES public.locations(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: referrals referrals_referred_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: referrals referrals_referrer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tags tags_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: template_activities template_activities_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_activities
    ADD CONSTRAINT template_activities_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.template_sections(id) ON DELETE CASCADE;


--
-- Name: template_sections template_sections_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_sections
    ADD CONSTRAINT template_sections_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.itinerary_templates(id) ON DELETE CASCADE;


--
-- Name: trip_history trip_history_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_history
    ADD CONSTRAINT trip_history_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: trip_history trip_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_history
    ADD CONSTRAINT trip_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: trip_images trip_images_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_images
    ADD CONSTRAINT trip_images_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE SET NULL;


--
-- Name: trip_images trip_images_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_images
    ADD CONSTRAINT trip_images_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: trip_images trip_images_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_images
    ADD CONSTRAINT trip_images_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: trip_members trip_members_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_members
    ADD CONSTRAINT trip_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id);


--
-- Name: trip_members trip_members_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_members
    ADD CONSTRAINT trip_members_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trip_members trip_members_user_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_members
    ADD CONSTRAINT trip_members_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: trip_notes trip_notes_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_notes
    ADD CONSTRAINT trip_notes_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE SET NULL;


--
-- Name: trip_notes trip_notes_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_notes
    ADD CONSTRAINT trip_notes_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trip_notes trip_notes_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_notes
    ADD CONSTRAINT trip_notes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: trip_notes trip_notes_updated_by_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_notes
    ADD CONSTRAINT trip_notes_updated_by_fkey1 FOREIGN KEY (updated_by) REFERENCES public.profiles(id);


--
-- Name: trip_notes trip_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_notes
    ADD CONSTRAINT trip_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: trip_tags trip_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_tags
    ADD CONSTRAINT trip_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: trip_tags trip_tags_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_tags
    ADD CONSTRAINT trip_tags_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: trip_template_uses trip_template_uses_applied_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_template_uses
    ADD CONSTRAINT trip_template_uses_applied_by_fkey FOREIGN KEY (applied_by) REFERENCES auth.users(id);


--
-- Name: trip_template_uses trip_template_uses_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_template_uses
    ADD CONSTRAINT trip_template_uses_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.itinerary_templates(id) ON DELETE SET NULL;


--
-- Name: trip_template_uses trip_template_uses_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_template_uses
    ADD CONSTRAINT trip_template_uses_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: trips trips_cover_image_url_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_cover_image_url_fkey FOREIGN KEY (cover_image_url) REFERENCES public.trips(cover_image_url);


--
-- Name: trips trips_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: trips trips_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE SET NULL;


--
-- Name: user_interactions user_interactions_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_interactions
    ADD CONSTRAINT user_interactions_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id);


--
-- Name: user_interactions user_interactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_interactions
    ADD CONSTRAINT user_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: user_interests user_interests_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_interests
    ADD CONSTRAINT user_interests_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: user_interests user_interests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_interests
    ADD CONSTRAINT user_interests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_presence user_presence_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_presence
    ADD CONSTRAINT user_presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_suggested_tags user_suggested_tags_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_suggested_tags
    ADD CONSTRAINT user_suggested_tags_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id);


--
-- Name: user_suggested_tags user_suggested_tags_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_suggested_tags
    ADD CONSTRAINT user_suggested_tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: user_travel user_travel_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_travel
    ADD CONSTRAINT user_travel_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE CASCADE;


--
-- Name: user_travel user_travel_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_travel
    ADD CONSTRAINT user_travel_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: votes votes_itinerary_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_itinerary_item_id_fkey FOREIGN KEY (itinerary_item_id) REFERENCES public.itinerary_items(id) ON DELETE CASCADE;


--
-- Name: votes votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_suggested_tags Admins can view all tag suggestions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all tag suggestions" ON public.user_suggested_tags FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: trips Allow admin delete access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow admin delete access" ON public.trips FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = trips.id) AND (tm.user_id = auth.uid()) AND (tm.role = 'admin'::public.trip_role)))));


--
-- Name: destinations Allow admin users to insert destinations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow admin users to insert destinations" ON public.destinations FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: trip_members Allow admin/editor to manage members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow admin/editor to manage members" ON public.trip_members USING (public.can_manage_trip_members(trip_id)) WITH CHECK (public.can_manage_trip_members(trip_id));


--
-- Name: trips Allow admin/editor update access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow admin/editor update access" ON public.trips FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = trips.id) AND (tm.user_id = auth.uid()) AND ((tm.role = 'admin'::public.trip_role) OR (tm.role = 'editor'::public.trip_role)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = trips.id) AND (tm.user_id = auth.uid()) AND ((tm.role = 'admin'::public.trip_role) OR (tm.role = 'editor'::public.trip_role))))));


--
-- Name: trip_notes Allow admins to delete notes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow admins to delete notes" ON public.trip_notes FOR DELETE USING (public.is_trip_member_with_role(trip_id, auth.uid(), ARRAY['admin'::text]));


--
-- Name: tags Allow admins to delete tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow admins to delete tags" ON public.tags FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: tags Allow admins to update tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow admins to update tags" ON public.tags FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: itinerary_sections Allow admins/editors to manage sections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow admins/editors to manage sections" ON public.itinerary_sections USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = itinerary_sections.trip_id) AND (tm.user_id = auth.uid()) AND ((tm.role = 'admin'::public.trip_role) OR (tm.role = 'editor'::public.trip_role)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = itinerary_sections.trip_id) AND (tm.user_id = auth.uid()) AND ((tm.role = 'admin'::public.trip_role) OR (tm.role = 'editor'::public.trip_role))))));


--
-- Name: trip_tags Allow admins/editors to manage trip tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow admins/editors to manage trip tags" ON public.trip_tags USING (public.can_manage_trip_members(trip_id)) WITH CHECK (public.can_manage_trip_members(trip_id));


--
-- Name: itinerary_templates Allow all users to view published templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all users to view published templates" ON public.itinerary_templates FOR SELECT USING ((is_published = true));


--
-- Name: itinerary_templates Allow authenticated users to create templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to create templates" ON public.itinerary_templates FOR INSERT WITH CHECK (((auth.role() = 'authenticated'::text) AND (created_by = auth.uid())));


--
-- Name: destinations Allow authenticated users to insert destinations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to insert destinations" ON public.destinations FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: permission_requests Allow authenticated users to insert requests for themselves; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to insert requests for themselves" ON public.permission_requests FOR INSERT WITH CHECK (((auth.role() = 'authenticated'::text) AND (auth.uid() = user_id)));


--
-- Name: tags Allow authenticated users to insert tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to insert tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: destinations Allow authenticated users to read destinations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to read destinations" ON public.destinations FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: tags Allow authenticated users to read tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to read tags" ON public.tags FOR SELECT TO authenticated USING (true);


--
-- Name: users Allow authenticated users to select own data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to select own data" ON public.users FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: places Allow authenticated users to suggest new manual places; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to suggest new manual places" ON public.places FOR INSERT WITH CHECK (((auth.role() = 'authenticated'::text) AND (suggested_by = auth.uid()) AND (is_verified = false) AND (source IS NULL) AND (source_id IS NULL)));


--
-- Name: places Allow authenticated users to suggest new places; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to suggest new places" ON public.places FOR INSERT WITH CHECK (((auth.role() = 'authenticated'::text) AND (suggested_by = auth.uid()) AND (is_verified = false)));


--
-- Name: users Allow authenticated users to update their own data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to update their own data" ON public.users FOR UPDATE TO authenticated USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: places Allow authenticated users to view relevant places; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to view relevant places" ON public.places FOR SELECT USING (((is_verified = true) OR (suggested_by = auth.uid()) OR (source IS NOT NULL)));


--
-- Name: places Allow authenticated users to view verified places; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to view verified places" ON public.places FOR SELECT USING (((is_verified = true) OR (suggested_by = auth.uid())));


--
-- Name: trip_notes Allow contributors and up to insert notes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow contributors and up to insert notes" ON public.trip_notes FOR INSERT WITH CHECK (((user_id = auth.uid()) AND (public.has_trip_role(trip_id, auth.uid(), 'admin'::public.trip_role) OR public.has_trip_role(trip_id, auth.uid(), 'editor'::public.trip_role) OR public.has_trip_role(trip_id, auth.uid(), 'contributor'::public.trip_role))));


--
-- Name: itinerary_items Allow contributors to manage itinerary items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow contributors to manage itinerary items" ON public.itinerary_items USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = itinerary_items.trip_id) AND (tm.user_id = auth.uid()) AND ((tm.role = 'admin'::public.trip_role) OR (tm.role = 'editor'::public.trip_role) OR (tm.role = 'contributor'::public.trip_role)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = itinerary_items.trip_id) AND (tm.user_id = auth.uid()) AND ((tm.role = 'admin'::public.trip_role) OR (tm.role = 'editor'::public.trip_role) OR (tm.role = 'contributor'::public.trip_role))))));


--
-- Name: trips Allow creator full access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow creator full access" ON public.trips USING ((auth.uid() = created_by)) WITH CHECK ((auth.uid() = created_by));


--
-- Name: itinerary_templates Allow creators to update their own templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow creators to update their own templates" ON public.itinerary_templates FOR UPDATE USING ((created_by = auth.uid())) WITH CHECK ((created_by = auth.uid()));


--
-- Name: itinerary_templates Allow creators to view their own unpublished templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow creators to view their own unpublished templates" ON public.itinerary_templates FOR SELECT USING ((created_by = auth.uid()));


--
-- Name: trips Allow delete access for admins only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow delete access for admins only" ON public.trips FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm_check
  WHERE ((tm_check.trip_id = trips.id) AND (tm_check.user_id = auth.uid()) AND (tm_check.role = 'admin'::public.trip_role)))));


--
-- Name: permission_requests Allow delete by admins/editors or requester; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow delete by admins/editors or requester" ON public.permission_requests FOR DELETE USING (((auth.uid() = user_id) OR (auth.uid() IN ( SELECT tm.user_id
   FROM public.trip_members tm
  WHERE ((tm.trip_id = permission_requests.trip_id) AND (tm.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role])))))));


--
-- Name: user_travel Allow delete on user_travel; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow delete on user_travel" ON public.user_travel FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: trip_notes Allow editors and up to delete any notes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow editors and up to delete any notes" ON public.trip_notes FOR DELETE USING ((public.has_trip_role(trip_id, auth.uid(), 'admin'::public.trip_role) OR public.has_trip_role(trip_id, auth.uid(), 'editor'::public.trip_role)));


--
-- Name: trip_notes Allow editors and up to update any notes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow editors and up to update any notes" ON public.trip_notes FOR UPDATE USING ((public.has_trip_role(trip_id, auth.uid(), 'admin'::public.trip_role) OR public.has_trip_role(trip_id, auth.uid(), 'editor'::public.trip_role)));


--
-- Name: trip_notes Allow editors/admins or last updater to update notes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow editors/admins or last updater to update notes" ON public.trip_notes FOR UPDATE USING ((public.is_trip_member_with_role(trip_id, auth.uid(), ARRAY['admin'::text, 'editor'::text]) OR (updated_by = auth.uid()))) WITH CHECK ((public.is_trip_member_with_role(trip_id, auth.uid(), ARRAY['admin'::text, 'editor'::text]) OR (updated_by = auth.uid())));


--
-- Name: trip_notes Allow editors/admins to create notes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow editors/admins to create notes" ON public.trip_notes FOR INSERT WITH CHECK (public.is_trip_member_with_role(trip_id, auth.uid(), ARRAY['admin'::text, 'editor'::text]));


--
-- Name: trip_notes Allow editors/admins to insert notes for their trip; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow editors/admins to insert notes for their trip" ON public.trip_notes FOR INSERT WITH CHECK (((updated_by = auth.uid()) AND (trip_id IN ( SELECT tm.trip_id
   FROM public.trip_members tm
  WHERE ((tm.user_id = auth.uid()) AND (tm.role = ANY (ARRAY['editor'::public.trip_role, 'admin'::public.trip_role])))))));


--
-- Name: itinerary_items Allow editors/admins to manage items in accessible sections or ; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow editors/admins to manage items in accessible sections or " ON public.itinerary_items USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.user_id = auth.uid()) AND (tm.trip_id = itinerary_items.trip_id) AND ((tm.role = 'admin'::public.trip_role) OR (tm.role = 'editor'::public.trip_role)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.user_id = auth.uid()) AND (tm.trip_id = itinerary_items.trip_id) AND ((tm.role = 'admin'::public.trip_role) OR (tm.role = 'editor'::public.trip_role)) AND ((itinerary_items.section_id IS NULL) OR (EXISTS ( SELECT 1
           FROM public.itinerary_sections s
          WHERE (s.id = itinerary_items.section_id))))))));


--
-- Name: note_tags Allow editors/admins to manage note tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow editors/admins to manage note tags" ON public.note_tags USING ((EXISTS ( SELECT 1
   FROM public.trip_notes tn
  WHERE ((tn.id = note_tags.note_id) AND public.is_trip_member_with_role(tn.trip_id, auth.uid(), ARRAY['admin'::text, 'editor'::text]))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.trip_notes tn
  WHERE ((tn.id = note_tags.note_id) AND public.is_trip_member_with_role(tn.trip_id, auth.uid(), ARRAY['admin'::text, 'editor'::text])))));


--
-- Name: itinerary_sections Allow editors/admins to manage their trip sections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow editors/admins to manage their trip sections" ON public.itinerary_sections USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = itinerary_sections.trip_id) AND (tm.user_id = auth.uid()) AND ((tm.role = 'admin'::public.trip_role) OR (tm.role = 'editor'::public.trip_role)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = itinerary_sections.trip_id) AND (tm.user_id = auth.uid()) AND ((tm.role = 'admin'::public.trip_role) OR (tm.role = 'editor'::public.trip_role))))));


--
-- Name: trip_notes Allow editors/admins to update notes for their trip; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow editors/admins to update notes for their trip" ON public.trip_notes FOR UPDATE USING ((trip_id IN ( SELECT tm.trip_id
   FROM public.trip_members tm
  WHERE ((tm.user_id = auth.uid()) AND (tm.role = ANY (ARRAY['editor'::public.trip_role, 'admin'::public.trip_role])))))) WITH CHECK (((updated_by = auth.uid()) AND (trip_id IN ( SELECT tm.trip_id
   FROM public.trip_members tm
  WHERE ((tm.user_id = auth.uid()) AND (tm.role = ANY (ARRAY['editor'::public.trip_role, 'admin'::public.trip_role])))))));


--
-- Name: users Allow individual user delete access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow individual user delete access" ON public.users FOR DELETE USING ((auth.uid() = id));


--
-- Name: profiles Allow individual user read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow individual user read access" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: profiles Allow individual user select access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow individual user select access" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: profiles Allow individual user update access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow individual user update access" ON public.profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: trips Allow insert access for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow insert access for authenticated users" ON public.trips FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: user_travel Allow insert on user_travel; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow insert on user_travel" ON public.user_travel FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: trip_tags Allow insert/delete for trip admins/editors; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow insert/delete for trip admins/editors" ON public.trip_tags USING ((auth.uid() IN ( SELECT trip_members.user_id
   FROM public.trip_members
  WHERE ((trip_members.trip_id = trip_tags.trip_id) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role])))))) WITH CHECK ((auth.uid() IN ( SELECT trip_members.user_id
   FROM public.trip_members
  WHERE ((trip_members.trip_id = trip_tags.trip_id) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role]))))));


--
-- Name: trips Allow member read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow member read access" ON public.trips FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: votes Allow members to delete their own vote; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to delete their own vote" ON public.votes FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: itinerary_item_votes Allow members to delete their own votes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to delete their own votes" ON public.itinerary_item_votes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: budget_items Allow members to insert budget items for their trips; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to insert budget items for their trips" ON public.budget_items FOR INSERT WITH CHECK ((trip_id IN ( SELECT trip_members.trip_id
   FROM public.trip_members
  WHERE (trip_members.user_id = auth.uid()))));


--
-- Name: itinerary_item_votes Allow members to insert their own votes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to insert their own votes" ON public.itinerary_item_votes FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM (public.itinerary_items ii
     JOIN public.trip_members tm ON ((ii.trip_id = tm.trip_id)))
  WHERE ((ii.id = itinerary_item_votes.itinerary_item_id) AND (tm.user_id = auth.uid()) AND (tm.joined_at IS NOT NULL))))));


--
-- Name: votes Allow members to insert/update their own vote; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to insert/update their own vote" ON public.votes USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (itinerary_item_id IN ( SELECT itinerary_items.id
   FROM public.itinerary_items
  WHERE (itinerary_items.trip_id IN ( SELECT trip_members.trip_id
           FROM public.trip_members
          WHERE (trip_members.user_id = auth.uid())))))));


--
-- Name: votes Allow members to manage own votes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to manage own votes" ON public.votes USING (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM (public.trip_members tm
     JOIN public.itinerary_items ii ON ((tm.trip_id = ii.trip_id)))
  WHERE ((ii.id = votes.itinerary_item_id) AND (tm.user_id = auth.uid())))))) WITH CHECK ((auth.uid() = user_id));


--
-- Name: budget_items Allow members to read budget items for their trips; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to read budget items for their trips" ON public.budget_items FOR SELECT USING ((trip_id IN ( SELECT trip_members.trip_id
   FROM public.trip_members
  WHERE (trip_members.user_id = auth.uid()))));


--
-- Name: trip_notes Allow members to read notes for their trips; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to read notes for their trips" ON public.trip_notes FOR SELECT USING (public.is_trip_member_with_role(trip_id, auth.uid(), ARRAY['admin'::text, 'editor'::text, 'contributor'::text, 'viewer'::text]));


--
-- Name: trip_history Allow members to read trip history; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to read trip history" ON public.trip_history FOR SELECT USING ((auth.uid() IN ( SELECT trip_members.user_id
   FROM public.trip_members
  WHERE (trip_members.trip_id = trip_history.trip_id))));


--
-- Name: itinerary_item_votes Allow members to update their own votes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to update their own votes" ON public.itinerary_item_votes FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: itinerary_items Allow members to view items in accessible sections or unschedul; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to view items in accessible sections or unschedul" ON public.itinerary_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.user_id = auth.uid()) AND (tm.trip_id = itinerary_items.trip_id) AND ((itinerary_items.section_id IS NULL) OR (EXISTS ( SELECT 1
           FROM public.itinerary_sections s
          WHERE (s.id = itinerary_items.section_id))))))));


--
-- Name: itinerary_items Allow members to view itinerary items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to view itinerary items" ON public.itinerary_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = itinerary_items.trip_id) AND (tm.user_id = auth.uid())))));


--
-- Name: trip_members Allow members to view memberships of their trips; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to view memberships of their trips" ON public.trip_members FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: note_tags Allow members to view note tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to view note tags" ON public.note_tags FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.trip_notes tn
     JOIN public.trip_members tm ON ((tn.trip_id = tm.trip_id)))
  WHERE ((tn.id = note_tags.note_id) AND (tm.user_id = auth.uid())))));


--
-- Name: trip_notes Allow members to view notes for their trip; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to view notes for their trip" ON public.trip_notes FOR SELECT USING ((trip_id IN ( SELECT tm.trip_id
   FROM public.trip_members tm
  WHERE (tm.user_id = auth.uid()))));


--
-- Name: trip_members Allow members to view other members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to view other members" ON public.trip_members FOR SELECT USING (public.is_trip_member(trip_id));


--
-- Name: itinerary_sections Allow members to view sections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to view sections" ON public.itinerary_sections FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = itinerary_sections.trip_id) AND (tm.user_id = auth.uid())))));


--
-- Name: itinerary_sections Allow members to view their trip sections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to view their trip sections" ON public.itinerary_sections FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = itinerary_sections.trip_id) AND (tm.user_id = auth.uid())))));


--
-- Name: trip_tags Allow members to view their trip tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to view their trip tags" ON public.trip_tags FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = trip_tags.trip_id) AND (tm.user_id = auth.uid())))));


--
-- Name: trip_notes Allow members to view trip notes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to view trip notes" ON public.trip_notes FOR SELECT USING (public.is_trip_member(trip_id, auth.uid()));


--
-- Name: votes Allow members to view votes on their trip items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow members to view votes on their trip items" ON public.votes FOR SELECT USING ((itinerary_item_id IN ( SELECT itinerary_items.id
   FROM public.itinerary_items
  WHERE (itinerary_items.trip_id IN ( SELECT trip_members.trip_id
           FROM public.trip_members
          WHERE (trip_members.user_id = auth.uid()))))));


--
-- Name: itinerary_items Allow modification access for admin/editor/contributor; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow modification access for admin/editor/contributor" ON public.itinerary_items TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = itinerary_items.trip_id) AND (trip_members.user_id = auth.uid()) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role, 'contributor'::public.trip_role]))))));


--
-- Name: expenses Allow modification by admin/editor/contributor; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow modification by admin/editor/contributor" ON public.expenses TO authenticated USING (public.is_trip_member(trip_id, auth.uid())) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.trip_members tm_check
  WHERE ((tm_check.trip_id = expenses.trip_id) AND (tm_check.user_id = auth.uid()) AND (tm_check.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role, 'contributor'::public.trip_role]))))));


--
-- Name: trip_members Allow modification by admin/editor/contributor; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow modification by admin/editor/contributor" ON public.trip_members TO authenticated USING (true) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.trip_members tm_auth_check
  WHERE ((tm_auth_check.trip_id = trip_members.trip_id) AND (tm_auth_check.user_id = auth.uid()) AND (tm_auth_check.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role, 'contributor'::public.trip_role]))))));


--
-- Name: trips Allow public read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public read access" ON public.trips FOR SELECT USING ((is_public = true));


--
-- Name: users Allow public read access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public read access" ON public.users FOR SELECT USING (true);


--
-- Name: destinations Allow public read access to destinations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow public read access to destinations" ON public.destinations FOR SELECT USING (true);


--
-- Name: trips Allow read access for members or if public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow read access for members or if public" ON public.trips FOR SELECT TO authenticated USING (((is_public = true) OR (EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = trips.id) AND (tm.user_id = auth.uid()))))));


--
-- Name: itinerary_items Allow read access for members or if trip public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow read access for members or if trip public" ON public.itinerary_items FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = itinerary_items.trip_id) AND ((trips.is_public = true) OR public.is_trip_member(itinerary_items.trip_id, auth.uid()))))));


--
-- Name: expenses Allow read access for trip members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow read access for trip members" ON public.expenses FOR SELECT TO authenticated USING (public.is_trip_member(trip_id, auth.uid()));


--
-- Name: trip_tags Allow select access for trip members or public trips; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow select access for trip members or public trips" ON public.trip_tags FOR SELECT USING ((( SELECT trips.is_public
   FROM public.trips
  WHERE (trips.id = trip_tags.trip_id)) OR (auth.uid() IN ( SELECT trip_members.user_id
   FROM public.trip_members
  WHERE (trip_members.trip_id = trip_tags.trip_id)))));


--
-- Name: permission_requests Allow select for admins/editors and requesters; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow select for admins/editors and requesters" ON public.permission_requests FOR SELECT USING (((auth.uid() = user_id) OR (auth.uid() IN ( SELECT tm.user_id
   FROM public.trip_members tm
  WHERE ((tm.trip_id = permission_requests.trip_id) AND (tm.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role])))))));


--
-- Name: user_travel Allow select on user_travel; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow select on user_travel" ON public.user_travel FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: trip_members Allow self-delete (leave trip); Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow self-delete (leave trip)" ON public.trip_members FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: trips Allow trip admins delete access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow trip admins delete access" ON public.trips FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = trips.id) AND (tm.user_id = auth.uid()) AND (tm.role = 'admin'::public.trip_role)))));


--
-- Name: trips Allow trip admins/editors update access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow trip admins/editors update access" ON public.trips FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = trips.id) AND (tm.user_id = auth.uid()) AND ((tm.role = 'admin'::public.trip_role) OR (tm.role = 'editor'::public.trip_role)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.trip_members tm
  WHERE ((tm.trip_id = trips.id) AND (tm.user_id = auth.uid()) AND ((tm.role = 'admin'::public.trip_role) OR (tm.role = 'editor'::public.trip_role))))));


--
-- Name: itinerary_item_votes Allow trip members to view votes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow trip members to view votes" ON public.itinerary_item_votes FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.itinerary_items ii
     JOIN public.trip_members tm ON ((ii.trip_id = tm.trip_id)))
  WHERE ((ii.id = itinerary_item_votes.itinerary_item_id) AND (tm.user_id = auth.uid()) AND (tm.joined_at IS NOT NULL)))));


--
-- Name: trips Allow update access for admin/editor/contributor; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow update access for admin/editor/contributor" ON public.trips FOR UPDATE TO authenticated USING (((is_public = true) OR public.is_trip_member(id, auth.uid()))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.trip_members tm_check
  WHERE ((tm_check.trip_id = trips.id) AND (tm_check.user_id = auth.uid()) AND (tm_check.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role, 'contributor'::public.trip_role]))))));


--
-- Name: permission_requests Allow update by admins/editors; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow update by admins/editors" ON public.permission_requests FOR UPDATE USING ((auth.uid() IN ( SELECT tm.user_id
   FROM public.trip_members tm
  WHERE ((tm.trip_id = permission_requests.trip_id) AND (tm.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role])))))) WITH CHECK ((auth.uid() IN ( SELECT tm.user_id
   FROM public.trip_members tm
  WHERE ((tm.trip_id = permission_requests.trip_id) AND (tm.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role]))))));


--
-- Name: user_travel Allow update on user_travel; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow update on user_travel" ON public.user_travel FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: trip_notes Allow users to delete own notes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to delete own notes" ON public.trip_notes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: budget_items Allow users to delete their own budget items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to delete their own budget items" ON public.budget_items FOR DELETE USING (((paid_by = auth.uid()) OR (trip_id IN ( SELECT trip_members.trip_id
   FROM public.trip_members
  WHERE ((trip_members.user_id = auth.uid()) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role])))))));


--
-- Name: trip_notes Allow users to update own notes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to update own notes" ON public.trip_notes FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: budget_items Allow users to update their own budget items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to update their own budget items" ON public.budget_items FOR UPDATE USING (((paid_by = auth.uid()) OR (trip_id IN ( SELECT trip_members.trip_id
   FROM public.trip_members
  WHERE ((trip_members.user_id = auth.uid()) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role]))))))) WITH CHECK (((paid_by = auth.uid()) OR (trip_id IN ( SELECT trip_members.trip_id
   FROM public.trip_members
  WHERE ((trip_members.user_id = auth.uid()) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role])))))));


--
-- Name: template_activities Allow users to view activities of accessible templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to view activities of accessible templates" ON public.template_activities FOR SELECT USING ((section_id IN ( SELECT ts.id
   FROM (public.template_sections ts
     JOIN public.itinerary_templates it ON ((ts.template_id = it.id)))
  WHERE ((it.is_published = true) OR (it.created_by = auth.uid())))));


--
-- Name: template_sections Allow users to view sections of accessible templates; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to view sections of accessible templates" ON public.template_sections FOR SELECT USING ((template_id IN ( SELECT it.id
   FROM public.itinerary_templates it
  WHERE ((it.is_published = true) OR (it.created_by = auth.uid())))));


--
-- Name: destination_tags Destination tags are viewable by everyone; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Destination tags are viewable by everyone" ON public.destination_tags FOR SELECT USING (true);


--
-- Name: destinations Destinations are viewable by everyone.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Destinations are viewable by everyone." ON public.destinations FOR SELECT USING (true);


--
-- Name: profiles Disallow delete access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Disallow delete access" ON public.profiles AS RESTRICTIVE FOR DELETE TO authenticated USING (false);


--
-- Name: profiles Disallow direct profile deletes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Disallow direct profile deletes" ON public.profiles FOR DELETE USING (false);


--
-- Name: profiles Disallow direct profile inserts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Disallow direct profile inserts" ON public.profiles FOR INSERT WITH CHECK (false);


--
-- Name: template_activities Everyone can view published template activities; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Everyone can view published template activities" ON public.template_activities FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.template_sections
     JOIN public.itinerary_templates ON ((template_sections.template_id = itinerary_templates.id)))
  WHERE ((template_sections.id = template_activities.section_id) AND (itinerary_templates.is_published = true)))));


--
-- Name: template_sections Everyone can view published template sections; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Everyone can view published template sections" ON public.template_sections FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.itinerary_templates
  WHERE ((itinerary_templates.id = template_sections.template_id) AND (itinerary_templates.is_published = true)))));


--
-- Name: destination_tags Only admins can create/update destination tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Only admins can create/update destination tags" ON public.destination_tags TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: places Places are viewable by everyone.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Places are viewable by everyone." ON public.places FOR SELECT USING (true);


--
-- Name: profiles Public profiles are viewable by everyone.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);


--
-- Name: destinations Public select on destinations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public select on destinations" ON public.destinations FOR SELECT USING (true);


--
-- Name: tags Tags are viewable by everyone; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR SELECT USING (true);


--
-- Name: user_suggested_tags Users can create tag suggestions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create tag suggestions" ON public.user_suggested_tags FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: trip_template_uses Users can create template uses for their trips; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create template uses for their trips" ON public.trip_template_uses FOR INSERT WITH CHECK ((auth.uid() IN ( SELECT trip_members.user_id
   FROM public.trip_members
  WHERE (trip_members.trip_id = trip_template_uses.trip_id))));


--
-- Name: user_interactions Users can create their own interactions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own interactions" ON public.user_interactions FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: likes Users can create their own likes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own likes" ON public.likes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: likes Users can delete their own likes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: user_interests Users can manage their own interests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can manage their own interests" ON public.user_interests TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: user_interactions Users can update their own interactions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own interactions" ON public.user_interactions FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_interactions Users can view their own interactions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own interactions" ON public.user_interactions FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_interests Users can view their own interests; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own interests" ON public.user_interests FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: likes Users can view their own likes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own likes" ON public.likes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_suggested_tags Users can view their own tag suggestions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own tag suggestions" ON public.user_suggested_tags FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: trip_template_uses Users can view their own trip template uses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own trip template uses" ON public.trip_template_uses FOR SELECT USING ((auth.uid() IN ( SELECT trip_members.user_id
   FROM public.trip_members
  WHERE (trip_members.trip_id = trip_template_uses.trip_id))));


--
-- Name: budget_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

--
-- Name: destination_tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.destination_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: destinations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

--
-- Name: expenses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

--
-- Name: expenses expenses_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY expenses_delete_policy ON public.expenses FOR DELETE USING (((paid_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = expenses.trip_id) AND (trips.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = expenses.trip_id) AND (trip_members.user_id = auth.uid()) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role])))))));


--
-- Name: expenses expenses_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY expenses_insert_policy ON public.expenses FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = expenses.trip_id) AND (trips.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = expenses.trip_id) AND (trip_members.user_id = auth.uid()) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role, 'contributor'::public.trip_role])))))));


--
-- Name: expenses expenses_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY expenses_select_policy ON public.expenses FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = expenses.trip_id) AND (trips.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = expenses.trip_id) AND (trip_members.user_id = auth.uid()))))));


--
-- Name: expenses expenses_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY expenses_update_policy ON public.expenses FOR UPDATE USING (((paid_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = expenses.trip_id) AND (trips.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = expenses.trip_id) AND (trip_members.user_id = auth.uid()) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role])))))));


--
-- Name: image_metadata; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;

--
-- Name: image_metadata image_metadata_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY image_metadata_insert_policy ON public.image_metadata FOR INSERT WITH CHECK (((auth.role() = 'authenticated'::text) AND (((entity_type = 'user_avatar'::public.image_type) AND (entity_id = auth.uid())) OR ((entity_type = 'trip_cover'::public.image_type) AND (EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = image_metadata.entity_id) AND (trips.created_by = auth.uid()))))) OR ((entity_type = 'template_cover'::public.image_type) AND (EXISTS ( SELECT 1
   FROM public.itinerary_templates
  WHERE ((itinerary_templates.id = image_metadata.entity_id) AND (itinerary_templates.created_by = auth.uid()))))))));


--
-- Name: image_metadata image_metadata_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY image_metadata_select_policy ON public.image_metadata FOR SELECT USING (true);


--
-- Name: image_metadata image_metadata_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY image_metadata_update_policy ON public.image_metadata FOR UPDATE USING (((auth.role() = 'authenticated'::text) AND ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))) OR (((entity_type = 'user_avatar'::public.image_type) AND (entity_id = auth.uid())) OR ((entity_type = 'trip_cover'::public.image_type) AND (EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = image_metadata.entity_id) AND (trips.created_by = auth.uid()))))) OR ((entity_type = 'template_cover'::public.image_type) AND (EXISTS ( SELECT 1
   FROM public.itinerary_templates
  WHERE ((itinerary_templates.id = image_metadata.entity_id) AND (itinerary_templates.created_by = auth.uid())))))))));


--
-- Name: invitations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: itinerary_item_votes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.itinerary_item_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: itinerary_item_votes itinerary_item_votes_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY itinerary_item_votes_delete_policy ON public.itinerary_item_votes FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: itinerary_item_votes itinerary_item_votes_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY itinerary_item_votes_insert_policy ON public.itinerary_item_votes FOR INSERT WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM (public.itinerary_items
     JOIN public.trip_members ON ((itinerary_items.trip_id = trip_members.trip_id)))
  WHERE ((itinerary_items.id = itinerary_item_votes.itinerary_item_id) AND (trip_members.user_id = auth.uid()))))));


--
-- Name: itinerary_item_votes itinerary_item_votes_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY itinerary_item_votes_select_policy ON public.itinerary_item_votes FOR SELECT USING (((EXISTS ( SELECT 1
   FROM (public.itinerary_items
     JOIN public.trips ON ((itinerary_items.trip_id = trips.id)))
  WHERE ((itinerary_items.id = itinerary_item_votes.itinerary_item_id) AND (trips.is_public = true)))) OR (EXISTS ( SELECT 1
   FROM (public.itinerary_items
     JOIN public.trip_members ON ((itinerary_items.trip_id = trip_members.trip_id)))
  WHERE ((itinerary_items.id = itinerary_item_votes.itinerary_item_id) AND (trip_members.user_id = auth.uid()))))));


--
-- Name: itinerary_item_votes itinerary_item_votes_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY itinerary_item_votes_update_policy ON public.itinerary_item_votes FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: itinerary_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;

--
-- Name: itinerary_sections; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.itinerary_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: itinerary_sections itinerary_sections_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY itinerary_sections_delete_policy ON public.itinerary_sections FOR DELETE USING (((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = itinerary_sections.trip_id) AND (trips.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = itinerary_sections.trip_id) AND (trip_members.user_id = auth.uid()) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role])))))));


--
-- Name: itinerary_sections itinerary_sections_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY itinerary_sections_insert_policy ON public.itinerary_sections FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = itinerary_sections.trip_id) AND (trips.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = itinerary_sections.trip_id) AND (trip_members.user_id = auth.uid()) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role, 'contributor'::public.trip_role])))))));


--
-- Name: itinerary_sections itinerary_sections_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY itinerary_sections_select_policy ON public.itinerary_sections FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = itinerary_sections.trip_id) AND (trips.is_public = true)))) OR (EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = itinerary_sections.trip_id) AND (trips.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = itinerary_sections.trip_id) AND (trip_members.user_id = auth.uid()))))));


--
-- Name: itinerary_sections itinerary_sections_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY itinerary_sections_update_policy ON public.itinerary_sections FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = itinerary_sections.trip_id) AND (trips.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = itinerary_sections.trip_id) AND (trip_members.user_id = auth.uid()) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role])))))));


--
-- Name: itinerary_template_sections; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.itinerary_template_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: itinerary_templates; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.itinerary_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: likes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

--
-- Name: note_tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: permission_requests; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: places; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

--
-- Name: tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

--
-- Name: template_activities; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.template_activities ENABLE ROW LEVEL SECURITY;

--
-- Name: template_sections; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.template_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: trip_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.trip_history ENABLE ROW LEVEL SECURITY;

--
-- Name: trip_images; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.trip_images ENABLE ROW LEVEL SECURITY;

--
-- Name: trip_images trip_images_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY trip_images_delete_policy ON public.trip_images FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = trip_images.trip_id) AND (trip_members.user_id = auth.uid()) AND ((trip_members.role = 'admin'::public.trip_role) OR (trip_members.role = 'editor'::public.trip_role))))));


--
-- Name: trip_images trip_images_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY trip_images_insert_policy ON public.trip_images FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = trip_images.trip_id) AND (trip_members.user_id = auth.uid()) AND (trip_members.role <> 'viewer'::public.trip_role)))));


--
-- Name: trip_images trip_images_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY trip_images_select_policy ON public.trip_images FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = trip_images.trip_id) AND (trip_members.user_id = auth.uid())))));


--
-- Name: trip_members; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

--
-- Name: trip_notes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.trip_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: trip_notes trip_notes_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY trip_notes_delete_policy ON public.trip_notes FOR DELETE USING (((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = trip_notes.trip_id) AND (trips.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = trip_notes.trip_id) AND (trip_members.user_id = auth.uid()) AND (trip_members.role = 'admin'::public.trip_role))))));


--
-- Name: trip_notes trip_notes_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY trip_notes_insert_policy ON public.trip_notes FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = trip_notes.trip_id) AND (trips.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = trip_notes.trip_id) AND (trip_members.user_id = auth.uid()) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role, 'contributor'::public.trip_role])))))));


--
-- Name: trip_notes trip_notes_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY trip_notes_select_policy ON public.trip_notes FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = trip_notes.trip_id) AND (trips.is_public = true)))) OR (EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = trip_notes.trip_id) AND (trips.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = trip_notes.trip_id) AND (trip_members.user_id = auth.uid()))))));


--
-- Name: trip_notes trip_notes_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY trip_notes_update_policy ON public.trip_notes FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM public.trips
  WHERE ((trips.id = trip_notes.trip_id) AND (trips.created_by = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.trip_members
  WHERE ((trip_members.trip_id = trip_notes.trip_id) AND (trip_members.user_id = auth.uid()) AND (trip_members.role = ANY (ARRAY['admin'::public.trip_role, 'editor'::public.trip_role, 'contributor'::public.trip_role])))))));


--
-- Name: trip_tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.trip_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: trip_template_uses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.trip_template_uses ENABLE ROW LEVEL SECURITY;

--
-- Name: trips; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

--
-- Name: user_interactions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_interests; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

--
-- Name: user_suggested_tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_suggested_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: user_travel; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_travel ENABLE ROW LEVEL SECURITY;

--
-- Name: votes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- Name: supabase_realtime expenses; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.expenses;


--
-- Name: supabase_realtime invitations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.invitations;


--
-- Name: supabase_realtime itinerary_items; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.itinerary_items;


--
-- Name: supabase_realtime trip_members; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.trip_members;


--
-- Name: supabase_realtime trip_notes; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.trip_notes;


--
-- Name: supabase_realtime trips; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.trips;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION algorithm_sign(signables text, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION sign(payload json, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.sign(payload json, secret text, algorithm text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.sign(payload json, secret text, algorithm text) TO dashboard_user;


--
-- Name: FUNCTION try_cast_double(inp text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO dashboard_user;


--
-- Name: FUNCTION url_decode(data text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.url_decode(data text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.url_decode(data text) TO dashboard_user;


--
-- Name: FUNCTION url_encode(data bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION verify(token text, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO dashboard_user;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION crypto_aead_det_decrypt(message bytea, additional bytea, key_uuid uuid, nonce bytea); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

GRANT ALL ON FUNCTION pgsodium.crypto_aead_det_decrypt(message bytea, additional bytea, key_uuid uuid, nonce bytea) TO service_role;


--
-- Name: FUNCTION crypto_aead_det_encrypt(message bytea, additional bytea, key_uuid uuid, nonce bytea); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

GRANT ALL ON FUNCTION pgsodium.crypto_aead_det_encrypt(message bytea, additional bytea, key_uuid uuid, nonce bytea) TO service_role;


--
-- Name: FUNCTION crypto_aead_det_keygen(); Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pgsodium.crypto_aead_det_keygen() TO service_role;


--
-- Name: FUNCTION approve_user_suggested_tag(p_suggestion_id uuid, p_admin_id uuid, p_admin_notes text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.approve_user_suggested_tag(p_suggestion_id uuid, p_admin_id uuid, p_admin_notes text) TO anon;
GRANT ALL ON FUNCTION public.approve_user_suggested_tag(p_suggestion_id uuid, p_admin_id uuid, p_admin_notes text) TO authenticated;
GRANT ALL ON FUNCTION public.approve_user_suggested_tag(p_suggestion_id uuid, p_admin_id uuid, p_admin_notes text) TO service_role;


--
-- Name: FUNCTION approve_user_tag(tag_id uuid, admin_id uuid, notes text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.approve_user_tag(tag_id uuid, admin_id uuid, notes text) TO anon;
GRANT ALL ON FUNCTION public.approve_user_tag(tag_id uuid, admin_id uuid, notes text) TO authenticated;
GRANT ALL ON FUNCTION public.approve_user_tag(tag_id uuid, admin_id uuid, notes text) TO service_role;


--
-- Name: FUNCTION calculate_trip_duration(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_trip_duration() TO anon;
GRANT ALL ON FUNCTION public.calculate_trip_duration() TO authenticated;
GRANT ALL ON FUNCTION public.calculate_trip_duration() TO service_role;


--
-- Name: FUNCTION can_manage_trip_members(p_trip_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.can_manage_trip_members(p_trip_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_manage_trip_members(p_trip_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_manage_trip_members(p_trip_id uuid) TO service_role;


--
-- Name: FUNCTION copy_template_to_trip(p_template_id uuid, p_trip_id uuid, p_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.copy_template_to_trip(p_template_id uuid, p_trip_id uuid, p_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.copy_template_to_trip(p_template_id uuid, p_trip_id uuid, p_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.copy_template_to_trip(p_template_id uuid, p_trip_id uuid, p_user_id uuid) TO service_role;


--
-- Name: FUNCTION create_trip_with_owner(trip_data jsonb, p_owner_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_trip_with_owner(trip_data jsonb, p_owner_id uuid) TO anon;
GRANT ALL ON FUNCTION public.create_trip_with_owner(trip_data jsonb, p_owner_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.create_trip_with_owner(trip_data jsonb, p_owner_id uuid) TO service_role;


--
-- Name: FUNCTION create_trip_with_owner(p_name text, p_description text, p_user_id uuid, p_start_date date, p_end_date date, p_destination_id uuid, p_destination_name text, p_cover_image_url text, p_trip_type public.trip_type, p_privacy_setting public.privacy_setting); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_trip_with_owner(p_name text, p_description text, p_user_id uuid, p_start_date date, p_end_date date, p_destination_id uuid, p_destination_name text, p_cover_image_url text, p_trip_type public.trip_type, p_privacy_setting public.privacy_setting) TO anon;
GRANT ALL ON FUNCTION public.create_trip_with_owner(p_name text, p_description text, p_user_id uuid, p_start_date date, p_end_date date, p_destination_id uuid, p_destination_name text, p_cover_image_url text, p_trip_type public.trip_type, p_privacy_setting public.privacy_setting) TO authenticated;
GRANT ALL ON FUNCTION public.create_trip_with_owner(p_name text, p_description text, p_user_id uuid, p_start_date date, p_end_date date, p_destination_id uuid, p_destination_name text, p_cover_image_url text, p_trip_type public.trip_type, p_privacy_setting public.privacy_setting) TO service_role;


--
-- Name: FUNCTION create_trip_with_owner(trip_name text, user_id uuid, description_param text, tags_param text[], destination_id uuid, destination_name_param text, start_date date, end_date date, is_public boolean, cover_image_url text, latitude numeric, longitude numeric); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_trip_with_owner(trip_name text, user_id uuid, description_param text, tags_param text[], destination_id uuid, destination_name_param text, start_date date, end_date date, is_public boolean, cover_image_url text, latitude numeric, longitude numeric) TO anon;
GRANT ALL ON FUNCTION public.create_trip_with_owner(trip_name text, user_id uuid, description_param text, tags_param text[], destination_id uuid, destination_name_param text, start_date date, end_date date, is_public boolean, cover_image_url text, latitude numeric, longitude numeric) TO authenticated;
GRANT ALL ON FUNCTION public.create_trip_with_owner(trip_name text, user_id uuid, description_param text, tags_param text[], destination_id uuid, destination_name_param text, start_date date, end_date date, is_public boolean, cover_image_url text, latitude numeric, longitude numeric) TO service_role;


--
-- Name: FUNCTION decrement_travelers_count(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrement_travelers_count() TO anon;
GRANT ALL ON FUNCTION public.decrement_travelers_count() TO authenticated;
GRANT ALL ON FUNCTION public.decrement_travelers_count() TO service_role;


--
-- Name: FUNCTION generate_public_slug(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generate_public_slug() TO anon;
GRANT ALL ON FUNCTION public.generate_public_slug() TO authenticated;
GRANT ALL ON FUNCTION public.generate_public_slug() TO service_role;


--
-- Name: FUNCTION generate_random_slug(length integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generate_random_slug(length integer) TO anon;
GRANT ALL ON FUNCTION public.generate_random_slug(length integer) TO authenticated;
GRANT ALL ON FUNCTION public.generate_random_slug(length integer) TO service_role;


--
-- Name: FUNCTION generate_trip_slug(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generate_trip_slug() TO anon;
GRANT ALL ON FUNCTION public.generate_trip_slug() TO authenticated;
GRANT ALL ON FUNCTION public.generate_trip_slug() TO service_role;


--
-- Name: FUNCTION get_destination_recommendations(p_user_id uuid, p_limit integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_destination_recommendations(p_user_id uuid, p_limit integer) TO anon;
GRANT ALL ON FUNCTION public.get_destination_recommendations(p_user_id uuid, p_limit integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_destination_recommendations(p_user_id uuid, p_limit integer) TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION handle_splitwise_connections_update(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_splitwise_connections_update() TO anon;
GRANT ALL ON FUNCTION public.handle_splitwise_connections_update() TO authenticated;
GRANT ALL ON FUNCTION public.handle_splitwise_connections_update() TO service_role;


--
-- Name: FUNCTION has_trip_role(p_trip_id uuid, p_user_id uuid, p_role public.trip_role); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.has_trip_role(p_trip_id uuid, p_user_id uuid, p_role public.trip_role) TO anon;
GRANT ALL ON FUNCTION public.has_trip_role(p_trip_id uuid, p_user_id uuid, p_role public.trip_role) TO authenticated;
GRANT ALL ON FUNCTION public.has_trip_role(p_trip_id uuid, p_user_id uuid, p_role public.trip_role) TO service_role;


--
-- Name: FUNCTION increment_counter(row_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.increment_counter(row_id uuid) TO anon;
GRANT ALL ON FUNCTION public.increment_counter(row_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.increment_counter(row_id uuid) TO service_role;


--
-- Name: FUNCTION increment_travelers_count(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.increment_travelers_count() TO anon;
GRANT ALL ON FUNCTION public.increment_travelers_count() TO authenticated;
GRANT ALL ON FUNCTION public.increment_travelers_count() TO service_role;


--
-- Name: FUNCTION insert_tag_if_not_exists(p_name text, p_slug text, p_category text, p_emoji text, p_description text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.insert_tag_if_not_exists(p_name text, p_slug text, p_category text, p_emoji text, p_description text) TO anon;
GRANT ALL ON FUNCTION public.insert_tag_if_not_exists(p_name text, p_slug text, p_category text, p_emoji text, p_description text) TO authenticated;
GRANT ALL ON FUNCTION public.insert_tag_if_not_exists(p_name text, p_slug text, p_category text, p_emoji text, p_description text) TO service_role;


--
-- Name: FUNCTION is_trip_member(p_trip_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_trip_member(p_trip_id uuid) TO anon;
GRANT ALL ON FUNCTION public.is_trip_member(p_trip_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_trip_member(p_trip_id uuid) TO service_role;


--
-- Name: FUNCTION is_trip_member(p_trip_id uuid, p_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_trip_member(p_trip_id uuid, p_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.is_trip_member(p_trip_id uuid, p_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_trip_member(p_trip_id uuid, p_user_id uuid) TO service_role;


--
-- Name: FUNCTION is_trip_member_with_role(_trip_id uuid, _user_id uuid, _roles text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_trip_member_with_role(_trip_id uuid, _user_id uuid, _roles text[]) TO anon;
GRANT ALL ON FUNCTION public.is_trip_member_with_role(_trip_id uuid, _user_id uuid, _roles text[]) TO authenticated;
GRANT ALL ON FUNCTION public.is_trip_member_with_role(_trip_id uuid, _user_id uuid, _roles text[]) TO service_role;


--
-- Name: FUNCTION moddatetime(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.moddatetime() TO anon;
GRANT ALL ON FUNCTION public.moddatetime() TO authenticated;
GRANT ALL ON FUNCTION public.moddatetime() TO service_role;


--
-- Name: FUNCTION recommend_by_geography(location_id uuid, limit_count integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.recommend_by_geography(location_id uuid, limit_count integer) TO anon;
GRANT ALL ON FUNCTION public.recommend_by_geography(location_id uuid, limit_count integer) TO authenticated;
GRANT ALL ON FUNCTION public.recommend_by_geography(location_id uuid, limit_count integer) TO service_role;


--
-- Name: FUNCTION recommend_popular_destinations(limit_count integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.recommend_popular_destinations(limit_count integer) TO anon;
GRANT ALL ON FUNCTION public.recommend_popular_destinations(limit_count integer) TO authenticated;
GRANT ALL ON FUNCTION public.recommend_popular_destinations(limit_count integer) TO service_role;


--
-- Name: FUNCTION sync_user_to_profile(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.sync_user_to_profile() TO anon;
GRANT ALL ON FUNCTION public.sync_user_to_profile() TO authenticated;
GRANT ALL ON FUNCTION public.sync_user_to_profile() TO service_role;


--
-- Name: FUNCTION trigger_set_timestamp(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_set_timestamp() TO anon;
GRANT ALL ON FUNCTION public.trigger_set_timestamp() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_set_timestamp() TO service_role;


--
-- Name: FUNCTION update_itinerary_item_position(p_item_id uuid, p_trip_id uuid, p_day_number integer, p_position integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_itinerary_item_position(p_item_id uuid, p_trip_id uuid, p_day_number integer, p_position integer) TO anon;
GRANT ALL ON FUNCTION public.update_itinerary_item_position(p_item_id uuid, p_trip_id uuid, p_day_number integer, p_position integer) TO authenticated;
GRANT ALL ON FUNCTION public.update_itinerary_item_position(p_item_id uuid, p_trip_id uuid, p_day_number integer, p_position integer) TO service_role;


--
-- Name: FUNCTION update_likes_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_likes_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_likes_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_likes_updated_at() TO service_role;


--
-- Name: FUNCTION update_profile_from_interaction(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_profile_from_interaction() TO anon;
GRANT ALL ON FUNCTION public.update_profile_from_interaction() TO authenticated;
GRANT ALL ON FUNCTION public.update_profile_from_interaction() TO service_role;


--
-- Name: FUNCTION update_profile_onboarding(p_user_id uuid, p_first_name text, p_travel_personality public.travel_personality_type, p_travel_squad public.travel_squad_type, p_onboarding_step integer, p_complete_onboarding boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_profile_onboarding(p_user_id uuid, p_first_name text, p_travel_personality public.travel_personality_type, p_travel_squad public.travel_squad_type, p_onboarding_step integer, p_complete_onboarding boolean) TO anon;
GRANT ALL ON FUNCTION public.update_profile_onboarding(p_user_id uuid, p_first_name text, p_travel_personality public.travel_personality_type, p_travel_squad public.travel_squad_type, p_onboarding_step integer, p_complete_onboarding boolean) TO authenticated;
GRANT ALL ON FUNCTION public.update_profile_onboarding(p_user_id uuid, p_first_name text, p_travel_personality public.travel_personality_type, p_travel_squad public.travel_squad_type, p_onboarding_step integer, p_complete_onboarding boolean) TO service_role;


--
-- Name: FUNCTION update_timestamp(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_timestamp() TO anon;
GRANT ALL ON FUNCTION public.update_timestamp() TO authenticated;
GRANT ALL ON FUNCTION public.update_timestamp() TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: FUNCTION validate_image_metadata_entity(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.validate_image_metadata_entity() TO anon;
GRANT ALL ON FUNCTION public.validate_image_metadata_entity() TO authenticated;
GRANT ALL ON FUNCTION public.validate_image_metadata_entity() TO service_role;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE decrypted_key; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE pgsodium.decrypted_key TO pgsodium_keyholder;


--
-- Name: TABLE masking_rule; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE pgsodium.masking_rule TO pgsodium_keyholder;


--
-- Name: TABLE mask_columns; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE pgsodium.mask_columns TO pgsodium_keyholder;


--
-- Name: TABLE albums; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.albums TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.albums TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.albums TO service_role;


--
-- Name: SEQUENCE albums_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.albums_id_seq TO anon;
GRANT ALL ON SEQUENCE public.albums_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.albums_id_seq TO service_role;


--
-- Name: TABLE budget_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.budget_items TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.budget_items TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.budget_items TO service_role;


--
-- Name: TABLE collaborative_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.collaborative_sessions TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.collaborative_sessions TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.collaborative_sessions TO service_role;


--
-- Name: TABLE destination_tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.destination_tags TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.destination_tags TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.destination_tags TO service_role;


--
-- Name: TABLE destinations; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.destinations TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.destinations TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.destinations TO service_role;


--
-- Name: TABLE expenses; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.expenses TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.expenses TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.expenses TO service_role;


--
-- Name: TABLE image_metadata; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.image_metadata TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.image_metadata TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.image_metadata TO service_role;


--
-- Name: TABLE invitations; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.invitations TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.invitations TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.invitations TO service_role;


--
-- Name: SEQUENCE invitations_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.invitations_id_seq TO anon;
GRANT ALL ON SEQUENCE public.invitations_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.invitations_id_seq TO service_role;


--
-- Name: TABLE itinerary_item_votes; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_item_votes TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_item_votes TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_item_votes TO service_role;


--
-- Name: TABLE itinerary_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_items TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_items TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_items TO service_role;


--
-- Name: TABLE itinerary_sections; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_sections TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_sections TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_sections TO service_role;


--
-- Name: TABLE itinerary_template_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_template_items TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_template_items TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_template_items TO service_role;


--
-- Name: TABLE itinerary_template_sections; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_template_sections TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_template_sections TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_template_sections TO service_role;


--
-- Name: SEQUENCE itinerary_template_sections_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.itinerary_template_sections_id_seq TO anon;
GRANT ALL ON SEQUENCE public.itinerary_template_sections_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.itinerary_template_sections_id_seq TO service_role;


--
-- Name: TABLE itinerary_templates; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_templates TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_templates TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.itinerary_templates TO service_role;


--
-- Name: TABLE likes; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.likes TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.likes TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.likes TO service_role;


--
-- Name: TABLE locations; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.locations TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.locations TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.locations TO service_role;


--
-- Name: TABLE note_tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.note_tags TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.note_tags TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.note_tags TO service_role;


--
-- Name: TABLE permission_requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.permission_requests TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.permission_requests TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.permission_requests TO service_role;


--
-- Name: TABLE places; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.places TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.places TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.places TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.profiles TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.profiles TO service_role;


--
-- Name: TABLE referrals; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.referrals TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.referrals TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.referrals TO service_role;


--
-- Name: TABLE tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.tags TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.tags TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.tags TO service_role;


--
-- Name: TABLE template_activities; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.template_activities TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.template_activities TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.template_activities TO service_role;


--
-- Name: TABLE template_sections; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.template_sections TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.template_sections TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.template_sections TO service_role;


--
-- Name: TABLE trip_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_history TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_history TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_history TO service_role;


--
-- Name: SEQUENCE trip_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.trip_history_id_seq TO anon;
GRANT ALL ON SEQUENCE public.trip_history_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.trip_history_id_seq TO service_role;


--
-- Name: TABLE trip_images; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_images TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_images TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_images TO service_role;


--
-- Name: TABLE trip_members; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_members TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_members TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_members TO service_role;


--
-- Name: COLUMN trip_members.trip_id; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(trip_id) ON TABLE public.trip_members TO authenticated;


--
-- Name: COLUMN trip_members.user_id; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(user_id) ON TABLE public.trip_members TO authenticated;


--
-- Name: COLUMN trip_members.role; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(role),UPDATE(role) ON TABLE public.trip_members TO authenticated;


--
-- Name: TABLE trip_notes; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_notes TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_notes TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_notes TO service_role;


--
-- Name: TABLE trip_tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_tags TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_tags TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_tags TO service_role;


--
-- Name: TABLE trip_template_uses; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_template_uses TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_template_uses TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trip_template_uses TO service_role;


--
-- Name: TABLE trips; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trips TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trips TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.trips TO service_role;


--
-- Name: TABLE user_interactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_interactions TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_interactions TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_interactions TO service_role;


--
-- Name: TABLE user_interests; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_interests TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_interests TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_interests TO service_role;


--
-- Name: TABLE user_presence; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_presence TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_presence TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_presence TO service_role;


--
-- Name: TABLE user_suggested_tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_suggested_tags TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_suggested_tags TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_suggested_tags TO service_role;


--
-- Name: TABLE user_travel; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_travel TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_travel TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_travel TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.users TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.users TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.users TO service_role;


--
-- Name: COLUMN users.avatar_url; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(avatar_url) ON TABLE public.users TO authenticated;


--
-- Name: COLUMN users.username; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(username) ON TABLE public.users TO authenticated;


--
-- Name: COLUMN users.full_name; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(full_name) ON TABLE public.users TO authenticated;


--
-- Name: TABLE votes; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.votes TO anon;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.votes TO authenticated;
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.votes TO service_role;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,DELETE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO postgres;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

