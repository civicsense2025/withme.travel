--
-- WITHME.TRAVEL GROUP IDEAS COMPREHENSIVE SCHEMA
-- Created: May 2025
--
-- This script creates the complete database schema for the Group Ideas feature
-- including guest token support, voting, commenting, and all necessary functions and policies
--

BEGIN;

-- =========================
-- UTILITY FUNCTIONS
-- =========================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique guest tokens
CREATE OR REPLACE FUNCTION generate_guest_token()
RETURNS UUID
LANGUAGE sql
AS $$
  SELECT gen_random_uuid();
$$;

-- =========================
-- 1. ENUMS
-- =========================

-- Only create if they don't exist already
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'group_idea_type') THEN
    CREATE TYPE public.group_idea_type AS ENUM (
      'destination',
      'date',
      'activity',
      'budget',
      'other',
      'question',
      'note',
      'place'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vote_type') THEN
    CREATE TYPE public.vote_type AS ENUM (
      'up',
      'down'
    );
  END IF;
END$$;

-- =========================
-- 2. GROUP PLANS TABLE
-- =========================

-- Create the plans table for organizing ideas
CREATE TABLE IF NOT EXISTS public.group_idea_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID,
  guest_token TEXT,
  is_ready_for_voting BOOLEAN DEFAULT false,
  voting_started_at TIMESTAMPTZ,
  voting_ended_at TIMESTAMPTZ,
  trip_id UUID,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  exported_at TIMESTAMPTZ,
  CONSTRAINT fk_group_id FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT fk_trip_id FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE SET NULL
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_group_idea_plans_group_id ON public.group_idea_plans(group_id);
CREATE INDEX IF NOT EXISTS idx_group_idea_plans_created_by ON public.group_idea_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_group_idea_plans_guest_token ON public.group_idea_plans(guest_token);
CREATE INDEX IF NOT EXISTS idx_group_idea_plans_trip_id ON public.group_idea_plans(trip_id);

-- Trigger to update the updated_at timestamp
CREATE TRIGGER before_update_group_idea_plan
  BEFORE UPDATE ON public.group_idea_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- =========================
-- 3. GROUP IDEAS TABLE
-- =========================

-- Create the main ideas table
CREATE TABLE IF NOT EXISTS public.group_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  plan_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  type public.group_idea_type DEFAULT 'destination',
  created_by UUID,
  guest_token TEXT, -- For ideas added by non-authenticated users
  position JSONB DEFAULT '{"columnId": "destination", "index": 0}'::jsonb,
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  selected BOOLEAN DEFAULT false,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_group_id FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT fk_plan_id FOREIGN KEY (plan_id) REFERENCES public.group_idea_plans(id) ON DELETE CASCADE
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_group_ideas_group_id ON public.group_ideas(group_id);
CREATE INDEX IF NOT EXISTS idx_group_ideas_plan_id ON public.group_ideas(plan_id);
CREATE INDEX IF NOT EXISTS idx_group_ideas_created_by ON public.group_ideas(created_by);
CREATE INDEX IF NOT EXISTS idx_group_ideas_guest_token ON public.group_ideas(guest_token);
CREATE INDEX IF NOT EXISTS idx_group_ideas_type ON public.group_ideas(type);

-- Trigger to update the updated_at timestamp
CREATE TRIGGER before_update_group_idea
  BEFORE UPDATE ON public.group_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- =========================
-- 4. GROUP IDEA VOTES TABLE
-- =========================

-- Create table for tracking votes on ideas
CREATE TABLE IF NOT EXISTS public.group_idea_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL,
  user_id UUID,
  guest_token TEXT, -- For votes by non-authenticated users
  vote_type public.vote_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_idea_id FOREIGN KEY (idea_id) REFERENCES public.group_ideas(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Ensure each user/guest can only have one vote per idea
  CONSTRAINT unique_vote_per_user_or_guest UNIQUE (idea_id, COALESCE(user_id::text, guest_token))
);

CREATE INDEX IF NOT EXISTS idx_group_idea_votes_idea_id ON public.group_idea_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_group_idea_votes_user_id ON public.group_idea_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_group_idea_votes_guest_token ON public.group_idea_votes(guest_token);

-- =========================
-- 5. GROUP IDEA COMMENTS TABLE
-- =========================

-- Create table for comments on ideas
CREATE TABLE IF NOT EXISTS public.group_idea_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL,
  user_id UUID,
  guest_token TEXT, -- For comments by non-authenticated users
  guest_name TEXT, -- Optional display name for guests
  content TEXT NOT NULL,
  parent_id UUID, -- For nested comments/replies
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  reactions_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_idea_id FOREIGN KEY (idea_id) REFERENCES public.group_ideas(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT fk_parent_id FOREIGN KEY (parent_id) REFERENCES public.group_idea_comments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_group_idea_comments_idea_id ON public.group_idea_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_group_idea_comments_user_id ON public.group_idea_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_group_idea_comments_guest_token ON public.group_idea_comments(guest_token);
CREATE INDEX IF NOT EXISTS idx_group_idea_comments_parent_id ON public.group_idea_comments(parent_id);

-- Trigger to update the updated_at timestamp for comments
CREATE TRIGGER before_update_group_idea_comment
  BEFORE UPDATE ON public.group_idea_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- =========================
-- 6. GROUP IDEA REACTIONS TABLE
-- =========================

-- Create table for emoji reactions on comments
CREATE TABLE IF NOT EXISTS public.group_idea_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL,
  user_id UUID,
  guest_token TEXT, -- For reactions by non-authenticated users
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_comment_id FOREIGN KEY (comment_id) REFERENCES public.group_idea_comments(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Ensure each user/guest can only react once with a specific emoji per comment
  CONSTRAINT unique_reaction_per_user_or_guest UNIQUE (comment_id, COALESCE(user_id::text, guest_token), emoji)
);

CREATE INDEX IF NOT EXISTS idx_group_idea_reactions_comment_id ON public.group_idea_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_group_idea_reactions_user_id ON public.group_idea_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_group_idea_reactions_guest_token ON public.group_idea_reactions(guest_token);

-- =========================
-- 7. FUNCTIONAL TRIGGERS
-- =========================

-- Vote count update trigger
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- When a vote is added, updated, or deleted
  IF TG_OP = 'DELETE' THEN
    -- If deleting a vote
    UPDATE public.group_ideas
    SET 
      votes_up = (
        SELECT COUNT(*) 
        FROM public.group_idea_votes 
        WHERE idea_id = OLD.idea_id AND vote_type = 'up'
      ),
      votes_down = (
        SELECT COUNT(*) 
        FROM public.group_idea_votes 
        WHERE idea_id = OLD.idea_id AND vote_type = 'down'
      )
    WHERE id = OLD.idea_id;
    RETURN OLD;
  ELSE
    -- If inserting or updating a vote
    UPDATE public.group_ideas
    SET 
      votes_up = (
        SELECT COUNT(*) 
        FROM public.group_idea_votes 
        WHERE idea_id = NEW.idea_id AND vote_type = 'up'
      ),
      votes_down = (
        SELECT COUNT(*) 
        FROM public.group_idea_votes 
        WHERE idea_id = NEW.idea_id AND vote_type = 'down'
      )
    WHERE id = NEW.idea_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote counting
CREATE TRIGGER after_vote_change
  AFTER INSERT OR UPDATE OR DELETE
  ON public.group_idea_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_counts();

-- Update comment reply counts
CREATE OR REPLACE FUNCTION update_comment_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    -- Increment the replies count on the parent comment
    UPDATE public.group_idea_comments
    SET replies_count = replies_count + 1
    WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    -- Decrement the replies count on the parent comment
    UPDATE public.group_idea_comments
    SET replies_count = GREATEST(0, replies_count - 1)
    WHERE id = OLD.parent_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reply counting
CREATE TRIGGER after_comment_change
  AFTER INSERT OR DELETE
  ON public.group_idea_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_replies_count();

-- Update comment reactions count
CREATE OR REPLACE FUNCTION update_comment_reactions_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment reactions count on the comment
    UPDATE public.group_idea_comments
    SET reactions_count = reactions_count + 1
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement reactions count on the comment
    UPDATE public.group_idea_comments
    SET reactions_count = GREATEST(0, reactions_count - 1)
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reaction counting
CREATE TRIGGER after_reaction_change
  AFTER INSERT OR DELETE
  ON public.group_idea_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_reactions_count();

-- Cleanup function for old guest data
CREATE OR REPLACE FUNCTION cleanup_old_guest_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete reactions from guest tokens older than 30 days
  DELETE FROM public.group_idea_reactions
  WHERE guest_token IS NOT NULL
  AND created_at < now() - interval '30 days';
  
  -- Delete votes from guest tokens older than 30 days
  DELETE FROM public.group_idea_votes
  WHERE guest_token IS NOT NULL
  AND created_at < now() - interval '30 days';
  
  -- Do not delete comments or ideas as they might be valuable content
  
  RETURN;
END;
$$;

-- =========================
-- 8. VIEW FOR GROUP IDEAS WITH DETAILS
-- =========================

-- View to get group ideas with creator details, vote counts, and comment counts
CREATE OR REPLACE VIEW public.group_ideas_with_details AS
SELECT 
  i.id,
  i.group_id,
  i.plan_id,
  i.title,
  i.description,
  i.type,
  i.created_by,
  i.guest_token,
  i.position,
  i.votes_up,
  i.votes_down,
  i.selected,
  i.meta,
  i.created_at,
  i.updated_at,
  CASE 
    WHEN i.created_by IS NOT NULL THEN 
      (SELECT jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'avatar_url', p.avatar_url
      ) FROM public.profiles p WHERE p.id = i.created_by)
    ELSE NULL
  END AS creator,
  (SELECT COUNT(*) FROM public.group_idea_comments c WHERE c.idea_id = i.id) AS comments_count
FROM 
  public.group_ideas i;

-- =========================
-- 9. RLS POLICIES
-- =========================

-- Enable Row Level Security
ALTER TABLE public.group_idea_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_idea_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_idea_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_idea_reactions ENABLE ROW LEVEL SECURITY;

-- Plans policies
CREATE POLICY "Everyone can view public group plans"
  ON public.group_idea_plans
  FOR SELECT
  USING (
    -- Group members can view plans
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_idea_plans.group_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
    OR
    -- Public groups are visible to all
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_idea_plans.group_id
      AND visibility IN ('public', 'shared_with_link')
    )
  );

