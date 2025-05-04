-- Create feedback_forms table
CREATE TABLE IF NOT EXISTS public.feedback_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  feedback_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  target_feature TEXT,
  target_page TEXT,
  display_trigger TEXT,
  trigger_value TEXT,
  show_progress_bar BOOLEAN DEFAULT TRUE,
  completion_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.feedback_forms IS 'Stores feedback form definitions for the application';

-- Create feedback_questions table
CREATE TABLE IF NOT EXISTS public.feedback_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.feedback_forms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  question_type TEXT NOT NULL,
  position INTEGER NOT NULL,
  options JSONB,
  rating_scale INTEGER,
  placeholder TEXT,
  max_character_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_form_id ON public.feedback_questions(form_id);

COMMENT ON TABLE public.feedback_questions IS 'Stores questions for feedback forms';

-- Create feedback_sessions table
CREATE TABLE IF NOT EXISTS public.feedback_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.feedback_forms(id),
  respondent_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  user_agent TEXT,
  ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_form_id ON public.feedback_sessions(form_id);
CREATE INDEX IF NOT EXISTS idx_sessions_respondent_id ON public.feedback_sessions(respondent_id);

COMMENT ON TABLE public.feedback_sessions IS 'Tracks feedback submission sessions';

-- Create feedback_responses table
CREATE TABLE IF NOT EXISTS public.feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.feedback_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.feedback_questions(id),
  respondent_id UUID REFERENCES auth.users(id),
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_responses_session_id ON public.feedback_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON public.feedback_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_responses_respondent_id ON public.feedback_responses(respondent_id);

COMMENT ON TABLE public.feedback_responses IS 'Stores individual responses to feedback questions';

-- Row Level Security (RLS) Policies

-- feedback_forms RLS
ALTER TABLE public.feedback_forms ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to view active forms
CREATE POLICY "Active forms are viewable by all users" 
  ON public.feedback_forms FOR SELECT
  USING (status = 'active');

-- Only administrators can manage forms
CREATE POLICY "Administrators can manage all forms" 
  ON public.feedback_forms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.app_metadata->>'role' = 'admin'
    )
  );

-- feedback_questions RLS
ALTER TABLE public.feedback_questions ENABLE ROW LEVEL SECURITY;

-- Questions are viewable by anyone
CREATE POLICY "Questions are viewable by all users" 
  ON public.feedback_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.feedback_forms
      WHERE public.feedback_forms.id = form_id
      AND public.feedback_forms.status = 'active'
    )
  );

-- Only administrators can manage questions
CREATE POLICY "Administrators can manage all questions" 
  ON public.feedback_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.app_metadata->>'role' = 'admin'
    )
  );

-- feedback_sessions RLS
ALTER TABLE public.feedback_sessions ENABLE ROW LEVEL SECURITY;

-- Users can create feedback sessions
CREATE POLICY "Users can create feedback sessions" 
  ON public.feedback_sessions FOR INSERT
  WITH CHECK (true);

-- Users can only view their own feedback sessions
CREATE POLICY "Users can view their own feedback sessions" 
  ON public.feedback_sessions FOR SELECT
  USING (respondent_id = auth.uid() OR respondent_id IS NULL);

-- Administrators can view all feedback sessions
CREATE POLICY "Administrators can view all feedback sessions" 
  ON public.feedback_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.app_metadata->>'role' = 'admin'
    )
  );

-- feedback_responses RLS
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

-- Users can create feedback responses
CREATE POLICY "Users can create feedback responses" 
  ON public.feedback_responses FOR INSERT
  WITH CHECK (true);

-- Users can only view their own feedback responses
CREATE POLICY "Users can view their own feedback responses" 
  ON public.feedback_responses FOR SELECT
  USING (respondent_id = auth.uid() OR respondent_id IS NULL);

-- Administrators can view all feedback responses
CREATE POLICY "Administrators can view all feedback responses" 
  ON public.feedback_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.app_metadata->>'role' = 'admin'
    )
  ); 