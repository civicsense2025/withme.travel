-- Create albums table
CREATE TABLE public.albums (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT albums_pkey PRIMARY KEY (id),
    CONSTRAINT albums_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON public.albums USING btree (user_id);

-- Create budget_items table
CREATE TABLE public.budget_items (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    trip_id uuid NOT NULL,
    title text NOT NULL,
    amount numeric NOT NULL,
    currency text NOT NULL DEFAULT 'USD'::text,
    category public.budget_category NOT NULL,
    paid_by uuid NOT NULL,
    date date NOT NULL,
    source text NULL DEFAULT 'manual'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT budget_items_pkey PRIMARY KEY (id),
    CONSTRAINT budget_items_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES profiles(id),
    CONSTRAINT budget_items_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT budget_items_amount_check CHECK ((amount >= (0)::numeric))
);
CREATE INDEX IF NOT EXISTS idx_budget_items_trip_id ON public.budget_items USING btree (trip_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_paid_by ON public.budget_items USING btree (paid_by);

-- Create collaborative_sessions table
CREATE TABLE public.collaborative_sessions (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    trip_id uuid NOT NULL,
    document_type text NOT NULL,
    document_id text NOT NULL,
    content jsonb NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT collaborative_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT collaborative_sessions_trip_id_document_type_document_id_key UNIQUE (trip_id, document_type, document_id)
);

-- Create destination_tags table
CREATE TABLE public.destination_tags (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    destination_id uuid NULL,
    tag_id uuid NULL,
    added_by uuid NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    confidence_score double precision NULL DEFAULT 1.0,
    votes_up integer NULL DEFAULT 0,
    votes_down integer NULL DEFAULT 0,
    is_verified boolean NULL DEFAULT false,
    CONSTRAINT destination_tags_pkey PRIMARY KEY (id),
    CONSTRAINT destination_tags_destination_id_tag_id_key UNIQUE (destination_id, tag_id),
    CONSTRAINT destination_tags_added_by_fkey FOREIGN KEY (added_by) REFERENCES auth.users(id),
    CONSTRAINT destination_tags_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    CONSTRAINT destination_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_destination_tags_destination_id ON public.destination_tags USING btree (destination_id);
CREATE INDEX IF NOT EXISTS idx_destination_tags_tag_id ON public.destination_tags USING btree (tag_id);

-- Create destinations table
CREATE TABLE public.destinations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    city text NULL,
    state_province text NULL,
    country text NULL,
    popularity integer NULL,
    lgbtq_friendliness numeric(3,1) NULL,
    accessibility numeric(3,1) NULL,
    continent text NULL,
    best_season text NULL,
    avg_cost_per_day numeric NULL,
    local_language text NULL,
    time_zone text NULL,
    cuisine_rating numeric(3,1) NULL,
    cultural_attractions numeric(3,1) NULL,
    nightlife_rating numeric(3,1) NULL,
    family_friendly boolean NULL,
    outdoor_activities numeric(3,1) NULL,
    beach_quality numeric(3,1) NULL,
    shopping_rating numeric(3,1) NULL,
    safety_rating numeric(3,1) NULL,
    wifi_connectivity numeric(3,1) NULL,
    public_transportation numeric(3,1) NULL,
    eco_friendly_options numeric(3,1) NULL,
    walkability numeric(3,1) NULL,
    instagram_worthy_spots numeric(3,1) NULL,
    off_peak_appeal numeric(3,1) NULL,
    digital_nomad_friendly boolean NULL,
    name text NULL,
    description text NULL,
    image_url text NULL,
    updated_at timestamp with time zone NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    emoji text NULL,
    visa_required boolean NULL,
    image_metadata jsonb NULL,
    byline character varying(100) NULL,
    highlights text NULL,
    perfect_for text NULL,
    likes_count integer NULL DEFAULT 0,
    latitude double precision NULL,
    longitude double precision NULL,
    avg_days integer NULL,
    address text NULL,
    mapbox_id text NULL,
    CONSTRAINT destinations_pkey PRIMARY KEY (id),
    CONSTRAINT destinations_beach_quality_check CHECK (((beach_quality >= 1.0) AND (beach_quality <= 5.0))),
    CONSTRAINT destinations_cuisine_rating_check CHECK (((cuisine_rating >= 1.0) AND (cuisine_rating <= 5.0))),
    CONSTRAINT destinations_cultural_attractions_check CHECK (((cultural_attractions >= 1.0) AND (cultural_attractions <= 5.0))),
    CONSTRAINT destinations_eco_friendly_options_check CHECK (((eco_friendly_options >= 1.0) AND (eco_friendly_options <= 5.0))),
    CONSTRAINT destinations_instagram_worthy_spots_check CHECK (((instagram_worthy_spots >= 1.0) AND (instagram_worthy_spots <= 5.0))),
    CONSTRAINT destinations_lgbtq_friendliness_check CHECK (((lgbtq_friendliness >= 1.0) AND (lgbtq_friendliness <= 5.0))),
    CONSTRAINT destinations_nightlife_rating_check CHECK (((nightlife_rating >= 1.0) AND (nightlife_rating <= 5.0))),
    CONSTRAINT destinations_off_peak_appeal_check CHECK (((off_peak_appeal >= 1.0) AND (off_peak_appeal <= 5.0))),
    CONSTRAINT destinations_outdoor_activities_check CHECK (((outdoor_activities >= 1.0) AND (outdoor_activities <= 5.0))),
    CONSTRAINT destinations_public_transportation_check CHECK (((public_transportation >= 1.0) AND (public_transportation <= 5.0)))




-- Create albums table
CREATE TABLE public.albums (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT albums_pkey PRIMARY KEY (id),
    CONSTRAINT albums_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON public.albums USING btree (user_id);

-- Create budget_items table
CREATE TABLE public.budget_items (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    trip_id uuid NOT NULL,
    title text NOT NULL,
    amount numeric NOT NULL,
    currency text NOT NULL DEFAULT 'USD'::text,
    category public.budget_category NOT NULL,
    paid_by uuid NOT NULL,
    date date NOT NULL,
    source text NULL DEFAULT 'manual'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT budget_items_pkey PRIMARY KEY (id),
    CONSTRAINT budget_items_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES profiles(id),
    CONSTRAINT budget_items_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT budget_items_amount_check CHECK ((amount >= (0)::numeric))
);
CREATE INDEX IF NOT EXISTS idx_budget_items_trip_id ON public.budget_items USING btree (trip_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_paid_by ON public.budget_items USING btree (paid_by);

-- Create collaborative_sessions table
CREATE TABLE public.collaborative_sessions (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    trip_id uuid NOT NULL,
    document_type text NOT NULL,
    document_id text NOT NULL,
    content jsonb NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT collaborative_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT collaborative_sessions_trip_id_document_type_document_id_key UNIQUE (trip_id, document_type, document_id)
);

-- Create destination_tags table
CREATE TABLE public.destination_tags (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    destination_id uuid NULL,
    tag_id uuid NULL,
    added_by uuid NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    confidence_score double precision NULL DEFAULT 1.0,
    votes_up integer NULL DEFAULT 0,
    votes_down integer NULL DEFAULT 0,
    is_verified boolean NULL DEFAULT false,
    CONSTRAINT destination_tags_pkey PRIMARY KEY (id),
    CONSTRAINT destination_tags_destination_id_tag_id_key UNIQUE (destination_id, tag_id),
    CONSTRAINT destination_tags_added_by_fkey FOREIGN KEY (added_by) REFERENCES auth.users(id),
    CONSTRAINT destination_tags_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    CONSTRAINT destination_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_destination_tags_destination_id ON public.destination_tags USING btree (destination_id);
CREATE INDEX IF NOT EXISTS idx_destination_tags_tag_id ON public.destination_tags USING btree (tag_id);

-- Create destinations table
CREATE TABLE public.destinations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    city text NULL,
    state_province text NULL,
    country text NULL,
    popularity integer NULL,
    lgbtq_friendliness numeric(3,1) NULL,
    accessibility numeric(3,1) NULL,
    continent text NULL,
    best_season text NULL,
    avg_cost_per_day numeric NULL,
    local_language text NULL,
    time_zone text NULL,
    cuisine_rating numeric(3,1) NULL,
    cultural_attractions numeric(3,1) NULL,
    nightlife_rating numeric(3,1) NULL,
    family_friendly boolean NULL,
    outdoor_activities numeric(3,1) NULL,
    beach_quality numeric(3,1) NULL,
    shopping_rating numeric(3,1) NULL,
    safety_rating numeric(3,1) NULL,
    wifi_connectivity numeric(3,1) NULL,
    public_transportation numeric(3,1) NULL,
    eco_friendly_options numeric(3,1) NULL,
    walkability numeric(3,1) NULL,
    instagram_worthy_spots numeric(3,1) NULL,
    off_peak_appeal numeric(3,1) NULL,
    digital_nomad_friendly boolean NULL,
    name text NULL,
    description text NULL,
    image_url text NULL,
    updated_at timestamp with time zone NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    emoji text NULL,
    visa_required boolean NULL,
    image_metadata jsonb NULL,
    byline character varying(100) NULL,
    highlights text NULL,
    perfect_for text NULL,
    likes_count integer NULL DEFAULT 0,
    latitude double precision NULL,
    longitude double precision NULL,
    avg_days integer NULL,
    address text NULL,
    mapbox_id text NULL,
    CONSTRAINT destinations_pkey PRIMARY KEY (id),
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
    CONSTRAINT destinations_accessibility_check CHECK (((accessibility >= 1.0) AND (accessibility <= 5.0))),
    CONSTRAINT destinations_wifi_connectivity_check CHECK (((wifi_connectivity >= 1.0) AND (wifi_connectivity <= 5.0)))
);
CREATE INDEX IF NOT EXISTS idx_destinations_coordinates ON public.destinations USING btree (latitude, longitude);
CREATE UNIQUE INDEX IF NOT EXISTS destinations_mapbox_id_unique_idx ON public.destinations USING btree (mapbox_id);
CREATE INDEX IF NOT EXISTS idx_destinations_city ON