-- Migration: Forms System Implementation
-- Description: Establishes database schema for Typeform-like forms feature
-- Created: 2025-06-20

/*
This migration implements the core schema for a Typeform-like forms system:
1. Form management tables (forms, questions, responses)
2. Conditional logic and branching capabilities
3. Analytics tracking and template functionality
4. Security policies and performance optimizations

These changes enable users to create, share, and interact with dynamic forms
while maintaining proper security and tracking response analytics.
*/

-- =============================================
-- EXTENSIONS
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TYPES
-- =============================================

-- Question type enum
CREATE TYPE question_type_enum AS ENUM (
  'short_text',       -- Short text input
  'long_text',        -- Multi-line text input
  'single_choice',    -- Single selection from multiple options
  'multiple_choice',  -- Multiple selections from options
  'yes_no',           -- Simple yes/no question
  'rating',           -- Star or numeric rating
  'date',             -- Date picker
  'file_upload',      -- File upload
  'location',         -- Location selection
  'number',           -- Numeric input
  'email',            -- Email input
  'phone',            -- Phone number input
  'website',          -- Website URL input
  'statement',        -- Non-input informational statement
  'welcome',          -- Welcome screen
  'thank_you'         -- Thank you/completion screen
);

-- Form visibility enum
CREATE TYPE form_visibility_enum AS ENUM (
  'private',          -- Only visible to creator and specific users
  'shared_with_link', -- Accessible via direct link
  'public'            -- Publicly listed and accessible
);

-- Form status enum
CREATE TYPE form_status_enum AS ENUM (
  'draft',            -- Work in progress
  'published',        -- Live and accepting responses
  'closed',           -- No longer accepting responses
  'archived'          -- Archived and hidden from normal views
);

-- Question validation type enum
CREATE TYPE validation_type_enum AS ENUM (
  'required',         -- Must be answered
  'min_length',       -- Minimum length for text
  'max_length',       -- Maximum length for text
  'min_value',        -- Minimum value for number
  'max_value',        -- Maximum value for number
  'regex',            -- Custom regex pattern
  'file_type',        -- Allowed file types
  'file_size',        -- Maximum file size
  'email',            -- Valid email format
  'url',              -- Valid URL format
  'phone'             -- Valid phone format
);

-- =============================================
-- FORMS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic form information
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  form_emoji TEXT,
  cover_image_url TEXT,
  
  -- Configuration
  theme_color TEXT,
  font_family TEXT,
  logo_url TEXT,
  show_progress_bar BOOLEAN DEFAULT TRUE,
  show_question_numbers BOOLEAN DEFAULT TRUE,
  
  -- Settings
  visibility form_visibility_enum DEFAULT 'private',
  status form_status_enum DEFAULT 'draft',
  allow_anonymous_responses BOOLEAN DEFAULT FALSE,
  response_limit INTEGER, -- Maximum number of responses allowed
  closes_at TIMESTAMPTZ,  -- When form stops accepting responses
  
  -- Analytics tracking
  view_count INTEGER DEFAULT 0,
  start_count INTEGER DEFAULT 0, -- Number of times form was started
  completion_count INTEGER DEFAULT 0,
  average_time_seconds INTEGER DEFAULT 0,
  
  -- Notifications
  notify_on_response BOOLEAN DEFAULT FALSE,
  notification_email TEXT,
  
  -- Post-completion
  redirect_url TEXT,
  completion_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Authorization code for access to shared forms (instead of auth)
  access_code TEXT
);

