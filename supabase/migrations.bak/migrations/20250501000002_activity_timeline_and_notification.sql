-- Add new types to trip_action_type ENUM if they don't exist
ALTER TYPE trip_action_type ADD VALUE IF NOT EXISTS 'COMMENT_ADDED';
ALTER TYPE trip_action_type ADD VALUE IF NOT EXISTS 'COMMENT_UPDATED';
ALTER TYPE trip_action_type ADD VALUE IF NOT EXISTS 'COMMENT_DELETED';
ALTER TYPE trip_action_type ADD VALUE IF NOT EXISTS 'VOTE_CAST';
ALTER TYPE trip_action_type ADD VALUE IF NOT EXISTS 'FOCUS_INITIATED';

-- Create notification preferences table for user customization
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    trip_updates BOOLEAN DEFAULT TRUE,
    itinerary_changes BOOLEAN DEFAULT TRUE,
    member_activity BOOLEAN DEFAULT TRUE,
    comments BOOLEAN DEFAULT TRUE,
    votes BOOLEAN DEFAULT TRUE,
    focus_events BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create in-app notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    priority TEXT DEFAULT 'normal', -- 'high', 'normal', 'low'
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    reference_id UUID, -- Can reference a trip item, comment, etc.
    reference_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create focus session table for shared focus mode
CREATE TABLE focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    initiated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    section_id TEXT NOT NULL, -- ID of the section to focus on
    section_path TEXT NOT NULL, -- Path to the section
    section_name TEXT NOT NULL, -- Name of the section
    active BOOLEAN DEFAULT TRUE,
    message TEXT, -- Optional message from initiator
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes')
);

-- Create triggers for automated trip history entries
CREATE OR REPLACE FUNCTION add_trip_history_entry()
RETURNS TRIGGER AS $$
DECLARE
    action_type_val trip_action_type;
    details_json jsonb;
BEGIN
    -- Determine action type based on table and operation
    CASE TG_TABLE_NAME
        WHEN 'itinerary_items' THEN
            CASE TG_OP
                WHEN 'INSERT' THEN action_type_val := 'ITINERARY_ITEM_ADDED';
                WHEN 'UPDATE' THEN action_type_val := 'ITINERARY_ITEM_UPDATED';
                WHEN 'DELETE' THEN action_type_val := 'ITINERARY_ITEM_DELETED';
            END CASE;
        WHEN 'trip_members' THEN
            CASE TG_OP
                WHEN 'INSERT' THEN action_type_val := 'MEMBER_ADDED';
                WHEN 'UPDATE' THEN action_type_val := 'MEMBER_ROLE_UPDATED';
                WHEN 'DELETE' THEN action_type_val := 'MEMBER_REMOVED';
            END CASE;
        WHEN 'trip_item_comments' THEN
            CASE TG_OP
                WHEN 'INSERT' THEN action_type_val := 'COMMENT_ADDED';
                WHEN 'UPDATE' THEN action_type_val := 'COMMENT_UPDATED';
                WHEN 'DELETE' THEN action_type_val := 'COMMENT_DELETED';
            END CASE;
        WHEN 'trip_votes' THEN
            CASE TG_OP
                WHEN 'INSERT' THEN action_type_val := 'VOTE_CAST';
            END CASE;
        WHEN 'focus_sessions' THEN
            CASE TG_OP
                WHEN 'INSERT' THEN action_type_val := 'FOCUS_INITIATED';
            END CASE;
    END CASE;
    
    -- Create JSON details
    IF TG_OP = 'DELETE' THEN
        details_json := row_to_json(OLD)::jsonb;
    ELSE
        details_json := row_to_json(NEW)::jsonb;
    END IF;
    
    -- Remove large fields to keep history entries small
    details_json := details_json - 'content' - 'description';
    
    -- Insert into trip_history
    IF TG_TABLE_NAME = 'itinerary_items' OR TG_TABLE_NAME = 'trip_item_comments' THEN
        IF TG_OP = 'DELETE' THEN
            INSERT INTO trip_history (trip_id, user_id, action_type, details)
            VALUES (OLD.trip_id, auth.uid(), action_type_val, details_json);
        ELSE
            INSERT INTO trip_history (trip_id, user_id, action_type, details)
            VALUES (NEW.trip_id, auth.uid(), action_type_val, details_json);
        END IF;
    ELSIF TG_TABLE_NAME = 'trip_members' THEN
        IF TG_OP = 'DELETE' THEN
            INSERT INTO trip_history (trip_id, user_id, action_type, details)
            VALUES (OLD.trip_id, auth.uid(), action_type_val, details_json);
        ELSE
            INSERT INTO trip_history (trip_id, user_id, action_type, details)
            VALUES (NEW.trip_id, auth.uid(), action_type_val, details_json);
        END IF;
    ELSIF TG_TABLE_NAME = 'trip_votes' THEN
        -- Need to join to get trip_id
        IF TG_OP = 'INSERT' THEN
            INSERT INTO trip_history (trip_id, user_id, action_type, details)
            SELECT p.trip_id, auth.uid(), action_type_val, details_json
            FROM trip_vote_options o
            JOIN trip_vote_polls p ON o.poll_id = p.id
            WHERE o.id = NEW.option_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'focus_sessions' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO trip_history (trip_id, user_id, action_type, details)
            VALUES (NEW.trip_id, NEW.initiated_by, action_type_val, details_json);
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for each relevant table
DROP TRIGGER IF EXISTS itinerary_item_history ON itinerary_items;
CREATE TRIGGER itinerary_item_history
AFTER INSERT OR UPDATE OR DELETE ON itinerary_items
FOR EACH ROW EXECUTE FUNCTION add_trip_history_entry();