CREATE POLICY "Group members can create plans"
  ON public.group_idea_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_idea_plans.group_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

CREATE POLICY "Owners can edit their plans"
  ON public.group_idea_plans
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group admins can manage all plans"
  ON public.group_idea_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_idea_plans.group_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
  );

-- Ideas policies
CREATE POLICY "Everyone can view ideas from visible groups"
  ON public.group_ideas
  FOR SELECT
  USING (
    -- Group members can view ideas
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_ideas.group_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
    OR
    -- Public groups are visible to all
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_ideas.group_id
      AND visibility IN ('public', 'shared_with_link')
    )
  );

CREATE POLICY "Group members can create ideas"
  ON public.group_ideas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_ideas.group_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

CREATE POLICY "Creators can update their ideas"
  ON public.group_ideas
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group admins can manage all ideas"
  ON public.group_ideas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_ideas.group_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
  );

-- Votes policies
CREATE POLICY "Everyone can view votes"
  ON public.group_idea_votes
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Group members can vote"
  ON public.group_idea_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_ideas i
      JOIN public.group_members m ON i.group_id = m.group_id
      WHERE i.id = idea_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
    )
  );

CREATE POLICY "Users can change their votes"
  ON public.group_idea_votes
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their votes"
  ON public.group_idea_votes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Comments policies
