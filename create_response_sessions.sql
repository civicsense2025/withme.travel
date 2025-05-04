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