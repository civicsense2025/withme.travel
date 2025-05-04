create type "public"."nomination_status" as enum ('pending', 'approved', 'rejected');

drop policy "Allow admin/editor to manage members" on "public"."trip_members";

drop policy "Allow members to view memberships of their trips" on "public"."trip_members";

drop policy "Allow members to view other members" on "public"."trip_members";

drop policy "Allow modification by admin/editor/contributor" on "public"."trip_members";

drop policy "Allow self-delete (leave trip)" on "public"."trip_members";

drop policy "Allow trip admins or user to delete membership" on "public"."trip_members";

drop policy "Allow trip admins or user to update membership" on "public"."trip_members";

drop policy "Allow user to add themselves to a trip" on "public"."trip_members";

drop policy "Only admins can modify trip member roles" on "public"."trip_members";

alter table "public"."likes" drop constraint "likes_item_type_check";

alter table "public"."likes" drop constraint "likes_user_id_item_id_item_type_key";

drop function if exists "public"."cleanup_old_metrics"();

drop function if exists "public"."is_trip_member"(p_trip_id uuid);

drop index if exists "public"."likes_item_type_idx";

drop index if exists "public"."likes_user_id_item_id_item_type_key";

alter type "public"."content_type" rename to "content_type__old_version_to_be_dropped";

create type "public"."content_type" as enum ('trip', 'itinerary_item', 'destination', 'collection', 'itinerary', 'place', 'attraction', 'guide');

create table "public"."place_metrics" (
    "place_id" uuid not null,
    "trip_inclusion_count" integer default 0,
    "saved_count" integer default 0,
    "review_count" integer default 0,
    "avg_rating" numeric(3,2) default 0,
    "recent_activity_count" integer default 0,
    "total_score" numeric(5,2) default 0,
    "last_calculated_at" timestamp with time zone not null default now()
);


create table "public"."place_nominations" (
    "id" uuid not null default gen_random_uuid(),
    "place_id" uuid not null,
    "nominated_at" timestamp with time zone not null default now(),
    "status" nomination_status default 'pending'::nomination_status,
    "auto_nominated" boolean default false,
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "review_notes" text,
    "metrics_snapshot" jsonb
);


create table "public"."reviews" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "place_id" uuid not null,
    "rating" integer not null,
    "content" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "item_id" uuid,
    "item_type" content_type not null
);


create table "public"."trip_logistics" (
    "id" uuid not null default uuid_generate_v4(),
    "trip_id" uuid not null,
    "type" text not null,
    "title" text not null,
    "description" text,
    "location" text,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "data" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid
);


alter table "public"."trip_logistics" enable row level security;

alter table "public"."content_slugs" alter column content_type type "public"."content_type" using content_type::text::"public"."content_type";

drop type "public"."content_type__old_version_to_be_dropped";

alter table "public"."likes" alter column "item_type" set data type content_type using "item_type"::content_type;

CREATE UNIQUE INDEX place_metrics_pkey ON public.place_metrics USING btree (place_id);

CREATE UNIQUE INDEX place_nominations_pkey ON public.place_nominations USING btree (id);

CREATE INDEX reviews_item_id_idx ON public.reviews USING btree (item_id);

CREATE INDEX reviews_item_type_idx ON public.reviews USING btree (item_type);

CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);

CREATE INDEX reviews_user_id_idx ON public.reviews USING btree (user_id);

CREATE UNIQUE INDEX trip_logistics_pkey ON public.trip_logistics USING btree (id);

CREATE INDEX trip_logistics_trip_id_idx ON public.trip_logistics USING btree (trip_id);

CREATE INDEX trip_logistics_type_idx ON public.trip_logistics USING btree (type);

CREATE UNIQUE INDEX unique_user_place_review ON public.reviews USING btree (user_id, place_id);

alter table "public"."place_metrics" add constraint "place_metrics_pkey" PRIMARY KEY using index "place_metrics_pkey";

alter table "public"."place_nominations" add constraint "place_nominations_pkey" PRIMARY KEY using index "place_nominations_pkey";

alter table "public"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";

alter table "public"."trip_logistics" add constraint "trip_logistics_pkey" PRIMARY KEY using index "trip_logistics_pkey";

alter table "public"."place_metrics" add constraint "place_metrics_place_id_fkey" FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE not valid;

alter table "public"."place_metrics" validate constraint "place_metrics_place_id_fkey";

alter table "public"."place_nominations" add constraint "place_nominations_place_id_fkey" FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE not valid;

alter table "public"."place_nominations" validate constraint "place_nominations_place_id_fkey";

alter table "public"."place_nominations" add constraint "place_nominations_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) not valid;

alter table "public"."place_nominations" validate constraint "place_nominations_reviewed_by_fkey";

alter table "public"."reviews" add constraint "reviews_place_id_fkey" FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_place_id_fkey";

alter table "public"."reviews" add constraint "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."reviews" validate constraint "reviews_rating_check";

alter table "public"."reviews" add constraint "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_user_id_fkey";

alter table "public"."reviews" add constraint "unique_user_place_review" UNIQUE using index "unique_user_place_review";

alter table "public"."trip_logistics" add constraint "trip_logistics_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."trip_logistics" validate constraint "trip_logistics_created_by_fkey";

alter table "public"."trip_logistics" add constraint "trip_logistics_trip_id_fkey" FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE not valid;

alter table "public"."trip_logistics" validate constraint "trip_logistics_trip_id_fkey";

alter table "public"."trip_logistics" add constraint "trip_logistics_type_check" CHECK ((type = ANY (ARRAY['form'::text, 'accommodation'::text, 'transportation'::text]))) not valid;

