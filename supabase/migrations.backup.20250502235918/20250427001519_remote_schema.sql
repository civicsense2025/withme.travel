

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






CREATE TYPE "public"."item_status" AS ENUM (
    'suggested',
    'confirmed',
    'rejected'
);


ALTER TYPE "public"."item_status" OWNER TO "postgres";


CREATE TYPE "public"."itinerary_category" AS ENUM (
    'flight',
    'accommodation',
    'attraction',
    'restaurant',
    'transportation',
    'activity',
    'other'
);


ALTER TYPE "public"."itinerary_category" OWNER TO "postgres";


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


CREATE TYPE "public"."trip_role" AS ENUM (
    'admin',
    'editor',
    'viewer',
    'contributor'
);


ALTER TYPE "public"."trip_role" OWNER TO "postgres";


CREATE TYPE "public"."vote_type" AS ENUM (
    'up',
    'down'
);


ALTER TYPE "public"."vote_type" OWNER TO "postgres";


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



SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."destinations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "city" "text" NOT NULL,
    "country" "text" NOT NULL,
    "continent" "text",
    "description" "text",
    "image_url" "text",
    "latitude" numeric(9,6),
    "longitude" numeric(9,6),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."destinations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."itinerary_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "created_by" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "status" "public"."item_status" DEFAULT 'suggested'::"public"."item_status",
    "start_time" time without time zone,
    "end_time" time without time zone,
    "date" "date",
    "day_number" integer,
    "address" "text",
    "latitude" numeric(9,6),
    "longitude" numeric(9,6),
    "place_id" "uuid",
    "category" "public"."itinerary_category",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_custom" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."itinerary_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."places" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "google_place_id" "text",
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
    "is_verified" boolean DEFAULT false NOT NULL,
    "suggested_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source" "text",
    "source_id" "text",
    CONSTRAINT "places_price_level_check" CHECK ((("price_level" >= 1) AND ("price_level" <= 5)))
);


ALTER TABLE "public"."places" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "avatar_url" "text",
    "username" "text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";





CREATE TABLE IF NOT EXISTS "public"."trip_members" (
    "id" bigint NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."trip_role" DEFAULT 'viewer'::"public"."trip_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "invited_by" "uuid",
    "joined_at" timestamp with time zone,
    "external_email" "text"
);


ALTER TABLE "public"."trip_members" OWNER TO "postgres";


ALTER TABLE "public"."trip_members" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."trip_members_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."trips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_by" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "tags" "text"[],
    "destination_id" "uuid",
    "destination_name" "text",
    "start_date" "date",
    "end_date" "date",
    "is_public" boolean DEFAULT false,
    "cover_image_url" "text",
    "latitude" numeric(9,6),
    "longitude" numeric(9,6),
    "playlist_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trips" OWNER TO "postgres";


COMMENT ON COLUMN "public"."trips"."created_by" IS 'Creator of the trip (references profiles.id)';






CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "itinerary_item_id" "uuid" NOT NULL,
    "vote_type" "public"."vote_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."votes" OWNER TO "postgres";


ALTER TABLE "public"."votes" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."votes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."destinations"
    ADD CONSTRAINT "destinations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."itinerary_items"
    ADD CONSTRAINT "itinerary_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_google_place_id_key" UNIQUE ("google_place_id");



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");






ALTER TABLE ONLY "public"."trip_members"
    ADD CONSTRAINT "trip_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_members"
    ADD CONSTRAINT "trip_members_trip_id_external_email_key" UNIQUE ("trip_id", "external_email");



