-- SQL Schema for the Destination Resources Feature

-- ENUMS
CREATE TYPE resource_type AS ENUM ('quiz', 'glossary', 'recipe', 'guide', 'game');
CREATE TYPE resource_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE quiz_question_type AS ENUM ('multiple_choice', 'true_false', 'fill_in_blank');
CREATE TYPE user_resource_interaction_type AS ENUM ('started', 'completed', 'viewed', 'quiz_attempted');

-- =========================================
-- TABLES
-- =========================================

-- Destination Resources Table: Central repository for all resource types linked to destinations.
CREATE TABLE IF NOT EXISTS destination_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    resource_type resource_type NOT NULL,
    title TEXT NOT NULL CHECK (char_length(title) <= 255),
    description TEXT,
    cover_image_url TEXT CHECK (char_length(cover_image_url) <= 2048),
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Optional link to the creator
    status resource_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE destination_resources ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_destination_resources_destination_id ON destination_resources(destination_id);
CREATE INDEX IF NOT EXISTS idx_destination_resources_resource_type ON destination_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_destination_resources_status ON destination_resources(status);
-- RLS Policies (Placeholder - Allow public read for published resources, admin/author write)
-- CREATE POLICY "Allow public read access to published resources" ON destination_resources FOR SELECT USING (status = 'published');
-- CREATE POLICY "Allow authors/admins to manage resources" ON destination_resources FOR ALL USING (auth.uid() = author_id OR is_admin(auth.uid()));

-- Quiz Questions Table: Stores questions for quiz resources.
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES destination_resources(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type quiz_question_type NOT NULL DEFAULT 'multiple_choice',
    position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
    image_url TEXT CHECK (char_length(image_url) <= 2048),
    explanation TEXT, -- Explanation shown after answering
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_quiz_question_resource CHECK (resource_id IN (SELECT id FROM destination_resources WHERE resource_type = 'quiz'))
);
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_resource_id ON quiz_questions(resource_id);
-- RLS Policies (Placeholder - Inherit from parent resource)
-- CREATE POLICY "Allow access based on parent resource" ON quiz_questions USING (resource_id IN (SELECT id FROM destination_resources));

-- Quiz Answers Table: Stores possible answers for quiz questions.
CREATE TABLE IF NOT EXISTS quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT CHECK (char_length(image_url) <= 2048),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON quiz_answers(question_id);
-- RLS Policies (Placeholder - Inherit from parent question/resource)
-- CREATE POLICY "Allow access based on parent question" ON quiz_answers USING (question_id IN (SELECT id FROM quiz_questions));

-- Glossary Terms Table: Stores terms and definitions for glossary resources.
CREATE TABLE IF NOT EXISTS glossary_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES destination_resources(id) ON DELETE CASCADE,
    term TEXT NOT NULL CHECK (char_length(term) <= 255),
    definition TEXT NOT NULL,
    pronunciation TEXT CHECK (char_length(pronunciation) <= 255),
    example_sentence TEXT,
    image_url TEXT CHECK (char_length(image_url) <= 2048),
    audio_url TEXT CHECK (char_length(audio_url) <= 2048),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_glossary_resource CHECK (resource_id IN (SELECT id FROM destination_resources WHERE resource_type = 'glossary'))
);
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_glossary_terms_resource_id ON glossary_terms(resource_id);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_term ON glossary_terms(term);
-- RLS Policies (Placeholder - Inherit from parent resource)
-- CREATE POLICY "Allow access based on parent resource" ON glossary_terms USING (resource_id IN (SELECT id FROM destination_resources));

-- Recipes Table: Stores recipe details for recipe resources.
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES destination_resources(id) ON DELETE CASCADE,
    ingredients JSONB, -- Array of strings or objects { ingredient: string, quantity: string, unit: string }
    instructions TEXT NOT NULL, -- Can be Markdown or plain text. Consider JSONB for steps.
    prep_time_minutes INTEGER CHECK (prep_time_minutes >= 0),
    cook_time_minutes INTEGER CHECK (cook_time_minutes >= 0),
    serving_size TEXT CHECK (char_length(serving_size) <= 100),
    image_url TEXT CHECK (char_length(image_url) <= 2048),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_recipe_resource CHECK (resource_id IN (SELECT id FROM destination_resources WHERE resource_type = 'recipe'))
);
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_recipes_resource_id ON recipes(resource_id);
-- RLS Policies (Placeholder - Inherit from parent resource)
-- CREATE POLICY "Allow access based on parent resource" ON recipes USING (resource_id IN (SELECT id FROM destination_resources));

