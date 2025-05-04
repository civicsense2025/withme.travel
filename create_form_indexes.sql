-- Create indexes for forms tables
CREATE INDEX IF NOT EXISTS idx_forms_trip_id ON public.forms(trip_id);
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON public.forms(created_by);
CREATE INDEX IF NOT EXISTS idx_forms_template_id ON public.forms(template_id);
CREATE INDEX IF NOT EXISTS idx_questions_form_id ON public.questions(form_id);
CREATE INDEX IF NOT EXISTS idx_response_sessions_form_id ON public.response_sessions(form_id);
CREATE INDEX IF NOT EXISTS idx_response_sessions_user_id ON public.response_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON public.responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON public.responses(question_id);
CREATE INDEX IF NOT EXISTS idx_form_collaborators_form_id ON public.form_collaborators(form_id);
CREATE INDEX IF NOT EXISTS idx_form_collaborators_user_id ON public.form_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_question_branching_form_id ON public.question_branching(form_id);
CREATE INDEX IF NOT EXISTS idx_question_branching_source_question_id ON public.question_branching(source_question_id);
CREATE INDEX IF NOT EXISTS idx_question_branching_target_question_id ON public.question_branching(target_question_id); 