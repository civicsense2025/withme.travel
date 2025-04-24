-- Create enum for interaction types
CREATE TYPE interaction_type AS ENUM ('like', 'visit', 'bookmark', 'tag');

-- Create enum for tag status
CREATE TYPE tag_status AS ENUM ('pending', 'approved', 'rejected');

-- Create table for user interactions
CREATE TABLE IF NOT EXISTS public.user_interactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    destination_id uuid REFERENCES public.destinations(id) ON DELETE CASCADE,
    interaction_type interaction_type NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    UNIQUE(user_id, destination_id, interaction_type)
);

-- Create table for tags
CREATE TABLE IF NOT EXISTS public.tags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    category text NOT NULL,
    emoji text,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    is_verified boolean DEFAULT false,
    use_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Create table for user suggested tags
CREATE TABLE IF NOT EXISTS public.user_suggested_tags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
    destination_id uuid REFERENCES public.destinations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status tag_status DEFAULT 'pending',
    admin_notes text,
    reviewed_by uuid REFERENCES auth.users(id),
    reviewed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Create table for destination tags
CREATE TABLE IF NOT EXISTS public.destination_tags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    destination_id uuid REFERENCES public.destinations(id) ON DELETE CASCADE,
    tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
    added_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    confidence_score float DEFAULT 1.0,
    votes_up integer DEFAULT 0,
    votes_down integer DEFAULT 0,
    is_verified boolean DEFAULT false,
    UNIQUE(destination_id, tag_id)
);

-- Create table for user interests
CREATE TABLE IF NOT EXISTS public.user_interests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
    strength integer DEFAULT 5 CHECK (strength BETWEEN 0 AND 10),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, tag_id)
);

-- Create function to approve user suggested tags
CREATE OR REPLACE FUNCTION approve_user_suggested_tag(
    p_suggestion_id uuid,
    p_admin_id uuid,
    p_admin_notes text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to get recommended destinations based on user interests
CREATE OR REPLACE FUNCTION get_destination_recommendations(
    p_user_id uuid,
    p_limit integer DEFAULT 10
)
RETURNS TABLE (
    destination_id uuid,
    match_score float,
    matching_tags jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Add RLS policies
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_suggested_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_interactions
CREATE POLICY "Users can view their own interactions"
    ON public.user_interactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions"
    ON public.user_interactions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions"
    ON public.user_interactions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policies for tags
CREATE POLICY "Tags are viewable by everyone"
    ON public.tags FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Only admins can create/update tags"
    ON public.tags FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- RLS Policies for user_suggested_tags
CREATE POLICY "Users can view their own tag suggestions"
    ON public.user_suggested_tags FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create tag suggestions"
    ON public.user_suggested_tags FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tag suggestions"
    ON public.user_suggested_tags FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- RLS Policies for destination_tags
CREATE POLICY "Destination tags are viewable by everyone"
    ON public.destination_tags FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Only admins can create/update destination tags"
    ON public.destination_tags FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- RLS Policies for user_interests
CREATE POLICY "Users can view their own interests"
    ON public.user_interests FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interests"
    ON public.user_interests FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_destination_id ON public.user_interactions(destination_id);
CREATE INDEX idx_user_interactions_type ON public.user_interactions(interaction_type);
CREATE INDEX idx_tags_slug ON public.tags(slug);
CREATE INDEX idx_destination_tags_destination_id ON public.destination_tags(destination_id);
CREATE INDEX idx_destination_tags_tag_id ON public.destination_tags(tag_id);
CREATE INDEX idx_user_interests_user_id ON public.user_interests(user_id);
CREATE INDEX idx_user_interests_tag_id ON public.user_interests(tag_id); 