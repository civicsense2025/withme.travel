# Enabling Real-Time Notifications in Supabase

To make the real-time notification system work, you'll need to enable the Realtime feature for the `notifications` table in Supabase. This allows clients to subscribe to changes (inserts, updates, deletes) on the notifications table.

## Steps to Enable Realtime in Supabase Dashboard

1. Log in to the [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Go to **Database** in the left sidebar
4. Click on **Replication** 
5. Look for the **Realtime** section
6. Add the `public.notifications` table to the list of tables with Realtime enabled
7. Make sure **Insert**, **Update**, and **Delete** operations are selected

## Using SQL

Alternatively, you can enable Realtime using SQL. Run the following SQL statement in the Supabase SQL Editor:

```sql
-- Enable realtime for the notifications table
begin;
  -- Remove existing publication if it exists
  drop publication if exists supabase_realtime;

  -- Create a new publication for all tables
  create publication supabase_realtime;
end;

-- Add the notifications table to the publication
alter publication supabase_realtime add table public.notifications;
```

## Verifying Realtime is Working

To verify that Realtime is working correctly:

1. Open your application with the developer console open
2. Insert a new notification directly in the Supabase dashboard SQL editor:

```sql
INSERT INTO public.notifications (
  user_id, 
  title, 
  content, 
  notification_type, 
  priority, 
  read
) VALUES (
  'USER_ID_HERE', -- Replace with an actual user ID
  'Test Realtime Notification',
  'This notification was created to test realtime functionality',
  'system_message',
  'high',
  false
);
```

3. You should see:
   - A toast notification appearing in the app
   - The notification count badge updating
   - The new notification appearing in the list when you open the notifications panel

## Tables to Enable Realtime For

For the complete notification system, enable Realtime for these tables:

1. `public.notifications` - For receiving new notifications
2. `public.notification_preferences` - For syncing preference changes across devices (optional)

This will ensure that users receive instant notifications without needing to refresh or poll the server. 