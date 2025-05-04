-- Start transaction for atomicity
BEGIN;

-- ===== Check for existing tables and safely create schema =====

-- First check if tables exist to avoid errors
DO $$ 
BEGIN
    -- Check for form-related tables
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'forms') THEN
        
        -- Main Forms table
        CREATE TABLE forms (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          form_type TEXT NOT NULL,
          is_template BOOLEAN DEFAULT false,
          template_id UUID,
          settings JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          created_by UUID REFERENCES auth.users(id),
          is_published BOOLEAN DEFAULT false,
          publish_date TIMESTAMP WITH TIME ZONE,
          close_date TIMESTAMP WITH TIME ZONE,
          status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
          auto_process_responses BOOLEAN DEFAULT false,
          display_in_saved BOOLEAN DEFAULT true
        );
        
        -- Add self-reference after table creation
        ALTER TABLE forms ADD CONSTRAINT forms_template_id_fkey 
          FOREIGN KEY (template_id) REFERENCES forms(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Created forms table';
    ELSE
        -- Table exists, check for and add missing columns
        BEGIN
            ALTER TABLE forms ADD COLUMN IF NOT EXISTS auto_process_responses BOOLEAN DEFAULT false;
            ALTER TABLE forms ADD COLUMN IF NOT EXISTS display_in_saved BOOLEAN DEFAULT true;
            ALTER TABLE forms ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;
            ALTER TABLE forms ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES forms(id) ON DELETE SET NULL;
            ALTER TABLE forms ADD COLUMN IF NOT EXISTS form_type TEXT;
            ALTER TABLE forms ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed'));
            RAISE NOTICE 'Updated forms table with new columns';
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'Error updating forms table: %', SQLERRM;
        END;
    END IF;
    
    -- Form questions table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'form_questions') THEN
        CREATE TABLE form_questions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
          question_text TEXT NOT NULL,
          description TEXT,
          question_type TEXT NOT NULL,
          is_required BOOLEAN DEFAULT false,
          position INTEGER NOT NULL,
          config JSONB DEFAULT '{}'::jsonb,
          conditional_logic JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          impacts_trip_detail BOOLEAN DEFAULT false,
          impacts_itinerary BOOLEAN DEFAULT false,
          impacts_preferences BOOLEAN DEFAULT false,
          impact_mapping JSONB DEFAULT '{}'::jsonb
        );
        
        -- Add check constraint for question types
        ALTER TABLE form_questions ADD CONSTRAINT valid_question_types 
          CHECK (question_type IN (
            'short_text', 'long_text', 'email',
            'single_choice', 'multiple_choice', 'yes_no',
            'star_rating', 'nps', 'numeric_scale',
            'image_choice', 'color_picker', 'emoji_reaction',
            'date_picker', 'budget_slider', 'location_picker',
            'drag_to_rank', 'budget_allocator', 'matrix_rating',
            'activity_interest', 'accommodation_style', 'dining_preferences',
            'availability_matcher', 'group_decision', 'responsibility_assignment',
            'welcome_screen', 'instructions', 'thank_you'
          ));
        
        RAISE NOTICE 'Created form_questions table';
    ELSE
        -- Table exists, check for and add missing columns
        BEGIN
            ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS impacts_trip_detail BOOLEAN DEFAULT false;
            ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS impacts_itinerary BOOLEAN DEFAULT false;
            ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS impacts_preferences BOOLEAN DEFAULT false;
            ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS impact_mapping JSONB DEFAULT '{}'::jsonb;
            RAISE NOTICE 'Updated form_questions table with new columns';
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'Error updating form_questions table: %', SQLERRM;
        END;
    END IF;
    
    -- Question Options table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'form_question_options') THEN
        CREATE TABLE form_question_options (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          question_id UUID NOT NULL REFERENCES form_questions(id) ON DELETE CASCADE,
          option_text TEXT NOT NULL,
          option_value TEXT,
          image_url TEXT,
          color_value TEXT,
          emoji TEXT,
          position INTEGER NOT NULL,
          additional_data JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        RAISE NOTICE 'Created form_question_options table';
    END IF;
    
    -- Form Sessions table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'form_sessions') THEN
        CREATE TABLE form_sessions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id),
          start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
          completion_time TIMESTAMP WITH TIME ZONE,
          completion_status TEXT DEFAULT 'in_progress' CHECK (
            completion_status IN ('in_progress', 'completed', 'abandoned')
          ),
          device_info JSONB DEFAULT '{}'::jsonb,
          progress INTEGER DEFAULT 0,
          last_question_id UUID REFERENCES form_questions(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          progress_expires_at TIMESTAMP WITH TIME ZONE,
          is_bookmarked BOOLEAN DEFAULT false,
          bookmark_name TEXT,
          display_in_saved BOOLEAN DEFAULT true
        );
        
        RAISE NOTICE 'Created form_sessions table';
    ELSE
        -- Table exists, check for and add missing columns
        BEGIN
            ALTER TABLE form_sessions ADD COLUMN IF NOT EXISTS progress_expires_at TIMESTAMP WITH TIME ZONE;
            ALTER TABLE form_sessions ADD COLUMN IF NOT EXISTS is_bookmarked BOOLEAN DEFAULT false;
            ALTER TABLE form_sessions ADD COLUMN IF NOT EXISTS bookmark_name TEXT;
            ALTER TABLE form_sessions ADD COLUMN IF NOT EXISTS display_in_saved BOOLEAN DEFAULT true;
            RAISE NOTICE 'Updated form_sessions table with new columns';
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'Error updating form_sessions table: %', SQLERRM;
        END;
    END IF;
    
    -- Form Responses table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'form_responses') THEN
        CREATE TABLE form_responses (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          session_id UUID NOT NULL REFERENCES form_sessions(id) ON DELETE CASCADE,
          question_id UUID NOT NULL REFERENCES form_questions(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id),
          response_value TEXT,
          response_data JSONB DEFAULT '{}'::jsonb,
          selected_options UUID[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          is_processed BOOLEAN DEFAULT false,
          processed_at TIMESTAMP WITH TIME ZONE
        );
        
        RAISE NOTICE 'Created form_responses table';
    ELSE
        -- Table exists, check for and add missing columns
        BEGIN
            ALTER TABLE form_responses ADD COLUMN IF NOT EXISTS is_processed BOOLEAN DEFAULT false;
            ALTER TABLE form_responses ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Updated form_responses table with new columns';
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'Error updating form_responses table: %', SQLERRM;
        END;
    END IF;
    
    -- Form impacts tracking
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'form_impacts') THEN
        CREATE TABLE form_impacts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
          impact_type TEXT NOT NULL CHECK (
            impact_type IN ('trip_detail', 'itinerary_item', 'preference', 'budget', 'accommodation', 'transportation')
          ),
          target_id UUID,
          question_id UUID REFERENCES form_questions(id),
          impact_config JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        RAISE NOTICE 'Created form_impacts table';
    END IF;
    
    -- Trip Logistics table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trip_logistics') THEN
        CREATE TABLE trip_logistics (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
          form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
          type TEXT NOT NULL CHECK (type IN ('form', 'accommodation', 'transportation')),
          title TEXT NOT NULL,
          description TEXT,
          location TEXT,
          start_date TIMESTAMP WITH TIME ZONE,
          end_date TIMESTAMP WITH TIME ZONE,
          details JSONB DEFAULT '{}'::jsonb,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          created_by UUID REFERENCES auth.users(id),
          display_in_saved BOOLEAN DEFAULT true
        );
        
        RAISE NOTICE 'Created trip_logistics table';
    ELSE
        -- Table exists, check for and add missing columns
        BEGIN
            ALTER TABLE trip_logistics ADD COLUMN IF NOT EXISTS form_id UUID REFERENCES forms(id) ON DELETE SET NULL;
            ALTER TABLE trip_logistics ADD COLUMN IF NOT EXISTS display_in_saved BOOLEAN DEFAULT true;
            RAISE NOTICE 'Updated trip_logistics table with new columns';
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'Error updating trip_logistics table: %', SQLERRM;
        END;
    END IF;
    
    -- Form analytics
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'form_analytics') THEN
        CREATE TABLE form_analytics (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
          total_views INTEGER DEFAULT 0,
          total_starts INTEGER DEFAULT 0,
          total_completions INTEGER DEFAULT 0,
          average_completion_time INTEGER,
          abandonment_rate NUMERIC,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        RAISE NOTICE 'Created form_analytics table';
    END IF;
    
    -- Question analytics
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'question_analytics') THEN
        CREATE TABLE question_analytics (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          question_id UUID NOT NULL REFERENCES form_questions(id) ON DELETE CASCADE,
          views INTEGER DEFAULT 0,
          skips INTEGER DEFAULT 0,
          average_time_spent INTEGER,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        RAISE NOTICE 'Created question_analytics table';
    END IF;
END IF;

-- ===== Create or replace functions and triggers =====

-- Function for setting updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to set form progress expiration
CREATE OR REPLACE FUNCTION set_form_progress_expiration() 
RETURNS TRIGGER AS $$
BEGIN
  -- Set expiration to 72 hours from now
  NEW.progress_expires_at := NOW() + INTERVAL '72 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update form analytics on completion
CREATE OR REPLACE FUNCTION update_form_analytics_on_completion() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completion_status = 'completed' AND 
     (OLD.completion_status IS NULL OR OLD.completion_status != 'completed') THEN
    
    -- Check if analytics entry exists
    IF EXISTS (SELECT 1 FROM form_analytics WHERE form_id = NEW.form_id) THEN
      -- Update existing analytics
      UPDATE form_analytics
      SET 
        total_completions = total_completions + 1,
        average_completion_time = (
          CASE 
            WHEN average_completion_time IS NULL OR total_completions = 0 THEN 
              EXTRACT(EPOCH FROM (NEW.completion_time - NEW.start_time))::INTEGER
            ELSE
              ((average_completion_time * total_completions) + 
               EXTRACT(EPOCH FROM (NEW.completion_time - NEW.start_time))::INTEGER) / (total_completions + 1)
          END
        ),
        updated_at = NOW()
      WHERE form_id = NEW.form_id;
    ELSE
      -- Insert new analytics record
      INSERT INTO form_analytics (
        form_id, 
        total_completions,
        average_completion_time,
        updated_at
      ) VALUES (
        NEW.form_id,
        1,
        EXTRACT(EPOCH FROM (NEW.completion_time - NEW.start_time))::INTEGER,
        NOW()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== Create or replace triggers =====

-- Drop existing triggers if they exist to avoid duplicates
DROP TRIGGER IF EXISTS set_forms_updated_at ON forms;
DROP TRIGGER IF EXISTS set_form_questions_updated_at ON form_questions;
DROP TRIGGER IF EXISTS set_form_sessions_updated_at ON form_sessions;
DROP TRIGGER IF EXISTS set_form_responses_updated_at ON form_responses;
DROP TRIGGER IF EXISTS set_form_session_expiration ON form_sessions;
DROP TRIGGER IF EXISTS update_analytics_on_completion ON form_sessions;
DROP TRIGGER IF EXISTS set_trip_logistics_updated_at ON trip_logistics;

-- Create triggers for updated_at timestamp
CREATE TRIGGER set_forms_updated_at
BEFORE UPDATE ON forms
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER set_form_questions_updated_at
BEFORE UPDATE ON form_questions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER set_form_sessions_updated_at
BEFORE UPDATE ON form_sessions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER set_form_responses_updated_at
BEFORE UPDATE ON form_responses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER set_trip_logistics_updated_at
BEFORE UPDATE ON trip_logistics
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

-- Create trigger for form session expiration
CREATE TRIGGER set_form_session_expiration
BEFORE INSERT OR UPDATE ON form_sessions
FOR EACH ROW
WHEN (NEW.completion_status = 'in_progress')
EXECUTE FUNCTION set_form_progress_expiration();

-- Create trigger for analytics updates
CREATE TRIGGER update_analytics_on_completion
AFTER UPDATE ON form_sessions
FOR EACH ROW
EXECUTE FUNCTION update_form_analytics_on_completion();

-- ===== Create or replace views =====

CREATE OR REPLACE VIEW user_saved_items AS
-- Form responses
SELECT 
  'form_response' as item_type,
  fs.id as item_id,
  f.trip_id,
  f.title as item_title,
  t.name as trip_name,
  fs.completion_time as saved_at,
  fs.bookmark_name as custom_name,
  fs.user_id
FROM form_sessions fs
JOIN forms f ON f.id = fs.form_id
LEFT JOIN trips t ON t.id = f.trip_id
WHERE fs.display_in_saved = true
  AND fs.completion_status = 'completed'

UNION ALL

-- Trip logistics items
SELECT 
  'logistics' as item_type,
  tl.id as item_id,
  tl.trip_id,
  tl.title as item_title,
  t.name as trip_name,
  tl.created_at as saved_at,
  NULL as custom_name,
  tl.created_by as user_id
FROM trip_logistics tl
JOIN trips t ON t.id = tl.trip_id
WHERE tl.display_in_saved = true;

-- ===== Create indexes for performance =====

-- Only create indexes if they don't exist already
DO $$
BEGIN
    -- Forms indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'forms_trip_id_idx') THEN
        CREATE INDEX forms_trip_id_idx ON forms(trip_id);
        RAISE NOTICE 'Created forms_trip_id_idx';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'forms_template_id_idx') THEN
        CREATE INDEX forms_template_id_idx ON forms(template_id);
        RAISE NOTICE 'Created forms_template_id_idx';
    END IF;

    -- Form questions indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'form_questions_form_id_idx') THEN
        CREATE INDEX form_questions_form_id_idx ON form_questions(form_id);
        RAISE NOTICE 'Created form_questions_form_id_idx';
    END IF;

    -- Question options indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'form_question_options_question_id_idx') THEN
        CREATE INDEX form_question_options_question_id_idx ON form_question_options(question_id);
        RAISE NOTICE 'Created form_question_options_question_id_idx';
    END IF;

    -- Sessions indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'form_sessions_form_id_idx') THEN
        CREATE INDEX form_sessions_form_id_idx ON form_sessions(form_id);
        RAISE NOTICE 'Created form_sessions_form_id_idx';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'form_sessions_user_id_idx') THEN
        CREATE INDEX form_sessions_user_id_idx ON form_sessions(user_id);
        RAISE NOTICE 'Created form_sessions_user_id_idx';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'form_sessions_progress_idx') THEN
        CREATE INDEX form_sessions_progress_idx ON form_sessions(user_id, completion_status, progress_expires_at);
        RAISE NOTICE 'Created form_sessions_progress_idx';
    END IF;

    -- Responses indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'form_responses_session_id_idx') THEN
        CREATE INDEX form_responses_session_id_idx ON form_responses(session_id);
        RAISE NOTICE 'Created form_responses_session_id_idx';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'form_responses_question_id_idx') THEN
        CREATE INDEX form_responses_question_id_idx ON form_responses(question_id);
        RAISE NOTICE 'Created form_responses_question_id_idx';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'form_responses_user_id_idx') THEN
        CREATE INDEX form_responses_user_id_idx ON form_responses(user_id);
        RAISE NOTICE 'Created form_responses_user_id_idx';
    END IF;

    -- Logistics indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'trip_logistics_trip_id_idx') THEN
        CREATE INDEX trip_logistics_trip_id_idx ON trip_logistics(trip_id);
        RAISE NOTICE 'Created trip_logistics_trip_id_idx';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'trip_logistics_form_id_idx') THEN
        CREATE INDEX trip_logistics_form_id_idx ON trip_logistics(form_id);
        RAISE NOTICE 'Created trip_logistics_form_id_idx';
    END IF;
