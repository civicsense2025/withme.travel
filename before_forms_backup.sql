

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."budget_category" AS ENUM (
    'accommodation',
    'transportation',
    'food',
    'activities',
    'shopping',
    'other'
);


ALTER TYPE "public"."budget_category" OWNER TO "postgres";


CREATE TYPE "public"."content_type" AS ENUM (
    'trip',
    'itinerary_item',
    'destination',
    'collection',
    'template'
);


ALTER TYPE "public"."content_type" OWNER TO "postgres";


CREATE TYPE "public"."image_type" AS ENUM (
    'destination',
    'trip_cover',
    'user_avatar',
    'template_cover'
);


ALTER TYPE "public"."image_type" OWNER TO "postgres";


CREATE TYPE "public"."interaction_type" AS ENUM (
    'like',
    'visit',
    'bookmark',
    'tag'
);


ALTER TYPE "public"."interaction_type" OWNER TO "postgres";


CREATE TYPE "public"."invitation_status" AS ENUM (
    'pending',
    'accepted',
    'declined',
    'expired'
);


ALTER TYPE "public"."invitation_status" OWNER TO "postgres";


CREATE TYPE "public"."item_status" AS ENUM (
    'suggested',
    'confirmed',
    'rejected'
);


ALTER TYPE "public"."item_status" OWNER TO "postgres";


CREATE TYPE "public"."itinerary_category" AS ENUM (
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
    'Other'
);


ALTER TYPE "public"."itinerary_category" OWNER TO "postgres";


CREATE TYPE "public"."itinerary_item_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE "public"."itinerary_item_status" OWNER TO "postgres";


CREATE TYPE "public"."place_category" AS ENUM (
    'attraction',
    'restaurant',
    'cafe',
    'hotel',
    'landmark',
    'shopping',
    'transport',
    'other'
);


ALTER TYPE "public"."place_category" OWNER TO "postgres";


CREATE TYPE "public"."privacy_setting" AS ENUM (
    'private',
    'shared_with_link',
    'public'
);


ALTER TYPE "public"."privacy_setting" OWNER TO "postgres";


CREATE TYPE "public"."tag_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE "public"."tag_status" OWNER TO "postgres";


CREATE TYPE "public"."travel_pace" AS ENUM (
    'very_slow',
    'slow',
    'moderate',
    'fast',
    'very_fast'
);


ALTER TYPE "public"."travel_pace" OWNER TO "postgres";


CREATE TYPE "public"."travel_personality_type" AS ENUM (
    'planner',
    'adventurer',
    'foodie',
    'sightseer',
    'relaxer',
    'culture'
);


ALTER TYPE "public"."travel_personality_type" OWNER TO "postgres";


CREATE TYPE "public"."travel_squad_type" AS ENUM (
    'friends',
    'family',
    'partner',
    'solo',
    'coworkers',
    'mixed'
);


ALTER TYPE "public"."travel_squad_type" OWNER TO "postgres";


CREATE TYPE "public"."travel_style" AS ENUM (
    'adventurous',
    'relaxed',
    'cultural',
    'luxury',
    'budget',
    'family',
    'solo',
    'nightlife',
    'nature',
    'food_focused'
);


ALTER TYPE "public"."travel_style" OWNER TO "postgres";


CREATE TYPE "public"."trip_action_type" AS ENUM (
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
    'FOCUS_INITIATED'
);


ALTER TYPE "public"."trip_action_type" OWNER TO "postgres";


CREATE TYPE "public"."trip_privacy_setting" AS ENUM (
    'private',
    'shared_with_link',
    'public'
);


ALTER TYPE "public"."trip_privacy_setting" OWNER TO "postgres";


CREATE TYPE "public"."trip_role" AS ENUM (
    'admin',
    'editor',
    'viewer',
    'contributor'
);


ALTER TYPE "public"."trip_role" OWNER TO "postgres";


COMMENT ON TYPE "public"."trip_role" IS 'role in a trip group';



CREATE TYPE "public"."trip_status" AS ENUM (
    'planning',
    'upcoming',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."trip_status" OWNER TO "postgres";


CREATE TYPE "public"."trip_type" AS ENUM (
    'leisure',
    'business',
    'family',
    'solo',
    'group',
    'other'
);


ALTER TYPE "public"."trip_type" OWNER TO "postgres";


CREATE TYPE "public"."url_format" AS ENUM (
    'canonical',
    'short',
    'social',
    'tracking'
);


ALTER TYPE "public"."url_format" OWNER TO "postgres";


CREATE TYPE "public"."vote_type" AS ENUM (
    'up',
    'down'
);


ALTER TYPE "public"."vote_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_trip_history_entry"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    action_type_val trip_action_type;
    details_json jsonb;
BEGIN
    -- Determine action type based on table and operation
    CASE TG_TABLE_NAME
        WHEN 'itinerary_items' THEN
            CASE TG_OP
                WHEN 'INSERT' THEN action_type_val := 'ITINERARY_ITEM_ADDED';
                WHEN 'UPDATE' THEN action_type_val := 'ITINERARY_ITEM_UPDATED';
                WHEN 'DELETE' THEN action_type_val := 'ITINERARY_ITEM_DELETED';
            END CASE;
        WHEN 'trip_members' THEN
            CASE TG_OP
                WHEN 'INSERT' THEN action_type_val := 'MEMBER_ADDED';
                WHEN 'UPDATE' THEN action_type_val := 'MEMBER_ROLE_UPDATED';
                WHEN 'DELETE' THEN action_type_val := 'MEMBER_REMOVED';
            END CASE;
        WHEN 'trip_item_comments' THEN
            CASE TG_OP
                WHEN 'INSERT' THEN action_type_val := 'COMMENT_ADDED';
                WHEN 'UPDATE' THEN action_type_val := 'COMMENT_UPDATED';
                WHEN 'DELETE' THEN action_type_val := 'COMMENT_DELETED';
            END CASE;
        WHEN 'trip_votes' THEN
            CASE TG_OP
                WHEN 'INSERT' THEN action_type_val := 'VOTE_CAST';
            END CASE;
        WHEN 'focus_sessions' THEN
            CASE TG_OP
                WHEN 'INSERT' THEN action_type_val := 'FOCUS_INITIATED';
            END CASE;
    END CASE;
    
    -- Create JSON details
    IF TG_OP = 'DELETE' THEN
        details_json := row_to_json(OLD)::jsonb;
    ELSE
        details_json := row_to_json(NEW)::jsonb;
    END IF;
    
    -- Remove large fields to keep history entries small
    details_json := details_json - 'content' - 'description';
    
    -- Insert into trip_history
    IF TG_TABLE_NAME = 'itinerary_items' OR TG_TABLE_NAME = 'trip_item_comments' THEN
        IF TG_OP = 'DELETE' THEN
            INSERT INTO trip_history (trip_id, user_id, action_type, details)
            VALUES (OLD.trip_id, auth.uid(), action_type_val, details_json);
        ELSE
            INSERT INTO trip_history (trip_id, user_id, action_type, details)
            VALUES (NEW.trip_id, auth.uid(), action_type_val, details_json);
        END IF;
    ELSIF TG_TABLE_NAME = 'trip_members' THEN
        IF TG_OP = 'DELETE' THEN
            INSERT INTO trip_history (trip_id, user_id, action_type, details)
            VALUES (OLD.trip_id, auth.uid(), action_type_val, details_json);
        ELSE
            INSERT INTO trip_history (trip_id, user_id, action_type, details)
            VALUES (NEW.trip_id, auth.uid(), action_type_val, details_json);
        END IF;
    ELSIF TG_TABLE_NAME = 'trip_votes' THEN
        -- Need to join to get trip_id
        IF TG_OP = 'INSERT' THEN
            INSERT INTO trip_history (trip_id, user_id, action_type, details)
            SELECT p.trip_id, auth.uid(), action_type_val, details_json
            FROM trip_vote_options o
            JOIN trip_vote_polls p ON o.poll_id = p.id
            WHERE o.id = NEW.option_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'focus_sessions' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO trip_history (trip_id, user_id, action_type, details)
            VALUES (NEW.trip_id, NEW.initiated_by, action_type_val, details_json);
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."add_trip_history_entry"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."apply_template_to_trip"("p_template_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid", "p_options" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_template_version INTEGER;
    v_trip_start_date DATE;
    v_template_duration INTEGER;
    v_trip_destination_id UUID;
    v_template_destination_id UUID;
    v_fallbacks_used INTEGER := 0;
    v_success_count INTEGER := 0;
    v_total_activities INTEGER := 0;
    v_optimization_level TEXT;
    v_application_id UUID;
    v_validation_result RECORD;
    v_result JSONB;
    v_time_zone TEXT;
    v_item RECORD;
    v_location_data JSONB;
    v_day_adjustment INTEGER;
    v_section_day INTEGER;
    v_time_adjustment INTERVAL;
BEGIN
    -- Get template version
    SELECT version INTO v_template_version
    FROM itinerary_templates
    WHERE id = p_template_id;

    -- Get trip details
    SELECT 
        start_date,
        destination_id,
        COALESCE(timezone, 'UTC')
    INTO 
        v_trip_start_date,
        v_trip_destination_id,
        v_time_zone
    FROM trips
    WHERE id = p_trip_id;
    
    -- Get template details
    SELECT 
        duration_days,
        destination_id
    INTO 
        v_template_duration,
        v_template_destination_id
    FROM itinerary_templates
    WHERE id = p_template_id;
    
    -- Determine optimization level from options or default to balanced
    v_optimization_level := COALESCE(p_options->>'optimization_level', 'balanced');
    
    -- Validate the trip before applying template
    SELECT * FROM validate_itinerary(p_trip_id, p_template_id) INTO v_validation_result;
    
    -- If validation fails and strict mode is enabled, return error
    IF NOT v_validation_result.is_valid AND (p_options->>'strict_validation')::boolean IS TRUE THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Validation failed',
            'errors', to_jsonb(v_validation_result.validation_errors)
        );
    END IF;
    
    -- Create application record
    INSERT INTO template_applications (
        trip_id,
        template_id,
        applied_by,
        version_used,
        optimization_level,
        application_metadata
    ) VALUES (
        p_trip_id,
        p_template_id,
        p_user_id,
        v_template_version,
        v_optimization_level,
        jsonb_build_object(
            'options', p_options,
            'validation_result', to_jsonb(v_validation_result)
        )
    )
    RETURNING id INTO v_application_id;
    
    -- Begin processing template sections and activities
    FOR v_section_day, v_day_adjustment IN (
        -- Get day adjustments based on trip start date and template
        WITH template_days AS (
            SELECT DISTINCT day 
            FROM itinerary_template_items 
            WHERE template_id = p_template_id
            ORDER BY day
        ),
        day_mapping AS (
            SELECT 
                td.day as template_day,
                CASE
                    -- Option 1: Start from specific day in trip
                    WHEN (p_options->>'start_day')::INTEGER IS NOT NULL THEN
                        (p_options->>'start_day')::INTEGER + (td.day - 1)
                    -- Option 2: Use smart mapping based on trip duration
                    WHEN (p_options->>'smart_distribution')::boolean IS TRUE AND
                         v_template_duration > 0 THEN
                        CEIL((td.day::FLOAT / v_template_duration) * 
                             (SELECT COALESCE(duration_days, 
                                             (end_date - start_date)::INTEGER + 1)
                              FROM trips WHERE id = p_trip_id))::INTEGER
                    -- Default: Direct day mapping
                    ELSE td.day
                END as trip_day
            FROM template_days td
        )
        SELECT template_day, trip_day from day_mapping
    ) LOOP
        -- Process each template activity for the current day
        FOR v_item IN (
            SELECT 
                ti.id,
                ti.title,
                ti.description,
                ti.start_time,
                ti.end_time,
                ti.location,
                ti.place_id,
                ti.category,
                ti.item_order as position,
                ti.duration_minutes,
                ti.address,
                ti.latitude,
                ti.longitude
            FROM itinerary_template_items ti
            WHERE ti.template_id = p_template_id
            AND ti.day = v_section_day
            ORDER BY ti.item_order
        ) LOOP
            v_total_activities := v_total_activities + 1;
            
            -- Time adjustment logic based on optimization level
            CASE v_optimization_level
                WHEN 'time_optimal' THEN
                    -- Distribute activities evenly throughout the day
                    SELECT 
                        CASE 
                            WHEN v_item.start_time IS NOT NULL THEN
                                -- For activities with start times, adjust based on surrounding activities
                                interval '0 hours' -- Simplified for this implementation
                            ELSE 
                                -- For activities without times, assign based on position
                                (v_item.position * interval '2 hours') + interval '9 hours'
                        END
                    INTO v_time_adjustment;
                
                WHEN 'location_optimal' THEN
                    -- Prioritize location grouping over strict time adherence
                    -- Just use original times for now
                    v_time_adjustment := interval '0 hours';
                    
                    -- In a more advanced implementation, we'd look at nearby activities and group them
                    -- by geographic proximity, potentially reordering and adjusting times
                
                ELSE -- 'balanced' or any other value
                    -- Use original times with slight adjustments if needed
                    v_time_adjustment := interval '0 hours';
            END CASE;
            
            -- Location optimization - just a basic implementation
            -- Location optimization - just a basic implementation
            -- In a full implementation, this would use more sophisticated geo-clustering
            IF v_item.place_id IS NULL AND v_trip_destination_id IS NOT NULL THEN
                -- If no specific place_id but we have coordinates, create location data
                v_location_data := CASE
                    WHEN v_item.latitude IS NOT NULL AND v_item.longitude IS NOT NULL THEN
                        jsonb_build_object(
                            'address', v_item.address,
                            'coordinates', jsonb_build_object(
                                'latitude', v_item.latitude,
                                'longitude', v_item.longitude
                            )
                        )
                    ELSE
                        jsonb_build_object(
                            'address', v_item.address,
                            'location_name', v_item.location
                        )
                END;
            END IF;

            -- Insert the activity into the trip
            BEGIN
                INSERT INTO itinerary_items (
                    trip_id,
                    title,
                    description,
                    start_time,
                    day_number,
                    location,
                    place_id,
                    category,
                    position,
                    duration_minutes,
                    created_by,
                    metadata
                ) VALUES (
                    p_trip_id,
                    v_item.title,
                    v_item.description,
                    -- Adjust time if provided, maintaining the original timezone
                    CASE 
                        WHEN v_item.start_time IS NOT NULL THEN
                            (v_trip_start_date + (v_day_adjustment - 1) * INTERVAL '1 day' + 
                             v_item.start_time::time + v_time_adjustment)::timestamp AT TIME ZONE v_time_zone
                        ELSE NULL
                    END,
                    v_day_adjustment,
                    v_item.location,
                    v_item.place_id,
                    v_item.category,
                    v_item.position,
                    v_item.duration_minutes,
                    p_user_id,
                    jsonb_build_object(
                        'template_item_id', v_item.id,
                        'template_id', p_template_id,
                        'application_id', v_application_id,
                        'location_data', v_location_data,
                        'optimization_level', v_optimization_level
                    )
                );
                
                v_success_count := v_success_count + 1;
                
            EXCEPTION WHEN OTHERS THEN
                -- Handle insertion failure
                v_fallbacks_used := v_fallbacks_used + 1;
                
                -- Log the error
                RAISE NOTICE 'Failed to insert activity %: %', v_item.title, SQLERRM;
                
                -- Try fallback insertion without timing/location constraints
                BEGIN
                    INSERT INTO itinerary_items (
                        trip_id,
                        title,
                        description,
                        day_number,
                        category,
                        position,
                        created_by,
                        metadata
                    ) VALUES (
                        p_trip_id,
                        v_item.title,
                        v_item.description || E'\n(Note: Original timing/location data could not be applied)',
                        v_day_adjustment,
                        v_item.category,
                        v_item.position,
                        p_user_id,
                        jsonb_build_object(
                            'template_item_id', v_item.id,
                            'template_id', p_template_id,
                            'application_id', v_application_id,
                            'fallback_insertion', true,
                            'original_error', SQLERRM
                        )
                    );
                    
                    v_success_count := v_success_count + 1;
                EXCEPTION WHEN OTHERS THEN
                    -- Log complete failure
                    RAISE NOTICE 'Fallback insertion also failed for activity %: %', v_item.title, SQLERRM;
                END;
            END;
        END LOOP;
    END LOOP;
    
    -- Update template application record with results
    UPDATE template_applications
    SET 
        success_rate = (v_success_count::FLOAT / NULLIF(v_total_activities, 0) * 100),
        fallbacks_used = v_fallbacks_used,
        application_metadata = application_metadata || jsonb_build_object(
            'activities_total', v_total_activities,
            'activities_succeeded', v_success_count,
            'completed_at', NOW()
        )
    WHERE id = v_application_id;
    
    -- Build result object
    v_result := jsonb_build_object(
        'success', true,
        'application_id', v_application_id,
        'activities_total', v_total_activities,
        'activities_succeeded', v_success_count,
        'success_rate', (v_success_count::FLOAT / NULLIF(v_total_activities, 0) * 100),
        'fallbacks_used', v_fallbacks_used,
        'optimization_level', v_optimization_level
    );
    
    -- Update template stats
    UPDATE itinerary_templates
    SET 
        copied_count = copied_count + 1,
        last_copied_at = NOW()
    WHERE id = p_template_id;
    
    RETURN v_result;
    
EXCEPTION WHEN OTHERS THEN
    -- Handle any unexpected errors
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'activities_total', v_total_activities,
        'activities_succeeded', v_success_count
    );
END;
$$;