CREATE POLICY "Everyone can view comments"
  ON public.group_idea_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_ideas i
      JOIN public.groups g ON i.group_id = g.id
      WHERE i.id = idea_id
      AND g.visibility IN ('public', 'shared_with_link')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.group_ideas i
      JOIN public.group_members m ON i.group_id = m.group_id
      WHERE i.id = idea_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
    )
  );

CREATE POLICY "Group members can comment"
  ON public.group_idea_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_ideas i
      JOIN public.group_members m ON i.group_id = m.group_id
      WHERE i.id = idea_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
    )
  );

CREATE POLICY "Users can edit their comments"
  ON public.group_idea_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their comments (soft delete)"
  ON public.group_idea_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND 'is_deleted' = ANY(akeys(to_jsonb(NEW) - to_jsonb(OLD))))
  WITH CHECK (user_id = auth.uid() AND NEW.is_deleted = true);

-- Reactions policies
CREATE POLICY "Everyone can view reactions"
  ON public.group_idea_reactions
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Group members can react"
  ON public.group_idea_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_idea_comments c
      JOIN public.group_ideas i ON c.idea_id = i.id
      JOIN public.group_members m ON i.group_id = m.group_id
      WHERE c.id = comment_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
    )
  );

CREATE POLICY "Users can delete their reactions"
  ON public.group_idea_reactions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =========================