END $$;

-- ===== Set up RLS policies =====

-- Enable RLS on all tables
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates
DROP POLICY IF EXISTS "Trip members can view forms" ON forms;
DROP POLICY IF EXISTS "Trip admins and editors can manage forms" ON forms;
DROP POLICY IF EXISTS "Users can view their own responses" ON form_responses;
DROP POLICY IF EXISTS "Users can manage their own responses" ON form_responses;
DROP POLICY IF EXISTS "Trip members can view form questions" ON form_questions;
DROP POLICY IF EXISTS "Trip members can view question options" ON form_question_options;
DROP POLICY IF EXISTS "Trip members can view and create sessions" ON form_sessions;
DROP POLICY IF EXISTS "Trip members can view trip logistics" ON trip_logistics;
DROP POLICY IF EXISTS "Trip admins and editors can manage trip logistics" ON trip_logistics;

-- Forms policies
CREATE POLICY "Trip members can view forms" ON forms
FOR SELECT USING (
  (is_template = true) OR -- Templates are visible to all
  EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_members.trip_id = forms.trip_id
    AND trip_members.user_id = auth.uid()
  )
);

CREATE POLICY "Trip admins and editors can manage forms" ON forms
FOR ALL USING (
  (is_template = true AND EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())) OR
  EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_members.trip_id = forms.trip_id
    AND trip_members.user_id = auth.uid()
    AND trip_members.role IN ('admin', 'editor')
  )
);