ALTER FUNCTION "public"."apply_template_to_trip"("p_template_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid", "p_options" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."apply_template_to_trip"("p_template_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid", "p_options" "jsonb") IS 'Applies a template to a trip with smart mapping, time optimization, and location-based adjustments';



CREATE OR REPLACE FUNCTION "public"."approve_user_suggested_tag"("p_suggestion_id" "uuid", "p_admin_id" "uuid", "p_admin_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."approve_user_suggested_tag"("p_suggestion_id" "uuid", "p_admin_id" "uuid", "p_admin_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."approve_user_tag"("tag_id" "uuid", "admin_id" "uuid", "notes" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."approve_user_tag"("tag_id" "uuid", "admin_id" "uuid", "notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_preference_match"("p_item_id" "uuid", "p_user_id" "uuid") RETURNS double precision
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_score FLOAT := 0;
    v_user_prefs user_preferences%ROWTYPE;
    v_item itinerary_items%ROWTYPE;
    v_weight FLOAT;
BEGIN
    -- Get user preferences
    SELECT * INTO v_user_prefs
    FROM user_preferences
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN 0.5; -- Default score for users without preferences
    END IF;
    
    -- Get item details
    SELECT * INTO v_item
    FROM itinerary_items
    WHERE id = p_item_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Calculate style match
    SELECT weight INTO v_weight
    FROM preference_weights
    WHERE category = 'travel_style';
    
    v_score := v_score + (
        CASE WHEN v_item.metadata->>'style' = ANY(v_user_prefs.travel_styles::text[])
        THEN v_weight ELSE 0 END
    );
    
    -- Calculate pace match
    SELECT weight INTO v_weight
    FROM preference_weights
    WHERE category = 'travel_pace';
    
    v_score := v_score + (
        CASE WHEN v_item.metadata->>'pace' = v_user_prefs.preferred_pace::text
        THEN v_weight ELSE 0 END
    );
    
    -- Calculate budget match
    SELECT weight INTO v_weight
    FROM preference_weights
    WHERE category = 'budget';
    
    IF (v_item.metadata->>'cost')::int <@ v_user_prefs.budget_range THEN
        v_score := v_score + v_weight;
    END IF;
    
    -- Calculate activity type match
    SELECT weight INTO v_weight
    FROM preference_weights
    WHERE category = 'activity_type';
    
    IF v_item.category = ANY(v_user_prefs.preferred_activity_types) THEN
        v_score := v_score + v_weight;
    END IF;
    
    -- Calculate time of day match
    SELECT weight INTO v_weight
    FROM preference_weights
    WHERE category = 'time_of_day';
    
    IF v_item.start_time::time <@ timerange(
        v_user_prefs.preferred_times_of_day[1],
        v_user_prefs.preferred_times_of_day[2],
        '[]'
    ) THEN
        v_score := v_score + v_weight;
    END IF;
    
    -- Normalize score to 0-1 range
    RETURN GREATEST(LEAST(v_score, 1), 0);
END;
$$;


ALTER FUNCTION "public"."calculate_preference_match"("p_item_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_preference_match"("p_item_id" "uuid", "p_user_id" "uuid") IS 'Calculates how well an item matches user preferences';



CREATE OR REPLACE FUNCTION "public"."calculate_trip_duration"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN

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


ALTER FUNCTION "public"."calculate_trip_duration"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_edit_trip"("p_trip_id" "uuid", "p_user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM trip_members
  WHERE trip_members.trip_id = p_trip_id
  AND trip_members.user_id = p_user_id;
  
  RETURN user_role IN ('admin', 'editor');
END;
$$;


ALTER FUNCTION "public"."can_edit_trip"("p_trip_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_manage_trip_members"("p_trip_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members
    WHERE trip_id = p_trip_id
      AND user_id = auth.uid()
      AND (role = 'admin'::public.trip_role OR role = 'editor'::public.trip_role)
  );
$$;


ALTER FUNCTION "public"."can_manage_trip_members"("p_trip_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_if_user_is_trip_member_with_role"("user_id_to_check" "uuid", "trip_id_to_check" "uuid", "allowed_roles" "public"."trip_role"[]) RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members tm
    WHERE tm.trip_id = trip_id_to_check
      AND tm.user_id = user_id_to_check
      AND tm.role = ANY(allowed_roles) -- Comparison should now work directly
  );
$$;


ALTER FUNCTION "public"."check_if_user_is_trip_member_with_role"("user_id_to_check" "uuid", "trip_id_to_check" "uuid", "allowed_roles" "public"."trip_role"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_metrics"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Update metrics older than 24 hours
    UPDATE item_popularity_metrics
    SET 
        views_last_24h = 0,
        shares_last_24h = 0,
        likes_last_24h = 0
    WHERE last_updated < NOW() - INTERVAL '24 hours';
    
    -- Update metrics older than 7 days
    UPDATE item_popularity_metrics
    SET 
        views_last_7d = 0,
        shares_last_7d = 0,
        likes_last_7d = 0
    WHERE last_updated < NOW() - INTERVAL '7 days';
    
    -- Update metrics older than 30 days
    UPDATE item_popularity_metrics
    SET 
        views_last_30d = 0,
        shares_last_30d = 0,
        likes_last_30d = 0
    WHERE last_updated < NOW() - INTERVAL '30 days';
END;
$$;


ALTER FUNCTION "public"."cleanup_old_metrics"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cleanup_old_metrics"() IS 'Maintenance function to clean up expired metrics';



CREATE OR REPLACE FUNCTION "public"."copy_and_customize_item"("p_source_item_id" "uuid", "p_target_trip_id" "uuid", "p_user_id" "uuid", "p_customizations" "jsonb" DEFAULT NULL::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_source_item itinerary_items%ROWTYPE;
    v_new_item_id UUID;
    v_customization_record JSONB;
BEGIN
    -- Get source item
    SELECT * INTO v_source_item
    FROM itinerary_items
    WHERE id = p_source_item_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Source item not found';
    END IF;
    
    -- Create new item as a copy
    INSERT INTO itinerary_items (
        trip_id,
        title,
        description,
        start_time,
        end_time,
        location,
        duration_minutes,
        day_number,
        category,
        position,
        content_layer,
        original_id,
        source_trip_id,
        attribution_type,
        attribution_metadata,
        created_by,
        metadata
    ) VALUES (
        p_target_trip_id,
        COALESCE((p_customizations->>'title'), v_source_item.title),
        COALESCE((p_customizations->>'description'), v_source_item.description),
        v_source_item.start_time,
        v_source_item.end_time,
        COALESCE((p_customizations->>'location'), v_source_item.location),
        COALESCE((p_customizations->>'duration_minutes')::integer, v_source_item.duration_minutes),
        COALESCE((p_customizations->>'day_number')::integer, v_source_item.day_number),
        v_source_item.category,
        COALESCE((p_customizations->>'position')::integer, v_source_item.position),
        'shared',
        COALESCE(v_source_item.original_id, v_source_item.id),
        v_source_item.trip_id,
        'copied',
        jsonb_build_object(
            'copied_from', v_source_item.id,
            'copied_at', NOW(),
            'copied_by', p_user_id
        ),
        p_user_id,
        v_source_item.metadata
    )
    RETURNING id INTO v_new_item_id;
    
    -- Record sharing history
    INSERT INTO content_sharing_history (
        item_id,
        source_trip_id,
        target_trip_id,
        shared_by,
        customizations
    ) VALUES (
        v_source_item.id,
        v_source_item.trip_id,
        p_target_trip_id,
        p_user_id,
        p_customizations
    );
    
    -- Update share count on original item
    UPDATE itinerary_items
    SET share_count = share_count + 1
    WHERE id = v_source_item.id;
    
    -- Store customizations if any
    IF p_customizations IS NOT NULL THEN
        FOR v_customization_record IN 
            SELECT * FROM jsonb_each(p_customizations)
        LOOP
            INSERT INTO content_customizations (
                item_id,
                user_id,
                customization_type,
                original_value,
                customized_value
            ) VALUES (
                v_new_item_id,
                p_user_id,
                v_customization_record.key,
                jsonb_build_object(
                    'value', 
                    CASE v_customization_record.key
                        WHEN 'title' THEN v_source_item.title
                        WHEN 'description' THEN v_source_item.description
                        WHEN 'location' THEN v_source_item.location
                        WHEN 'duration_minutes' THEN v_source_item.duration_minutes
                        WHEN 'day_number' THEN v_source_item.day_number
                        WHEN 'position' THEN v_source_item.position
                    END
                ),
                v_customization_record.value
            );
        END LOOP;
    END IF;
    
    RETURN v_new_item_id;
END;
$$;


ALTER FUNCTION "public"."copy_and_customize_item"("p_source_item_id" "uuid", "p_target_trip_id" "uuid", "p_user_id" "uuid", "p_customizations" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."copy_and_customize_item"("p_source_item_id" "uuid", "p_target_trip_id" "uuid", "p_user_id" "uuid", "p_customizations" "jsonb") IS 'Copies an item to another trip with optional customizations';



CREATE OR REPLACE FUNCTION "public"."copy_template_to_trip"("p_template_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."copy_template_to_trip"("p_template_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."count_item_comments"("p_item_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  comment_count INT;
BEGIN
  SELECT COUNT(*)
  INTO comment_count
  FROM trip_item_comments
  WHERE item_id = p_item_id;
  
  RETURN comment_count;
END;
$$;


ALTER FUNCTION "public"."count_item_comments"("p_item_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_notification_from_history"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    members_cursor CURSOR FOR 
        SELECT tm.user_id, np.in_app_enabled
        FROM trip_members tm
        LEFT JOIN notification_preferences np ON tm.user_id = np.user_id
        WHERE tm.trip_id = NEW.trip_id AND tm.user_id != NEW.user_id;
    member_record RECORD; -- Use a single record variable
    notifications_enabled BOOLEAN;
    title_text TEXT;
    content_text TEXT;
    notification_type TEXT;
    priority_level TEXT := 'normal';
    actor_name TEXT;
BEGIN
    -- Get actor name
    SELECT name INTO actor_name FROM profiles WHERE id = NEW.user_id;
    
    -- Create appropriate notification text based on action type
    CASE NEW.action_type
        WHEN 'ITINERARY_ITEM_ADDED' THEN
            title_text := 'New itinerary item added';
            content_text := COALESCE(actor_name, 'Someone') || ' added a new item to the trip: ' || COALESCE((NEW.details->>'title')::TEXT, 'Untitled item');
            notification_type := 'itinerary_change';
        WHEN 'ITINERARY_ITEM_UPDATED' THEN
            title_text := 'Itinerary item updated';
            content_text := COALESCE(actor_name, 'Someone') || ' updated an item in the trip: ' || COALESCE((NEW.details->>'title')::TEXT, 'Untitled item');
            notification_type := 'itinerary_change';
        WHEN 'COMMENT_ADDED' THEN
            title_text := 'New comment';
            content_text := COALESCE(actor_name, 'Someone') || ' commented on an item';
            notification_type := 'comment';
            priority_level := 'high';
        WHEN 'VOTE_CAST' THEN
            title_text := 'New vote';
            content_text := COALESCE(actor_name, 'Someone') || ' voted on a poll';
            notification_type := 'vote';
        WHEN 'FOCUS_INITIATED' THEN
            title_text := 'Focus session started';
            content_text := COALESCE(actor_name, 'Someone') || ' started a focus session on: ' || COALESCE((NEW.details->>'section_name')::TEXT, 'a section');
            notification_type := 'focus';
            priority_level := 'high';
        ELSE
            title_text := 'Trip update';
            content_text := 'There was an update to your trip';
            notification_type := 'trip_update';
    END CASE;
    
    -- Create a notification for all trip members except the actor
    FOR member_record IN members_cursor LOOP
        -- Get notification enabled status from the record, default to true if NULL
        notifications_enabled := COALESCE(member_record.in_app_enabled, TRUE);
        
        -- Check if the user has notifications enabled
        IF notifications_enabled THEN
            INSERT INTO notifications (
                user_id,
                trip_id,
                sender_id,
                title,
                content,
                notification_type,
                priority,
                action_url,
                reference_id,
                reference_type
            ) VALUES (
                member_record.user_id, -- Use the user_id from the record
                NEW.trip_id,
                NEW.user_id,
                title_text,
                content_text,
                notification_type,
                priority_level,
                '/trips/' || NEW.trip_id,
                CASE 
                    WHEN NEW.action_type IN ('ITINERARY_ITEM_ADDED', 'ITINERARY_ITEM_UPDATED') THEN (NEW.details->>'id')::UUID
                    WHEN NEW.action_type = 'COMMENT_ADDED' THEN (NEW.details->>'id')::UUID
                    WHEN NEW.action_type = 'VOTE_CAST' THEN (NEW.details->>'option_id')::UUID
                    WHEN NEW.action_type = 'FOCUS_INITIATED' THEN (NEW.details->>'id')::UUID
                    ELSE NULL
                END,
                CASE 
                    WHEN NEW.action_type IN ('ITINERARY_ITEM_ADDED', 'ITINERARY_ITEM_UPDATED') THEN 'itinerary_item'
                    WHEN NEW.action_type = 'COMMENT_ADDED' THEN 'comment'
                    WHEN NEW.action_type = 'VOTE_CAST' THEN 'vote'
                    WHEN NEW.action_type = 'FOCUS_INITIATED' THEN 'focus_session'
                    ELSE NULL
                END
            );
        END IF;
    END LOOP;
    
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."create_notification_from_history"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_template_sections_from_items"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    template_record RECORD;
    day_record RECORD;
    new_section_id bigint;
BEGIN
    -- Process each template
    FOR template_record IN SELECT DISTINCT template_id FROM public.itinerary_template_items LOOP
        -- For each template, process each distinct day
        FOR day_record IN SELECT DISTINCT day FROM public.itinerary_template_items WHERE template_id = template_record.template_id ORDER BY day LOOP
            -- Check if a section already exists
            IF NOT EXISTS (
                SELECT 1 FROM public.itinerary_template_sections 
                WHERE template_id = template_record.template_id AND day_number = day_record.day
            ) THEN
                -- Create a new section
                INSERT INTO public.itinerary_template_sections (template_id, day_number, title, position)
                VALUES (template_record.template_id, day_record.day, 'Day ' || day_record.day, day_record.day)
                RETURNING id INTO new_section_id;
                
                -- Update items to reference the new section
                UPDATE public.itinerary_template_items
                SET section_id = new_section_id
                WHERE template_id = template_record.template_id AND day = day_record.day;
                
                RAISE NOTICE 'Created section for template % day %', template_record.template_id, day_record.day;
            END IF;
        END LOOP;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."create_template_sections_from_items"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_trip_with_owner"("trip_data" "jsonb", "p_owner_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."create_trip_with_owner"("trip_data" "jsonb", "p_owner_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_trip_with_owner"("trip_data" "jsonb", "p_owner_id" "uuid") IS 'Creates a trip and adds the creator as an admin in a single transaction. Validates required fields and handles common errors.';



CREATE OR REPLACE FUNCTION "public"."create_trip_with_owner"("p_name" "text", "p_description" "text", "p_user_id" "uuid", "p_start_date" "date" DEFAULT NULL::"date", "p_end_date" "date" DEFAULT NULL::"date", "p_destination_id" "uuid" DEFAULT NULL::"uuid", "p_destination_name" "text" DEFAULT NULL::"text", "p_cover_image_url" "text" DEFAULT NULL::"text", "p_trip_type" "public"."trip_type" DEFAULT NULL::"public"."trip_type", "p_privacy_setting" "public"."privacy_setting" DEFAULT 'private'::"public"."privacy_setting") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."create_trip_with_owner"("p_name" "text", "p_description" "text", "p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_destination_id" "uuid", "p_destination_name" "text", "p_cover_image_url" "text", "p_trip_type" "public"."trip_type", "p_privacy_setting" "public"."privacy_setting") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_trip_with_owner"("trip_name" "text", "user_id" "uuid", "description_param" "text" DEFAULT NULL::"text", "tags_param" "text"[] DEFAULT NULL::"text"[], "destination_id" "uuid" DEFAULT NULL::"uuid", "destination_name_param" "text" DEFAULT NULL::"text", "start_date" "date" DEFAULT NULL::"date", "end_date" "date" DEFAULT NULL::"date", "is_public" boolean DEFAULT false, "cover_image_url" "text" DEFAULT NULL::"text", "latitude" numeric DEFAULT NULL::numeric, "longitude" numeric DEFAULT NULL::numeric) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."create_trip_with_owner"("trip_name" "text", "user_id" "uuid", "description_param" "text", "tags_param" "text"[], "destination_id" "uuid", "destination_name_param" "text", "start_date" "date", "end_date" "date", "is_public" boolean, "cover_image_url" "text", "latitude" numeric, "longitude" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_travelers_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.destinations
  SET travelers_count = GREATEST(travelers_count - 1, 0)
  WHERE id = OLD.destination_id;
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."decrement_travelers_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."execute_sql"("query" "text") RETURNS SETOF "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    row record;
BEGIN
  -- Loop through results and convert each row to json
  FOR row IN EXECUTE query LOOP
    RETURN NEXT to_json(row);
  END LOOP;
  RETURN;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;


ALTER FUNCTION "public"."execute_sql"("query" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_public_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."generate_public_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_random_itinerary"("p_trip_id" "uuid", "p_user_id" "uuid", "p_options" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_trip_duration INTEGER;
    v_trip_destination_id UUID;
    v_trip_start_date DATE;
    v_activities_per_day INTEGER;
    v_total_activities INTEGER := 0;
    v_result JSONB;
    v_day INTEGER;
    v_activity_types TEXT[] := ARRAY['dining', 'sightseeing', 'activity', 'shopping', 'nightlife', 'relaxation'];
    v_activity_type TEXT;
    v_day_activities INTEGER;
    v_position INTEGER;
    v_start_hour INTEGER;
    v_activity_duration INTEGER;
    v_activity_title TEXT;
BEGIN
    -- Get trip details
    SELECT 
        COALESCE(duration_days, CASE WHEN end_date IS NOT NULL THEN (end_date - start_date)::INTEGER + 1 ELSE 7 END),
        destination_id,
        start_date
    INTO 
        v_trip_duration,
        v_trip_destination_id,
        v_trip_start_date
    FROM trips
    WHERE id = p_trip_id;
    
    -- Get activities per day from options or use default
    v_activities_per_day := COALESCE((p_options->>'activities_per_day')::INTEGER, 4);
    
    -- Process each day of the trip
    FOR v_day IN 1..v_trip_duration LOOP
        -- Determine how many activities to generate for this day
        -- Add some randomness to make it more realistic
        v_day_activities := v_activities_per_day + floor(random() * 3)::INTEGER - 1;
        
        -- Generate activities for this day
        FOR v_position IN 1..v_day_activities LOOP
            -- Generate random activity type
            v_activity_type := v_activity_types[1 + floor(random() * array_length(v_activity_types, 1))::INTEGER];
            
            -- Generate random start time between 8 AM and 8 PM
            v_start_hour := 8 + floor(random() * 12)::INTEGER;
            
            -- Generate random duration between 1 and 3 hours
            v_activity_duration := 60 + floor(random() * 120)::INTEGER;
            
            -- Generate activity title based on type
            CASE v_activity_type
                WHEN 'dining' THEN
                    v_activity_title := 
                        (ARRAY['Breakfast at ', 'Lunch at ', 'Dinner at ', 'Drinks at '])[1 + floor(random() * 4)::INTEGER] ||
                        (ARRAY['Local Restaurant', 'Café', 'Bistro', 'Food Market', 'Gourmet Experience'])[1 + floor(random() * 5)::INTEGER];
                WHEN 'sightseeing' THEN
                    v_activity_title := 
                        'Visit ' ||
                        (ARRAY['Museum', 'Monument', 'Cathedral', 'Historic Site', 'Art Gallery', 'Park'])[1 + floor(random() * 6)::INTEGER];
                WHEN 'activity' THEN
                    v_activity_title := 
                        (ARRAY['Walking Tour', 'Bike Rental', 'Boat Trip', 'Cooking Class', 'Local Workshop', 'Photography Session'])[1 + floor(random() * 6)::INTEGER];
                WHEN 'shopping' THEN
                    v_activity_title := 
                        (ARRAY['Shopping at ', 'Browsing ', 'Local Market: ', 'Souvenirs at '])[1 + floor(random() * 4)::INTEGER] ||
                        (ARRAY['Main Street', 'Shopping District', 'Artisan Market', 'Boutiques', 'Local Shops'])[1 + floor(random() * 5)::INTEGER];
                WHEN 'nightlife' THEN
                    v_activity_title := 
                        (ARRAY['Evening at ', 'Night out: ', 'Enjoying '])[1 + floor(random() * 3)::INTEGER] ||
                        (ARRAY['Local Bar', 'Jazz Club', 'Live Music', 'Rooftop Lounge', 'Cocktail Bar'])[1 + floor(random() * 5)::INTEGER];
                ELSE -- relaxation
                    v_activity_title := 
                        (ARRAY['Relaxing at ', 'Spa treatment: ', 'Wellness: '])[1 + floor(random() * 3)::INTEGER] ||
                        (ARRAY['Beach Time', 'Pool Day', 'Massage', 'Yoga Session', 'Meditation', 'Park Visit'])[1 + floor(random() * 6)::INTEGER];
            END CASE;
            
            -- Insert the random activity
            BEGIN
                INSERT INTO itinerary_items (
                    trip_id,
                    title,
                    day_number,
                    category,
                    start_time,
                    duration_minutes,
                    position,
                    status,
                    created_by,
                    metadata
                ) VALUES (
                    p_trip_id,
                    v_activity_title,
                    v_day,
                    v_activity_type,
                    (v_trip_start_date + (v_day - 1) + (v_start_hour || ':00:00')::time)::timestamp,
                    v_activity_duration,
                    v_position,
                    'suggested',
                    p_user_id,
                    jsonb_build_object(
                        'randomly_generated', true,
                        'generation_time', NOW(),
                        'seed', floor(random() * 1000000)::INTEGER
                    )
                );
                
                v_total_activities := v_total_activities + 1;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Failed to insert random activity: %', SQLERRM;
            END;
        END LOOP;
    END LOOP;
    
    -- Build result object
    v_result := jsonb_build_object(
        'success', true,
        'trip_id', p_trip_id,
        'activities_generated', v_total_activities,
        'days_generated', v_trip_duration,
        'generation_timestamp', NOW()
    );
    
    RETURN v_result;
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'activities_generated', v_total_activities
    );
END;
$$;


ALTER FUNCTION "public"."generate_random_itinerary"("p_trip_id" "uuid", "p_user_id" "uuid", "p_options" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_random_itinerary"("p_trip_id" "uuid", "p_user_id" "uuid", "p_options" "jsonb") IS 'Generates a random itinerary for a trip with sensible defaults and activity distribution';



CREATE OR REPLACE FUNCTION "public"."generate_random_slug"("length" integer) RETURNS "text"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."generate_random_slug"("length" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_slug"("input_text" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    normalized_text TEXT;
BEGIN
    -- Convert to lowercase and remove special characters
    normalized_text := lower(input_text);
    normalized_text := regexp_replace(normalized_text, '[^a-zA-Z0-9\s-]', '', 'g');
    -- Replace spaces with hyphens
    normalized_text := regexp_replace(normalized_text, '\s+', '-', 'g');
    -- Remove multiple consecutive hyphens
    normalized_text := regexp_replace(normalized_text, '-+', '-', 'g');
    -- Trim hyphens from start and end
    normalized_text := trim(both '-' from normalized_text);
    
    RETURN normalized_text;
END;
$$;


ALTER FUNCTION "public"."generate_slug"("input_text" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_slug"("input_text" "text") IS 'Generates a URL-friendly slug from input text';



CREATE OR REPLACE FUNCTION "public"."generate_trip_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."generate_trip_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_unique_slug"("input_text" "text", "content_type_val" "public"."content_type", "content_id_val" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Generate base slug
    base_slug := generate_slug(input_text);
    final_slug := base_slug;
    
    -- Keep trying until we find a unique slug
    WHILE EXISTS (
        SELECT 1 FROM content_slugs 
        WHERE content_type = content_type_val 
        AND slug = final_slug 
        AND content_id != content_id_val
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter::TEXT;
    END LOOP;
    
    RETURN final_slug;
END;
$$;


ALTER FUNCTION "public"."generate_unique_slug"("input_text" "text", "content_type_val" "public"."content_type", "content_id_val" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_unique_slug"("input_text" "text", "content_type_val" "public"."content_type", "content_id_val" "uuid") IS 'Generates a unique slug for a given content type and ID';



CREATE OR REPLACE FUNCTION "public"."get_destination_recommendations"("p_user_id" "uuid", "p_limit" integer DEFAULT 10) RETURNS TABLE("destination_id" "uuid", "match_score" double precision, "matching_tags" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_destination_recommendations"("p_user_id" "uuid", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_poll_results"("poll_id_param" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  poll_data JSON;
  options_data JSON;
  total_votes INTEGER;
  user_vote_id UUID;
BEGIN
  -- Get poll information
  SELECT
    json_build_object(
      'id', p.id,
      'title', p.title,
      'description', p.description,
      'is_active', p.is_active,
      'created_at', p.created_at,
      'created_by', json_build_object(
        'id', u.id,
        'name', pr.name,
        'avatar_url', pr.avatar_url
      ),
      'expires_at', p.expires_at,
      'is_expired', (p.expires_at IS NOT NULL AND p.expires_at < NOW())
    )
  INTO poll_data
  FROM 
    trip_vote_polls p
    LEFT JOIN auth.users u ON p.created_by = u.id
    LEFT JOIN profiles pr ON u.id = pr.id
  WHERE 
    p.id = poll_id_param;
  
  -- Get the total votes for the poll
  SELECT COUNT(*) INTO total_votes
  FROM trip_votes
  WHERE poll_id = poll_id_param;
  
  -- Get the user's vote if they've voted
  IF auth.uid() IS NOT NULL THEN
    SELECT option_id INTO user_vote_id
    FROM trip_votes
    WHERE poll_id = poll_id_param AND user_id = auth.uid();
  END IF;
  
  -- Get options with detailed vote information
  SELECT
    json_agg(
      json_build_object(
        'id', o.id,
        'title', o.title,
        'description', o.description,
        'image_url', o.image_url,
        'vote_count', COALESCE(v.vote_count, 0),
        'percentage', CASE 
                        WHEN total_votes > 0 THEN 
                          ROUND((COALESCE(v.vote_count, 0)::NUMERIC / total_votes) * 100, 1)
                        ELSE 0 
                      END,
        'voters', COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', u.id,
              'name', p.name,
              'avatar_url', p.avatar_url
            )
          )
          FROM trip_votes tv
          JOIN auth.users u ON tv.user_id = u.id
          JOIN profiles p ON u.id = p.id
          WHERE tv.option_id = o.id
          ), '[]'::json
        ),
        'is_user_vote', (o.id = user_vote_id)
      )
      ORDER BY COALESCE(v.vote_count, 0) DESC, o.title
    )
  INTO options_data
  FROM
    trip_vote_options o
    LEFT JOIN (
      SELECT option_id, COUNT(*) as vote_count
      FROM trip_votes
      WHERE poll_id = poll_id_param
      GROUP BY option_id
    ) v ON o.id = v.option_id
  WHERE
    o.poll_id = poll_id_param;
  
  -- Return combined JSON result
  RETURN json_build_object(
    'poll', poll_data,
    'options', options_data,
    'total_votes', total_votes,
    'user_vote', user_vote_id
  );
END;
$$;


ALTER FUNCTION "public"."get_poll_results"("poll_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_poll_with_options"("poll_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  poll_json JSON;
  options_json JSON;
BEGIN
  -- Get poll data
  SELECT json_build_object(
    'id', p.id,
    'trip_id', p.trip_id,
    'title', p.title,
    'description', p.description,
    'is_active', p.is_active,
    'created_by', p.created_by,
    'expires_at', p.expires_at,
    'created_at', p.created_at
  ) INTO poll_json
  FROM trip_vote_polls p
  WHERE p.id = poll_id;
  
  -- Get options with vote counts
  SELECT json_agg(
    json_build_object(
      'id', o.id,
      'title', o.title,
      'description', o.description,
      'image_url', o.image_url,
      'votes', (SELECT COUNT(*) FROM trip_votes v WHERE v.option_id = o.id),
      'has_voted', has_user_voted(poll_id, auth.uid())
    )
  ) INTO options_json
  FROM trip_vote_options o
  WHERE o.poll_id = poll_id;
  
  -- Combine the results
  RETURN json_build_object(
    'poll', poll_json,
    'options', options_json
  );
END;
$$;


ALTER FUNCTION "public"."get_poll_with_options"("poll_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."itinerary_template_sections" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "day_number" integer NOT NULL,
    "date" "date",
    "title" "text",
    "position" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "template_id" "uuid" NOT NULL
);


ALTER TABLE "public"."itinerary_template_sections" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_sections_for_template"("p_template_id" "uuid") RETURNS SETOF "public"."itinerary_template_sections"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT * 
  FROM public.itinerary_template_sections
  WHERE template_id = p_template_id
  ORDER BY day_number, position;
$$;


ALTER FUNCTION "public"."get_sections_for_template"("p_template_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_trip_activity_timeline"("trip_id_param" "uuid", "limit_param" integer DEFAULT 50, "offset_param" integer DEFAULT 0) RETURNS TABLE("id" bigint, "trip_id" "uuid", "created_at" timestamp with time zone, "user_id" "uuid", "action_type" "public"."trip_action_type", "details" "jsonb", "actor_name" "text", "actor_avatar" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.trip_id,
        h.created_at,
        h.user_id,
        h.action_type,
        h.details,
        p.name AS actor_name,
        p.avatar_url AS actor_avatar
    FROM 
        trip_history h
    LEFT JOIN 
        profiles p ON h.user_id = p.id
    WHERE 
        h.trip_id = trip_id_param
    ORDER BY 
        h.created_at DESC
    LIMIT limit_param
    OFFSET offset_param;
END;
$$;


ALTER FUNCTION "public"."get_trip_activity_timeline"("trip_id_param" "uuid", "limit_param" integer, "offset_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_trip_role"("p_trip_id" "uuid", "p_user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM trip_members
  WHERE trip_members.trip_id = p_trip_id
  AND trip_members.user_id = p_user_id;
  
  RETURN user_role;
END;
$$;


ALTER FUNCTION "public"."get_trip_role"("p_trip_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_unread_notification_count"("user_id_param" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_result
    FROM notifications
    WHERE user_id = user_id_param AND read = FALSE;
    
    RETURN count_result;
END;
$$;


ALTER FUNCTION "public"."get_unread_notification_count"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_poll_vote"("p_poll_id" "uuid", "p_user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  vote_data JSON;
BEGIN
  SELECT json_build_object(
    'option_id', v.option_id,
    'option_title', o.title,
    'created_at', v.created_at
  ) INTO vote_data
  FROM trip_votes v
  JOIN trip_vote_options o ON v.option_id = o.id
  WHERE v.poll_id = p_poll_id AND v.user_id = p_user_id;
  
  IF vote_data IS NULL THEN
    RETURN json_build_object('has_voted', false);
  ELSE
    RETURN json_build_object(
      'has_voted', true,
      'vote', vote_data
    );
  END IF;
END;
$$;


ALTER FUNCTION "public"."get_user_poll_vote"("p_poll_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_votes"("trip_id_param" "uuid", "user_id_param" "uuid" DEFAULT "auth"."uid"()) RETURNS TABLE("poll_id" "uuid", "option_id" "uuid", "voted_at" timestamp with time zone, "poll_title" "text", "option_title" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.poll_id,
    v.option_id,
    v.created_at as voted_at,
    p.title as poll_title,
    o.title as option_title
  FROM
    trip_votes v
    JOIN trip_vote_polls p ON v.poll_id = p.id
    JOIN trip_vote_options o ON v.option_id = o.id
  WHERE
    v.trip_id = trip_id_param AND
    v.user_id = user_id_param
  ORDER BY
    v.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_votes"("trip_id_param" "uuid", "user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_splitwise_connections_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_splitwise_connections_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_trip_role"("p_trip_id" "uuid", "p_user_id" "uuid", "p_role" "public"."trip_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members tm
    WHERE tm.trip_id = p_trip_id AND tm.user_id = p_user_id AND tm.role = p_role
  );
$$;


ALTER FUNCTION "public"."has_trip_role"("p_trip_id" "uuid", "p_user_id" "uuid", "p_role" "public"."trip_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_user_liked_comment"("p_comment_id" "uuid", "p_user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM trip_comment_likes 
    WHERE comment_id = p_comment_id AND user_id = p_user_id
  );
END;
$$;


ALTER FUNCTION "public"."has_user_liked_comment"("p_comment_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_user_voted"("p_poll_id" "uuid", "p_user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM trip_votes 
    WHERE poll_id = p_poll_id AND user_id = p_user_id
  );
END;
$$;


ALTER FUNCTION "public"."has_user_voted"("p_poll_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_counter"("row_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_value INTEGER;
BEGIN
  SELECT popularity INTO current_value FROM destinations WHERE id = row_id;
  RETURN COALESCE(current_value, 0) + 1;
END;
$$;


ALTER FUNCTION "public"."increment_counter"("row_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_travelers_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.destinations
  SET travelers_count = travelers_count + 1
  WHERE id = NEW.destination_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."increment_travelers_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_tag_if_not_exists"("p_name" "text", "p_slug" "text", "p_category" "text", "p_emoji" "text" DEFAULT NULL::"text", "p_description" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."insert_tag_if_not_exists"("p_name" "text", "p_slug" "text", "p_category" "text", "p_emoji" "text", "p_description" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_poll_expired"("poll_id_param" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  poll_expired BOOLEAN;
BEGIN
  SELECT
    (p.expires_at IS NOT NULL AND p.expires_at < NOW())
  INTO poll_expired
  FROM
    trip_vote_polls p
  WHERE
    p.id = poll_id_param;
  
  RETURN COALESCE(poll_expired, FALSE);
END;
$$;


ALTER FUNCTION "public"."is_poll_expired"("poll_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_trip_member"("p_trip_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members
    WHERE trip_id = p_trip_id AND user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_trip_member"("p_trip_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_trip_member"("p_trip_id" "uuid", "p_user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_members.trip_id = p_trip_id
    AND trip_members.user_id = p_user_id
  );
END;
$$;


ALTER FUNCTION "public"."is_trip_member"("p_trip_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_trip_member_with_role"("_trip_id" "uuid", "_user_id" "uuid", "_roles" "text"[]) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."is_trip_member_with_role"("_trip_id" "uuid", "_user_id" "uuid", "_roles" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."moddatetime"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."moddatetime"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."pg_execute"("query" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  EXECUTE query;
END;
$$;


ALTER FUNCTION "public"."pg_execute"("query" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."pg_execute"("query" "text") IS 'Execute arbitrary SQL. WARNING: High security risk. Only use with service_role clients.';



CREATE OR REPLACE FUNCTION "public"."recommend_by_geography"("location_id" "uuid", "limit_count" integer DEFAULT 10) RETURNS TABLE("destination_id" "uuid", "destination_name" "text", "local_popularity" integer)
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."recommend_by_geography"("location_id" "uuid", "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recommend_popular_destinations"("limit_count" integer DEFAULT 10) RETURNS TABLE("destination_id" "uuid", "destination_name" "text", "popularity_score" integer)
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."recommend_popular_destinations"("limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_user_to_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."sync_user_to_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_access_requests_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_access_requests_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_canonical_url"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_base_url TEXT := 'https://withme.travel';  -- Configurable base URL
    v_trip_slug TEXT;
BEGIN
    -- Get trip slug
    SELECT slug INTO v_trip_slug
    FROM content_slugs
    WHERE content_type = 'trip'
    AND content_id = NEW.trip_id
    AND is_canonical = true;
    
    -- Generate item slug if not exists
    IF NEW.slug IS NULL THEN
        NEW.slug := generate_unique_slug(NEW.title, 'itinerary_item', NEW.id);
        
        -- Insert into content_slugs
        INSERT INTO content_slugs (
            content_type,
            content_id,
            slug,
            is_canonical,
            created_by
        ) VALUES (
            'itinerary_item',
            NEW.id,
            NEW.slug,
            true,
            auth.uid()
        );
    END IF;
    
    -- Update canonical URL
    NEW.canonical_url := v_base_url || '/trips/' || 
        COALESCE(v_trip_slug, 'default') || 
        '/items/' || NEW.slug;
    
    -- Generate SEO title if not set
    IF NEW.seo_title IS NULL THEN
        NEW.seo_title := NEW.title || ' - WithMe Travel';
    END IF;
    
    -- Generate SEO description if not set
    IF NEW.seo_description IS NULL THEN
        NEW.seo_description := COALESCE(NEW.description, NEW.title) || 
            ' - Plan your perfect trip with WithMe Travel';
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_canonical_url"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_canonical_url"() IS 'Maintains canonical URLs and SEO fields for itinerary items';



CREATE OR REPLACE FUNCTION "public"."update_collaborative_notes_metadata"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_edited_at = now();
  NEW.last_edited_by = auth.uid();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_collaborative_notes_metadata"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_itinerary_item_position"("p_item_id" "uuid", "p_trip_id" "uuid", "p_day_number" integer, "p_position" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_old_day_number integer;
  v_old_position integer;
BEGIN
  -- 1. Get the old state of the item being moved (only day and position)
  SELECT day_number, "position"
  INTO v_old_day_number, v_old_position
  FROM public.itinerary_items
  WHERE id = p_item_id AND trip_id = p_trip_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Itinerary item with id % not found for trip %', p_item_id, p_trip_id;
    RETURN;
  END IF;

  -- 2. Check if a meaningful change is actually happening (day or position)
  IF v_old_day_number IS NOT DISTINCT FROM p_day_number AND
     v_old_position IS NOT DISTINCT FROM p_position THEN
     RETURN; -- Exit if no change
  END IF;

  -- 3. Adjust positions in the OLD location (only based on day_number)
  UPDATE public.itinerary_items
  SET "position" = "position" - 1,
      updated_at = now()
  WHERE trip_id = p_trip_id
    AND id != p_item_id
    AND day_number IS NOT DISTINCT FROM v_old_day_number -- Match old day (handles NULL)
    AND "position" > v_old_position;                 -- Only items after the old position

  -- 4. Adjust positions in the NEW location (only based on day_number)
  UPDATE public.itinerary_items
  SET "position" = "position" + 1,
      updated_at = now()
  WHERE trip_id = p_trip_id
    AND id != p_item_id
    AND day_number IS NOT DISTINCT FROM p_day_number -- Match new day (handles NULL)
    AND "position" >= p_position;                -- Items at or after the new position

  -- 5. Update the target item itself (only day, position, updated_at)
  UPDATE public.itinerary_items
  SET
    day_number = p_day_number,      -- New day number (or NULL)
    "position" = p_position,        -- New position
    -- section_id = v_new_section_id, -- Temporarily removed section_id update
    updated_at = now()              -- Update timestamp
  WHERE id = p_item_id AND trip_id = p_trip_id;

END;
$$;


ALTER FUNCTION "public"."update_itinerary_item_position"("p_item_id" "uuid", "p_trip_id" "uuid", "p_day_number" integer, "p_position" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_likes_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_likes_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_popularity_metrics"("p_item_id" "uuid", "p_action" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Create or update metrics record
    INSERT INTO item_popularity_metrics (
        item_id,
        views_last_24h,
        views_last_7d,
        views_last_30d,
        shares_last_24h,
        shares_last_7d,
        shares_last_30d,
        likes_last_24h,
        likes_last_7d,
        likes_last_30d,
        last_updated
    ) VALUES (
        p_item_id,
        CASE WHEN p_action = 'view' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'view' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'view' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'share' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'share' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'share' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'like' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'like' THEN 1 ELSE 0 END,
        CASE WHEN p_action = 'like' THEN 1 ELSE 0 END,
        v_now
    )
    ON CONFLICT (item_id) DO UPDATE SET
        views_last_24h = CASE 
            WHEN p_action = 'view' THEN item_popularity_metrics.views_last_24h + 1
            ELSE item_popularity_metrics.views_last_24h
        END,
        views_last_7d = CASE 
            WHEN p_action = 'view' THEN item_popularity_metrics.views_last_7d + 1
            ELSE item_popularity_metrics.views_last_7d
        END,
        views_last_30d = CASE 
            WHEN p_action = 'view' THEN item_popularity_metrics.views_last_30d + 1
            ELSE item_popularity_metrics.views_last_30d
        END,
        shares_last_24h = CASE 
            WHEN p_action = 'share' THEN item_popularity_metrics.shares_last_24h + 1
            ELSE item_popularity_metrics.shares_last_24h
        END,
        shares_last_7d = CASE 
            WHEN p_action = 'share' THEN item_popularity_metrics.shares_last_7d + 1
            ELSE item_popularity_metrics.shares_last_7d
        END,
        shares_last_30d = CASE 
            WHEN p_action = 'share' THEN item_popularity_metrics.shares_last_30d + 1
            ELSE item_popularity_metrics.shares_last_30d
        END,
        likes_last_24h = CASE 
            WHEN p_action = 'like' THEN item_popularity_metrics.likes_last_24h + 1
            ELSE item_popularity_metrics.likes_last_24h
        END,
        likes_last_7d = CASE 
            WHEN p_action = 'like' THEN item_popularity_metrics.likes_last_7d + 1
            ELSE item_popularity_metrics.likes_last_7d
        END,
        likes_last_30d = CASE 
            WHEN p_action = 'like' THEN item_popularity_metrics.likes_last_30d + 1
            ELSE item_popularity_metrics.likes_last_30d
        END,
        -- Calculate trending score (simplified version)
        trending_score = (
            CASE WHEN p_action = 'view' THEN item_popularity_metrics.views_last_24h + 1 ELSE item_popularity_metrics.views_last_24h END * 1 +
            CASE WHEN p_action = 'share' THEN item_popularity_metrics.shares_last_24h + 1 ELSE item_popularity_metrics.shares_last_24h END * 5 +
            CASE WHEN p_action = 'like' THEN item_popularity_metrics.likes_last_24h + 1 ELSE item_popularity_metrics.likes_last_24h END * 3
        ) / 9.0,
        last_updated = v_now;
END;
$$;


ALTER FUNCTION "public"."update_popularity_metrics"("p_item_id" "uuid", "p_action" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_popularity_metrics"("p_item_id" "uuid", "p_action" "text") IS 'Updates popularity metrics for an item based on user actions';



CREATE OR REPLACE FUNCTION "public"."update_preferences_from_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Record the activity
    INSERT INTO user_activity_history (
        user_id,
        item_id,
        interaction_type,
        interaction_data
    ) VALUES (
        NEW.user_id,
        NEW.item_id,
        NEW.interaction_type,
        NEW.interaction_data
    );
    
    -- Update user preferences based on activity
    -- This is a simplified version; in practice, you'd want more sophisticated
    -- preference learning algorithms
    IF NEW.interaction_type = 'like' THEN
        UPDATE user_preferences
        SET 
            preferred_activity_types = array_append(
                preferred_activity_types,
                (SELECT category FROM itinerary_items WHERE id = NEW.item_id)
            ),
            updated_at = NOW()
        WHERE user_id = NEW.user_id
        AND NOT (SELECT category FROM itinerary_items WHERE id = NEW.item_id) = ANY(preferred_activity_types);
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_preferences_from_activity"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_preferences_from_activity"() IS 'Updates user preferences based on their activity';



CREATE OR REPLACE FUNCTION "public"."update_profile_from_interaction"() RETURNS "trigger"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."update_profile_from_interaction"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_onboarding"("p_user_id" "uuid", "p_first_name" "text" DEFAULT NULL::"text", "p_travel_personality" "public"."travel_personality_type" DEFAULT NULL::"public"."travel_personality_type", "p_travel_squad" "public"."travel_squad_type" DEFAULT NULL::"public"."travel_squad_type", "p_onboarding_step" integer DEFAULT NULL::integer, "p_complete_onboarding" boolean DEFAULT false) RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."update_profile_onboarding"("p_user_id" "uuid", "p_first_name" "text", "p_travel_personality" "public"."travel_personality_type", "p_travel_squad" "public"."travel_squad_type", "p_onboarding_step" integer, "p_complete_onboarding" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_quality_metrics"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO content_quality_metrics (
        item_id,
        trip_id,
        quality_score,
        engagement_score,
        popularity_score
    ) VALUES (
        NEW.id,
        NEW.trip_id,
        0.5,  -- Default initial quality score
        0.0,  -- Default initial engagement score
        0.0   -- Default initial popularity score
    )
    ON CONFLICT (item_id) 
    DO UPDATE SET
        updated_at = NOW();
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_quality_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_trip_last_accessed"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE trips
  SET last_accessed_at = now()
  WHERE id = NEW.trip_id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_trip_last_accessed"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_image_metadata_entity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."validate_image_metadata_entity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_itinerary"("p_trip_id" "uuid", "p_template_id" "uuid") RETURNS TABLE("is_valid" boolean, "validation_errors" "text"[])
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_trip_exists BOOLEAN;
    v_template_exists BOOLEAN;
    v_errors TEXT[] := ARRAY[]::TEXT[];
    v_start_date DATE;
    v_duration_days INTEGER;
BEGIN
    -- Check if trip and template exist
    SELECT EXISTS (
        SELECT 1 FROM trips WHERE id = p_trip_id
    ) INTO v_trip_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM itinerary_templates WHERE id = p_template_id
    ) INTO v_template_exists;
    
    IF NOT v_trip_exists THEN
        v_errors := array_append(v_errors, 'Trip does not exist');
    END IF;
    
    IF NOT v_template_exists THEN
        v_errors := array_append(v_errors, 'Template does not exist');
    END IF;
    
    -- Early return if basic existence checks fail
    IF NOT (v_trip_exists AND v_template_exists) THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, v_errors;
        RETURN;
    END IF;
    
    -- Get trip details
    SELECT start_date, COALESCE(duration_days, 
        CASE 
            WHEN end_date IS NOT NULL THEN (end_date - start_date)::INTEGER + 1
            ELSE NULL
        END)
    INTO v_start_date, v_duration_days
    FROM trips 
    WHERE id = p_trip_id;
    
    -- Validate trip duration against template
    IF v_duration_days IS NULL THEN
        v_errors := array_append(v_errors, 'Trip duration is not set');
    ELSE
        WITH template_days AS (
            SELECT MAX(day) as max_day
            FROM itinerary_template_items
            WHERE template_id = p_template_id
        )
        SELECT
            CASE
                WHEN v_duration_days < max_day THEN
                    array_append(v_errors, 'Trip duration (' || v_duration_days || ' days) is shorter than template duration (' || max_day || ' days)')
                ELSE v_errors
            END
        INTO v_errors
        FROM template_days;
    END IF;
    
    -- Validate no time conflicts within days
    WITH activity_times AS (
        SELECT 
            day_number,
            start_time,
            COALESCE(
                start_time + (duration_minutes || ' minutes')::INTERVAL,
                start_time + INTERVAL '1 hour'  -- Default duration if not specified
            ) as end_time
        FROM itinerary_items
        WHERE trip_id = p_trip_id
        AND start_time IS NOT NULL
    ),
    conflicts AS (
        SELECT DISTINCT a1.day_number
        FROM activity_times a1
        JOIN activity_times a2 
        ON a1.day_number = a2.day_number
        AND a1.start_time < a2.end_time 
        AND a2.start_time < a1.end_time
        AND a1.start_time != a2.start_time
    )
    SELECT
        CASE
            WHEN EXISTS (SELECT 1 FROM conflicts) THEN
                array_append(
                    v_errors,
                    'Time conflicts detected on day(s): ' || string_agg(day_number::TEXT, ', ')
                )
            ELSE v_errors
        END
    INTO v_errors
    FROM conflicts
    GROUP BY 1;
    
    -- Validate location data
    WITH location_checks AS (
        SELECT 
            COUNT(*) FILTER (WHERE location IS NULL) as missing_locations,
            COUNT(*) FILTER (WHERE location = '') as empty_locations
        FROM itinerary_items
        WHERE trip_id = p_trip_id
    )
    SELECT 
        CASE 
            WHEN missing_locations > 0 THEN 
                array_append(v_errors, 'Missing locations for ' || missing_locations || ' activities')
            WHEN empty_locations > 0 THEN
                array_append(v_errors, 'Empty location strings for ' || empty_locations || ' activities')
            ELSE v_errors
        END
    INTO v_errors
    FROM location_checks;
    
    -- Validate activity data completeness
    WITH activity_checks AS (
        SELECT 
            COUNT(*) FILTER (WHERE title IS NULL OR title = '') as missing_titles,
            COUNT(*) FILTER (WHERE day_number IS NULL) as missing_days
        FROM itinerary_items
        WHERE trip_id = p_trip_id
    )
    SELECT 
        CASE 
            WHEN missing_titles > 0 THEN 
                array_append(v_errors, 'Missing titles for ' || missing_titles || ' activities')
            WHEN missing_days > 0 THEN
                array_append(v_errors, 'Missing day numbers for ' || missing_days || ' activities')
            ELSE v_errors
        END
    INTO v_errors
    FROM activity_checks;
    
    -- Create validation log entry
    INSERT INTO validation_logs (
        trip_id,
        template_id,
        is_valid,
        validation_errors,
        validated_at
    ) VALUES (
        p_trip_id,
        p_template_id,
        ARRAY_LENGTH(v_errors, 1) IS NULL,
        v_errors,
        NOW()
    );
    
    -- Return validation result
    RETURN QUERY SELECT 
        ARRAY_LENGTH(v_errors, 1) IS NULL,
        v_errors;
END;
$$;


ALTER FUNCTION "public"."validate_itinerary"("p_trip_id" "uuid", "p_template_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."validate_itinerary"("p_trip_id" "uuid", "p_template_id" "uuid") IS 'Validates an itinerary against a template, checking for time conflicts, missing data, and other issues';



CREATE TABLE IF NOT EXISTS "public"."access_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "requested_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "access_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."access_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."albums" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."albums" OWNER TO "postgres";


ALTER TABLE "public"."albums" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."albums_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."budget_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "category" "public"."budget_category" NOT NULL,
    "paid_by" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "source" "text" DEFAULT 'manual'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "budget_items_amount_check" CHECK (("amount" >= (0)::numeric))
);


ALTER TABLE "public"."budget_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."budget_items" IS 'Stores individual expense items for trips, including manual entries.';



COMMENT ON COLUMN "public"."budget_items"."paid_by" IS 'The profile ID of the user who paid for the expense.';



COMMENT ON COLUMN "public"."budget_items"."source" IS 'Indicates if the expense was entered manually or imported (e.g., splitwise).';



CREATE TABLE IF NOT EXISTS "public"."collaborative_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "created_by" "uuid" NOT NULL,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "last_edited_by" "uuid",
    "last_edited_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."collaborative_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collaborative_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "document_type" "text" NOT NULL,
    "document_id" "text" NOT NULL,
    "content" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."collaborative_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_customizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "item_id" "uuid",
    "user_id" "uuid",
    "customization_type" "text" NOT NULL,
    "original_value" "jsonb",
    "customized_value" "jsonb",
    "is_private" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."content_customizations" OWNER TO "postgres";


COMMENT ON TABLE "public"."content_customizations" IS 'Stores user-specific customizations for itinerary items';



CREATE TABLE IF NOT EXISTS "public"."content_quality_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "item_id" "uuid",
    "trip_id" "uuid",
    "quality_score" double precision,
    "engagement_score" double precision,
    "popularity_score" double precision,
    "usage_count" integer DEFAULT 0,
    "last_used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "content_quality_metrics_engagement_score_check" CHECK ((("engagement_score" >= (0)::double precision) AND ("engagement_score" <= (1)::double precision))),
    CONSTRAINT "content_quality_metrics_popularity_score_check" CHECK ((("popularity_score" >= (0)::double precision) AND ("popularity_score" <= (1)::double precision))),
    CONSTRAINT "content_quality_metrics_quality_score_check" CHECK ((("quality_score" >= (0)::double precision) AND ("quality_score" <= (1)::double precision)))
);


ALTER TABLE "public"."content_quality_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."content_quality_metrics" IS 'Tracks quality and engagement metrics for itinerary content';



CREATE TABLE IF NOT EXISTS "public"."content_sharing_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "item_id" "uuid",
    "source_trip_id" "uuid",
    "target_trip_id" "uuid",
    "shared_by" "uuid",
    "shared_at" timestamp with time zone DEFAULT "now"(),
    "customizations" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."content_sharing_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."content_sharing_history" IS 'Tracks history of content sharing between trips';



CREATE TABLE IF NOT EXISTS "public"."content_slugs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "content_type" "public"."content_type" NOT NULL,
    "content_id" "uuid" NOT NULL,
    "slug" "text" NOT NULL,
    "is_canonical" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."content_slugs" OWNER TO "postgres";


COMMENT ON TABLE "public"."content_slugs" IS 'Tracks unique slugs for all content types';



CREATE TABLE IF NOT EXISTS "public"."destination_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "destination_id" "uuid",
    "tag_id" "uuid",
    "added_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "confidence_score" double precision DEFAULT 1.0,
    "votes_up" integer DEFAULT 0,
    "votes_down" integer DEFAULT 0,
    "is_verified" boolean DEFAULT false
);


ALTER TABLE "public"."destination_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."destinations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "city" "text",
    "state_province" "text",
    "country" "text",
    "popularity" integer,
    "lgbtq_friendliness" numeric(3,1),
    "accessibility" numeric(3,1),
    "continent" "text",
    "best_season" "text",
    "avg_cost_per_day" numeric,
    "local_language" "text",
    "time_zone" "text",
    "cuisine_rating" numeric(3,1),
    "cultural_attractions" numeric(3,1),
    "nightlife_rating" numeric(3,1),
    "family_friendly" boolean,
    "outdoor_activities" numeric(3,1),
    "beach_quality" numeric(3,1),
    "shopping_rating" numeric(3,1),
    "safety_rating" numeric(3,1),
    "wifi_connectivity" numeric(3,1),
    "public_transportation" numeric(3,1),
    "eco_friendly_options" numeric(3,1),
    "walkability" numeric(3,1),
    "instagram_worthy_spots" numeric(3,1),
    "off_peak_appeal" numeric(3,1),
    "digital_nomad_friendly" boolean,
    "name" "text",
    "description" "text",
    "image_url" "text",
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "emoji" "text",
    "visa_required" boolean,
    "image_metadata" "jsonb",
    "byline" character varying(100),
    "highlights" "text",
    "perfect_for" "text",
    "likes_count" integer DEFAULT 0,
    "latitude" double precision,
    "longitude" double precision,
    "avg_days" integer,
    "address" "text",
    "mapbox_id" "text",
    "currency" "text",
    CONSTRAINT "destinations_accessibility_check" CHECK ((("accessibility" >= 1.0) AND ("accessibility" <= 5.0))),
    CONSTRAINT "destinations_beach_quality_check" CHECK ((("beach_quality" >= 1.0) AND ("beach_quality" <= 5.0))),
    CONSTRAINT "destinations_cuisine_rating_check" CHECK ((("cuisine_rating" >= 1.0) AND ("cuisine_rating" <= 5.0))),
    CONSTRAINT "destinations_cultural_attractions_check" CHECK ((("cultural_attractions" >= 1.0) AND ("cultural_attractions" <= 5.0))),
    CONSTRAINT "destinations_eco_friendly_options_check" CHECK ((("eco_friendly_options" >= 1.0) AND ("eco_friendly_options" <= 5.0))),
    CONSTRAINT "destinations_instagram_worthy_spots_check" CHECK ((("instagram_worthy_spots" >= 1.0) AND ("instagram_worthy_spots" <= 5.0))),
    CONSTRAINT "destinations_lgbtq_friendliness_check" CHECK ((("lgbtq_friendliness" >= 1.0) AND ("lgbtq_friendliness" <= 5.0))),
    CONSTRAINT "destinations_nightlife_rating_check" CHECK ((("nightlife_rating" >= 1.0) AND ("nightlife_rating" <= 5.0))),
    CONSTRAINT "destinations_off_peak_appeal_check" CHECK ((("off_peak_appeal" >= 1.0) AND ("off_peak_appeal" <= 5.0))),
    CONSTRAINT "destinations_outdoor_activities_check" CHECK ((("outdoor_activities" >= 1.0) AND ("outdoor_activities" <= 5.0))),
    CONSTRAINT "destinations_public_transportation_check" CHECK ((("public_transportation" >= 1.0) AND ("public_transportation" <= 5.0))),
    CONSTRAINT "destinations_safety_rating_check" CHECK ((("safety_rating" >= 1.0) AND ("safety_rating" <= 5.0))),
    CONSTRAINT "destinations_shopping_rating_check" CHECK ((("shopping_rating" >= 1.0) AND ("shopping_rating" <= 5.0))),
    CONSTRAINT "destinations_walkability_check" CHECK ((("walkability" >= 1.0) AND ("walkability" <= 5.0))),
    CONSTRAINT "destinations_wifi_connectivity_check" CHECK ((("wifi_connectivity" >= 1.0) AND ("wifi_connectivity" <= 5.0)))
);


ALTER TABLE "public"."destinations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."destinations"."id" IS 'Unique identifier for the destination';



COMMENT ON COLUMN "public"."destinations"."city" IS 'Primary city name';



COMMENT ON COLUMN "public"."destinations"."state_province" IS 'State, province, or region (if applicable)';



COMMENT ON COLUMN "public"."destinations"."country" IS 'Country name';



COMMENT ON COLUMN "public"."destinations"."popularity" IS 'General popularity score/indicator';



COMMENT ON COLUMN "public"."destinations"."lgbtq_friendliness" IS 'Rating (1-5) for LGBTQ+ friendliness';



COMMENT ON COLUMN "public"."destinations"."accessibility" IS 'Rating (1-5) for physical accessibility';



COMMENT ON COLUMN "public"."destinations"."continent" IS 'Continent';



COMMENT ON COLUMN "public"."destinations"."best_season" IS 'Recommended travel season(s)';



COMMENT ON COLUMN "public"."destinations"."avg_cost_per_day" IS 'Estimated average daily cost for a tourist';



COMMENT ON COLUMN "public"."destinations"."local_language" IS 'Primary local language(s)';



COMMENT ON COLUMN "public"."destinations"."time_zone" IS 'Time zone identifier (e.g., Europe/Paris)';



COMMENT ON COLUMN "public"."destinations"."cuisine_rating" IS 'Rating (1-5) for local cuisine';



COMMENT ON COLUMN "public"."destinations"."cultural_attractions" IS 'Rating (1-5) for cultural attractions';



COMMENT ON COLUMN "public"."destinations"."nightlife_rating" IS 'Rating (1-5) for nightlife';



COMMENT ON COLUMN "public"."destinations"."family_friendly" IS 'Is the destination generally family-friendly?';



COMMENT ON COLUMN "public"."destinations"."outdoor_activities" IS 'Rating (1-5) for outdoor activity availability/quality';



COMMENT ON COLUMN "public"."destinations"."beach_quality" IS 'Rating (1-5) for beach quality (if applicable)';



COMMENT ON COLUMN "public"."destinations"."shopping_rating" IS 'Rating (1-5) for shopping options';



COMMENT ON COLUMN "public"."destinations"."safety_rating" IS 'Rating (1-5) for general safety';



COMMENT ON COLUMN "public"."destinations"."wifi_connectivity" IS 'Rating (1-5) for WiFi availability/speed';



COMMENT ON COLUMN "public"."destinations"."public_transportation" IS 'Rating (1-5) for public transportation quality';



COMMENT ON COLUMN "public"."destinations"."eco_friendly_options" IS 'Rating (1-5) for availability of eco-friendly options';



COMMENT ON COLUMN "public"."destinations"."walkability" IS 'Rating (1-5) for how walkable the main areas are';



COMMENT ON COLUMN "public"."destinations"."instagram_worthy_spots" IS 'Rating (1-5) for photogenic spots';



COMMENT ON COLUMN "public"."destinations"."off_peak_appeal" IS 'Rating (1-5) for appeal during off-peak seasons';



COMMENT ON COLUMN "public"."destinations"."digital_nomad_friendly" IS 'Is the destination suitable for digital nomads?';



COMMENT ON COLUMN "public"."destinations"."name" IS 'Primary display name for the destination (e.g., "Paris, France")';



COMMENT ON COLUMN "public"."destinations"."image_metadata" IS 'Stores metadata about the destination image, like alt text and attribution.';



COMMENT ON COLUMN "public"."destinations"."latitude" IS 'Latitude coordinate for the destination.';



COMMENT ON COLUMN "public"."destinations"."longitude" IS 'Longitude coordinate for the destination.';



COMMENT ON COLUMN "public"."destinations"."avg_days" IS 'Estimated average number of days recommended for a trip.';



CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid",
    "title" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "category" "text",
    "date" "date",
    "paid_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "source" "text" DEFAULT 'manual'::"text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."focus_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "initiated_by" "uuid" NOT NULL,
    "section_id" "text" NOT NULL,
    "section_path" "text" NOT NULL,
    "section_name" "text" NOT NULL,
    "active" boolean DEFAULT true,
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '00:30:00'::interval)
);


ALTER TABLE "public"."focus_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."image_metadata" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "entity_type" "public"."image_type" NOT NULL,
    "url" "text" NOT NULL,
    "alt_text" "text",
    "attribution" "text",
    "photographer_name" "text",
    "photographer_url" "text",
    "license" "text",
    "source" "text" NOT NULL,
    "source_id" "text",
    "width" integer,
    "height" integer,
    "focal_point_x" double precision,
    "focal_point_y" double precision,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "attribution_html" "text"
);


ALTER TABLE "public"."image_metadata" OWNER TO "postgres";


COMMENT ON COLUMN "public"."image_metadata"."attribution_html" IS 'HTML-formatted attribution with clickable links';



CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "invited_by" "uuid",
    "trip_id" "uuid",
    "invitation_status" "public"."invitation_status" DEFAULT 'pending'::"public"."invitation_status" NOT NULL,
    "email" "text" NOT NULL,
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."invitations" OWNER TO "postgres";


ALTER TABLE "public"."invitations" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."invitations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."item_popularity_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "item_id" "uuid",
    "views_last_24h" integer DEFAULT 0,
    "views_last_7d" integer DEFAULT 0,
    "views_last_30d" integer DEFAULT 0,
    "shares_last_24h" integer DEFAULT 0,
    "shares_last_7d" integer DEFAULT 0,
    "shares_last_30d" integer DEFAULT 0,
    "likes_last_24h" integer DEFAULT 0,
    "likes_last_7d" integer DEFAULT 0,
    "likes_last_30d" integer DEFAULT 0,
    "trending_score" double precision DEFAULT 0,
    "last_updated" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."item_popularity_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."item_popularity_metrics" IS 'Stores and tracks item popularity metrics';



CREATE TABLE IF NOT EXISTS "public"."itinerary_item_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "itinerary_item_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "vote" "public"."vote_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE ONLY "public"."itinerary_item_votes" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."itinerary_item_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."itinerary_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid",
    "title" "text" NOT NULL,
    "type" "text",
    "date" "date",
    "start_time" time without time zone,
    "end_time" time without time zone,
    "location" "text",
    "place_id" "uuid",
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "cost" numeric(10,2),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "item_type" "text",
    "is_custom" boolean DEFAULT false,
    "day_number" integer,
    "address" "text",
    "category" "public"."itinerary_category",
    "status" "public"."item_status" DEFAULT 'suggested'::"public"."item_status",
    "position" numeric,
    "estimated_cost" numeric,
    "currency" "text",
    "duration_minutes" integer,
    "section_id" "uuid",
    "updated_at" timestamp with time zone,
    "cover_image_url" "text",
    "content_layer" "text",
    "original_id" "uuid",
    "source_trip_id" "uuid",
    "attribution_type" "text",
    "attribution_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "seo_title" "text",
    "seo_description" "text",
    "canonical_url" "text",
    "slug" "text",
    "meta_keywords" "text"[],
    "structured_data" "jsonb" DEFAULT '{}'::"jsonb",
    "share_status" "text",
    "share_count" integer DEFAULT 0,
    "like_count" integer DEFAULT 0,
    "view_count" integer DEFAULT 0,
    "votes" "jsonb" DEFAULT '{}'::"jsonb",
    "last_modified_by" "uuid",
    "is_favorite" boolean DEFAULT false NOT NULL,
    "day" integer,
    "description" "text",
    CONSTRAINT "itinerary_items_attribution_type_check" CHECK (("attribution_type" = ANY (ARRAY['original'::"text", 'copied'::"text", 'inspired_by'::"text", 'generated'::"text"]))),
    CONSTRAINT "itinerary_items_content_layer_check" CHECK (("content_layer" = ANY (ARRAY['original'::"text", 'shared'::"text", 'generated'::"text", 'customized'::"text"]))),
    CONSTRAINT "itinerary_items_share_status_check" CHECK (("share_status" = ANY (ARRAY['private'::"text", 'shared'::"text", 'public'::"text"])))
);


ALTER TABLE "public"."itinerary_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."itinerary_items" IS 'Stores individual items within a trip itinerary.';



COMMENT ON COLUMN "public"."itinerary_items"."trip_id" IS 'Foreign key linking to the parent trip.';



COMMENT ON COLUMN "public"."itinerary_items"."title" IS 'Primary name or title of the item.';



COMMENT ON COLUMN "public"."itinerary_items"."start_time" IS 'Start date and time for the event/booking.';



COMMENT ON COLUMN "public"."itinerary_items"."end_time" IS 'End date and time for the event/booking.';



COMMENT ON COLUMN "public"."itinerary_items"."latitude" IS 'Geographic coordinates (longitude, latitude). Requires PostGIS or use separate numeric fields.';



COMMENT ON COLUMN "public"."itinerary_items"."longitude" IS 'Geographic coordinates (longitude, latitude). Requires PostGIS or use separate numeric fields.';



COMMENT ON COLUMN "public"."itinerary_items"."created_by" IS 'User who originally added this item.';



COMMENT ON COLUMN "public"."itinerary_items"."item_type" IS 'Categorizes the itinerary item.';



COMMENT ON COLUMN "public"."itinerary_items"."estimated_cost" IS 'Estimated cost for the itinerary item.';



COMMENT ON COLUMN "public"."itinerary_items"."currency" IS 'Currency code for the estimated cost (e.g., USD, EUR).';



COMMENT ON COLUMN "public"."itinerary_items"."duration_minutes" IS 'Estimated duration of the activity in minutes.';



CREATE TABLE IF NOT EXISTS "public"."itinerary_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "day_number" integer NOT NULL,
    "date" "date",
    "title" "text",
    "position" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "itinerary_sections_day_number_check" CHECK (("day_number" > 0))
);


ALTER TABLE "public"."itinerary_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."itinerary_template_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "template_id" "uuid" NOT NULL,
    "day" integer NOT NULL,
    "item_order" integer DEFAULT 0 NOT NULL,
    "title" "text",
    "description" "text",
    "start_time" time without time zone,
    "end_time" time without time zone,
    "location" "text",
    "place_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "section_id" bigint,
    "trip_id" "uuid",
    "type" "text",
    "date" "date",
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "cost" numeric(10,2),
    "notes" "text",
    "created_by" "uuid",
    "item_type" "text",
    "is_custom" boolean DEFAULT false,
    "day_number" integer,
    "address" "text",
    "category" "public"."itinerary_category",
    "status" "public"."item_status" DEFAULT 'suggested'::"public"."item_status",
    "position" numeric,
    "estimated_cost" numeric,
    "currency" "text",
    "duration_minutes" integer,
    "cover_image_url" "text",
    "content_layer" "text",
    "original_id" "uuid",
    "source_trip_id" "uuid",
    "attribution_type" "text",
    "attribution_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "seo_title" "text",
    "seo_description" "text",
    "canonical_url" "text",
    "slug" "text",
    "meta_keywords" "text"[],
    "structured_data" "jsonb" DEFAULT '{}'::"jsonb",
    "share_status" "text",
    "share_count" integer DEFAULT 0,
    "like_count" integer DEFAULT 0,
    "view_count" integer DEFAULT 0,
    "votes" "jsonb" DEFAULT '{}'::"jsonb",
    "last_modified_by" "uuid",
    "is_favorite" boolean DEFAULT false,
    CONSTRAINT "itinerary_template_items_day_check" CHECK (("day" > 0))
);


ALTER TABLE "public"."itinerary_template_items" OWNER TO "postgres";


COMMENT ON COLUMN "public"."itinerary_template_items"."item_order" IS 'Order of the item within a specific day of the template';



COMMENT ON COLUMN "public"."itinerary_template_items"."location" IS 'Text-based location name (e.g., "Eiffel Tower")';



COMMENT ON COLUMN "public"."itinerary_template_items"."place_id" IS 'Optional reference to a structured place entry in the places table';



ALTER TABLE "public"."itinerary_template_sections" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."itinerary_template_sections_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."itinerary_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "destination_id" "uuid" NOT NULL,
    "duration_days" integer NOT NULL,
    "category" character varying(50) NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_published" boolean DEFAULT false,
    "view_count" integer DEFAULT 0,
    "use_count" integer DEFAULT 0,
    "like_count" integer DEFAULT 0,
    "featured" boolean DEFAULT false,
    "cover_image_url" "text",
    "groupsize" "text",
    "tags" "text"[],
    "template_type" character varying(50),
    "source_trip_id" "uuid",
    "version" integer DEFAULT 1,
    "copied_count" integer DEFAULT 0,
    "last_copied_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "itinerary_templates_template_type_check" CHECK ((("template_type")::"text" = ANY (ARRAY[('official'::character varying)::"text", ('user_created'::character varying)::"text", ('trip_based'::character varying)::"text"])))
);


ALTER TABLE "public"."itinerary_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "item_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "likes_item_type_check" CHECK (("item_type" = ANY (ARRAY['destination'::"text", 'itinerary'::"text", 'attraction'::"text"])))
);


ALTER TABLE "public"."likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "parent_id" "uuid",
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."note_tags" (
    "note_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."note_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email_enabled" boolean DEFAULT true,
    "push_enabled" boolean DEFAULT true,
    "in_app_enabled" boolean DEFAULT true,
    "trip_updates" boolean DEFAULT true,
    "itinerary_changes" boolean DEFAULT true,
    "member_activity" boolean DEFAULT true,
    "comments" boolean DEFAULT true,
    "votes" boolean DEFAULT true,
    "focus_events" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trip_id" "uuid",
    "sender_id" "uuid",
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "notification_type" "text" NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text",
    "read" boolean DEFAULT false,
    "action_url" "text",
    "reference_id" "uuid",
    "reference_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permission_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."permission_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."places" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "public"."place_category",
    "address" "text",
    "latitude" numeric(9,6),
    "longitude" numeric(9,6),
    "destination_id" "uuid",
    "price_level" integer,
    "rating" numeric(2,1),
    "rating_count" integer DEFAULT 0,
    "images" "text"[],
    "tags" "text"[],
    "opening_hours" "jsonb",
    "is_verified" boolean DEFAULT false,
    "suggested_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "source" "text",
    "source_id" "text",
    CONSTRAINT "places_price_level_check" CHECK ((("price_level" >= 1) AND ("price_level" <= 5))),
    CONSTRAINT "places_rating_check" CHECK ((("rating" >= (0)::numeric) AND ("rating" <= (5)::numeric)))
);


ALTER TABLE "public"."places" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."preference_weights" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "category" "text" NOT NULL,
    "subcategory" "text",
    "weight" double precision,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "preference_weights_weight_check" CHECK ((("weight" >= (0)::double precision) AND ("weight" <= (1)::double precision)))
);


ALTER TABLE "public"."preference_weights" OWNER TO "postgres";


COMMENT ON TABLE "public"."preference_weights" IS 'Configurable weights for preference matching algorithm';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "name" "text",
    "avatar_url" "text",
    "is_admin" boolean DEFAULT false,
    "email" "text",
    "username" "text",
    "cover_image_url" "text",
    "bio" "text",
    "location" "text",
    "website" "text",
    "is_verified" boolean DEFAULT false,
    "home_location_id" "uuid",
    "first_name" "text",
    "travel_personality" "public"."travel_personality_type",
    "travel_squad" "public"."travel_squad_type",
    "onboarding_completed" boolean DEFAULT false,
    "onboarding_completed_at" timestamp with time zone,
    "onboarding_step" integer DEFAULT 1
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'Public profiles of users with additional metadata';



COMMENT ON COLUMN "public"."profiles"."is_admin" IS 'Flags if the user has administrative privileges.';



CREATE TABLE IF NOT EXISTS "public"."referrals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "referrer_id" "uuid" NOT NULL,
    "referred_id" "uuid" NOT NULL,
    "referral_code" "text" NOT NULL,
    "trip_id" "uuid",
    "converted" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "converted_at" timestamp with time zone
);


ALTER TABLE "public"."referrals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "category" "text",
    "emoji" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "is_verified" boolean DEFAULT false,
    "use_count" integer DEFAULT 0,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


COMMENT ON TABLE "public"."tags" IS 'Stores unique tags that can be applied to trips.';



COMMENT ON COLUMN "public"."tags"."id" IS 'Unique identifier for the tag.';



COMMENT ON COLUMN "public"."tags"."name" IS 'The unique name of the tag.';



COMMENT ON COLUMN "public"."tags"."created_at" IS 'Timestamp when the tag was created.';



CREATE TABLE IF NOT EXISTS "public"."template_applications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid",
    "template_id" "uuid",
    "applied_at" timestamp with time zone DEFAULT "now"(),
    "applied_by" "uuid",
    "version_used" integer,
    "success_rate" double precision,
    "optimization_level" "text",
    "fallbacks_used" integer,
    "application_metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."template_applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_comment_likes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "comment_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trip_comment_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_history" (
    "id" bigint NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "action_type" "public"."trip_action_type" NOT NULL,
    "details" "jsonb"
);


ALTER TABLE "public"."trip_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."trip_history" IS 'Stores audit log/history of events related to trips.';



COMMENT ON COLUMN "public"."trip_history"."trip_id" IS 'The trip this history event belongs to.';



COMMENT ON COLUMN "public"."trip_history"."user_id" IS 'The user who performed the action (can be null for system actions).';



COMMENT ON COLUMN "public"."trip_history"."action_type" IS 'The type of action performed.';



COMMENT ON COLUMN "public"."trip_history"."details" IS 'JSON object containing details specific to the action type (e.g., changed fields, added item ID).';



CREATE SEQUENCE IF NOT EXISTS "public"."trip_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."trip_history_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."trip_history_id_seq" OWNED BY "public"."trip_history"."id";



CREATE TABLE IF NOT EXISTS "public"."trip_images" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "content_type" "text" NOT NULL,
    "size_bytes" integer NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "width" integer,
    "height" integer,
    "description" "text",
    "album_id" bigint
);


ALTER TABLE "public"."trip_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_item_comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trip_item_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_logistics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "location" "text",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "trip_logistics_type_check" CHECK (("type" = ANY (ARRAY['form'::"text", 'accommodation'::"text", 'transportation'::"text"])))
);


ALTER TABLE "public"."trip_logistics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid",
    "user_id" "uuid",
    "role" "public"."trip_role" DEFAULT 'viewer'::"public"."trip_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "invited_by" "uuid",
    "joined_at" timestamp with time zone,
    "external_email" "text",
    "notification_preferences" "jsonb" DEFAULT '{"push": true, "email": true}'::"jsonb",
    "last_viewed_at" timestamp with time zone
);

ALTER TABLE ONLY "public"."trip_members" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_notes" (
    "trip_id" "uuid" NOT NULL,
    "content" "text",
    "updated_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "album_id" bigint,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL
);

ALTER TABLE ONLY "public"."trip_notes" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_notes" OWNER TO "postgres";


COMMENT ON COLUMN "public"."trip_notes"."user_id" IS 'The user who created the note.';



CREATE TABLE IF NOT EXISTS "public"."trip_tags" (
    "trip_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trip_tags" OWNER TO "postgres";


COMMENT ON TABLE "public"."trip_tags" IS 'Join table linking trips to tags.';



COMMENT ON COLUMN "public"."trip_tags"."trip_id" IS 'Foreign key referencing the trip.';



COMMENT ON COLUMN "public"."trip_tags"."tag_id" IS 'Foreign key referencing the tag.';



COMMENT ON COLUMN "public"."trip_tags"."assigned_at" IS 'Timestamp when the tag was assigned to the trip.';



CREATE TABLE IF NOT EXISTS "public"."trip_template_uses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid",
    "template_id" "uuid",
    "applied_at" timestamp with time zone DEFAULT "now"(),
    "applied_by" "uuid",
    "version_used" integer,
    "modifications" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."trip_template_uses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_vote_options" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "poll_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trip_vote_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_vote_polls" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid" NOT NULL,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trip_vote_polls" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_votes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "poll_id" "uuid" NOT NULL,
    "option_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trip_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "destination_id" "uuid",
    "destination_name" "text",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "date_flexibility" "text",
    "travelers_count" integer DEFAULT 1,
    "vibe" "text",
    "budget" "text",
    "is_public" boolean DEFAULT false NOT NULL,
    "slug" "text",
    "cover_image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "member_count" numeric,
    "description" "text",
    "trip_emoji" "text",
    "splitwise_group_id" bigint,
    "duration_days" integer DEFAULT 1,
    "status" "public"."trip_status" DEFAULT 'planning'::"public"."trip_status",
    "likes_count" integer DEFAULT 0,
    "comments_count" integer DEFAULT 0,
    "view_count" integer DEFAULT 0,
    "use_count" integer DEFAULT 0,
    "shared_url" "text",
    "public_slug" "text",
    "trip_type" "text",
    "cover_image_position_y" numeric,
    "privacy_setting" "public"."trip_privacy_setting" DEFAULT 'private'::"public"."trip_privacy_setting" NOT NULL,
    "playlist_url" "text",
    "is_archived" boolean DEFAULT false NOT NULL,
    "last_accessed_at" timestamp with time zone,
    "color_scheme" "text",
    CONSTRAINT "trips_cover_image_position_y_check" CHECK ((("cover_image_position_y" >= (0)::numeric) AND ("cover_image_position_y" <= (100)::numeric))),
    CONSTRAINT "trips_date_flexibility_check" CHECK (("date_flexibility" = ANY (ARRAY['fixed'::"text", 'month'::"text", 'season'::"text", 'undecided'::"text"]))),
    CONSTRAINT "trips_name_check" CHECK (("char_length"("name") > 0)),
    CONSTRAINT "trips_travelers_count_check" CHECK (("travelers_count" >= 0))
);


ALTER TABLE "public"."trips" OWNER TO "postgres";


COMMENT ON COLUMN "public"."trips"."id" IS 'Unique identifier for the trip';



COMMENT ON COLUMN "public"."trips"."created_by" IS 'Creator of the trip (references profiles.id)';



COMMENT ON COLUMN "public"."trips"."name" IS 'User-defined name for the trip';



COMMENT ON COLUMN "public"."trips"."destination_id" IS 'Foreign key referencing the primary destination';



COMMENT ON COLUMN "public"."trips"."destination_name" IS 'Stored name of the destination (city, country)';



COMMENT ON COLUMN "public"."trips"."start_date" IS 'Planned start date of the trip (if specific)';



COMMENT ON COLUMN "public"."trips"."end_date" IS 'Planned end date of the trip (if specific)';



COMMENT ON COLUMN "public"."trips"."date_flexibility" IS 'Indicates date specificity (fixed, month, season, undecided)';



COMMENT ON COLUMN "public"."trips"."travelers_count" IS 'Number of people associated with the trip';



COMMENT ON COLUMN "public"."trips"."vibe" IS 'General vibe or type of the trip';



COMMENT ON COLUMN "public"."trips"."budget" IS 'Budget category for the trip';



COMMENT ON COLUMN "public"."trips"."is_public" IS 'Whether the trip itinerary is publicly viewable';



COMMENT ON COLUMN "public"."trips"."slug" IS 'URL-friendly identifier for public trips';



COMMENT ON COLUMN "public"."trips"."cover_image_url" IS 'URL for the trip''s cover image';



COMMENT ON COLUMN "public"."trips"."created_at" IS 'Timestamp of creation';



COMMENT ON COLUMN "public"."trips"."updated_at" IS 'Timestamp of last update';



COMMENT ON COLUMN "public"."trips"."splitwise_group_id" IS 'Stores the linked Splitwise group ID for the trip.';



COMMENT ON COLUMN "public"."trips"."duration_days" IS 'Explicit number of days for the trip itinerary.';



COMMENT ON COLUMN "public"."trips"."cover_image_position_y" IS 'Vertical position (0-100%) for the cover image focal point.';



COMMENT ON COLUMN "public"."trips"."privacy_setting" IS 'Controls the visibility of the trip: private (default), shared_with_link, or public.';



COMMENT ON COLUMN "public"."trips"."playlist_url" IS 'tidal or spotify';



CREATE TABLE IF NOT EXISTS "public"."user_activity_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "item_id" "uuid",
    "interaction_type" "text" NOT NULL,
    "interaction_data" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."user_activity_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_activity_history" IS 'Tracks user interactions for preference learning';



CREATE TABLE IF NOT EXISTS "public"."user_interactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "destination_id" "uuid",
    "interaction_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_interactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_interests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "tag_id" "uuid",
    "strength" integer DEFAULT 5,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_interests_strength_check" CHECK ((("strength" >= 0) AND ("strength" <= 10)))
);


ALTER TABLE "public"."user_interests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_login_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "login_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ip_address" "text",
    "user_agent" "text",
    "success" boolean DEFAULT true NOT NULL,
    "method" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_login_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "travel_styles" "public"."travel_style"[] DEFAULT ARRAY[]::"public"."travel_style"[],
    "preferred_pace" "public"."travel_pace" DEFAULT 'moderate'::"public"."travel_pace",
    "budget_range" "int4range",
    "preferred_activity_types" "text"[],
    "preferred_times_of_day" time without time zone[] DEFAULT ARRAY['09:00:00'::time without time zone, '19:00:00'::time without time zone],
    "accessibility_needs" "text"[],
    "dietary_restrictions" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_preferences" IS 'Stores user travel preferences and settings';



CREATE TABLE IF NOT EXISTS "public"."user_presence" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "document_id" "text",
    "status" "text" DEFAULT 'viewing'::"text" NOT NULL,
    "last_active" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_presence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_suggested_tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "destination_id" "uuid",
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "category" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_suggested_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_travel" (
    "user_id" "uuid" NOT NULL,
    "destination_id" "uuid" NOT NULL,
    "visited_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_travel" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."validation_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "trip_id" "uuid",
    "template_id" "uuid",
    "is_valid" boolean NOT NULL,
    "validation_errors" "text"[],
    "validated_at" timestamp with time zone DEFAULT "now"(),
    "validated_by" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."validation_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "itinerary_item_id" "uuid",
    "user_id" "uuid",
    "vote_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."votes" OWNER TO "postgres";


ALTER TABLE ONLY "public"."trip_history" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."trip_history_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "access_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "access_requests_trip_id_user_id_key" UNIQUE ("trip_id", "user_id");



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."budget_items"
    ADD CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collaborative_notes"
    ADD CONSTRAINT "collaborative_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collaborative_sessions"
    ADD CONSTRAINT "collaborative_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collaborative_sessions"
    ADD CONSTRAINT "collaborative_sessions_trip_id_document_type_document_id_key" UNIQUE ("trip_id", "document_type", "document_id");



ALTER TABLE ONLY "public"."content_customizations"
    ADD CONSTRAINT "content_customizations_item_id_user_id_customization_type_key" UNIQUE ("item_id", "user_id", "customization_type");



ALTER TABLE ONLY "public"."content_customizations"
    ADD CONSTRAINT "content_customizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_quality_metrics"
    ADD CONSTRAINT "content_quality_metrics_item_id_key" UNIQUE ("item_id");



ALTER TABLE ONLY "public"."content_quality_metrics"
    ADD CONSTRAINT "content_quality_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_sharing_history"
    ADD CONSTRAINT "content_sharing_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_slugs"
    ADD CONSTRAINT "content_slugs_content_type_slug_key" UNIQUE ("content_type", "slug");



ALTER TABLE ONLY "public"."content_slugs"
    ADD CONSTRAINT "content_slugs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."destination_tags"
    ADD CONSTRAINT "destination_tags_destination_id_tag_id_key" UNIQUE ("destination_id", "tag_id");



ALTER TABLE ONLY "public"."destination_tags"
    ADD CONSTRAINT "destination_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."destinations"
    ADD CONSTRAINT "destinations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."focus_sessions"
    ADD CONSTRAINT "focus_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."image_metadata"
    ADD CONSTRAINT "image_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."item_popularity_metrics"
    ADD CONSTRAINT "item_popularity_metrics_item_id_key" UNIQUE ("item_id");



ALTER TABLE ONLY "public"."item_popularity_metrics"
    ADD CONSTRAINT "item_popularity_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."itinerary_item_votes"
    ADD CONSTRAINT "itinerary_item_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."itinerary_items"
    ADD CONSTRAINT "itinerary_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."itinerary_sections"
    ADD CONSTRAINT "itinerary_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."itinerary_sections"
    ADD CONSTRAINT "itinerary_sections_trip_id_day_number_key" UNIQUE ("trip_id", "day_number");



ALTER TABLE ONLY "public"."itinerary_template_items"
    ADD CONSTRAINT "itinerary_template_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."itinerary_template_sections"
    ADD CONSTRAINT "itinerary_template_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."itinerary_templates"
    ADD CONSTRAINT "itinerary_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."itinerary_templates"
    ADD CONSTRAINT "itinerary_templates_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_user_id_item_id_item_type_key" UNIQUE ("user_id", "item_id", "item_type");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."note_tags"
    ADD CONSTRAINT "note_tags_pkey" PRIMARY KEY ("note_id", "tag_id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permission_requests"
    ADD CONSTRAINT "permission_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permission_requests"
    ADD CONSTRAINT "permission_requests_trip_id_user_id_key" UNIQUE ("trip_id", "user_id");



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."preference_weights"
    ADD CONSTRAINT "preference_weights_category_subcategory_key" UNIQUE ("category", "subcategory");



ALTER TABLE ONLY "public"."preference_weights"
    ADD CONSTRAINT "preference_weights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referrer_id_referred_id_key" UNIQUE ("referrer_id", "referred_id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."template_applications"
    ADD CONSTRAINT "template_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."template_applications"
    ADD CONSTRAINT "template_applications_trip_id_template_id_applied_at_key" UNIQUE ("trip_id", "template_id", "applied_at");



ALTER TABLE ONLY "public"."trip_comment_likes"
    ADD CONSTRAINT "trip_comment_likes_comment_id_user_id_key" UNIQUE ("comment_id", "user_id");



ALTER TABLE ONLY "public"."trip_comment_likes"
    ADD CONSTRAINT "trip_comment_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_history"
    ADD CONSTRAINT "trip_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_images"
    ADD CONSTRAINT "trip_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_images"
    ADD CONSTRAINT "trip_images_trip_id_idx" UNIQUE ("trip_id", "file_path");



ALTER TABLE ONLY "public"."trip_item_comments"
    ADD CONSTRAINT "trip_item_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_logistics"
    ADD CONSTRAINT "trip_logistics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_members"
    ADD CONSTRAINT "trip_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_members"
    ADD CONSTRAINT "trip_members_trip_id_user_id_key" UNIQUE ("trip_id", "user_id");



ALTER TABLE ONLY "public"."trip_notes"
    ADD CONSTRAINT "trip_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_tags"
    ADD CONSTRAINT "trip_tags_pkey" PRIMARY KEY ("trip_id", "tag_id");



ALTER TABLE ONLY "public"."trip_template_uses"
    ADD CONSTRAINT "trip_template_uses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_template_uses"
    ADD CONSTRAINT "trip_template_uses_trip_id_template_id_key" UNIQUE ("trip_id", "template_id");



ALTER TABLE ONLY "public"."trip_vote_options"
    ADD CONSTRAINT "trip_vote_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_vote_polls"
    ADD CONSTRAINT "trip_vote_polls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_votes"
    ADD CONSTRAINT "trip_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_votes"
    ADD CONSTRAINT "trip_votes_poll_id_user_id_key" UNIQUE ("poll_id", "user_id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_public_slug_key" UNIQUE ("public_slug");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."itinerary_templates"
    ADD CONSTRAINT "unique_itinerary_template_slug" UNIQUE ("slug");



ALTER TABLE ONLY "public"."itinerary_item_votes"
    ADD CONSTRAINT "unique_user_vote_per_item" UNIQUE ("itinerary_item_id", "user_id");



ALTER TABLE ONLY "public"."user_activity_history"
    ADD CONSTRAINT "user_activity_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_interactions"
    ADD CONSTRAINT "user_interactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_interests"
    ADD CONSTRAINT "user_interests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_interests"
    ADD CONSTRAINT "user_interests_user_id_tag_id_key" UNIQUE ("user_id", "tag_id");



ALTER TABLE ONLY "public"."user_login_history"
    ADD CONSTRAINT "user_login_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_user_id_trip_id_document_id_key" UNIQUE ("user_id", "trip_id", "document_id");



ALTER TABLE ONLY "public"."user_suggested_tags"
    ADD CONSTRAINT "user_suggested_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_travel"
    ADD CONSTRAINT "user_travel_pkey" PRIMARY KEY ("user_id", "destination_id");



ALTER TABLE ONLY "public"."validation_logs"
    ADD CONSTRAINT "validation_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_itinerary_item_id_user_id_key" UNIQUE ("itinerary_item_id", "user_id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "destinations_mapbox_id_unique_idx" ON "public"."destinations" USING "btree" ("mapbox_id");



CREATE INDEX "idx_access_requests_status" ON "public"."access_requests" USING "btree" ("status");



CREATE INDEX "idx_access_requests_trip_id" ON "public"."access_requests" USING "btree" ("trip_id");



CREATE INDEX "idx_access_requests_user_id" ON "public"."access_requests" USING "btree" ("user_id");



CREATE INDEX "idx_activity_history_item" ON "public"."user_activity_history" USING "btree" ("item_id");



CREATE INDEX "idx_activity_history_user" ON "public"."user_activity_history" USING "btree" ("user_id", "created_at");



CREATE INDEX "idx_albums_user_id" ON "public"."albums" USING "btree" ("user_id");



CREATE INDEX "idx_budget_items_paid_by" ON "public"."budget_items" USING "btree" ("paid_by");



CREATE INDEX "idx_budget_items_trip_id" ON "public"."budget_items" USING "btree" ("trip_id");



CREATE INDEX "idx_collaborative_notes_created_by" ON "public"."collaborative_notes" USING "btree" ("created_by");



CREATE INDEX "idx_collaborative_notes_trip_id" ON "public"."collaborative_notes" USING "btree" ("trip_id");



CREATE INDEX "idx_content_slugs_lookup" ON "public"."content_slugs" USING "btree" ("content_type", "slug");



CREATE INDEX "idx_customizations_lookup" ON "public"."content_customizations" USING "btree" ("item_id", "user_id");



CREATE INDEX "idx_destination_tags_destination_id" ON "public"."destination_tags" USING "btree" ("destination_id");



CREATE INDEX "idx_destination_tags_tag_id" ON "public"."destination_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_destinations_city" ON "public"."destinations" USING "btree" ("city");



CREATE INDEX "idx_destinations_continent" ON "public"."destinations" USING "btree" ("continent");



CREATE INDEX "idx_destinations_coordinates" ON "public"."destinations" USING "btree" ("latitude", "longitude");



CREATE INDEX "idx_destinations_country" ON "public"."destinations" USING "btree" ("country");



CREATE INDEX "idx_expenses_category" ON "public"."expenses" USING "btree" ("category");



CREATE INDEX "idx_expenses_date" ON "public"."expenses" USING "btree" ("date");



CREATE INDEX "idx_expenses_paid_by" ON "public"."expenses" USING "btree" ("paid_by");



CREATE INDEX "idx_expenses_trip_id" ON "public"."expenses" USING "btree" ("trip_id");



CREATE INDEX "idx_focus_sessions_active" ON "public"."focus_sessions" USING "btree" ("active");



CREATE INDEX "idx_focus_sessions_trip_id" ON "public"."focus_sessions" USING "btree" ("trip_id");



CREATE INDEX "idx_items_share_status" ON "public"."itinerary_items" USING "btree" ("share_status");



CREATE INDEX "idx_itinerary_item_votes_item_id" ON "public"."itinerary_item_votes" USING "btree" ("itinerary_item_id");



CREATE INDEX "idx_itinerary_item_votes_user_id" ON "public"."itinerary_item_votes" USING "btree" ("user_id");



CREATE INDEX "idx_itinerary_items_category" ON "public"."itinerary_items" USING "btree" ("category");



CREATE INDEX "idx_itinerary_items_content_layer" ON "public"."itinerary_items" USING "btree" ("content_layer");



CREATE INDEX "idx_itinerary_items_coordinates" ON "public"."itinerary_items" USING "btree" ("latitude", "longitude");



CREATE INDEX "idx_itinerary_items_created_by" ON "public"."itinerary_items" USING "btree" ("created_by");



CREATE INDEX "idx_itinerary_items_date" ON "public"."itinerary_items" USING "btree" ("date");



CREATE INDEX "idx_itinerary_items_day" ON "public"."itinerary_items" USING "btree" ("day");



CREATE INDEX "idx_itinerary_items_day_number" ON "public"."itinerary_items" USING "btree" ("day_number");



CREATE INDEX "idx_itinerary_items_day_position" ON "public"."itinerary_items" USING "btree" ("trip_id", "day_number", "position");



CREATE INDEX "idx_itinerary_items_item_type" ON "public"."itinerary_items" USING "btree" ("item_type");



CREATE INDEX "idx_itinerary_items_original_id" ON "public"."itinerary_items" USING "btree" ("original_id");



CREATE INDEX "idx_itinerary_items_position" ON "public"."itinerary_items" USING "btree" ("position");



CREATE INDEX "idx_itinerary_items_section_id" ON "public"."itinerary_items" USING "btree" ("section_id");



CREATE INDEX "idx_itinerary_items_seo" ON "public"."itinerary_items" USING "btree" ("seo_title", "canonical_url");



CREATE INDEX "idx_itinerary_items_slug" ON "public"."itinerary_items" USING "btree" ("slug");



CREATE INDEX "idx_itinerary_items_start_time" ON "public"."itinerary_items" USING "btree" ("start_time");



CREATE INDEX "idx_itinerary_items_status" ON "public"."itinerary_items" USING "btree" ("status");



CREATE INDEX "idx_itinerary_items_trip_day_pos" ON "public"."itinerary_items" USING "btree" ("trip_id", "day_number", "section_id", "position");



CREATE INDEX "idx_itinerary_items_trip_id" ON "public"."itinerary_items" USING "btree" ("trip_id");



CREATE INDEX "idx_itinerary_sections_date" ON "public"."itinerary_sections" USING "btree" ("date");



CREATE INDEX "idx_itinerary_sections_day_number" ON "public"."itinerary_sections" USING "btree" ("day_number");



CREATE INDEX "idx_itinerary_sections_position" ON "public"."itinerary_sections" USING "btree" ("position");



CREATE INDEX "idx_itinerary_sections_trip_id" ON "public"."itinerary_sections" USING "btree" ("trip_id");



CREATE INDEX "idx_itinerary_template_items_day_order" ON "public"."itinerary_template_items" USING "btree" ("template_id", "day", "item_order");



CREATE INDEX "idx_itinerary_template_items_place_id" ON "public"."itinerary_template_items" USING "btree" ("place_id");



CREATE INDEX "idx_itinerary_template_items_section_id" ON "public"."itinerary_template_items" USING "btree" ("section_id");



CREATE INDEX "idx_itinerary_template_items_template_id" ON "public"."itinerary_template_items" USING "btree" ("template_id");



CREATE INDEX "idx_itinerary_template_sections_template_id" ON "public"."itinerary_template_sections" USING "btree" ("template_id");



CREATE INDEX "idx_itinerary_templates_created_by" ON "public"."itinerary_templates" USING "btree" ("created_by");



CREATE INDEX "idx_itinerary_templates_destination_id" ON "public"."itinerary_templates" USING "btree" ("destination_id");



CREATE INDEX "idx_itinerary_templates_slug" ON "public"."itinerary_templates" USING "btree" ("slug");



CREATE INDEX "idx_note_tags_note_id" ON "public"."note_tags" USING "btree" ("note_id");



CREATE INDEX "idx_note_tags_tag_id" ON "public"."note_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_read" ON "public"."notifications" USING "btree" ("read");



CREATE INDEX "idx_notifications_trip_id" ON "public"."notifications" USING "btree" ("trip_id");



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_places_category" ON "public"."places" USING "btree" ("category");



CREATE INDEX "idx_places_destination" ON "public"."places" USING "btree" ("destination_id");



CREATE INDEX "idx_places_source" ON "public"."places" USING "btree" ("source", "source_id");



CREATE INDEX "idx_places_tags" ON "public"."places" USING "gin" ("tags");



CREATE INDEX "idx_popularity_metrics_trending" ON "public"."item_popularity_metrics" USING "btree" ("trending_score" DESC);



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_profiles_username" ON "public"."profiles" USING "btree" ("username");



CREATE INDEX "idx_quality_metrics_scores" ON "public"."content_quality_metrics" USING "btree" ("quality_score", "engagement_score", "popularity_score");



CREATE INDEX "idx_sharing_history_trips" ON "public"."content_sharing_history" USING "btree" ("source_trip_id", "target_trip_id");



CREATE INDEX "idx_tags_slug" ON "public"."tags" USING "btree" ("slug");



CREATE INDEX "idx_trip_comment_likes_commentid" ON "public"."trip_comment_likes" USING "btree" ("comment_id");



CREATE INDEX "idx_trip_comment_likes_userid" ON "public"."trip_comment_likes" USING "btree" ("user_id");



CREATE INDEX "idx_trip_history_action_type" ON "public"."trip_history" USING "btree" ("action_type");



CREATE INDEX "idx_trip_history_created_at" ON "public"."trip_history" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_trip_history_trip_id" ON "public"."trip_history" USING "btree" ("trip_id");



CREATE INDEX "idx_trip_history_user_id" ON "public"."trip_history" USING "btree" ("user_id");



CREATE INDEX "idx_trip_item_comments_tripid_itemid" ON "public"."trip_item_comments" USING "btree" ("trip_id", "item_id");



CREATE INDEX "idx_trip_item_comments_userid" ON "public"."trip_item_comments" USING "btree" ("user_id");



CREATE INDEX "idx_trip_members_role" ON "public"."trip_members" USING "btree" ("role");



CREATE INDEX "idx_trip_members_trip_id" ON "public"."trip_members" USING "btree" ("trip_id");



CREATE INDEX "idx_trip_members_user_id" ON "public"."trip_members" USING "btree" ("user_id");



CREATE INDEX "idx_trip_notes_trip_id" ON "public"."trip_notes" USING "btree" ("trip_id");



CREATE INDEX "idx_trip_notes_updated_by" ON "public"."trip_notes" USING "btree" ("updated_by");



CREATE INDEX "idx_trip_notes_user_id" ON "public"."trip_notes" USING "btree" ("user_id");



CREATE INDEX "idx_trip_tags_tag_id" ON "public"."trip_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_trip_tags_trip_id" ON "public"."trip_tags" USING "btree" ("trip_id");



CREATE INDEX "idx_trips_created_by" ON "public"."trips" USING "btree" ("created_by");



CREATE INDEX "idx_trips_destination_id" ON "public"."trips" USING "btree" ("destination_id");



CREATE INDEX "idx_trips_is_public" ON "public"."trips" USING "btree" ("is_public");



CREATE INDEX "idx_trips_privacy_setting" ON "public"."trips" USING "btree" ("privacy_setting") WHERE ("privacy_setting" = ANY (ARRAY['shared_with_link'::"public"."trip_privacy_setting", 'public'::"public"."trip_privacy_setting"]));



CREATE INDEX "idx_trips_slug" ON "public"."trips" USING "btree" ("slug");



CREATE INDEX "idx_trips_splitwise_group_id" ON "public"."trips" USING "btree" ("splitwise_group_id");



CREATE INDEX "idx_trips_status" ON "public"."trips" USING "btree" ("status");



CREATE INDEX "idx_user_interactions_destination_id" ON "public"."user_interactions" USING "btree" ("destination_id");



CREATE INDEX "idx_user_interactions_type" ON "public"."user_interactions" USING "btree" ("interaction_type");



CREATE INDEX "idx_user_interactions_user_id" ON "public"."user_interactions" USING "btree" ("user_id");



CREATE INDEX "idx_user_interests_tag_id" ON "public"."user_interests" USING "btree" ("tag_id");



CREATE INDEX "idx_user_interests_user_id" ON "public"."user_interests" USING "btree" ("user_id");



CREATE INDEX "idx_user_login_history_login_at" ON "public"."user_login_history" USING "btree" ("login_at");



CREATE INDEX "idx_user_login_history_user_id" ON "public"."user_login_history" USING "btree" ("user_id");



CREATE INDEX "idx_user_prefs_lookup" ON "public"."user_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_votes_itinerary_item" ON "public"."votes" USING "btree" ("itinerary_item_id");



CREATE INDEX "idx_votes_user" ON "public"."votes" USING "btree" ("user_id");



CREATE UNIQUE INDEX "image_metadata_entity_idx" ON "public"."image_metadata" USING "btree" ("entity_id", "entity_type");



CREATE INDEX "likes_item_id_idx" ON "public"."likes" USING "btree" ("item_id");



CREATE INDEX "likes_item_type_idx" ON "public"."likes" USING "btree" ("item_type");



CREATE INDEX "likes_user_id_idx" ON "public"."likes" USING "btree" ("user_id");



CREATE INDEX "trip_logistics_trip_id_idx" ON "public"."trip_logistics" USING "btree" ("trip_id");



CREATE INDEX "trip_logistics_type_idx" ON "public"."trip_logistics" USING "btree" ("type");



CREATE OR REPLACE TRIGGER "after_user_interaction" AFTER INSERT ON "public"."user_interactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_profile_from_interaction"();



CREATE OR REPLACE TRIGGER "create_quality_metrics" AFTER INSERT ON "public"."itinerary_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_quality_metrics"();



CREATE OR REPLACE TRIGGER "focus_session_history" AFTER INSERT ON "public"."focus_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."add_trip_history_entry"();



CREATE OR REPLACE TRIGGER "handle_updated_at_itinerary_item_votes" BEFORE UPDATE ON "public"."itinerary_item_votes" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"();



CREATE OR REPLACE TRIGGER "history_notification_trigger" AFTER INSERT ON "public"."trip_history" FOR EACH ROW WHEN (("new"."user_id" IS NOT NULL)) EXECUTE FUNCTION "public"."create_notification_from_history"();



CREATE OR REPLACE TRIGGER "itinerary_item_history" AFTER INSERT OR DELETE OR UPDATE ON "public"."itinerary_items" FOR EACH ROW EXECUTE FUNCTION "public"."add_trip_history_entry"();



CREATE OR REPLACE TRIGGER "maintain_seo_fields" BEFORE INSERT OR UPDATE ON "public"."itinerary_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_canonical_url"();



CREATE OR REPLACE TRIGGER "set_notification_preferences_timestamp" BEFORE UPDATE ON "public"."notification_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."destinations" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."itinerary_items" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."trips" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "set_trip_logistics_updated_at" BEFORE UPDATE ON "public"."trip_logistics" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at_trip_item_comments" BEFORE UPDATE ON "public"."trip_item_comments" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "trg_decrement_travelers" AFTER DELETE ON "public"."user_travel" FOR EACH ROW EXECUTE FUNCTION "public"."decrement_travelers_count"();



CREATE OR REPLACE TRIGGER "trg_increment_travelers" AFTER INSERT ON "public"."user_travel" FOR EACH ROW EXECUTE FUNCTION "public"."increment_travelers_count"();



CREATE OR REPLACE TRIGGER "trip_comment_history" AFTER INSERT OR DELETE OR UPDATE ON "public"."trip_item_comments" FOR EACH ROW EXECUTE FUNCTION "public"."add_trip_history_entry"();



CREATE OR REPLACE TRIGGER "trip_member_history" AFTER INSERT OR DELETE OR UPDATE ON "public"."trip_members" FOR EACH ROW EXECUTE FUNCTION "public"."add_trip_history_entry"();



CREATE OR REPLACE TRIGGER "trip_vote_history" AFTER INSERT ON "public"."trip_votes" FOR EACH ROW EXECUTE FUNCTION "public"."add_trip_history_entry"();



CREATE OR REPLACE TRIGGER "update_access_requests_updated_at" BEFORE UPDATE ON "public"."access_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_access_requests_updated_at"();



CREATE OR REPLACE TRIGGER "update_budget_items_updated_at" BEFORE UPDATE ON "public"."budget_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_collaborative_notes_metadata" BEFORE UPDATE ON "public"."collaborative_notes" FOR EACH ROW WHEN (("old".* IS DISTINCT FROM "new".*)) EXECUTE FUNCTION "public"."update_collaborative_notes_metadata"();



CREATE OR REPLACE TRIGGER "update_image_metadata_updated_at" BEFORE UPDATE ON "public"."image_metadata" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_likes_updated_at" BEFORE UPDATE ON "public"."likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_likes_updated_at"();



CREATE OR REPLACE TRIGGER "update_trip_duration" BEFORE INSERT OR UPDATE OF "start_date", "end_date" ON "public"."trips" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_trip_duration"();



CREATE OR REPLACE TRIGGER "update_trip_last_viewed" AFTER UPDATE OF "last_viewed_at" ON "public"."trip_members" FOR EACH ROW WHEN (("old"."last_viewed_at" IS DISTINCT FROM "new"."last_viewed_at")) EXECUTE FUNCTION "public"."update_trip_last_accessed"();



CREATE OR REPLACE TRIGGER "update_trips_timestamp" BEFORE UPDATE ON "public"."trips" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "validate_image_metadata_entity" BEFORE INSERT OR UPDATE ON "public"."image_metadata" FOR EACH ROW EXECUTE FUNCTION "public"."validate_image_metadata_entity"();



ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "access_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "access_requests_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "access_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."albums"
    ADD CONSTRAINT "albums_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."budget_items"
    ADD CONSTRAINT "budget_items_paid_by_fkey" FOREIGN KEY ("paid_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."budget_items"
    ADD CONSTRAINT "budget_items_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborative_notes"
    ADD CONSTRAINT "collaborative_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborative_notes"
    ADD CONSTRAINT "collaborative_notes_last_edited_by_fkey" FOREIGN KEY ("last_edited_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."collaborative_notes"
    ADD CONSTRAINT "collaborative_notes_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_customizations"
    ADD CONSTRAINT "content_customizations_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."itinerary_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_customizations"
    ADD CONSTRAINT "content_customizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_quality_metrics"
    ADD CONSTRAINT "content_quality_metrics_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."itinerary_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_quality_metrics"
    ADD CONSTRAINT "content_quality_metrics_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_sharing_history"
    ADD CONSTRAINT "content_sharing_history_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."itinerary_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_sharing_history"
    ADD CONSTRAINT "content_sharing_history_shared_by_fkey" FOREIGN KEY ("shared_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."content_sharing_history"
    ADD CONSTRAINT "content_sharing_history_source_trip_id_fkey" FOREIGN KEY ("source_trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_sharing_history"
    ADD CONSTRAINT "content_sharing_history_target_trip_id_fkey" FOREIGN KEY ("target_trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_slugs"
    ADD CONSTRAINT "content_slugs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."destination_tags"
    ADD CONSTRAINT "destination_tags_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."destination_tags"
    ADD CONSTRAINT "destination_tags_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."destination_tags"
    ADD CONSTRAINT "destination_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."itinerary_items"
    ADD CONSTRAINT "fk_itinerary_items_creator" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."itinerary_items"
    ADD CONSTRAINT "fk_itinerary_items_place" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."itinerary_items"
    ADD CONSTRAINT "fk_itinerary_items_trip" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."itinerary_template_items"
    ADD CONSTRAINT "fk_itinerary_template_items_place_id" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."itinerary_template_items"
    ADD CONSTRAINT "fk_itinerary_template_items_section_id" FOREIGN KEY ("section_id") REFERENCES "public"."itinerary_template_sections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."itinerary_template_items"
    ADD CONSTRAINT "fk_itinerary_template_items_template_id" FOREIGN KEY ("template_id") REFERENCES "public"."itinerary_templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."focus_sessions"
    ADD CONSTRAINT "focus_sessions_initiated_by_fkey" FOREIGN KEY ("initiated_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."focus_sessions"
    ADD CONSTRAINT "focus_sessions_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."item_popularity_metrics"
    ADD CONSTRAINT "item_popularity_metrics_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."itinerary_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."itinerary_item_votes"
    ADD CONSTRAINT "itinerary_item_votes_itinerary_item_id_fkey" FOREIGN KEY ("itinerary_item_id") REFERENCES "public"."itinerary_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."itinerary_item_votes"
    ADD CONSTRAINT "itinerary_item_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."itinerary_items"
    ADD CONSTRAINT "itinerary_items_last_modified_by_fkey" FOREIGN KEY ("last_modified_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."itinerary_items"
    ADD CONSTRAINT "itinerary_items_original_id_fkey" FOREIGN KEY ("original_id") REFERENCES "public"."itinerary_items"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."itinerary_items"
    ADD CONSTRAINT "itinerary_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."itinerary_sections"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."itinerary_items"
    ADD CONSTRAINT "itinerary_items_source_trip_id_fkey" FOREIGN KEY ("source_trip_id") REFERENCES "public"."trips"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."itinerary_items"
    ADD CONSTRAINT "itinerary_items_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."itinerary_sections"
    ADD CONSTRAINT "itinerary_sections_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."itinerary_template_sections"
    ADD CONSTRAINT "itinerary_template_sections_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."itinerary_templates"("id");



ALTER TABLE ONLY "public"."itinerary_templates"
    ADD CONSTRAINT "itinerary_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."itinerary_templates"
    ADD CONSTRAINT "itinerary_templates_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id");



ALTER TABLE ONLY "public"."itinerary_templates"
    ADD CONSTRAINT "itinerary_templates_source_trip_id_fkey" FOREIGN KEY ("source_trip_id") REFERENCES "public"."trips"("id");



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."note_tags"
    ADD CONSTRAINT "note_tags_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "public"."trip_notes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."note_tags"
    ADD CONSTRAINT "note_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_suggested_by_fkey" FOREIGN KEY ("suggested_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_home_location_id_fkey" FOREIGN KEY ("home_location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."template_applications"
    ADD CONSTRAINT "template_applications_applied_by_fkey" FOREIGN KEY ("applied_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."template_applications"
    ADD CONSTRAINT "template_applications_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."itinerary_templates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."template_applications"
    ADD CONSTRAINT "template_applications_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_comment_likes"
    ADD CONSTRAINT "trip_comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."trip_item_comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_comment_likes"
    ADD CONSTRAINT "trip_comment_likes_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_comment_likes"
    ADD CONSTRAINT "trip_comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_history"
    ADD CONSTRAINT "trip_history_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_history"
    ADD CONSTRAINT "trip_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trip_images"
    ADD CONSTRAINT "trip_images_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trip_images"
    ADD CONSTRAINT "trip_images_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."trip_images"
    ADD CONSTRAINT "trip_images_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_item_comments"
    ADD CONSTRAINT "trip_item_comments_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_item_comments"
    ADD CONSTRAINT "trip_item_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_logistics"
    ADD CONSTRAINT "trip_logistics_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."trip_logistics"
    ADD CONSTRAINT "trip_logistics_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_members"
    ADD CONSTRAINT "trip_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."trip_members"
    ADD CONSTRAINT "trip_members_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_notes"
    ADD CONSTRAINT "trip_notes_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trip_notes"
    ADD CONSTRAINT "trip_notes_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_notes"
    ADD CONSTRAINT "trip_notes_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."trip_notes"
    ADD CONSTRAINT "trip_notes_updated_by_fkey1" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."trip_notes"
    ADD CONSTRAINT "trip_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trip_tags"
    ADD CONSTRAINT "trip_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_tags"
    ADD CONSTRAINT "trip_tags_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_template_uses"
    ADD CONSTRAINT "trip_template_uses_applied_by_fkey" FOREIGN KEY ("applied_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."trip_template_uses"
    ADD CONSTRAINT "trip_template_uses_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."itinerary_templates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trip_template_uses"
    ADD CONSTRAINT "trip_template_uses_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_vote_options"
    ADD CONSTRAINT "trip_vote_options_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "public"."trip_vote_polls"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_vote_polls"
    ADD CONSTRAINT "trip_vote_polls_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."trip_vote_polls"
    ADD CONSTRAINT "trip_vote_polls_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_votes"
    ADD CONSTRAINT "trip_votes_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."trip_vote_options"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_votes"
    ADD CONSTRAINT "trip_votes_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "public"."trip_vote_polls"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_votes"
    ADD CONSTRAINT "trip_votes_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_votes"
    ADD CONSTRAINT "trip_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_activity_history"
    ADD CONSTRAINT "user_activity_history_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."itinerary_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_activity_history"
    ADD CONSTRAINT "user_activity_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_interactions"
    ADD CONSTRAINT "user_interactions_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id");



ALTER TABLE ONLY "public"."user_interactions"
    ADD CONSTRAINT "user_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_interests"
    ADD CONSTRAINT "user_interests_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_interests"
    ADD CONSTRAINT "user_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_login_history"
    ADD CONSTRAINT "user_login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_suggested_tags"
    ADD CONSTRAINT "user_suggested_tags_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id");



ALTER TABLE ONLY "public"."user_suggested_tags"
    ADD CONSTRAINT "user_suggested_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_travel"
    ADD CONSTRAINT "user_travel_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_travel"
    ADD CONSTRAINT "user_travel_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."validation_logs"
    ADD CONSTRAINT "validation_logs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."itinerary_templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."validation_logs"
    ADD CONSTRAINT "validation_logs_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."validation_logs"
    ADD CONSTRAINT "validation_logs_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_itinerary_item_id_fkey" FOREIGN KEY ("itinerary_item_id") REFERENCES "public"."itinerary_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins and owners can edit items" ON "public"."itinerary_items" FOR UPDATE USING ((("auth"."uid"() = "created_by") OR ("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "itinerary_items"."trip_id") AND ("trip_members"."role" = 'admin'::"public"."trip_role"))))));



CREATE POLICY "Admins can view all tag suggestions" ON "public"."user_suggested_tags" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Allow admin delete access" ON "public"."trips" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "trips"."id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'admin'::"public"."trip_role")))));



CREATE POLICY "Allow admin users to insert destinations" ON "public"."destinations" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Allow admin/editor to manage members" ON "public"."trip_members" USING ("public"."can_manage_trip_members"("trip_id")) WITH CHECK ("public"."can_manage_trip_members"("trip_id"));



CREATE POLICY "Allow admin/editor update access" ON "public"."trips" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "trips"."id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "trips"."id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role"))))));



CREATE POLICY "Allow admins to delete notes" ON "public"."trip_notes" FOR DELETE USING ("public"."is_trip_member_with_role"("trip_id", "auth"."uid"(), ARRAY['admin'::"text"]));



CREATE POLICY "Allow admins to delete tags" ON "public"."tags" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Allow admins to update tags" ON "public"."tags" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Allow admins/editors to manage sections" ON "public"."itinerary_sections" USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "itinerary_sections"."trip_id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "itinerary_sections"."trip_id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role"))))));



CREATE POLICY "Allow admins/editors to manage trip tags" ON "public"."trip_tags" USING ("public"."can_manage_trip_members"("trip_id")) WITH CHECK ("public"."can_manage_trip_members"("trip_id"));



CREATE POLICY "Allow all users to view published templates" ON "public"."itinerary_templates" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Allow authenticated users to create templates" ON "public"."itinerary_templates" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("created_by" = "auth"."uid"())));



CREATE POLICY "Allow authenticated users to insert destinations" ON "public"."destinations" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to insert requests for themselves" ON "public"."permission_requests" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "user_id")));



CREATE POLICY "Allow authenticated users to insert tags" ON "public"."tags" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to manage trips" ON "public"."trips" TO "authenticated" USING ((("auth"."uid"() = "created_by") OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trips"."id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = 'admin'::"public"."trip_role"))))));



CREATE POLICY "Allow authenticated users to read destinations" ON "public"."destinations" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read tags" ON "public"."tags" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to suggest new manual places" ON "public"."places" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("suggested_by" = "auth"."uid"()) AND ("is_verified" = false) AND ("source" IS NULL) AND ("source_id" IS NULL)));



CREATE POLICY "Allow authenticated users to suggest new places" ON "public"."places" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("suggested_by" = "auth"."uid"()) AND ("is_verified" = false)));



CREATE POLICY "Allow authenticated users to view relevant places" ON "public"."places" FOR SELECT USING ((("is_verified" = true) OR ("suggested_by" = "auth"."uid"()) OR ("source" IS NOT NULL)));



CREATE POLICY "Allow authenticated users to view verified places" ON "public"."places" FOR SELECT USING ((("is_verified" = true) OR ("suggested_by" = "auth"."uid"())));



CREATE POLICY "Allow contributors and up to insert notes" ON "public"."trip_notes" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND ("public"."has_trip_role"("trip_id", "auth"."uid"(), 'admin'::"public"."trip_role") OR "public"."has_trip_role"("trip_id", "auth"."uid"(), 'editor'::"public"."trip_role") OR "public"."has_trip_role"("trip_id", "auth"."uid"(), 'contributor'::"public"."trip_role"))));



CREATE POLICY "Allow contributors to manage itinerary items" ON "public"."itinerary_items" USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "itinerary_items"."trip_id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role") OR ("tm"."role" = 'contributor'::"public"."trip_role")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "itinerary_items"."trip_id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role") OR ("tm"."role" = 'contributor'::"public"."trip_role"))))));



CREATE POLICY "Allow creator full access" ON "public"."trips" USING (("auth"."uid"() = "created_by")) WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Allow creators to update their own templates" ON "public"."itinerary_templates" FOR UPDATE USING (("created_by" = "auth"."uid"())) WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Allow creators to view their own unpublished templates" ON "public"."itinerary_templates" FOR SELECT USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Allow delete access for admins only" ON "public"."trips" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm_check"
  WHERE (("tm_check"."trip_id" = "trips"."id") AND ("tm_check"."user_id" = "auth"."uid"()) AND ("tm_check"."role" = 'admin'::"public"."trip_role")))));



CREATE POLICY "Allow delete by admins/editors or requester" ON "public"."permission_requests" FOR DELETE USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() IN ( SELECT "tm"."user_id"
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "permission_requests"."trip_id") AND ("tm"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])))))));



CREATE POLICY "Allow delete on user_travel" ON "public"."user_travel" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow editors and up to delete any notes" ON "public"."trip_notes" FOR DELETE USING (("public"."has_trip_role"("trip_id", "auth"."uid"(), 'admin'::"public"."trip_role") OR "public"."has_trip_role"("trip_id", "auth"."uid"(), 'editor'::"public"."trip_role")));



CREATE POLICY "Allow editors and up to update any notes" ON "public"."trip_notes" FOR UPDATE USING (("public"."has_trip_role"("trip_id", "auth"."uid"(), 'admin'::"public"."trip_role") OR "public"."has_trip_role"("trip_id", "auth"."uid"(), 'editor'::"public"."trip_role")));



CREATE POLICY "Allow editors/admins or last updater to update notes" ON "public"."trip_notes" FOR UPDATE USING (("public"."is_trip_member_with_role"("trip_id", "auth"."uid"(), ARRAY['admin'::"text", 'editor'::"text"]) OR ("updated_by" = "auth"."uid"()))) WITH CHECK (("public"."is_trip_member_with_role"("trip_id", "auth"."uid"(), ARRAY['admin'::"text", 'editor'::"text"]) OR ("updated_by" = "auth"."uid"())));



CREATE POLICY "Allow editors/admins to create notes" ON "public"."trip_notes" FOR INSERT WITH CHECK ("public"."is_trip_member_with_role"("trip_id", "auth"."uid"(), ARRAY['admin'::"text", 'editor'::"text"]));



CREATE POLICY "Allow editors/admins to insert notes for their trip" ON "public"."trip_notes" FOR INSERT WITH CHECK ((("updated_by" = "auth"."uid"()) AND ("trip_id" IN ( SELECT "tm"."trip_id"
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = ANY (ARRAY['editor'::"public"."trip_role", 'admin'::"public"."trip_role"])))))));



CREATE POLICY "Allow editors/admins to manage items in accessible sections or " ON "public"."itinerary_items" USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."user_id" = "auth"."uid"()) AND ("tm"."trip_id" = "itinerary_items"."trip_id") AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."user_id" = "auth"."uid"()) AND ("tm"."trip_id" = "itinerary_items"."trip_id") AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role")) AND (("itinerary_items"."section_id" IS NULL) OR (EXISTS ( SELECT 1
           FROM "public"."itinerary_sections" "s"
          WHERE ("s"."id" = "itinerary_items"."section_id"))))))));



