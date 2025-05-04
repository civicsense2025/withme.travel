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

-- Add unique constraint on form_id and user_id
ALTER TABLE public.form_collaborators
    ADD CONSTRAINT IF NOT EXISTS form_collaborators_form_user_unique UNIQUE (form_id, user_id); 