-- SQL Schema for the Forms Feature

-- ENUMS (Consider creating PostgreSQL ENUM types for better type safety)
-- Example: CREATE TYPE form_visibility AS ENUM ('private', 'shared_with_link', 'public');
-- For now, using TEXT with CHECK constraints.

-- FORM STATUS ENUM
-- CREATE TYPE form_status AS ENUM ('draft', 'published', 'closed', 'archived');

-- QUESTION TYPE ENUM
-- CREATE TYPE question_type AS ENUM ('short_text', 'long_text', 'single_choice', 'multiple_choice', 'yes_no', 'rating', 'date', 'file_upload', 'location', 'number', 'email', 'phone', 'website', 'statement', 'welcome', 'thank_you');

-- COLLABORATOR ROLE ENUM
-- CREATE TYPE form_collaborator_role AS ENUM ('viewer', 'editor', 'admin');

-- COLLABORATOR INVITATION STATUS ENUM
-- CREATE TYPE form_invitation_status AS ENUM ('pending', 'accepted', 'declined');

-- =========================================
-- TABLES
-- =========================================

-- Forms Table: Stores the main configuration for each form.
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- User who created the form
    title TEXT NOT NULL CHECK (char_length(title) <= 100),
    description TEXT CHECK (char_length(description) <= 500),
    slug TEXT UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'), -- Optional URL-friendly identifier
    form_emoji TEXT CHECK (char_length(form_emoji) <= 4),
    cover_image_url TEXT CHECK (char_length(cover_image_url) <= 2048),
    theme_color TEXT CHECK (theme_color ~ '^#[0-9A-Fa-f]{6}$'), -- Hex color code
    font_family TEXT,
    logo_url TEXT CHECK (char_length(logo_url) <= 2048),
    show_progress_bar BOOLEAN NOT NULL DEFAULT TRUE,
    show_question_numbers BOOLEAN NOT NULL DEFAULT TRUE,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared_with_link', 'public')), -- Or use form_visibility ENUM
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')), -- Or use form_status ENUM
    allow_anonymous_responses BOOLEAN NOT NULL DEFAULT FALSE,
    response_limit INTEGER CHECK (response_limit > 0),
    closes_at TIMESTAMPTZ, -- Timestamp when the form automatically closes
    view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    start_count INTEGER NOT NULL DEFAULT 0 CHECK (start_count >= 0),
    completion_count INTEGER NOT NULL DEFAULT 0 CHECK (completion_count >= 0),
    average_time_seconds INTEGER NOT NULL DEFAULT 0 CHECK (average_time_seconds >= 0),
    notify_on_response BOOLEAN NOT NULL DEFAULT FALSE,
    notification_email TEXT CHECK (notification_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    redirect_url TEXT CHECK (char_length(redirect_url) <= 2048 AND redirect_url ~ '^https?://.*'),
    completion_message TEXT CHECK (char_length(completion_message) <= 1000),
    access_code TEXT UNIQUE, -- Optional code to access the form
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ
);
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON forms(created_by);
CREATE INDEX IF NOT EXISTS idx_forms_slug ON forms(slug);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_visibility ON forms(visibility);
-- RLS Policies (Placeholder - Adjust based on your access rules)
-- CREATE POLICY "Allow authenticated users to view public/shared forms" ON forms FOR SELECT USING (visibility = 'public' OR (visibility = 'shared_with_link' AND auth.role() = 'authenticated'));
-- CREATE POLICY "Allow creators to manage their forms" ON forms FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
-- CREATE POLICY "Allow collaborators to manage forms based on role" ON forms USING (id IN (SELECT form_id FROM form_collaborators WHERE user_id = auth.uid()));