-- =============================================
-- QUESTIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  
  -- Question content
  title TEXT NOT NULL,
  description TEXT,
  placeholder TEXT, -- Placeholder text for input fields
  is_required BOOLEAN DEFAULT FALSE,
  
  -- Question configuration
  question_type question_type_enum NOT NULL,
  position INTEGER NOT NULL, -- Order within the form
  
  -- Options for choice questions (single/multiple)
  options JSONB DEFAULT '[]'::JSONB, -- Array of options with structure
  
  -- Validation settings
  validation_rules JSONB DEFAULT '{}'::JSONB, -- Custom validation rules
  
  -- Conditional logic
  conditional_logic JSONB DEFAULT '{}'::JSONB, -- Logic that determines if this question is shown
  
  -- Advanced settings
  default_value TEXT, -- Default answer value
  max_character_count INTEGER, -- For text inputs
  show_character_count BOOLEAN DEFAULT FALSE,
  
  -- For rating questions
  rating_scale INTEGER, -- E.g., 1-5, 1-10
  rating_type TEXT, -- 'stars', 'numbers', etc.
  
  -- For file uploads
  allowed_file_types TEXT[], -- Array of allowed MIME types
  max_file_size INTEGER, -- In bytes
  max_files INTEGER DEFAULT 1,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure questions are ordered within a form
  UNIQUE (form_id, position)
);

-- =============================================
-- QUESTION BRANCHING TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS question_branching (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  source_question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  target_question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Condition for this branch to be followed
  condition_type TEXT NOT NULL, -- 'equals', 'not_equals', 'contains', 'greater_than', etc.
  condition_value TEXT NOT NULL, -- Value to compare against
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Source and target must be different questions in the same form
  CHECK (source_question_id <> target_question_id),
  
  -- Ensure one branching rule per source question + condition
  UNIQUE (source_question_id, condition_type, condition_value)
);

-- =============================================
-- RESPONSE SESSIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS response_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null for anonymous
  
  -- Session tracking
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  
  -- Progress
  is_completed BOOLEAN DEFAULT FALSE,
  completion_percentage SMALLINT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- For partial responses - store current progress
  current_question_id UUID REFERENCES questions(id),
  
  -- For access code protected forms
  access_code_used TEXT
);

-- =============================================
-- RESPONSES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES response_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Responses stored in different formats based on question type
  text_value TEXT, -- For text, email, etc.
  number_value DECIMAL, -- For numeric values
  boolean_value BOOLEAN, -- For yes/no
  date_value DATE, -- For date questions
  json_value JSONB, -- For complex responses like multiple choice or location
  
  -- File responses
  file_urls TEXT[], -- URLs to uploaded files
  file_metadata JSONB, -- Additional file information
  
  -- Response metadata
  response_time_seconds INTEGER, -- Time spent on this question
  skipped BOOLEAN DEFAULT FALSE, -- If question was shown but skipped
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FORM TEMPLATES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Template information
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  
  -- Template content
  form_structure JSONB NOT NULL, -- Complete form structure including questions
  
  -- Template metadata
  is_official BOOLEAN DEFAULT FALSE, -- Official (system) template vs user-created
  is_public BOOLEAN DEFAULT FALSE, -- Whether template is publicly available
  use_count INTEGER DEFAULT 0, -- Times this template was used
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FORM COLLABORATORS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS form_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Collaboration role
  role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'admin')),
  
  -- Invitation status
  invitation_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (invitation_status IN ('pending', 'accepted', 'declined')),
  
  -- Metadata
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  -- Ensure unique collaborator per form
  UNIQUE(form_id, user_id)
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at for forms
CREATE TRIGGER set_form_timestamp
BEFORE UPDATE ON forms
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger to automatically update updated_at for questions
CREATE TRIGGER set_question_timestamp
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger to automatically update updated_at for responses
CREATE TRIGGER set_response_timestamp
BEFORE UPDATE ON responses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Function to update response session on new response
CREATE OR REPLACE FUNCTION update_response_session()
RETURNS TRIGGER AS $$
DECLARE
  _session_id UUID;
  _form_id UUID;
  _total_questions INTEGER;
  _answered_questions INTEGER;
BEGIN
  -- Get session ID
  SELECT session_id INTO _session_id FROM NEW;
  
  -- Update last activity time
  UPDATE response_sessions
  SET last_activity_at = NOW()
  WHERE id = _session_id;
  
  -- Calculate completion percentage
  SELECT form_id INTO _form_id FROM response_sessions WHERE id = _session_id;
  
  SELECT COUNT(*) INTO _total_questions 
  FROM questions 
  WHERE form_id = _form_id AND question_type NOT IN ('welcome', 'thank_you', 'statement');
  
  SELECT COUNT(DISTINCT question_id) INTO _answered_questions 
  FROM responses 
  WHERE session_id = _session_id AND NOT skipped;
  
  -- Update completion percentage
  IF _total_questions > 0 THEN
    UPDATE response_sessions
    SET completion_percentage = (_answered_questions * 100) / _total_questions
    WHERE id = _session_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update response session when new response is recorded