CREATE POLICY "Allow editors/admins to manage note tags" ON "public"."note_tags" USING ((EXISTS ( SELECT 1
   FROM "public"."trip_notes" "tn"
  WHERE (("tn"."id" = "note_tags"."note_id") AND "public"."is_trip_member_with_role"("tn"."trip_id", "auth"."uid"(), ARRAY['admin'::"text", 'editor'::"text"]))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_notes" "tn"
  WHERE (("tn"."id" = "note_tags"."note_id") AND "public"."is_trip_member_with_role"("tn"."trip_id", "auth"."uid"(), ARRAY['admin'::"text", 'editor'::"text"])))));



CREATE POLICY "Allow editors/admins to manage their trip sections" ON "public"."itinerary_sections" USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "itinerary_sections"."trip_id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "itinerary_sections"."trip_id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role"))))));



CREATE POLICY "Allow editors/admins to update notes for their trip" ON "public"."trip_notes" FOR UPDATE USING (("trip_id" IN ( SELECT "tm"."trip_id"
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = ANY (ARRAY['editor'::"public"."trip_role", 'admin'::"public"."trip_role"])))))) WITH CHECK ((("updated_by" = "auth"."uid"()) AND ("trip_id" IN ( SELECT "tm"."trip_id"
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = ANY (ARRAY['editor'::"public"."trip_role", 'admin'::"public"."trip_role"])))))));



