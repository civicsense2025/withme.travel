-- Create enum types for various status values
CREATE TYPE message_type AS ENUM ('text', 'system', 'file', 'image');
CREATE TYPE presence_status AS ENUM ('online', 'away', 'offline', 'editing');
CREATE TYPE reaction_type AS ENUM ('like', 'dislike', 'love', 'laugh', 'wow', 'sad', 'angry');
CREATE TYPE vote_status AS ENUM ('active', 'completed', 'cancelled');

-- Create user_presence table for real-time presence tracking
CREATE TABLE user_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  status presence_status NOT NULL DEFAULT 'online',
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  cursor_position JSONB,
  editing_item_id UUID,
  page_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, trip_id)
);

-- Create chat_channels table for trip-specific chat rooms
CREATE TABLE chat_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_thread BOOLEAN NOT NULL DEFAULT FALSE,
  parent_message_id UUID,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT parent_message_check CHECK (
    (is_thread = TRUE AND parent_message_id IS NOT NULL) OR 
    (is_thread = FALSE AND parent_message_id IS NULL)
  )
);

-- Create chat_messages table for storing messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  message_type message_type NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create message_mentions for @mentions in messages
CREATE TABLE message_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (message_id, mentioned_user_id)
);

-- Create message_reactions for reactions to messages
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction reaction_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (message_id, user_id, reaction)
);

-- Create itinerary_item_comments for item-level discussions
CREATE TABLE itinerary_item_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES itinerary_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_comment_id UUID REFERENCES itinerary_item_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create comment_mentions for @mentions in comments
CREATE TABLE comment_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES itinerary_item_comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (comment_id, mentioned_user_id)
);

-- Create comment_reactions for reactions to comments
CREATE TABLE comment_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES itinerary_item_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction reaction_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (comment_id, user_id, reaction)
);

-- Create item_alternatives for suggesting multiple options for a time slot
CREATE TABLE item_alternatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INTEGER,
  time_slot TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create alternative_items to link alternatives to specific items
CREATE TABLE alternative_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alternative_id UUID NOT NULL REFERENCES item_alternatives(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES itinerary_items(id) ON DELETE CASCADE,
  is_selected BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (alternative_id, item_id)
);

-- Create voting_sessions for deadline-based voting
CREATE TABLE voting_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  alternative_id UUID REFERENCES item_alternatives(id) ON DELETE CASCADE,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status vote_status NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create preference_votes for ranking-based voting
CREATE TABLE preference_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES itinerary_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, item_id, user_id)
);

-- Create budget_agreements for budget voting
CREATE TABLE budget_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agreed_amount DECIMAL(10, 2) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (trip_id, user_id)
);

-- Create personal_notes for private notes visible only to the creator
CREATE TABLE personal_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  item_id UUID REFERENCES itinerary_items(id) ON DELETE CASCADE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create personal_expenses for individual expense tracking
CREATE TABLE personal_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  category TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  share_with_group BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create personal_tasks for preparation checklists
CREATE TABLE personal_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create personal_preferences for marking interest in activities
CREATE TABLE personal_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES itinerary_items(id) ON DELETE CASCADE,
  interest_level INTEGER NOT NULL CHECK (interest_level BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, item_id)
);

-- Create realtime subscriptions
BEGIN;
  -- Enable realtime for user presence
  ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
  
  -- Enable realtime for chat messages
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE message_mentions;
  ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
  
  -- Enable realtime for item comments
  ALTER PUBLICATION supabase_realtime ADD TABLE itinerary_item_comments;
  ALTER PUBLICATION supabase_realtime ADD TABLE comment_mentions;
  ALTER PUBLICATION supabase_realtime ADD TABLE comment_reactions;
  
  -- Enable realtime for voting
  ALTER PUBLICATION supabase_realtime ADD TABLE voting_sessions;
  ALTER PUBLICATION supabase_realtime ADD TABLE preference_votes;
COMMIT;

-- Create RLS policies
-- User Presence policies
CREATE POLICY "Users can view presence in their trips"
  ON user_presence
  FOR SELECT
  USING (user_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = user_presence.trip_id AND trip_members.user_id = auth.uid()));

CREATE POLICY "Users can update their own presence"
  ON user_presence
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own presence"
  ON user_presence
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Chat message policies
CREATE POLICY "Trip members can view chat messages"
  ON chat_messages
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_channels JOIN trip_members 
                ON chat_channels.trip_id = trip_members.trip_id 
                WHERE chat_channels.id = chat_messages.channel_id 
                AND trip_members.user_id = auth.uid()));

CREATE POLICY "Users can insert their own chat messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (user_id = auth.uid() AND 
              EXISTS (SELECT 1 FROM chat_channels JOIN trip_members 
                     ON chat_channels.trip_id = trip_members.trip_id 
                     WHERE chat_channels.id = chat_messages.channel_id 
                     AND trip_members.user_id = auth.uid()));

CREATE POLICY "Users can update their own chat messages"
  ON chat_messages
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Comment policies
CREATE POLICY "Trip members can view comments"
  ON itinerary_item_comments
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM itinerary_items JOIN trip_members 
                ON itinerary_items.trip_id = trip_members.trip_id 
                WHERE itinerary_items.id = itinerary_item_comments.item_id 
                AND trip_members.user_id = auth.uid()));

CREATE POLICY "Trip members can add comments"
  ON itinerary_item_comments
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM itinerary_items JOIN trip_members 
                     ON itinerary_items.trip_id = trip_members.trip_id 
                     WHERE itinerary_items.id = itinerary_item_comments.item_id 
                     AND trip_members.user_id = auth.uid()));

CREATE POLICY "Users can update their own comments"
  ON itinerary_item_comments
  FOR UPDATE
  USING (user_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM itinerary_items JOIN trip_members 
                ON itinerary_items.trip_id = trip_members.trip_id 
                WHERE itinerary_items.id = itinerary_item_comments.item_id 
                AND trip_members.user_id = auth.uid() 
                AND trip_members.role IN ('admin', 'editor')));

-- Personal note policies
CREATE POLICY "Users can only see their own personal notes"
  ON personal_notes
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can only insert their own personal notes"
  ON personal_notes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can only update their own personal notes"
  ON personal_notes
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can only delete their own personal notes"
  ON personal_notes
  FOR DELETE
  USING (user_id = auth.uid());

-- Enable row level security
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_mentions ENABLE ROW LEVEL SECURITY;

