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