CREATE POLICY "Allow individual user read access" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Allow individual user select access" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Allow individual user update access" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Allow insert access for authenticated users" ON "public"."trips" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow insert on user_travel" ON "public"."user_travel" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow insert/delete for trip admins/editors" ON "public"."trip_tags" USING (("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_tags"."trip_id") AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])))))) WITH CHECK (("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_tags"."trip_id") AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"]))))));



CREATE POLICY "Allow member read access" ON "public"."trips" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow members to delete their own vote" ON "public"."votes" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow members to delete their own votes" ON "public"."itinerary_item_votes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow members to insert budget items for their trips" ON "public"."budget_items" FOR INSERT WITH CHECK (("trip_id" IN ( SELECT "trip_members"."trip_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Allow members to insert their own votes" ON "public"."itinerary_item_votes" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM ("public"."itinerary_items" "ii"
     JOIN "public"."trip_members" "tm" ON (("ii"."trip_id" = "tm"."trip_id")))
  WHERE (("ii"."id" = "itinerary_item_votes"."itinerary_item_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."joined_at" IS NOT NULL))))));



CREATE POLICY "Allow members to insert/update their own vote" ON "public"."votes" USING (("user_id" = "auth"."uid"())) WITH CHECK ((("user_id" = "auth"."uid"()) AND ("itinerary_item_id" IN ( SELECT "itinerary_items"."id"
   FROM "public"."itinerary_items"
  WHERE ("itinerary_items"."trip_id" IN ( SELECT "trip_members"."trip_id"
           FROM "public"."trip_members"
          WHERE ("trip_members"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Allow members to manage own votes" ON "public"."votes" USING ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM ("public"."trip_members" "tm"
     JOIN "public"."itinerary_items" "ii" ON (("tm"."trip_id" = "ii"."trip_id")))
  WHERE (("ii"."id" = "votes"."itinerary_item_id") AND ("tm"."user_id" = "auth"."uid"())))))) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow members to read budget items for their trips" ON "public"."budget_items" FOR SELECT USING (("trip_id" IN ( SELECT "trip_members"."trip_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Allow members to read trip history" ON "public"."trip_history" FOR SELECT USING (("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."trip_id" = "trip_history"."trip_id"))));



CREATE POLICY "Allow members to update their own votes" ON "public"."itinerary_item_votes" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow members to view items in accessible sections or unschedul" ON "public"."itinerary_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."user_id" = "auth"."uid"()) AND ("tm"."trip_id" = "itinerary_items"."trip_id") AND (("itinerary_items"."section_id" IS NULL) OR (EXISTS ( SELECT 1
           FROM "public"."itinerary_sections" "s"
          WHERE ("s"."id" = "itinerary_items"."section_id"))))))));