-- Questions Table: Stores individual questions within a form.
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) <= 255),
    description TEXT CHECK (char_length(description) <= 1000),
    placeholder TEXT CHECK (char_length(placeholder) <= 255),
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    question_type TEXT NOT NULL CHECK (question_type IN ('short_text', 'long_text', 'single_choice', 'multiple_choice', 'yes_no', 'rating', 'date', 'file_upload', 'location', 'number', 'email', 'phone', 'website', 'statement', 'welcome', 'thank_you')), -- Or use question_type ENUM
    position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
    options JSONB, -- For choice-based questions (array of {id, label, value, description?, imageUrl?})
    validation_rules JSONB, -- Array of validation rules {type, value?, message?}
    conditional_logic JSONB, -- {questionId, operator, value}
    default_value TEXT,
    max_character_count INTEGER CHECK (max_character_count > 0),
    show_character_count BOOLEAN NOT NULL DEFAULT FALSE,
    rating_scale INTEGER CHECK (rating_scale >= 3 AND rating_scale <= 10), -- e.g., 5 or 10
    rating_type TEXT CHECK (rating_type IN ('stars', 'numbers', 'emojis')),
    allowed_file_types TEXT[], -- Array of allowed MIME types or extensions
    max_file_size INTEGER CHECK (max_file_size > 0), -- In bytes
    max_files INTEGER NOT NULL DEFAULT 1 CHECK (max_files > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_questions_form_id ON questions(form_id);
CREATE INDEX IF NOT EXISTS idx_questions_position ON questions(position);
-- RLS Policies (Placeholder - Inherit from forms or define specific rules)
-- CREATE POLICY "Allow form viewers/creators/collaborators to see questions" ON questions FOR SELECT USING (form_id IN (SELECT id FROM forms)); 
-- CREATE POLICY "Allow form creators/editors to manage questions" ON questions FOR ALL USING (form_id IN (SELECT id FROM forms WHERE auth.uid() = created_by)); -- Needs refinement for collaborators

-- Question Branching Table: Defines conditional jumps between questions (optional, alternative to JSONB in questions).
CREATE TABLE IF NOT EXISTS question_branching (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    source_question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    target_question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    condition_type TEXT NOT NULL CHECK (condition_type IN ('equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'starts_with', 'ends_with')), -- Operator
    condition_value TEXT NOT NULL, -- The value to compare against the source question's answer
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_question_id, condition_type, condition_value) -- Prevent duplicate rules for the same condition
);
ALTER TABLE question_branching ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_question_branching_form_id ON question_branching(form_id);
CREATE INDEX IF NOT EXISTS idx_question_branching_source_question_id ON question_branching(source_question_id);
-- RLS Policies (Placeholder)

-- Response Sessions Table: Tracks a single attempt to fill out a form.
CREATE TABLE IF NOT EXISTS response_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    respondent_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Link to user if not anonymous
    ip_address INET, -- Store IP address (consider privacy implications)
    user_agent TEXT, -- Browser/device information
    referrer TEXT, -- How the user arrived at the form
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completion_percentage REAL NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
    current_question_id UUID REFERENCES questions(id) ON DELETE SET NULL, -- Track progress
    access_code_used TEXT -- If an access code was used
);
ALTER TABLE response_sessions ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_response_sessions_form_id ON response_sessions(form_id);
CREATE INDEX IF NOT EXISTS idx_response_sessions_respondent_id ON response_sessions(respondent_id);
CREATE INDEX IF NOT EXISTS idx_response_sessions_is_completed ON response_sessions(is_completed);
-- RLS Policies (Placeholder)
-- CREATE POLICY "Allow respondents to manage their own sessions" ON response_sessions FOR ALL USING (auth.uid() = respondent_id);
-- CREATE POLICY "Allow form creators/collaborators to view sessions" ON response_sessions FOR SELECT USING (form_id IN (SELECT id FROM forms)); -- Needs refinement

-- Responses Table: Stores the actual answers to individual questions within a session.
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES response_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text_value TEXT, -- For text-based answers
    number_value NUMERIC, -- For number answers
    boolean_value BOOLEAN, -- For yes/no answers
    date_value DATE, -- For date answers
    json_value JSONB, -- For complex answers like multiple choice (array) or location ({lat, lon})
    file_urls TEXT[], -- For file uploads (array of URLs to stored files)
    file_metadata JSONB, -- Optional metadata about uploaded files
    response_time_seconds INTEGER CHECK (response_time_seconds >= 0), -- Time spent on this question
    skipped BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (session_id, question_id) -- Ensure only one response per question per session
);
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses(question_id);
-- RLS Policies (Placeholder - Inherit from sessions or define specific rules)
-- CREATE POLICY "Allow session owners/form owners to access responses" ON responses FOR ALL USING (session_id IN (SELECT id FROM response_sessions)); -- Needs refinement