-- 10. GUEST POLICIES
-- =========================

-- These policies allow guest token holders to interact with the system
-- They will be applied in addition to the standard policies above

-- Guests can create ideas in any group
CREATE POLICY "Guest tokens can create ideas"
  ON public.group_ideas
  FOR INSERT
  WITH CHECK (
    guest_token IS NOT NULL AND
    created_by IS NULL
  );

-- Guests can update only their own ideas
CREATE POLICY "Guest tokens can update their own ideas"
  ON public.group_ideas
  FOR UPDATE
  USING (
    guest_token IS NOT NULL AND 
    guest_token::text = current_setting('request.headers.guest_token', true)
  )
  WITH CHECK (
    guest_token IS NOT NULL AND 
    guest_token::text = current_setting('request.headers.guest_token', true)
  );

-- Guests can vote
CREATE POLICY "Guest tokens can vote"
  ON public.group_idea_votes
  FOR INSERT
  WITH CHECK (
    guest_token IS NOT NULL AND
    user_id IS NULL
  );

-- Guests can update their votes
CREATE POLICY "Guest tokens can update their votes"
  ON public.group_idea_votes
  FOR UPDATE
  USING (
    guest_token IS NOT NULL AND 
    guest_token::text = current_setting('request.headers.guest_token', true)
  )
  WITH CHECK (
    guest_token IS NOT NULL AND 
    guest_token::text = current_setting('request.headers.guest_token', true)
  );

-- Guests can delete their votes
CREATE POLICY "Guest tokens can delete their votes"
  ON public.group_idea_votes
  FOR DELETE
  USING (
    guest_token IS NOT NULL AND 
    guest_token::text = current_setting('request.headers.guest_token', true)
  );

-- Guests can comment
CREATE POLICY "Guest tokens can comment"
  ON public.group_idea_comments
  FOR INSERT
  WITH CHECK (
    guest_token IS NOT NULL AND
    user_id IS NULL
  );

-- Guests can update their comments
CREATE POLICY "Guest tokens can update their comments"
  ON public.group_idea_comments
  FOR UPDATE
  USING (
    guest_token IS NOT NULL AND 
    guest_token::text = current_setting('request.headers.guest_token', true)
  )
  WITH CHECK (
    guest_token IS NOT NULL AND 
    guest_token::text = current_setting('request.headers.guest_token', true)
  );

-- Guests can react to comments
CREATE POLICY "Guest tokens can react"
  ON public.group_idea_reactions
  FOR INSERT
  WITH CHECK (
    guest_token IS NOT NULL AND
    user_id IS NULL
  );