CREATE POLICY "Allow members to view itinerary items" ON "public"."itinerary_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "itinerary_items"."trip_id") AND ("tm"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow members to view memberships of their trips" ON "public"."trip_members" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow members to view note tags" ON "public"."note_tags" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."trip_notes" "tn"
     JOIN "public"."trip_members" "tm" ON (("tn"."trip_id" = "tm"."trip_id")))
  WHERE (("tn"."id" = "note_tags"."note_id") AND ("tm"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow members to view notes for their trip" ON "public"."trip_notes" FOR SELECT USING (("trip_id" IN ( SELECT "tm"."trip_id"
   FROM "public"."trip_members" "tm"
  WHERE ("tm"."user_id" = "auth"."uid"()))));



CREATE POLICY "Allow members to view other members" ON "public"."trip_members" FOR SELECT USING ("public"."is_trip_member"("trip_id"));



CREATE POLICY "Allow members to view sections" ON "public"."itinerary_sections" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "itinerary_sections"."trip_id") AND ("tm"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow members to view their trip sections" ON "public"."itinerary_sections" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "itinerary_sections"."trip_id") AND ("tm"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow members to view their trip tags" ON "public"."trip_tags" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "trip_tags"."trip_id") AND ("tm"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow members to view trip notes" ON "public"."trip_notes" FOR SELECT USING ("public"."is_trip_member"("trip_id", "auth"."uid"()));



CREATE POLICY "Allow members to view votes on their trip items" ON "public"."votes" FOR SELECT USING (("itinerary_item_id" IN ( SELECT "itinerary_items"."id"
   FROM "public"."itinerary_items"
  WHERE ("itinerary_items"."trip_id" IN ( SELECT "trip_members"."trip_id"
           FROM "public"."trip_members"
          WHERE ("trip_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Allow modification access for admin/editor/contributor" ON "public"."itinerary_items" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "itinerary_items"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role", 'contributor'::"public"."trip_role"]))))));



CREATE POLICY "Allow modification by admin/editor/contributor" ON "public"."expenses" TO "authenticated" USING ("public"."is_trip_member"("trip_id", "auth"."uid"())) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm_check"
  WHERE (("tm_check"."trip_id" = "expenses"."trip_id") AND ("tm_check"."user_id" = "auth"."uid"()) AND ("tm_check"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role", 'contributor'::"public"."trip_role"]))))));



CREATE POLICY "Allow modification by admin/editor/contributor" ON "public"."trip_members" TO "authenticated" USING (true) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm_auth_check"
  WHERE (("tm_auth_check"."trip_id" = "trip_members"."trip_id") AND ("tm_auth_check"."user_id" = "auth"."uid"()) AND ("tm_auth_check"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role", 'contributor'::"public"."trip_role"]))))));



CREATE POLICY "Allow public read access" ON "public"."trips" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Allow public read access to destinations" ON "public"."destinations" FOR SELECT USING (true);



CREATE POLICY "Allow read access for members or if public" ON "public"."trips" FOR SELECT TO "authenticated" USING ((("is_public" = true) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "trips"."id") AND ("tm"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Allow read access for members or if trip public" ON "public"."itinerary_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "itinerary_items"."trip_id") AND (("trips"."is_public" = true) OR "public"."is_trip_member"("itinerary_items"."trip_id", "auth"."uid"()))))));



CREATE POLICY "Allow read access for trip members" ON "public"."expenses" FOR SELECT TO "authenticated" USING ("public"."is_trip_member"("trip_id", "auth"."uid"()));



CREATE POLICY "Allow select access for trip members or public trips" ON "public"."trip_tags" FOR SELECT USING ((( SELECT "trips"."is_public"
   FROM "public"."trips"
  WHERE ("trips"."id" = "trip_tags"."trip_id")) OR ("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."trip_id" = "trip_tags"."trip_id")))));



CREATE POLICY "Allow select for admins/editors and requesters" ON "public"."permission_requests" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() IN ( SELECT "tm"."user_id"
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "permission_requests"."trip_id") AND ("tm"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])))))));



CREATE POLICY "Allow select on user_travel" ON "public"."user_travel" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow self-delete (leave trip)" ON "public"."trip_members" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow trip admins delete access" ON "public"."trips" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "trips"."id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'admin'::"public"."trip_role")))));



CREATE POLICY "Allow trip admins or user to delete membership" ON "public"."trip_members" FOR DELETE TO "authenticated" USING (("public"."check_if_user_is_trip_member_with_role"("auth"."uid"(), "trip_id", ARRAY['admin'::"public"."trip_role"]) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "Allow trip admins or user to update membership" ON "public"."trip_members" FOR UPDATE TO "authenticated" USING (("public"."check_if_user_is_trip_member_with_role"("auth"."uid"(), "trip_id", ARRAY['admin'::"public"."trip_role"]) OR ("user_id" = "auth"."uid"()))) WITH CHECK ("public"."check_if_user_is_trip_member_with_role"("auth"."uid"(), "trip_id", ARRAY['admin'::"public"."trip_role"]));



CREATE POLICY "Allow trip admins/editors to update trips" ON "public"."trips" FOR UPDATE TO "authenticated" USING ("public"."check_if_user_is_trip_member_with_role"("auth"."uid"(), "id", ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])) WITH CHECK ("public"."check_if_user_is_trip_member_with_role"("auth"."uid"(), "id", ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"]));



CREATE POLICY "Allow trip admins/editors update access" ON "public"."trips" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "trips"."id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "trips"."id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role"))))));



CREATE POLICY "Allow trip members to view votes" ON "public"."itinerary_item_votes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."itinerary_items" "ii"
     JOIN "public"."trip_members" "tm" ON (("ii"."trip_id" = "tm"."trip_id")))
  WHERE (("ii"."id" = "itinerary_item_votes"."itinerary_item_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."joined_at" IS NOT NULL)))));



CREATE POLICY "Allow update access for admin/editor/contributor" ON "public"."trips" FOR UPDATE TO "authenticated" USING ((("is_public" = true) OR "public"."is_trip_member"("id", "auth"."uid"()))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm_check"
  WHERE (("tm_check"."trip_id" = "trips"."id") AND ("tm_check"."user_id" = "auth"."uid"()) AND ("tm_check"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role", 'contributor'::"public"."trip_role"]))))));



CREATE POLICY "Allow update by admins/editors" ON "public"."permission_requests" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "tm"."user_id"
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "permission_requests"."trip_id") AND ("tm"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])))))) WITH CHECK (("auth"."uid"() IN ( SELECT "tm"."user_id"
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "permission_requests"."trip_id") AND ("tm"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"]))))));



CREATE POLICY "Allow update on user_travel" ON "public"."user_travel" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow user to add themselves to a trip" ON "public"."trip_members" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow users to delete own notes" ON "public"."trip_notes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to delete their own budget items" ON "public"."budget_items" FOR DELETE USING ((("paid_by" = "auth"."uid"()) OR ("trip_id" IN ( SELECT "trip_members"."trip_id"
   FROM "public"."trip_members"
  WHERE (("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])))))));



CREATE POLICY "Allow users to update own notes" ON "public"."trip_notes" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update their own budget items" ON "public"."budget_items" FOR UPDATE USING ((("paid_by" = "auth"."uid"()) OR ("trip_id" IN ( SELECT "trip_members"."trip_id"
   FROM "public"."trip_members"
  WHERE (("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"]))))))) WITH CHECK ((("paid_by" = "auth"."uid"()) OR ("trip_id" IN ( SELECT "trip_members"."trip_id"
   FROM "public"."trip_members"
  WHERE (("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])))))));



CREATE POLICY "Content owners can manage slugs" ON "public"."content_slugs" USING (
CASE "content_type"
    WHEN 'trip'::"public"."content_type" THEN ("auth"."uid"() IN ( SELECT "trip_members"."user_id"
       FROM "public"."trip_members"
      WHERE (("trip_members"."trip_id" = "content_slugs"."content_id") AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])))))
    WHEN 'itinerary_item'::"public"."content_type" THEN ("auth"."uid"() IN ( SELECT "trip_members"."user_id"
       FROM "public"."trip_members"
      WHERE (("trip_members"."trip_id" = ( SELECT "itinerary_items"."trip_id"
               FROM "public"."itinerary_items"
              WHERE ("itinerary_items"."id" = "content_slugs"."content_id"))) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])))))
    ELSE ("auth"."uid"() = "created_by")
END);



CREATE POLICY "Destination tags are viewable by everyone" ON "public"."destination_tags" FOR SELECT USING (true);



CREATE POLICY "Destinations are viewable by everyone." ON "public"."destinations" FOR SELECT USING (true);



CREATE POLICY "Disallow delete access" ON "public"."profiles" AS RESTRICTIVE FOR DELETE TO "authenticated" USING (false);



CREATE POLICY "Disallow direct profile deletes" ON "public"."profiles" FOR DELETE USING (false);



CREATE POLICY "Disallow direct profile inserts" ON "public"."profiles" FOR INSERT WITH CHECK (false);



CREATE POLICY "Editors can update content quality metrics" ON "public"."content_quality_metrics" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "content_quality_metrics"."trip_id") AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"]))))));



CREATE POLICY "Everyone can view popularity metrics" ON "public"."item_popularity_metrics" FOR SELECT USING (true);



CREATE POLICY "Everyone can view preference weights" ON "public"."preference_weights" FOR SELECT USING (true);



CREATE POLICY "Only admins can create/update destination tags" ON "public"."destination_tags" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Only admins can manage preference weights" ON "public"."preference_weights" USING ((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."raw_user_meta_data" ->> 'is_admin'::"text") = 'true'::"text")))));



CREATE POLICY "Only admins can modify trip member roles" ON "public"."trip_members" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "trip_members"."trip_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'admin'::"public"."trip_role")))));



CREATE POLICY "Only system can insert login history" ON "public"."user_login_history" FOR INSERT WITH CHECK (true);



CREATE POLICY "Places are viewable by everyone." ON "public"."places" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Public read access to content quality metrics" ON "public"."content_quality_metrics" FOR SELECT USING (true);



CREATE POLICY "Public read access to content slugs" ON "public"."content_slugs" FOR SELECT USING (true);



CREATE POLICY "Public select on destinations" ON "public"."destinations" FOR SELECT USING (true);



CREATE POLICY "System can insert activity history" ON "public"."user_activity_history" FOR INSERT WITH CHECK (true);



CREATE POLICY "Tags are viewable by everyone" ON "public"."tags" FOR SELECT USING (true);



CREATE POLICY "Trip admin/editor/creator can update polls" ON "public"."trip_vote_polls" FOR UPDATE USING ((("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_vote_polls"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])))))));



CREATE POLICY "Trip admins and editors can create focus sessions" ON "public"."focus_sessions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "focus_sessions"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"]))))));