-- Form questions policies
CREATE POLICY "Trip members can view form questions" ON form_questions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM forms
    JOIN trip_members ON trip_members.trip_id = forms.trip_id
    WHERE forms.id = form_questions.form_id
    AND trip_members.user_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_questions.form_id
    AND forms.is_template = true
  )
);

-- Question options policies
CREATE POLICY "Trip members can view question options" ON form_question_options
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM form_questions
    JOIN forms ON forms.id = form_questions.form_id
    JOIN trip_members ON trip_members.trip_id = forms.trip_id
    WHERE form_questions.id = form_question_options.question_id
    AND trip_members.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM form_questions
    JOIN forms ON forms.id = form_questions.form_id
    WHERE form_questions.id = form_question_options.question_id
    AND forms.is_template = true
  )
);

-- Form sessions policies
CREATE POLICY "Trip members can view and create sessions" ON form_sessions
FOR ALL USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM forms
    JOIN trip_members ON trip_members.trip_id = forms.trip_id
    WHERE forms.id = form_sessions.form_id
    AND trip_members.user_id = auth.uid()
    AND trip_members.role IN ('admin', 'editor')
  )
);

-- Response policies
CREATE POLICY "Users can view their own responses" ON form_responses
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM form_sessions
    JOIN forms ON forms.id = form_sessions.form_id
    JOIN trip_members ON trip_members.trip_id = forms.trip_id
    WHERE form_sessions.id = form_responses.session_id
    AND trip_members.user_id = auth.uid()
    AND trip_members.role IN ('admin', 'editor')
  )
);

CREATE POLICY "Users can manage their own responses" ON form_responses
FOR ALL USING (
  user_id = auth.uid()
);

-- Trip logistics policies
CREATE POLICY "Trip members can view trip logistics" ON trip_logistics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_members.trip_id = trip_logistics.trip_id
    AND trip_members.user_id = auth.uid()
  )
);

CREATE POLICY "Trip admins and editors can manage trip logistics" ON trip_logistics
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_members.trip_id = trip_logistics.trip_id
    AND trip_members.user_id = auth.uid()
    AND trip_members.role IN ('admin', 'editor')
  )
);

-- Commit transaction
COMMIT;