ALTER TABLE ONLY "public"."trip_members"
    ADD CONSTRAINT "trip_members_trip_id_user_id_key" UNIQUE ("trip_id", "user_id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_itinerary_item_id_key" UNIQUE ("user_id", "itinerary_item_id");






ALTER TABLE ONLY "public"."itinerary_items"
    ADD CONSTRAINT "itinerary_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."itinerary_items"
    ADD CONSTRAINT "itinerary_items_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."itinerary_items"
    ADD CONSTRAINT "itinerary_items_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_suggested_by_fkey" FOREIGN KEY ("suggested_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;






ALTER TABLE ONLY "public"."trip_members"
    ADD CONSTRAINT "trip_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trip_members"
    ADD CONSTRAINT "trip_members_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_members"
    ADD CONSTRAINT "trip_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_itinerary_item_id_fkey" FOREIGN KEY ("itinerary_item_id") REFERENCES "public"."itinerary_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Allow admin delete access" ON "public"."trips" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "trips"."id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'admin'::"public"."trip_role")))));



CREATE POLICY "Allow admin/editor to manage members" ON "public"."trip_members" USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm_check"
  WHERE (("tm_check"."trip_id" = "trip_members"."trip_id") AND ("tm_check"."user_id" = "auth"."uid"()) AND (("tm_check"."role" = 'admin'::"public"."trip_role") OR ("tm_check"."role" = 'editor'::"public"."trip_role")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm_check"
  WHERE (("tm_check"."trip_id" = "trip_members"."trip_id") AND ("tm_check"."user_id" = "auth"."uid"()) AND (("tm_check"."role" = 'admin'::"public"."trip_role") OR ("tm_check"."role" = 'editor'::"public"."trip_role"))))));



CREATE POLICY "Allow admin/editor update access" ON "public"."trips" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "trips"."id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "trips"."id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role"))))));






CREATE POLICY "Allow contributors to manage itinerary items" ON "public"."itinerary_items" USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "itinerary_items"."trip_id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role") OR ("tm"."role" = 'contributor'::"public"."trip_role")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "itinerary_items"."trip_id") AND ("tm"."user_id" = "auth"."uid"()) AND (("tm"."role" = 'admin'::"public"."trip_role") OR ("tm"."role" = 'editor'::"public"."trip_role") OR ("tm"."role" = 'contributor'::"public"."trip_role"))))));



CREATE POLICY "Allow member read access" ON "public"."trips" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow members to manage own votes" ON "public"."votes" USING ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM ("public"."trip_members" "tm"
     JOIN "public"."itinerary_items" "ii" ON (("tm"."trip_id" = "ii"."trip_id")))
  WHERE (("ii"."id" = "votes"."itinerary_item_id") AND ("tm"."user_id" = "auth"."uid"())))))) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow members to view itinerary items" ON "public"."itinerary_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm"
  WHERE (("tm"."trip_id" = "itinerary_items"."trip_id") AND ("tm"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow members to view other members" ON "public"."trip_members" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."trip_members" "tm_check"
  WHERE (("tm_check"."trip_id" = "trip_members"."trip_id") AND ("tm_check"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow public read access" ON "public"."trips" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Destinations are viewable by everyone." ON "public"."destinations" FOR SELECT USING (true);



CREATE POLICY "Places are viewable by everyone." ON "public"."places" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."destinations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."itinerary_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."places" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER TABLE "public"."trip_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trips" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."create_trip_with_owner"("trip_name" "text", "user_id" "uuid", "description_param" "text", "tags_param" "text"[], "destination_id" "uuid", "destination_name_param" "text", "start_date" "date", "end_date" "date", "is_public" boolean, "cover_image_url" "text", "latitude" numeric, "longitude" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."create_trip_with_owner"("trip_name" "text", "user_id" "uuid", "description_param" "text", "tags_param" "text"[], "destination_id" "uuid", "destination_name_param" "text", "start_date" "date", "end_date" "date", "is_public" boolean, "cover_image_url" "text", "latitude" numeric, "longitude" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_trip_with_owner"("trip_name" "text", "user_id" "uuid", "description_param" "text", "tags_param" "text"[], "destination_id" "uuid", "destination_name_param" "text", "start_date" "date", "end_date" "date", "is_public" boolean, "cover_image_url" "text", "latitude" numeric, "longitude" numeric) TO "service_role";






























GRANT ALL ON TABLE "public"."destinations" TO "anon";
GRANT ALL ON TABLE "public"."destinations" TO "authenticated";
GRANT ALL ON TABLE "public"."destinations" TO "service_role";



GRANT ALL ON TABLE "public"."itinerary_items" TO "anon";
GRANT ALL ON TABLE "public"."itinerary_items" TO "authenticated";
GRANT ALL ON TABLE "public"."itinerary_items" TO "service_role";



GRANT ALL ON TABLE "public"."places" TO "anon";
GRANT ALL ON TABLE "public"."places" TO "authenticated";
GRANT ALL ON TABLE "public"."places" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";






GRANT ALL ON TABLE "public"."trip_members" TO "anon";
GRANT ALL ON TABLE "public"."trip_members" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_members" TO "service_role";



GRANT ALL ON SEQUENCE "public"."trip_members_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."trip_members_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."trip_members_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."trips" TO "anon";
GRANT ALL ON TABLE "public"."trips" TO "authenticated";
GRANT ALL ON TABLE "public"."trips" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "service_role";









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