CREATE POLICY "Trip admins and editors can manage logistics" ON "public"."trip_logistics" USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_logistics"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"]))))));



CREATE POLICY "Trip admins and editors can update focus sessions" ON "public"."focus_sessions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "focus_sessions"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"]))))));



CREATE POLICY "Trip admins can update access requests" ON "public"."access_requests" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "access_requests"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = 'admin'::"public"."trip_role")))));



CREATE POLICY "Trip members (admin/editor) can delete collaborative notes" ON "public"."collaborative_notes" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "collaborative_notes"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND (("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])) OR ("auth"."uid"() = "collaborative_notes"."created_by"))))));



CREATE POLICY "Trip members can add comments" ON "public"."trip_item_comments" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_item_comments"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Trip members can create collaborative notes" ON "public"."collaborative_notes" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "collaborative_notes"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"())))) AND ("auth"."uid"() = "created_by")));



CREATE POLICY "Trip members can like comments" ON "public"."trip_comment_likes" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_comment_likes"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Trip members can update collaborative notes" ON "public"."collaborative_notes" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "collaborative_notes"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Trip members can view access requests for their trips" ON "public"."access_requests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "access_requests"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"]))))));



CREATE POLICY "Trip members can view collaborative notes" ON "public"."collaborative_notes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "collaborative_notes"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Trip members can view comments" ON "public"."trip_item_comments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_item_comments"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Trip members can view focus sessions" ON "public"."focus_sessions" FOR SELECT USING (("trip_id" IN ( SELECT "trip_members"."trip_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Trip members can view likes" ON "public"."trip_comment_likes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_comment_likes"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Trip members can view logistics" ON "public"."trip_logistics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_logistics"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Trip members can view options" ON "public"."trip_vote_options" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."trip_vote_polls"
     JOIN "public"."trip_members" ON (("trip_vote_polls"."trip_id" = "trip_members"."trip_id")))
  WHERE (("trip_vote_options"."poll_id" = "trip_vote_polls"."id") AND ("trip_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Trip members can view polls" ON "public"."trip_vote_polls" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_vote_polls"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Trip members can view votes" ON "public"."trip_votes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_votes"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Trip members can vote" ON "public"."trip_votes" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_votes"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Trip members with edit permissions can create options" ON "public"."trip_vote_options" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."trip_vote_polls"
     JOIN "public"."trip_members" ON (("trip_vote_polls"."trip_id" = "trip_members"."trip_id")))
  WHERE (("trip_vote_options"."poll_id" = "trip_vote_polls"."id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"]))))));