alter table "public"."trip_logistics" validate constraint "trip_logistics_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_trip_member_with_role(_trip_id uuid, _user_id uuid, _roles text[])
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
    member_role text;
BEGIN
    SELECT role INTO member_role
    FROM public.trip_members
    WHERE trip_id = _trip_id AND user_id = _user_id;

    RETURN member_role = ANY(_roles);
END;$function$
;

grant delete on table "public"."place_metrics" to "anon";

grant insert on table "public"."place_metrics" to "anon";

grant references on table "public"."place_metrics" to "anon";

grant select on table "public"."place_metrics" to "anon";

grant trigger on table "public"."place_metrics" to "anon";

grant truncate on table "public"."place_metrics" to "anon";

grant update on table "public"."place_metrics" to "anon";

grant delete on table "public"."place_metrics" to "authenticated";

grant insert on table "public"."place_metrics" to "authenticated";

grant references on table "public"."place_metrics" to "authenticated";

grant select on table "public"."place_metrics" to "authenticated";

grant trigger on table "public"."place_metrics" to "authenticated";

grant truncate on table "public"."place_metrics" to "authenticated";

grant update on table "public"."place_metrics" to "authenticated";

grant delete on table "public"."place_metrics" to "service_role";

grant insert on table "public"."place_metrics" to "service_role";

grant references on table "public"."place_metrics" to "service_role";

grant select on table "public"."place_metrics" to "service_role";

grant trigger on table "public"."place_metrics" to "service_role";

grant truncate on table "public"."place_metrics" to "service_role";

grant update on table "public"."place_metrics" to "service_role";

grant delete on table "public"."place_nominations" to "anon";

grant insert on table "public"."place_nominations" to "anon";

grant references on table "public"."place_nominations" to "anon";

grant select on table "public"."place_nominations" to "anon";

grant trigger on table "public"."place_nominations" to "anon";

grant truncate on table "public"."place_nominations" to "anon";

grant update on table "public"."place_nominations" to "anon";

grant delete on table "public"."place_nominations" to "authenticated";

grant insert on table "public"."place_nominations" to "authenticated";

grant references on table "public"."place_nominations" to "authenticated";

grant select on table "public"."place_nominations" to "authenticated";

grant trigger on table "public"."place_nominations" to "authenticated";

grant truncate on table "public"."place_nominations" to "authenticated";

grant update on table "public"."place_nominations" to "authenticated";

grant delete on table "public"."place_nominations" to "service_role";

grant insert on table "public"."place_nominations" to "service_role";

grant references on table "public"."place_nominations" to "service_role";

grant select on table "public"."place_nominations" to "service_role";

grant trigger on table "public"."place_nominations" to "service_role";

grant truncate on table "public"."place_nominations" to "service_role";

grant update on table "public"."place_nominations" to "service_role";

grant delete on table "public"."reviews" to "anon";

grant insert on table "public"."reviews" to "anon";

grant references on table "public"."reviews" to "anon";

grant select on table "public"."reviews" to "anon";

grant trigger on table "public"."reviews" to "anon";

grant truncate on table "public"."reviews" to "anon";

grant update on table "public"."reviews" to "anon";

grant delete on table "public"."reviews" to "authenticated";

grant insert on table "public"."reviews" to "authenticated";

grant references on table "public"."reviews" to "authenticated";

grant select on table "public"."reviews" to "authenticated";

grant trigger on table "public"."reviews" to "authenticated";

grant truncate on table "public"."reviews" to "authenticated";

grant update on table "public"."reviews" to "authenticated";

grant delete on table "public"."reviews" to "service_role";

grant insert on table "public"."reviews" to "service_role";

grant references on table "public"."reviews" to "service_role";

grant select on table "public"."reviews" to "service_role";

grant trigger on table "public"."reviews" to "service_role";

grant truncate on table "public"."reviews" to "service_role";

grant update on table "public"."reviews" to "service_role";

grant delete on table "public"."trip_logistics" to "anon";

grant insert on table "public"."trip_logistics" to "anon";

grant references on table "public"."trip_logistics" to "anon";

grant select on table "public"."trip_logistics" to "anon";

grant trigger on table "public"."trip_logistics" to "anon";

grant truncate on table "public"."trip_logistics" to "anon";

grant update on table "public"."trip_logistics" to "anon";

grant delete on table "public"."trip_logistics" to "authenticated";

grant insert on table "public"."trip_logistics" to "authenticated";

grant references on table "public"."trip_logistics" to "authenticated";

grant select on table "public"."trip_logistics" to "authenticated";

grant trigger on table "public"."trip_logistics" to "authenticated";

grant truncate on table "public"."trip_logistics" to "authenticated";

grant update on table "public"."trip_logistics" to "authenticated";

grant delete on table "public"."trip_logistics" to "service_role";

grant insert on table "public"."trip_logistics" to "service_role";

grant references on table "public"."trip_logistics" to "service_role";

grant select on table "public"."trip_logistics" to "service_role";

grant trigger on table "public"."trip_logistics" to "service_role";

grant truncate on table "public"."trip_logistics" to "service_role";

grant update on table "public"."trip_logistics" to "service_role";

create policy "Trip admins and editors can manage logistics"
on "public"."trip_logistics"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM trip_members
  WHERE ((trip_members.trip_id = trip_logistics.trip_id) AND (trip_members.user_id = auth.uid()) AND (trip_members.role = ANY (ARRAY['admin'::trip_role, 'editor'::trip_role]))))));


create policy "Trip members can view logistics"
on "public"."trip_logistics"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM trip_members
  WHERE ((trip_members.trip_id = trip_logistics.trip_id) AND (trip_members.user_id = auth.uid())))));


CREATE TRIGGER set_trip_logistics_updated_at BEFORE UPDATE ON public.trip_logistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