CREATE TRIGGER update_session_on_response
AFTER INSERT ON responses
FOR EACH ROW
EXECUTE FUNCTION update_response_session();

-- Function to generate a unique slug for a form
CREATE OR REPLACE FUNCTION generate_form_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Create a base slug from the title
  base_slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]', '-', 'g'));
  
  -- Trim multiple dashes
  base_slug := REGEXP_REPLACE(base_slug, '-+', '-', 'g');
  
  -- Trim leading and trailing dashes
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- If empty (e.g., title had only special chars), use a default
  IF LENGTH(base_slug) = 0 THEN
    base_slug := 'form';
  END IF;
  
  -- Set initial final slug
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM forms WHERE slug = final_slug AND id <> NEW.id) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  -- Assign the slug
  NEW.slug := final_slug;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate a slug before inserting a form
CREATE TRIGGER generate_form_slug
BEFORE INSERT ON forms
FOR EACH ROW
WHEN (NEW.slug IS NULL)
EXECUTE FUNCTION generate_form_slug();

-- Function to increment template use count
CREATE OR REPLACE FUNCTION increment_template_use_count()
RETURNS TRIGGER AS $$
BEGIN
  -- This trigger would be activated by a separate function that creates forms from templates
  -- The separate function would need to store the template_id in a session variable or similar
  -- For a simplified example, we're assuming a new column was added temporarily
  
  IF TG_ARGV[0] IS NOT NULL THEN
    UPDATE form_templates
    SET use_count = use_count + 1
    WHERE id = TG_ARGV[0]::UUID;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update form analytics when session is completed
CREATE OR REPLACE FUNCTION update_form_analytics_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  _form_id UUID;
  _time_spent INTEGER;
  _current_avg_time INTEGER;
  _current_completion_count INTEGER;
BEGIN
  -- Only process when session is marked as completed
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    -- Get form ID and time spent
    _form_id := NEW.form_id;
    _time_spent := COALESCE(NEW.time_spent_seconds, 0);
    
    -- Get current values
    SELECT average_time_seconds, completion_count 
    INTO _current_avg_time, _current_completion_count
    FROM forms 
    WHERE id = _form_id;
    
    -- Calculate new average time
    -- Formula: new_avg = ((old_avg * old_count) + new_time) / (old_count + 1)
    IF _current_completion_count > 0 THEN
      _current_avg_time := ((_current_avg_time * _current_completion_count) + _time_spent) / (_current_completion_count + 1);
    ELSE
      _current_avg_time := _time_spent;
    END IF;
    
    -- Update form analytics
    UPDATE forms
    SET 
      completion_count = completion_count + 1,
      average_time_seconds = _current_avg_time
    WHERE id = _form_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update form analytics when session is completed
CREATE TRIGGER update_form_analytics_on_session_completion
AFTER UPDATE OF is_completed ON response_sessions
FOR EACH ROW
WHEN (NEW.is_completed = TRUE AND OLD.is_completed = FALSE)
EXECUTE FUNCTION update_form_analytics_on_completion();

-- Function to increment view count for forms
CREATE OR REPLACE FUNCTION increment_form_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forms
  SET view_count = view_count + 1
  WHERE id = NEW.form_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment view count when a new response session starts
CREATE TRIGGER increment_view_count_on_session_start
AFTER INSERT ON response_sessions
FOR EACH ROW
EXECUTE FUNCTION increment_form_view_count();