CREATE POLICY "Trip members with edit permissions can create polls" ON "public"."trip_vote_polls" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_vote_polls"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"]))))));



CREATE POLICY "Users can create access requests" ON "public"."access_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create sharing history for their trips" ON "public"."content_sharing_history" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."trip_id" = "content_sharing_history"."source_trip_id"))));



CREATE POLICY "Users can create tag suggestions" ON "public"."user_suggested_tags" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create template applications for their trips" ON "public"."template_applications" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."trip_id" = "template_applications"."trip_id"))));



CREATE POLICY "Users can create template uses for their trips" ON "public"."trip_template_uses" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."trip_id" = "trip_template_uses"."trip_id"))));



CREATE POLICY "Users can create their own customizations" ON "public"."content_customizations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own interactions" ON "public"."user_interactions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own likes" ON "public"."likes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create validation logs for their trips" ON "public"."validation_logs" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."trip_id" = "validation_logs"."trip_id"))));



CREATE POLICY "Users can delete their own comments" ON "public"."trip_item_comments" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own likes" ON "public"."likes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own votes" ON "public"."trip_votes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can manage their own interests" ON "public"."user_interests" TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own notification preferences" ON "public"."notification_preferences" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own preferences" ON "public"."user_preferences" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can unlike their own likes" ON "public"."trip_comment_likes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own comments" ON "public"."trip_item_comments" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own customizations" ON "public"."content_customizations" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own interactions" ON "public"."user_interactions" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own notification read status" ON "public"."notifications" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view public trips" ON "public"."trips" FOR SELECT USING (("privacy_setting" = 'public'::"public"."trip_privacy_setting"));



CREATE POLICY "Users can view sharing history for their trips" ON "public"."content_sharing_history" FOR SELECT USING (("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."trip_id" = "content_sharing_history"."source_trip_id")
UNION
 SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."trip_id" = "content_sharing_history"."target_trip_id"))));



CREATE POLICY "Users can view template applications for their trips" ON "public"."template_applications" FOR SELECT USING (("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."trip_id" = "template_applications"."trip_id"))));



CREATE POLICY "Users can view their own access requests" ON "public"."access_requests" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own activity history" ON "public"."user_activity_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own customizations" ON "public"."content_customizations" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ((NOT "is_private") AND ("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."trip_id" = ( SELECT "itinerary_items"."trip_id"
           FROM "public"."itinerary_items"
          WHERE ("itinerary_items"."id" = "content_customizations"."item_id"))))))));



CREATE POLICY "Users can view their own interactions" ON "public"."user_interactions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own interests" ON "public"."user_interests" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own likes" ON "public"."likes" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own login history" ON "public"."user_login_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own preferences" ON "public"."user_preferences" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own tag suggestions" ON "public"."user_suggested_tags" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own trip template uses" ON "public"."trip_template_uses" FOR SELECT USING (("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."trip_id" = "trip_template_uses"."trip_id"))));



CREATE POLICY "Users can view trips they are members of" ON "public"."trips" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_members"."id") AND ("trip_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view validation logs for their trips" ON "public"."validation_logs" FOR SELECT USING (("auth"."uid"() IN ( SELECT "trip_members"."user_id"
   FROM "public"."trip_members"
  WHERE ("trip_members"."trip_id" = "validation_logs"."trip_id"))));



ALTER TABLE "public"."access_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."budget_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaborative_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_customizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_quality_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_sharing_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_slugs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."destination_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."destinations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "expenses_delete_policy" ON "public"."expenses" FOR DELETE USING ((("paid_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "expenses"."trip_id") AND ("trips"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "expenses"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])))))));



CREATE POLICY "expenses_insert_policy" ON "public"."expenses" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "expenses"."trip_id") AND ("trips"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "expenses"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role", 'contributor'::"public"."trip_role"])))))));



CREATE POLICY "expenses_select_policy" ON "public"."expenses" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "expenses"."trip_id") AND ("trips"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "expenses"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "expenses_update_policy" ON "public"."expenses" FOR UPDATE USING ((("paid_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "expenses"."trip_id") AND ("trips"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "expenses"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])))))));



ALTER TABLE "public"."focus_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."image_metadata" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "image_metadata_insert_policy" ON "public"."image_metadata" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ((("entity_type" = 'user_avatar'::"public"."image_type") AND ("entity_id" = "auth"."uid"())) OR (("entity_type" = 'trip_cover'::"public"."image_type") AND (EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "image_metadata"."entity_id") AND ("trips"."created_by" = "auth"."uid"()))))) OR (("entity_type" = 'template_cover'::"public"."image_type") AND (EXISTS ( SELECT 1
   FROM "public"."itinerary_templates"
  WHERE (("itinerary_templates"."id" = "image_metadata"."entity_id") AND ("itinerary_templates"."created_by" = "auth"."uid"()))))))));



CREATE POLICY "image_metadata_select_policy" ON "public"."image_metadata" FOR SELECT USING (true);