DROP TRIGGER IF EXISTS trip_member_history ON trip_members;
CREATE TRIGGER trip_member_history
AFTER INSERT OR UPDATE OR DELETE ON trip_members
FOR EACH ROW EXECUTE FUNCTION add_trip_history_entry();

DROP TRIGGER IF EXISTS trip_comment_history ON trip_item_comments;
CREATE TRIGGER trip_comment_history
AFTER INSERT OR UPDATE OR DELETE ON trip_item_comments
FOR EACH ROW EXECUTE FUNCTION add_trip_history_entry();

DROP TRIGGER IF EXISTS trip_vote_history ON trip_votes;
CREATE TRIGGER trip_vote_history
AFTER INSERT ON trip_votes
FOR EACH ROW EXECUTE FUNCTION add_trip_history_entry();

DROP TRIGGER IF EXISTS focus_session_history ON focus_sessions;
CREATE TRIGGER focus_session_history
AFTER INSERT ON focus_sessions
FOR EACH ROW EXECUTE FUNCTION add_trip_history_entry();

-- Create indexes for efficient querying
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_trip_id ON notifications(trip_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_focus_sessions_trip_id ON focus_sessions(trip_id);
CREATE INDEX idx_focus_sessions_active ON focus_sessions(active);

-- Enable Row Level Security for new tables
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification preferences
CREATE POLICY "Users can manage their own notification preferences"
ON notification_preferences
USING (user_id = auth.uid());

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification read status"
ON notifications
FOR UPDATE
USING (user_id = auth.uid());

-- RLS policies for focus sessions
CREATE POLICY "Trip members can view focus sessions"
ON focus_sessions
FOR SELECT
USING (
  trip_id IN (
    SELECT trip_id FROM trip_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Trip admins and editors can create focus sessions"
ON focus_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_id = focus_sessions.trip_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'editor')
  )
);

CREATE POLICY "Trip admins and editors can update focus sessions"
ON focus_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_id = focus_sessions.trip_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'editor')
  )
);