-- Form Templates Table: Stores reusable form structures.
CREATE TABLE IF NOT EXISTS form_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL CHECK (char_length(name) <= 100),
    description TEXT CHECK (char_length(description) <= 500),
    category TEXT,
    form_structure JSONB NOT NULL, -- Contains the form and questions structure
    is_official BOOLEAN NOT NULL DEFAULT FALSE, -- Template provided by the platform
    is_public BOOLEAN NOT NULL DEFAULT FALSE, -- Available for others to use
    use_count INTEGER NOT NULL DEFAULT 0 CHECK (use_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_form_templates_created_by ON form_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_form_templates_category ON form_templates(category);
CREATE INDEX IF NOT EXISTS idx_form_templates_is_public ON form_templates(is_public);
-- RLS Policies (Placeholder)
-- CREATE POLICY "Allow users to view public templates" ON form_templates FOR SELECT USING (is_public = TRUE);
-- CREATE POLICY "Allow creators to manage their templates" ON form_templates FOR ALL USING (auth.uid() = created_by);

-- Form Collaborators Table: Manages user access and roles for specific forms.
CREATE TABLE IF NOT EXISTS form_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')), -- Or use form_collaborator_role ENUM
    invitation_status TEXT NOT NULL DEFAULT 'accepted' CHECK (invitation_status IN ('pending', 'accepted', 'declined')), -- Or use form_invitation_status ENUM
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    UNIQUE (form_id, user_id) -- Ensure only one role per user per form
);
ALTER TABLE form_collaborators ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_form_collaborators_form_id ON form_collaborators(form_id);
CREATE INDEX IF NOT EXISTS idx_form_collaborators_user_id ON form_collaborators(user_id);
-- RLS Policies (Placeholder)
-- CREATE POLICY "Allow users to see their own collaborations" ON form_collaborators FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Allow form creators/admins to manage collaborators" ON form_collaborators FOR ALL USING (form_id IN (SELECT id FROM forms WHERE auth.uid() = created_by)); -- Needs refinement for admin role

-- =========================================
-- FUNCTIONS / TRIGGERS (Optional)
-- =========================================

-- Trigger function to update 'updated_at' timestamp on forms table
CREATE OR REPLACE FUNCTION update_form_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_form_update
    BEFORE UPDATE ON forms
    FOR EACH ROW
    EXECUTE FUNCTION update_form_updated_at();

-- Trigger function to update 'updated_at' timestamp on questions table
CREATE OR REPLACE FUNCTION update_question_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    -- Also update the parent form's updated_at timestamp
    UPDATE forms SET updated_at = now() WHERE id = NEW.form_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_question_update
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_question_updated_at();

-- Trigger function to update session timestamps
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity_at = now();
    IF NEW.is_completed AND OLD.is_completed IS DISTINCT FROM TRUE THEN
        NEW.completed_at = now();
    END IF;
    -- Calculate time spent (simple example, might need refinement)
    IF NEW.completed_at IS NOT NULL THEN
      NEW.time_spent_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::integer;
    ELSE 
      NEW.time_spent_seconds = EXTRACT(EPOCH FROM (NEW.last_activity_at - NEW.started_at))::integer;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_session_update
    BEFORE UPDATE ON response_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_activity();

-- Trigger function to update response timestamps
CREATE OR REPLACE FUNCTION update_response_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    -- Update session last activity
    UPDATE response_sessions SET last_activity_at = now() WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_response_update
    BEFORE UPDATE ON responses
    FOR EACH ROW
    EXECUTE FUNCTION update_response_updated_at();

-- Trigger function to update template timestamps
CREATE OR REPLACE FUNCTION update_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_template_update
    BEFORE UPDATE ON form_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_template_updated_at();


-- Function to calculate form completion rate (example)
CREATE OR REPLACE FUNCTION calculate_form_completion_rate(form_uuid UUID)
RETURNS REAL AS $$
DECLARE
    starts INTEGER;
    completions INTEGER;
BEGIN
    SELECT start_count, completion_count 
    INTO starts, completions
    FROM forms
    WHERE id = form_uuid;

    IF starts = 0 THEN
        RETURN 0.0;
    END IF;

    RETURN (completions::REAL / starts::REAL) * 100.0;
END;
$$ language 'plpgsql';


-- Consider adding functions to safely delete forms/questions if needed,
-- handling related data like responses. 