CREATE POLICY "image_metadata_update_policy" ON "public"."image_metadata" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))) OR ((("entity_type" = 'user_avatar'::"public"."image_type") AND ("entity_id" = "auth"."uid"())) OR (("entity_type" = 'trip_cover'::"public"."image_type") AND (EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "image_metadata"."entity_id") AND ("trips"."created_by" = "auth"."uid"()))))) OR (("entity_type" = 'template_cover'::"public"."image_type") AND (EXISTS ( SELECT 1
   FROM "public"."itinerary_templates"
  WHERE (("itinerary_templates"."id" = "image_metadata"."entity_id") AND ("itinerary_templates"."created_by" = "auth"."uid"())))))))));



ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."item_popularity_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."itinerary_item_votes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "itinerary_item_votes_delete_policy" ON "public"."itinerary_item_votes" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "itinerary_item_votes_insert_policy" ON "public"."itinerary_item_votes" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."itinerary_items"
     JOIN "public"."trip_members" ON (("itinerary_items"."trip_id" = "trip_members"."trip_id")))
  WHERE (("itinerary_items"."id" = "itinerary_item_votes"."itinerary_item_id") AND ("trip_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "itinerary_item_votes_select_policy" ON "public"."itinerary_item_votes" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."itinerary_items"
     JOIN "public"."trips" ON (("itinerary_items"."trip_id" = "trips"."id")))
  WHERE (("itinerary_items"."id" = "itinerary_item_votes"."itinerary_item_id") AND ("trips"."is_public" = true)))) OR (EXISTS ( SELECT 1
   FROM ("public"."itinerary_items"
     JOIN "public"."trip_members" ON (("itinerary_items"."trip_id" = "trip_members"."trip_id")))
  WHERE (("itinerary_items"."id" = "itinerary_item_votes"."itinerary_item_id") AND ("trip_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "itinerary_item_votes_update_policy" ON "public"."itinerary_item_votes" FOR UPDATE USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."itinerary_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."itinerary_sections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "itinerary_sections_delete_policy" ON "public"."itinerary_sections" FOR DELETE USING (((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "itinerary_sections"."trip_id") AND ("trips"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "itinerary_sections"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])))))));



CREATE POLICY "itinerary_sections_insert_policy" ON "public"."itinerary_sections" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "itinerary_sections"."trip_id") AND ("trips"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "itinerary_sections"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role", 'contributor'::"public"."trip_role"])))))));



CREATE POLICY "itinerary_sections_select_policy" ON "public"."itinerary_sections" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "itinerary_sections"."trip_id") AND ("trips"."is_public" = true)))) OR (EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "itinerary_sections"."trip_id") AND ("trips"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "itinerary_sections"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "itinerary_sections_update_policy" ON "public"."itinerary_sections" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "itinerary_sections"."trip_id") AND ("trips"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "itinerary_sections"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role"])))))));



ALTER TABLE "public"."itinerary_template_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."note_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permission_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."places" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."preference_weights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."template_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_comment_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_images" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "trip_images_delete_policy" ON "public"."trip_images" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_images"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND (("trip_members"."role" = 'admin'::"public"."trip_role") OR ("trip_members"."role" = 'editor'::"public"."trip_role"))))));



CREATE POLICY "trip_images_insert_policy" ON "public"."trip_images" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_images"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" <> 'viewer'::"public"."trip_role")))));



CREATE POLICY "trip_images_select_policy" ON "public"."trip_images" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_images"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."trip_item_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_logistics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "trip_notes_delete_policy" ON "public"."trip_notes" FOR DELETE USING (((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "trip_notes"."trip_id") AND ("trips"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_notes"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = 'admin'::"public"."trip_role"))))));



CREATE POLICY "trip_notes_insert_policy" ON "public"."trip_notes" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "trip_notes"."trip_id") AND ("trips"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_notes"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role", 'contributor'::"public"."trip_role"])))))));



CREATE POLICY "trip_notes_select_policy" ON "public"."trip_notes" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "trip_notes"."trip_id") AND ("trips"."is_public" = true)))) OR (EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "trip_notes"."trip_id") AND ("trips"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_notes"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "trip_notes_update_policy" ON "public"."trip_notes" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "trip_notes"."trip_id") AND ("trips"."created_by" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."trip_members"
  WHERE (("trip_members"."trip_id" = "trip_notes"."trip_id") AND ("trip_members"."user_id" = "auth"."uid"()) AND ("trip_members"."role" = ANY (ARRAY['admin'::"public"."trip_role", 'editor'::"public"."trip_role", 'contributor'::"public"."trip_role"])))))));



ALTER TABLE "public"."trip_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_template_uses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_vote_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_vote_polls" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_activity_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_interactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_interests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_login_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_suggested_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_travel" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."validation_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."expenses";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."invitations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."itinerary_items";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."trip_history";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."trip_members";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."trip_notes";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."trips";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."add_trip_history_entry"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_trip_history_entry"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_trip_history_entry"() TO "service_role";



GRANT ALL ON FUNCTION "public"."apply_template_to_trip"("p_template_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid", "p_options" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."apply_template_to_trip"("p_template_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid", "p_options" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."apply_template_to_trip"("p_template_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid", "p_options" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."approve_user_suggested_tag"("p_suggestion_id" "uuid", "p_admin_id" "uuid", "p_admin_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_user_suggested_tag"("p_suggestion_id" "uuid", "p_admin_id" "uuid", "p_admin_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_user_suggested_tag"("p_suggestion_id" "uuid", "p_admin_id" "uuid", "p_admin_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."approve_user_tag"("tag_id" "uuid", "admin_id" "uuid", "notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_user_tag"("tag_id" "uuid", "admin_id" "uuid", "notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_user_tag"("tag_id" "uuid", "admin_id" "uuid", "notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_preference_match"("p_item_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_preference_match"("p_item_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_preference_match"("p_item_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_trip_duration"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_trip_duration"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_trip_duration"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_edit_trip"("p_trip_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_edit_trip"("p_trip_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_edit_trip"("p_trip_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_manage_trip_members"("p_trip_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_manage_trip_members"("p_trip_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_manage_trip_members"("p_trip_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_if_user_is_trip_member_with_role"("user_id_to_check" "uuid", "trip_id_to_check" "uuid", "allowed_roles" "public"."trip_role"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."check_if_user_is_trip_member_with_role"("user_id_to_check" "uuid", "trip_id_to_check" "uuid", "allowed_roles" "public"."trip_role"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_if_user_is_trip_member_with_role"("user_id_to_check" "uuid", "trip_id_to_check" "uuid", "allowed_roles" "public"."trip_role"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."copy_and_customize_item"("p_source_item_id" "uuid", "p_target_trip_id" "uuid", "p_user_id" "uuid", "p_customizations" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."copy_and_customize_item"("p_source_item_id" "uuid", "p_target_trip_id" "uuid", "p_user_id" "uuid", "p_customizations" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."copy_and_customize_item"("p_source_item_id" "uuid", "p_target_trip_id" "uuid", "p_user_id" "uuid", "p_customizations" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."copy_template_to_trip"("p_template_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."copy_template_to_trip"("p_template_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."copy_template_to_trip"("p_template_id" "uuid", "p_trip_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."count_item_comments"("p_item_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."count_item_comments"("p_item_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."count_item_comments"("p_item_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification_from_history"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification_from_history"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification_from_history"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_template_sections_from_items"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_template_sections_from_items"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_template_sections_from_items"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_trip_with_owner"("trip_data" "jsonb", "p_owner_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_trip_with_owner"("trip_data" "jsonb", "p_owner_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_trip_with_owner"("trip_data" "jsonb", "p_owner_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_trip_with_owner"("p_name" "text", "p_description" "text", "p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_destination_id" "uuid", "p_destination_name" "text", "p_cover_image_url" "text", "p_trip_type" "public"."trip_type", "p_privacy_setting" "public"."privacy_setting") TO "anon";
GRANT ALL ON FUNCTION "public"."create_trip_with_owner"("p_name" "text", "p_description" "text", "p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_destination_id" "uuid", "p_destination_name" "text", "p_cover_image_url" "text", "p_trip_type" "public"."trip_type", "p_privacy_setting" "public"."privacy_setting") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_trip_with_owner"("p_name" "text", "p_description" "text", "p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_destination_id" "uuid", "p_destination_name" "text", "p_cover_image_url" "text", "p_trip_type" "public"."trip_type", "p_privacy_setting" "public"."privacy_setting") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_trip_with_owner"("trip_name" "text", "user_id" "uuid", "description_param" "text", "tags_param" "text"[], "destination_id" "uuid", "destination_name_param" "text", "start_date" "date", "end_date" "date", "is_public" boolean, "cover_image_url" "text", "latitude" numeric, "longitude" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."create_trip_with_owner"("trip_name" "text", "user_id" "uuid", "description_param" "text", "tags_param" "text"[], "destination_id" "uuid", "destination_name_param" "text", "start_date" "date", "end_date" "date", "is_public" boolean, "cover_image_url" "text", "latitude" numeric, "longitude" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_trip_with_owner"("trip_name" "text", "user_id" "uuid", "description_param" "text", "tags_param" "text"[], "destination_id" "uuid", "destination_name_param" "text", "start_date" "date", "end_date" "date", "is_public" boolean, "cover_image_url" "text", "latitude" numeric, "longitude" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_travelers_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_travelers_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_travelers_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."execute_sql"("query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."execute_sql"("query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."execute_sql"("query" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_public_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_public_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_public_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_random_itinerary"("p_trip_id" "uuid", "p_user_id" "uuid", "p_options" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_random_itinerary"("p_trip_id" "uuid", "p_user_id" "uuid", "p_options" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_random_itinerary"("p_trip_id" "uuid", "p_user_id" "uuid", "p_options" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_random_slug"("length" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."generate_random_slug"("length" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_random_slug"("length" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_trip_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_trip_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_trip_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_unique_slug"("input_text" "text", "content_type_val" "public"."content_type", "content_id_val" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_unique_slug"("input_text" "text", "content_type_val" "public"."content_type", "content_id_val" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_unique_slug"("input_text" "text", "content_type_val" "public"."content_type", "content_id_val" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_destination_recommendations"("p_user_id" "uuid", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_destination_recommendations"("p_user_id" "uuid", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_destination_recommendations"("p_user_id" "uuid", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_poll_results"("poll_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_poll_results"("poll_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_poll_results"("poll_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_poll_with_options"("poll_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_poll_with_options"("poll_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_poll_with_options"("poll_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."itinerary_template_sections" TO "anon";
GRANT ALL ON TABLE "public"."itinerary_template_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."itinerary_template_sections" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_sections_for_template"("p_template_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_sections_for_template"("p_template_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sections_for_template"("p_template_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_trip_activity_timeline"("trip_id_param" "uuid", "limit_param" integer, "offset_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_trip_activity_timeline"("trip_id_param" "uuid", "limit_param" integer, "offset_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_trip_activity_timeline"("trip_id_param" "uuid", "limit_param" integer, "offset_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_trip_role"("p_trip_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_trip_role"("p_trip_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_trip_role"("p_trip_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unread_notification_count"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_unread_notification_count"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unread_notification_count"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_poll_vote"("p_poll_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_poll_vote"("p_poll_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_poll_vote"("p_poll_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_votes"("trip_id_param" "uuid", "user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_votes"("trip_id_param" "uuid", "user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_votes"("trip_id_param" "uuid", "user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_splitwise_connections_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_splitwise_connections_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_splitwise_connections_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_trip_role"("p_trip_id" "uuid", "p_user_id" "uuid", "p_role" "public"."trip_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_trip_role"("p_trip_id" "uuid", "p_user_id" "uuid", "p_role" "public"."trip_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_trip_role"("p_trip_id" "uuid", "p_user_id" "uuid", "p_role" "public"."trip_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_user_liked_comment"("p_comment_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_user_liked_comment"("p_comment_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_user_liked_comment"("p_comment_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_user_voted"("p_poll_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_user_voted"("p_poll_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_user_voted"("p_poll_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_counter"("row_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_counter"("row_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_counter"("row_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_travelers_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_travelers_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_travelers_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_tag_if_not_exists"("p_name" "text", "p_slug" "text", "p_category" "text", "p_emoji" "text", "p_description" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_tag_if_not_exists"("p_name" "text", "p_slug" "text", "p_category" "text", "p_emoji" "text", "p_description" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_tag_if_not_exists"("p_name" "text", "p_slug" "text", "p_category" "text", "p_emoji" "text", "p_description" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_poll_expired"("poll_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_poll_expired"("poll_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_poll_expired"("poll_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_trip_member"("p_trip_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_trip_member"("p_trip_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_trip_member"("p_trip_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_trip_member"("p_trip_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_trip_member"("p_trip_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_trip_member"("p_trip_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_trip_member_with_role"("_trip_id" "uuid", "_user_id" "uuid", "_roles" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."is_trip_member_with_role"("_trip_id" "uuid", "_user_id" "uuid", "_roles" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_trip_member_with_role"("_trip_id" "uuid", "_user_id" "uuid", "_roles" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."moddatetime"() TO "anon";
GRANT ALL ON FUNCTION "public"."moddatetime"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."moddatetime"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."pg_execute"("query" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."pg_execute"("query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."pg_execute"("query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pg_execute"("query" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."recommend_by_geography"("location_id" "uuid", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."recommend_by_geography"("location_id" "uuid", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."recommend_by_geography"("location_id" "uuid", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."recommend_popular_destinations"("limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."recommend_popular_destinations"("limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."recommend_popular_destinations"("limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_user_to_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_user_to_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_user_to_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_access_requests_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_access_requests_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_access_requests_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_canonical_url"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_canonical_url"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_canonical_url"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_collaborative_notes_metadata"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_collaborative_notes_metadata"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_collaborative_notes_metadata"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_itinerary_item_position"("p_item_id" "uuid", "p_trip_id" "uuid", "p_day_number" integer, "p_position" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_itinerary_item_position"("p_item_id" "uuid", "p_trip_id" "uuid", "p_day_number" integer, "p_position" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_itinerary_item_position"("p_item_id" "uuid", "p_trip_id" "uuid", "p_day_number" integer, "p_position" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_likes_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_likes_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_likes_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_popularity_metrics"("p_item_id" "uuid", "p_action" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_popularity_metrics"("p_item_id" "uuid", "p_action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_popularity_metrics"("p_item_id" "uuid", "p_action" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_preferences_from_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_preferences_from_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_preferences_from_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_from_interaction"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_from_interaction"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_from_interaction"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_onboarding"("p_user_id" "uuid", "p_first_name" "text", "p_travel_personality" "public"."travel_personality_type", "p_travel_squad" "public"."travel_squad_type", "p_onboarding_step" integer, "p_complete_onboarding" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_onboarding"("p_user_id" "uuid", "p_first_name" "text", "p_travel_personality" "public"."travel_personality_type", "p_travel_squad" "public"."travel_squad_type", "p_onboarding_step" integer, "p_complete_onboarding" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_onboarding"("p_user_id" "uuid", "p_first_name" "text", "p_travel_personality" "public"."travel_personality_type", "p_travel_squad" "public"."travel_squad_type", "p_onboarding_step" integer, "p_complete_onboarding" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_quality_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_quality_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_quality_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_trip_last_accessed"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_trip_last_accessed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_trip_last_accessed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_image_metadata_entity"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_image_metadata_entity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_image_metadata_entity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_itinerary"("p_trip_id" "uuid", "p_template_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_itinerary"("p_trip_id" "uuid", "p_template_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_itinerary"("p_trip_id" "uuid", "p_template_id" "uuid") TO "service_role";



























GRANT ALL ON TABLE "public"."access_requests" TO "anon";
GRANT ALL ON TABLE "public"."access_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."access_requests" TO "service_role";



GRANT ALL ON TABLE "public"."albums" TO "anon";
GRANT ALL ON TABLE "public"."albums" TO "authenticated";
GRANT ALL ON TABLE "public"."albums" TO "service_role";



GRANT ALL ON SEQUENCE "public"."albums_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."albums_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."albums_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."budget_items" TO "anon";
GRANT ALL ON TABLE "public"."budget_items" TO "authenticated";
GRANT ALL ON TABLE "public"."budget_items" TO "service_role";



GRANT ALL ON TABLE "public"."collaborative_notes" TO "anon";
GRANT ALL ON TABLE "public"."collaborative_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborative_notes" TO "service_role";



GRANT ALL ON TABLE "public"."collaborative_sessions" TO "anon";
GRANT ALL ON TABLE "public"."collaborative_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborative_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."content_customizations" TO "anon";
GRANT ALL ON TABLE "public"."content_customizations" TO "authenticated";
GRANT ALL ON TABLE "public"."content_customizations" TO "service_role";



GRANT ALL ON TABLE "public"."content_quality_metrics" TO "anon";
GRANT ALL ON TABLE "public"."content_quality_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."content_quality_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."content_sharing_history" TO "anon";
GRANT ALL ON TABLE "public"."content_sharing_history" TO "authenticated";
GRANT ALL ON TABLE "public"."content_sharing_history" TO "service_role";



GRANT ALL ON TABLE "public"."content_slugs" TO "anon";
GRANT ALL ON TABLE "public"."content_slugs" TO "authenticated";
GRANT ALL ON TABLE "public"."content_slugs" TO "service_role";



GRANT ALL ON TABLE "public"."destination_tags" TO "anon";
GRANT ALL ON TABLE "public"."destination_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."destination_tags" TO "service_role";



GRANT ALL ON TABLE "public"."destinations" TO "anon";
GRANT ALL ON TABLE "public"."destinations" TO "authenticated";
GRANT ALL ON TABLE "public"."destinations" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."focus_sessions" TO "anon";
GRANT ALL ON TABLE "public"."focus_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."focus_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."image_metadata" TO "anon";
GRANT ALL ON TABLE "public"."image_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."image_metadata" TO "service_role";



GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invitations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invitations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invitations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."item_popularity_metrics" TO "anon";
GRANT ALL ON TABLE "public"."item_popularity_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."item_popularity_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."itinerary_item_votes" TO "anon";
GRANT ALL ON TABLE "public"."itinerary_item_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."itinerary_item_votes" TO "service_role";



GRANT ALL ON TABLE "public"."itinerary_items" TO "anon";
GRANT ALL ON TABLE "public"."itinerary_items" TO "authenticated";
GRANT ALL ON TABLE "public"."itinerary_items" TO "service_role";



GRANT ALL ON TABLE "public"."itinerary_sections" TO "anon";
GRANT ALL ON TABLE "public"."itinerary_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."itinerary_sections" TO "service_role";



GRANT ALL ON TABLE "public"."itinerary_template_items" TO "anon";
GRANT ALL ON TABLE "public"."itinerary_template_items" TO "authenticated";
GRANT ALL ON TABLE "public"."itinerary_template_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."itinerary_template_sections_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."itinerary_template_sections_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."itinerary_template_sections_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."itinerary_templates" TO "anon";
GRANT ALL ON TABLE "public"."itinerary_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."itinerary_templates" TO "service_role";



GRANT ALL ON TABLE "public"."likes" TO "anon";
GRANT ALL ON TABLE "public"."likes" TO "authenticated";
GRANT ALL ON TABLE "public"."likes" TO "service_role";



GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT ALL ON TABLE "public"."note_tags" TO "anon";
GRANT ALL ON TABLE "public"."note_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."note_tags" TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."permission_requests" TO "anon";
GRANT ALL ON TABLE "public"."permission_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."permission_requests" TO "service_role";



GRANT ALL ON TABLE "public"."places" TO "anon";
GRANT ALL ON TABLE "public"."places" TO "authenticated";
GRANT ALL ON TABLE "public"."places" TO "service_role";



GRANT ALL ON TABLE "public"."preference_weights" TO "anon";
GRANT ALL ON TABLE "public"."preference_weights" TO "authenticated";
GRANT ALL ON TABLE "public"."preference_weights" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."referrals" TO "anon";
GRANT ALL ON TABLE "public"."referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."referrals" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."template_applications" TO "anon";
GRANT ALL ON TABLE "public"."template_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."template_applications" TO "service_role";



GRANT ALL ON TABLE "public"."trip_comment_likes" TO "anon";
GRANT ALL ON TABLE "public"."trip_comment_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_comment_likes" TO "service_role";



GRANT ALL ON TABLE "public"."trip_history" TO "anon";
GRANT ALL ON TABLE "public"."trip_history" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_history" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trip_history_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trip_history_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trip_history_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trip_images" TO "anon";
GRANT ALL ON TABLE "public"."trip_images" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_images" TO "service_role";



GRANT ALL ON TABLE "public"."trip_item_comments" TO "anon";
GRANT ALL ON TABLE "public"."trip_item_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_item_comments" TO "service_role";



GRANT ALL ON TABLE "public"."trip_logistics" TO "anon";
GRANT ALL ON TABLE "public"."trip_logistics" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_logistics" TO "service_role";



GRANT ALL ON TABLE "public"."trip_members" TO "anon";
GRANT ALL ON TABLE "public"."trip_members" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_members" TO "service_role";



GRANT INSERT("trip_id") ON TABLE "public"."trip_members" TO "authenticated";



GRANT INSERT("user_id") ON TABLE "public"."trip_members" TO "authenticated";



GRANT INSERT("role"),UPDATE("role") ON TABLE "public"."trip_members" TO "authenticated";



GRANT ALL ON TABLE "public"."trip_notes" TO "anon";
GRANT ALL ON TABLE "public"."trip_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_notes" TO "service_role";



GRANT ALL ON TABLE "public"."trip_tags" TO "anon";
GRANT ALL ON TABLE "public"."trip_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_tags" TO "service_role";



GRANT ALL ON TABLE "public"."trip_template_uses" TO "anon";
GRANT ALL ON TABLE "public"."trip_template_uses" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_template_uses" TO "service_role";



GRANT ALL ON TABLE "public"."trip_vote_options" TO "anon";
GRANT ALL ON TABLE "public"."trip_vote_options" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_vote_options" TO "service_role";



GRANT ALL ON TABLE "public"."trip_vote_polls" TO "anon";
GRANT ALL ON TABLE "public"."trip_vote_polls" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_vote_polls" TO "service_role";



GRANT ALL ON TABLE "public"."trip_votes" TO "anon";
GRANT ALL ON TABLE "public"."trip_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_votes" TO "service_role";



GRANT ALL ON TABLE "public"."trips" TO "anon";
GRANT ALL ON TABLE "public"."trips" TO "authenticated";
GRANT ALL ON TABLE "public"."trips" TO "service_role";



GRANT ALL ON TABLE "public"."user_activity_history" TO "anon";
GRANT ALL ON TABLE "public"."user_activity_history" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activity_history" TO "service_role";



GRANT ALL ON TABLE "public"."user_interactions" TO "anon";
GRANT ALL ON TABLE "public"."user_interactions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_interactions" TO "service_role";



GRANT ALL ON TABLE "public"."user_interests" TO "anon";
GRANT ALL ON TABLE "public"."user_interests" TO "authenticated";
GRANT ALL ON TABLE "public"."user_interests" TO "service_role";



GRANT ALL ON TABLE "public"."user_login_history" TO "anon";
GRANT ALL ON TABLE "public"."user_login_history" TO "authenticated";
GRANT ALL ON TABLE "public"."user_login_history" TO "service_role";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_presence" TO "anon";
GRANT ALL ON TABLE "public"."user_presence" TO "authenticated";
GRANT ALL ON TABLE "public"."user_presence" TO "service_role";



GRANT ALL ON TABLE "public"."user_suggested_tags" TO "anon";
GRANT ALL ON TABLE "public"."user_suggested_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."user_suggested_tags" TO "service_role";



GRANT ALL ON TABLE "public"."user_travel" TO "anon";
GRANT ALL ON TABLE "public"."user_travel" TO "authenticated";
GRANT ALL ON TABLE "public"."user_travel" TO "service_role";



GRANT ALL ON TABLE "public"."validation_logs" TO "anon";
GRANT ALL ON TABLE "public"."validation_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."validation_logs" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
