-- Create itinerary templates table
CREATE TABLE IF NOT EXISTS itinerary_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  destination_id UUID REFERENCES destinations(id),
  duration_days INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  days JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  use_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE
);

-- Create functions to increment counters
CREATE OR REPLACE FUNCTION increment_template_views(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE itinerary_templates
  SET view_count = view_count + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_template_uses(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE itinerary_templates
  SET use_count = use_count + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_template_likes(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE itinerary_templates
  SET like_count = like_count + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Create template likes table for users to like templates
CREATE TABLE IF NOT EXISTS template_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES itinerary_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Create RLS policies
ALTER TABLE itinerary_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view published templates
CREATE POLICY "Anyone can view published templates" 
  ON itinerary_templates FOR SELECT 
  USING (is_published = true);

-- Template creators can view their own templates
CREATE POLICY "Users can view their own templates" 
  ON itinerary_templates FOR SELECT 
  USING (auth.uid() = created_by);

-- Only admins can publish templates
CREATE POLICY "Only admins can publish templates" 
  ON itinerary_templates FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Users can create templates
CREATE POLICY "Users can create templates" 
  ON itinerary_templates FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own templates
CREATE POLICY "Users can update their own templates" 
  ON itinerary_templates FOR UPDATE 
  USING (auth.uid() = created_by);

-- Users can delete their own templates
CREATE POLICY "Users can delete their own templates" 
  ON itinerary_templates FOR DELETE 
  USING (auth.uid() = created_by);

-- Admins can delete any template
CREATE POLICY "Admins can delete any template" 
  ON itinerary_templates FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Set up likes table RLS
ALTER TABLE template_likes ENABLE ROW LEVEL SECURITY;

-- Users can like templates
CREATE POLICY "Users can like templates" 
  ON template_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike templates
CREATE POLICY "Users can unlike templates" 
  ON template_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- Users can view their own likes
CREATE POLICY "Users can view their own likes" 
  ON template_likes FOR SELECT 
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_templates_destination ON itinerary_templates(destination_id);
CREATE INDEX idx_templates_category ON itinerary_templates(category);
CREATE INDEX idx_templates_duration ON itinerary_templates(duration_days);
CREATE INDEX idx_templates_created_by ON itinerary_templates(created_by);
CREATE INDEX idx_templates_slug ON itinerary_templates(slug);
