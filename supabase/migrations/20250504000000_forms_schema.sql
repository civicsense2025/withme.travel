-- Forms schema migration

-- Form Templates table
CREATE TABLE IF NOT EXISTS public.form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    tags TEXT[],
    form_type TEXT NOT NULL,
    is_published BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    template_data JSONB
);

-- Forms table
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    visibility TEXT NOT NULL DEFAULT 'private',
    form_type TEXT NOT NULL,
    allow_anonymous BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ,
    metadata JSONB,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    parent_form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.form_templates(id) ON DELETE SET NULL,
    is_template BOOLEAN DEFAULT false,
    settings JSONB,
    custom_theme JSONB,
    logo_url TEXT,
    progress_save_duration INTEGER DEFAULT 72,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    placeholder TEXT,
    is_required BOOLEAN DEFAULT false,
    question_type TEXT NOT NULL,
    position INTEGER,
    options JSONB,
    validation_rules JSONB,
    conditional_logic JSONB,
    default_value TEXT,
    max_character_count INTEGER,
    show_character_count BOOLEAN DEFAULT false,
    rating_scale INTEGER,
    rating_type TEXT,
    allowed_file_types TEXT[],
    max_file_size INTEGER,
    max_files INTEGER
);

-- Response Sessions table
CREATE TABLE IF NOT EXISTS public.response_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    expires_at TIMESTAMPTZ,
    progress JSONB
);

-- Responses table
CREATE TABLE IF NOT EXISTS public.responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    session_id UUID NOT NULL REFERENCES public.response_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    value TEXT,
    value_json JSONB,
    metadata JSONB,
    files TEXT[]
);

-- Form Collaborators table
CREATE TABLE IF NOT EXISTS public.form_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    accepted BOOLEAN DEFAULT false,
    accepted_at TIMESTAMPTZ,
    last_viewed_at TIMESTAMPTZ
);

-- Question Branching table
CREATE TABLE IF NOT EXISTS public.question_branching (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    source_question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    target_question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    condition_type TEXT NOT NULL,
    condition_value JSONB NOT NULL
);

-- Add unique constraint on form_id and user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'form_collaborators_form_user_unique'
    ) THEN
        ALTER TABLE public.form_collaborators
            ADD CONSTRAINT form_collaborators_form_user_unique UNIQUE (form_id, user_id);
    END IF;
END $$;

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

-- Enable row-level security for tables
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- Policies for form_templates
CREATE POLICY "Everyone can view published templates" ON public.form_templates
    FOR SELECT
    USING (is_published = true);
    
CREATE POLICY "Creators can view their own templates" ON public.form_templates
    FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create templates" ON public.form_templates
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their own templates" ON public.form_templates
    FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete their own templates" ON public.form_templates
    FOR DELETE
    USING (auth.uid() = created_by);

-- Policies for forms
CREATE POLICY "Users can view forms they have access to" ON public.forms
    FOR SELECT
    USING (
        auth.uid() = created_by
        OR visibility = 'public'
        OR (
            visibility = 'members' 
            AND trip_id IS NOT NULL 
            AND EXISTS (
                SELECT 1 FROM public.trip_members 
                WHERE trip_id = forms.trip_id 
                AND user_id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM public.form_collaborators
            WHERE form_id = id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert forms they create" ON public.forms
    FOR INSERT
    WITH CHECK (
        auth.uid() = created_by
        AND (
            trip_id IS NULL
            OR EXISTS (
                SELECT 1 FROM public.trip_members 
                WHERE trip_id = forms.trip_id 
                AND user_id = auth.uid()
                AND role IN ('admin', 'editor')
            )
        )
    );

CREATE POLICY "Form creators can update their forms" ON public.forms
    FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Trip admins and editors can update trip forms" ON public.forms
    FOR UPDATE
    USING (
        trip_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.trip_members 
            WHERE trip_id = forms.trip_id 
            AND user_id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    )
    WITH CHECK (
        trip_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.trip_members 
            WHERE trip_id = forms.trip_id 
            AND user_id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Form creators can delete their forms" ON public.forms
    FOR DELETE
    USING (auth.uid() = created_by);

CREATE POLICY "Trip admins can delete trip forms" ON public.forms
    FOR DELETE
    USING (
        trip_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.trip_members 
            WHERE trip_id = forms.trip_id 
            AND user_id = auth.uid()
            AND role = 'admin'
        )
    ); 