-- Function to create a form from a template
CREATE OR REPLACE FUNCTION create_form_from_template(
  p_template_id UUID,
  p_user_id UUID,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template RECORD;
  v_form_structure JSONB;
  v_form_id UUID;
  v_question JSONB;
  v_position INTEGER;
BEGIN
  -- Get template details
  SELECT * INTO v_template 
  FROM form_templates 
  WHERE id = p_template_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found';
  END IF;
  
  -- Extract form structure
  v_form_structure := v_template.form_structure;
  
  -- Create new form
  INSERT INTO forms (
    created_by,
    title,
    description,
    theme_color,
    font_family,
    logo_url,
    show_progress_bar,
    show_question_numbers,
    visibility,
    status
  ) VALUES (
    p_user_id,
    COALESCE(p_title, v_template.name),
    COALESCE(p_description, v_template.description),
    COALESCE(v_form_structure->>'theme_color'::TEXT, '#3B82F6'),
    COALESCE(v_form_structure->>'font_family'::TEXT, 'Inter'),
    v_form_structure->>'logo_url'::TEXT,
    COALESCE((v_form_structure->>'show_progress_bar')::BOOLEAN, TRUE),
    COALESCE((v_form_structure->>'show_question_numbers')::BOOLEAN, TRUE),
    'private',
    'draft'
  ) RETURNING id INTO v_form_id;
  
  -- Create questions from template
  v_position := 1;
  FOR v_question IN SELECT * FROM jsonb_array_elements(v_form_structure->'questions')
  LOOP
    INSERT INTO questions (
      form_id,
      title,
      description,
      placeholder,
      is_required,
      question_type,
      position,
      options,
      validation_rules,
      conditional_logic,
      default_value,
      max_character_count,
      show_character_count,
      rating_scale,
      rating_type,
      allowed_file_types,
      max_file_size,
      max_files
    ) VALUES (
      v_form_id,
      v_question->>'title',
      v_question->>'description',
      v_question->>'placeholder',
      COALESCE((v_question->>'is_required')::BOOLEAN, FALSE),
      (v_question->>'question_type')::question_type_enum,
      v_position,
      COALESCE(v_question->'options', '[]'::JSONB),
      COALESCE(v_question->'validation_rules', '{}'::JSONB),
      COALESCE(v_question->'conditional_logic', '{}'::JSONB),
      v_question->>'default_value',
      (v_question->>'max_character_count')::INTEGER,
      COALESCE((v_question->>'show_character_count')::BOOLEAN, FALSE),
      (v_question->>'rating_scale')::INTEGER,
      v_question->>'rating_type',
      (v_question->>'allowed_file_types')::TEXT[],
      (v_question->>'max_file_size')::INTEGER,
      COALESCE((v_question->>'max_files')::INTEGER, 1)
    );
    
    v_position := v_position + 1;
  END LOOP;
  
  -- Increment template use count
  UPDATE form_templates
  SET use_count = use_count + 1
  WHERE id = p_template_id;
  
  RETURN v_form_id;
END;
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS on all form-related tables
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_branching ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_collaborators ENABLE ROW LEVEL SECURITY;

-- Forms table policies
-- Policy: Users can view their own forms
CREATE POLICY "Users can view their own forms"
  ON forms
  FOR SELECT
  USING (created_by = auth.uid());

-- Policy: Users can view forms they collaborate on
CREATE POLICY "Users can view forms they collaborate on"
  ON forms
  FOR SELECT
  USING (id IN (
    SELECT form_id 
    FROM form_collaborators 
    WHERE user_id = auth.uid() AND invitation_status = 'accepted'
  ));

-- Policy: Users can view public forms
CREATE POLICY "Users can view public forms"
  ON forms
  FOR SELECT
  USING (visibility = 'public');

-- Policy: Users can view forms with shared links
CREATE POLICY "Users can view shared link forms"
  ON forms
  FOR SELECT
  USING (visibility = 'shared_with_link');

-- Policy: Users can insert their own forms
CREATE POLICY "Users can insert their own forms"
  ON forms
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Policy: Users can update their own forms
CREATE POLICY "Users can update their own forms"
  ON forms
  FOR UPDATE
  USING (created_by = auth.uid());

-- Policy: Collaborators with editor or admin role can update forms
CREATE POLICY "Collaborators can update forms"
  ON forms
  FOR UPDATE
  USING (id IN (
    SELECT form_id 
    FROM form_collaborators 
    WHERE user_id = auth.uid() AND role IN ('editor', 'admin') AND invitation_status = 'accepted'
  ));

-- Policy: Users can delete their own forms
CREATE POLICY "Users can delete their own forms"
  ON forms
  FOR DELETE
  USING (created_by = auth.uid());

-- Questions table policies
-- Policy: Users can view questions for their forms
CREATE POLICY "Users can view questions for their forms"
  ON questions
  FOR SELECT
  USING (form_id IN (
    SELECT id FROM forms WHERE created_by = auth.uid()
  ));

-- Policy: Collaborators can view questions
CREATE POLICY "Collaborators can view questions"
  ON questions
  FOR SELECT
  USING (form_id IN (
    SELECT form_id 
    FROM form_collaborators 
    WHERE user_id = auth.uid() AND invitation_status = 'accepted'
  ));

-- Policy: Users can view questions for public forms
CREATE POLICY "Users can view questions for public forms"
  ON questions
  FOR SELECT
  USING (form_id IN (
    SELECT id FROM forms WHERE visibility = 'public'
  ));

-- Policy: Users can view questions for shared link forms
CREATE POLICY "Users can view questions for shared link forms"
  ON questions
  FOR SELECT
  USING (form_id IN (
    SELECT id FROM forms WHERE visibility = 'shared_with_link'
  ));

-- Policy: Users can insert questions for their forms
CREATE POLICY "Users can insert questions for their forms"
  ON questions
  FOR INSERT
  WITH CHECK (form_id IN (
    SELECT id FROM forms WHERE created_by = auth.uid()
  ));

-- Policy: Collaborators with editor role can insert questions
CREATE POLICY "Collaborators can insert questions"
  ON questions
  FOR INSERT
  WITH CHECK (form_id IN (
    SELECT form_id 
    FROM form_collaborators 
    WHERE user_id = auth.uid() AND role IN ('editor', 'admin') AND invitation_status = 'accepted'
  ));

-- Policy: Users can update questions for their forms
CREATE POLICY "Users can update questions for their forms"
  ON questions
  FOR UPDATE
  USING (form_id IN (
    SELECT id FROM forms WHERE created_by = auth.uid()
  ));

-- Policy: Collaborators with editor role can update questions
CREATE POLICY "Collaborators can update questions"
  ON questions
  FOR UPDATE
  USING (form_id IN (
    SELECT form_id 
    FROM form_collaborators 
    WHERE user_id = auth.uid() AND role IN ('editor', 'admin') AND invitation_status = 'accepted'
  ));

-- Policy: Users can delete questions for their forms
CREATE POLICY "Users can delete questions for their forms"
  ON questions
  FOR DELETE
  USING (form_id IN (
    SELECT id FROM forms WHERE created_by = auth.uid()
  ));

-- Response sessions policies
-- Policy: Users can view their own response sessions
CREATE POLICY "Users can view their own response sessions"
  ON response_sessions
  FOR SELECT
  USING (respondent_id = auth.uid());

-- Policy: Form owners can view all response sessions for their forms
CREATE POLICY "Form owners can view response sessions"
  ON response_sessions
  FOR SELECT
  USING (form_id IN (
    SELECT id FROM forms WHERE created_by = auth.uid()
  ));

-- Policy: Collaborators can view response sessions
CREATE POLICY "Collaborators can view response sessions"
  ON response_sessions
  FOR SELECT
  USING (form_id IN (
    SELECT form_id 
    FROM form_collaborators 
    WHERE user_id = auth.uid() AND invitation_status = 'accepted'
  ));

-- Policy: Users can insert response sessions
CREATE POLICY "Users can insert response sessions"
  ON response_sessions
  FOR INSERT
  WITH CHECK (
    -- For authenticated users
    (auth.uid() IS NOT NULL AND respondent_id = auth.uid()) OR
    -- For anonymous responses (if the form allows it)
    (form_id IN (
      SELECT id FROM forms WHERE allow_anonymous_responses = TRUE
    ))
  );

-- Policy: Users can update their own response sessions
CREATE POLICY "Users can update their own response sessions"
  ON response_sessions
  FOR UPDATE
  USING (respondent_id = auth.uid());

-- Responses policies
-- Policy: Users can view their own responses
CREATE POLICY "Users can view their own responses"
  ON responses
  FOR SELECT
  USING (session_id IN (
    SELECT id FROM response_sessions WHERE respondent_id = auth.uid()
  ));

-- Policy: Form owners can view all responses for their forms
CREATE POLICY "Form owners can view responses"
  ON responses
  FOR SELECT
  USING (session_id IN (
    SELECT rs.id 
    FROM response_sessions rs
    JOIN forms f ON rs.form_id = f.id
    WHERE f.created_by = auth.uid()
  ));

-- Policy: Collaborators can view responses
CREATE POLICY "Collaborators can view responses"
  ON responses
  FOR SELECT
  USING (session_id IN (
    SELECT rs.id 
    FROM response_sessions rs
    JOIN form_collaborators fc ON rs.form_id = fc.form_id
    WHERE fc.user_id = auth.uid() AND fc.invitation_status = 'accepted'
  ));

-- Policy: Users can insert their own responses
CREATE POLICY "Users can insert responses"
  ON responses
  FOR INSERT
  WITH CHECK (session_id IN (
    SELECT id FROM response_sessions WHERE respondent_id = auth.uid() OR respondent_id IS NULL
  ));

-- Form templates policies
-- Policy: Everyone can view public templates
CREATE POLICY "Everyone can view public templates"
  ON form_templates
  FOR SELECT
  USING (is_public = TRUE);

-- Policy: Users can view their own templates
CREATE POLICY "Users can view their own templates"
  ON form_templates
  FOR SELECT
  USING (created_by = auth.uid());

-- Policy: Users can insert their own templates
CREATE POLICY "Users can insert their own templates"
  ON form_templates
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Policy: Users can update their own templates
CREATE POLICY "Users can update their own templates"
  ON form_templates
  FOR UPDATE
  USING (created_by = auth.uid());

-- Policy: Users can delete their own templates
CREATE POLICY "Users can delete their own templates"
  ON form_templates
  FOR DELETE
  USING (created_by = auth.uid());

-- Form collaborators policies
-- Policy: Users can view collaborators for their forms
CREATE POLICY "Users can view collaborators for their forms"
  ON form_collaborators
  FOR SELECT
  USING (form_id IN (
    SELECT id FROM forms WHERE created_by = auth.uid()
  ));

-- Policy: Users can view their own collaborations
CREATE POLICY "Users can view their own collaborations"
  ON form_collaborators
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Form owners can manage collaborators
CREATE POLICY "Form owners can manage collaborators"
  ON form_collaborators
  FOR ALL
  USING (form_id IN (
    SELECT id FROM forms WHERE created_by = auth.uid()
  ));

-- =============================================
-- INDEXES
-- =============================================

-- Indexes for forms table
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON forms(created_by);
CREATE INDEX IF NOT EXISTS idx_forms_visibility ON forms(visibility);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_slug ON forms(slug);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at);