-- Guides Table: Stores content for guide/tip resources.
CREATE TABLE IF NOT EXISTS guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES destination_resources(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- Markdown or HTML content for the guide
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_guide_resource CHECK (resource_id IN (SELECT id FROM destination_resources WHERE resource_type = 'guide'))
);
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_guides_resource_id ON guides(resource_id);
-- RLS Policies (Placeholder - Inherit from parent resource)
-- CREATE POLICY "Allow access based on parent resource" ON guides USING (resource_id IN (SELECT id FROM destination_resources));

-- Resource Trip Link Table: Junction table to associate resources with trips.
CREATE TABLE IF NOT EXISTS resource_trip_link (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES destination_resources(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (resource_id, trip_id) -- Prevent linking the same resource multiple times to a trip
);
ALTER TABLE resource_trip_link ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_resource_trip_link_resource_id ON resource_trip_link(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_trip_link_trip_id ON resource_trip_link(trip_id);
-- RLS Policies (Placeholder - Allow trip members to view/manage links)
-- CREATE POLICY "Allow trip members to view links" ON resource_trip_link FOR SELECT USING (trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid()));
-- CREATE POLICY "Allow trip members (editors+) to manage links" ON resource_trip_link FOR ALL USING (trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid() AND role IN ('admin', 'editor')));

-- Resource Itinerary Link Table: Junction table to associate resources with specific itinerary items.
CREATE TABLE IF NOT EXISTS resource_itinerary_link (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES destination_resources(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES itinerary_items(id) ON DELETE CASCADE,
    added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (resource_id, item_id) -- Prevent linking the same resource multiple times to an item
);
ALTER TABLE resource_itinerary_link ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_resource_itinerary_link_resource_id ON resource_itinerary_link(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_itinerary_link_item_id ON resource_itinerary_link(item_id);
-- RLS Policies (Placeholder - Similar to trip links, based on itinerary item access)
-- CREATE POLICY "Allow item viewers to see links" ON resource_itinerary_link FOR SELECT USING (item_id IN (SELECT id FROM itinerary_items WHERE trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())));
-- CREATE POLICY "Allow item editors to manage links" ON resource_itinerary_link FOR ALL USING (item_id IN (SELECT id FROM itinerary_items WHERE trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))));

-- User Resource Interactions Table: Tracks user progress and interactions with resources.
CREATE TABLE IF NOT EXISTS user_resource_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES destination_resources(id) ON DELETE CASCADE,
    interaction_type user_resource_interaction_type NOT NULL,
    score REAL CHECK (score >= 0 AND score <= 100), -- For quiz attempts
    progress JSONB, -- Store quiz answers, game state, etc.
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_viewed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, resource_id, interaction_type) -- Depending on how interactions are tracked, might need adjustment
);
ALTER TABLE user_resource_interactions ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_resource_interactions_user_id ON user_resource_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resource_interactions_resource_id ON user_resource_interactions(resource_id);
-- RLS Policies (Placeholder - Allow users to manage their own interactions)
-- CREATE POLICY "Allow users to manage their own interactions" ON user_resource_interactions FOR ALL USING (auth.uid() = user_id);

-- =========================================
-- FUNCTIONS / TRIGGERS (Optional)
-- =========================================

-- Trigger function to update 'updated_at' timestamp on destination_resources table
CREATE OR REPLACE FUNCTION update_destination_resource_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_destination_resource_update
    BEFORE UPDATE ON destination_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_destination_resource_updated_at();

-- Similar update triggers can be added for quiz_questions, quiz_answers, etc.

-- Trigger to update user interaction last_viewed_at
CREATE OR REPLACE FUNCTION update_user_interaction_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_viewed_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_user_interaction_update
    BEFORE UPDATE ON user_resource_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_interaction_timestamp(); 