-- Guests can delete their reactions
CREATE POLICY "Guest tokens can delete their reactions"
  ON public.group_idea_reactions
  FOR DELETE
  USING (
    guest_token IS NOT NULL AND 
    guest_token::text = current_setting('request.headers.guest_token', true)
  );

-- =========================
-- 11. HELPER FUNCTIONS
-- =========================

-- Function to get all ideas for a plan with details
CREATE OR REPLACE FUNCTION get_plan_ideas(p_plan_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  type TEXT,
  position JSONB,
  votes_up INTEGER,
  votes_down INTEGER,
  selected BOOLEAN,
  created_by UUID,
  created_by_guest BOOLEAN,
  creator_name TEXT,
  creator_avatar TEXT,
  comments_count BIGINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.title,
    i.description,
    i.type::TEXT,
    i.position,
    i.votes_up,
    i.votes_down,
    i.selected,
    i.created_by,
    CASE WHEN i.guest_token IS NOT NULL THEN TRUE ELSE FALSE END,
    p.name,
    p.avatar_url,
    COUNT(c.id),
    i.created_at,
    i.updated_at
  FROM 
    public.group_ideas i
    LEFT JOIN public.profiles p ON i.created_by = p.id
    LEFT JOIN public.group_idea_comments c ON i.id = c.idea_id
  WHERE 
    i.plan_id = p_plan_id
  GROUP BY
    i.id, i.title, i.description, i.type, i.position, 
    i.votes_up, i.votes_down, i.selected, i.created_by, 
    i.guest_token, p.name, p.avatar_url, i.created_at, i.updated_at
  ORDER BY 
    i.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to convert ideas to trip itinerary items
CREATE OR REPLACE FUNCTION convert_ideas_to_itinerary_items(
  p_plan_id UUID,
  p_trip_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  idea_count INTEGER := 0;
  idea_record RECORD;
  new_item_id UUID;
BEGIN
  -- Get selected ideas
  FOR idea_record IN 
    SELECT * FROM public.group_ideas 
    WHERE plan_id = p_plan_id AND selected = TRUE
  LOOP
    -- Determine appropriate category based on idea type
    DECLARE
      category public.itinerary_category;
    BEGIN
      CASE idea_record.type::TEXT
        WHEN 'destination' THEN category := 'attraction'::public.itinerary_category;
        WHEN 'activity' THEN category := 'activity'::public.itinerary_category;
        WHEN 'place' THEN category := 'attraction'::public.itinerary_category;
        ELSE category := 'other'::public.itinerary_category;
      END CASE;
      
      -- Create new itinerary item
      INSERT INTO public.itinerary_items (
        trip_id,
        title,
        description,
        category,
        status,
        created_by,
        notes,
        day_number,
        position
      ) VALUES (
        p_trip_id,
        idea_record.title,
        idea_record.description,
        category,
        'suggested'::public.item_status,
        p_user_id,
        format('Created from group idea board: %s', idea_record.title),
        1,  -- Default to day 1
        idea_count  -- Use incrementing position
      )
      RETURNING id INTO new_item_id;
      
      idea_count := idea_count + 1;
    END;
  END LOOP;
  
  -- Update the plan to mark it as exported
  UPDATE public.group_idea_plans
  SET 
    exported_at = NOW(),
    trip_id = p_trip_id
  WHERE id = p_plan_id;
  
  RETURN idea_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has voted on an idea
CREATE OR REPLACE FUNCTION has_user_voted_on_idea(
  p_idea_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_guest_token TEXT DEFAULT NULL
)
RETURNS TABLE (
  has_voted BOOLEAN,
  vote_type public.vote_type
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE,
    v.vote_type
  FROM 
    public.group_idea_votes v
  WHERE 
    v.idea_id = p_idea_id AND
    ((p_user_id IS NOT NULL AND v.user_id = p_user_id) OR
     (p_guest_token IS NOT NULL AND v.guest_token = p_guest_token))
  LIMIT 1;
  
  -- If no result, return false
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::public.vote_type;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMIT;