-- Indexes for questions table
CREATE INDEX IF NOT EXISTS idx_questions_form_id ON questions(form_id);
CREATE INDEX IF NOT EXISTS idx_questions_position ON questions(form_id, position);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);

-- Indexes for question_branching table
CREATE INDEX IF NOT EXISTS idx_question_branching_form_id ON question_branching(form_id);
CREATE INDEX IF NOT EXISTS idx_question_branching_source ON question_branching(source_question_id);
CREATE INDEX IF NOT EXISTS idx_question_branching_target ON question_branching(target_question_id);

-- Indexes for response_sessions table
CREATE INDEX IF NOT EXISTS idx_response_sessions_form_id ON response_sessions(form_id);
CREATE INDEX IF NOT EXISTS idx_response_sessions_respondent ON response_sessions(respondent_id);
CREATE INDEX IF NOT EXISTS idx_response_sessions_completed ON response_sessions(is_completed);
CREATE INDEX IF NOT EXISTS idx_response_sessions_started_at ON response_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_response_sessions_completed_at ON response_sessions(completed_at);

-- Indexes for responses table
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses(question_id);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at);
CREATE INDEX IF NOT EXISTS idx_responses_text_value ON responses(text_value) WHERE text_value IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_responses_boolean_value ON responses(boolean_value) WHERE boolean_value IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_responses_skipped ON responses(skipped);