-- Create function to get activity timeline for a trip
CREATE OR REPLACE FUNCTION get_trip_activity_timeline(trip_id_param UUID, limit_param INTEGER DEFAULT 50, offset_param INTEGER DEFAULT 0)
RETURNS TABLE (
    id BIGINT,
    trip_id UUID,
    created_at TIMESTAMPTZ,
    user_id UUID,
    action_type trip_action_type,
    details JSONB,
    actor_name TEXT,
    actor_avatar TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.trip_id,
        h.created_at,
        h.user_id,
        h.action_type,
        h.details,
        p.name AS actor_name,
        p.avatar_url AS actor_avatar
    FROM 
        trip_history h
    LEFT JOIN 
        profiles p ON h.user_id = p.id
    WHERE 
        h.trip_id = trip_id_param
    ORDER BY 
        h.created_at DESC
    LIMIT limit_param
    OFFSET offset_param;
END;
$$ LANGUAGE plpgsql;

-- Create function to create notification from history event
CREATE OR REPLACE FUNCTION create_notification_from_history()
RETURNS TRIGGER AS $$
DECLARE
    members_cursor CURSOR FOR 
        SELECT tm.user_id, np.in_app_enabled
        FROM trip_members tm
        LEFT JOIN notification_preferences np ON tm.user_id = np.user_id
        WHERE tm.trip_id = NEW.trip_id AND tm.user_id != NEW.user_id;
    member_record RECORD; -- Use a single record variable
    notifications_enabled BOOLEAN;
    title_text TEXT;
    content_text TEXT;
    notification_type TEXT;
    priority_level TEXT := 'normal';
    actor_name TEXT;
BEGIN
    -- Get actor name
    SELECT name INTO actor_name FROM profiles WHERE id = NEW.user_id;
    
    -- Create appropriate notification text based on action type
    CASE NEW.action_type
        WHEN 'ITINERARY_ITEM_ADDED' THEN
            title_text := 'New itinerary item added';
            content_text := COALESCE(actor_name, 'Someone') || ' added a new item to the trip: ' || COALESCE((NEW.details->>'title')::TEXT, 'Untitled item');
            notification_type := 'itinerary_change';
        WHEN 'ITINERARY_ITEM_UPDATED' THEN
            title_text := 'Itinerary item updated';
            content_text := COALESCE(actor_name, 'Someone') || ' updated an item in the trip: ' || COALESCE((NEW.details->>'title')::TEXT, 'Untitled item');
            notification_type := 'itinerary_change';
        WHEN 'COMMENT_ADDED' THEN
            title_text := 'New comment';
            content_text := COALESCE(actor_name, 'Someone') || ' commented on an item';
            notification_type := 'comment';
            priority_level := 'high';
        WHEN 'VOTE_CAST' THEN
            title_text := 'New vote';
            content_text := COALESCE(actor_name, 'Someone') || ' voted on a poll';
            notification_type := 'vote';
        WHEN 'FOCUS_INITIATED' THEN
            title_text := 'Focus session started';
            content_text := COALESCE(actor_name, 'Someone') || ' started a focus session on: ' || COALESCE((NEW.details->>'section_name')::TEXT, 'a section');
            notification_type := 'focus';
            priority_level := 'high';
        ELSE
            title_text := 'Trip update';
            content_text := 'There was an update to your trip';
            notification_type := 'trip_update';
    END CASE;
    
    -- Create a notification for all trip members except the actor
    FOR member_record IN members_cursor LOOP
        -- Get notification enabled status from the record, default to true if NULL
        notifications_enabled := COALESCE(member_record.in_app_enabled, TRUE);
        
        -- Check if the user has notifications enabled
        IF notifications_enabled THEN
            INSERT INTO notifications (
                user_id,
                trip_id,
                sender_id,
                title,
                content,
                notification_type,
                priority,
                action_url,
                reference_id,
                reference_type
            ) VALUES (
                member_record.user_id, -- Use the user_id from the record
                NEW.trip_id,
                NEW.user_id,
                title_text,
                content_text,
                notification_type,
                priority_level,
                '/trips/' || NEW.trip_id,
                CASE 
                    WHEN NEW.action_type IN ('ITINERARY_ITEM_ADDED', 'ITINERARY_ITEM_UPDATED') THEN (NEW.details->>'id')::UUID
                    WHEN NEW.action_type = 'COMMENT_ADDED' THEN (NEW.details->>'id')::UUID
                    WHEN NEW.action_type = 'VOTE_CAST' THEN (NEW.details->>'option_id')::UUID
                    WHEN NEW.action_type = 'FOCUS_INITIATED' THEN (NEW.details->>'id')::UUID
                    ELSE NULL
                END,
                CASE 
                    WHEN NEW.action_type IN ('ITINERARY_ITEM_ADDED', 'ITINERARY_ITEM_UPDATED') THEN 'itinerary_item'
                    WHEN NEW.action_type = 'COMMENT_ADDED' THEN 'comment'
                    WHEN NEW.action_type = 'VOTE_CAST' THEN 'vote'
                    WHEN NEW.action_type = 'FOCUS_INITIATED' THEN 'focus_session'
                    ELSE NULL
                END
            );
        END IF;
    END LOOP;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to generate notifications from history events
DROP TRIGGER IF EXISTS history_notification_trigger ON trip_history;
CREATE TRIGGER history_notification_trigger
AFTER INSERT ON trip_history
FOR EACH ROW
WHEN (NEW.user_id IS NOT NULL)
EXECUTE FUNCTION create_notification_from_history();

-- Create function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_result
    FROM notifications
    WHERE user_id = user_id_param AND read = FALSE;
    
    RETURN count_result;
END;
$$ LANGUAGE plpgsql;

-- Add automatic timestamp updates for new tables
CREATE TRIGGER set_notification_preferences_timestamp
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); 