-- Indexes for form_templates table
CREATE INDEX IF NOT EXISTS idx_form_templates_created_by ON form_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_form_templates_is_public ON form_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_form_templates_category ON form_templates(category);
CREATE INDEX IF NOT EXISTS idx_form_templates_use_count ON form_templates(use_count);

-- Indexes for form_collaborators table
CREATE INDEX IF NOT EXISTS idx_form_collaborators_form_id ON form_collaborators(form_id);
CREATE INDEX IF NOT EXISTS idx_form_collaborators_user_id ON form_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_form_collaborators_role ON form_collaborators(role);
CREATE INDEX IF NOT EXISTS idx_form_collaborators_status ON form_collaborators(invitation_status);

-- =============================================
-- COMMENTS
-- =============================================

-- Add helpful comments to tables
COMMENT ON TABLE forms IS 'Stores form metadata, settings, and analytics';
COMMENT ON TABLE questions IS 'Stores individual questions for forms with their configurations';
COMMENT ON TABLE question_branching IS 'Defines conditional logic for question flow';
COMMENT ON TABLE response_sessions IS 'Tracks user sessions for form responses';
COMMENT ON TABLE responses IS 'Stores individual question responses from users';
COMMENT ON TABLE form_templates IS 'Contains reusable form templates';
COMMENT ON TABLE form_collaborators IS 'Manages form collaboration permissions';

-- Forms table column comments
COMMENT ON COLUMN forms.title IS 'Form title displayed to users';
COMMENT ON COLUMN forms.description IS 'Optional form description/instructions';
COMMENT ON COLUMN forms.visibility IS 'Controls who can access the form';
COMMENT ON COLUMN forms.status IS 'Current form status (draft, published, closed, etc.)';
COMMENT ON COLUMN forms.allow_anonymous_responses IS 'Whether responses can be submitted without authentication';
COMMENT ON COLUMN forms.response_limit IS 'Maximum number of responses to collect (null for unlimited)';
COMMENT ON COLUMN forms.closes_at IS 'Time when form stops accepting new responses';
COMMENT ON COLUMN forms.completion_count IS 'Number of completed responses received';
COMMENT ON COLUMN forms.average_time_seconds IS 'Average time to complete the form';

-- Questions table column comments
COMMENT ON COLUMN questions.title IS 'The question text displayed to the user';
COMMENT ON COLUMN questions.description IS 'Optional additional explanation or instructions';
COMMENT ON COLUMN questions.is_required IS 'Whether an answer is required to proceed';
COMMENT ON COLUMN questions.question_type IS 'Type of question (text, multiple-choice, etc.)';
COMMENT ON COLUMN questions.position IS 'Order of the question within the form';
COMMENT ON COLUMN questions.options IS 'For choice-based questions, the available options';
COMMENT ON COLUMN questions.conditional_logic IS 'Rules for when this question should be shown';

-- Response sessions table column comments
COMMENT ON COLUMN response_sessions.respondent_id IS 'User ID for authenticated respondents, null for anonymous';
COMMENT ON COLUMN response_sessions.is_completed IS 'Whether the user has completed the form';
COMMENT ON COLUMN response_sessions.completion_percentage IS 'Percentage of questions answered';
COMMENT ON COLUMN response_sessions.time_spent_seconds IS 'Total time user spent on the form';

-- Responses table column comments
COMMENT ON COLUMN responses.text_value IS 'Text response for text-based questions';
COMMENT ON COLUMN responses.number_value IS 'Numeric response for number questions';
COMMENT ON COLUMN responses.boolean_value IS 'Boolean response for yes/no questions';
COMMENT ON COLUMN responses.json_value IS 'JSON data for complex responses like multiple choice';
COMMENT ON COLUMN responses.file_urls IS 'Array of URLs to uploaded files';
COMMENT ON COLUMN responses.response_time_seconds IS 'Time spent on this specific question';

