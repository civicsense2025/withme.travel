# WithMe.Travel: Comprehensive SQL & Supabase Guide

*A practical guide for understanding and working with SQL, Supabase, and database management for the WithMe.Travel team—written by someone who's been in the trenches.*

## Table of Contents

- [Introduction to SQL and Our Database Architecture](#introduction-to-sql-and-our-database-architecture)
  - [What is SQL and Why Do We Use It?](#what-is-sql-and-why-do-we-use-it)
  - [Our Database Philosophy](#our-database-philosophy)
  - [Supabase: PostgreSQL Made Friendly](#supabase-postgresql-made-friendly)
  - [WithMe.Travel Database Schema Overview](#withmetravel-database-schema-overview)
- [SQL Fundamentals for WithMe.Travel Team](#sql-fundamentals-for-withmetravel-team)
  - [Basic SQL Structure](#basic-sql-structure)
  - [Joining Tables](#joining-tables)
  - [Common SQL Patterns We Use](#common-sql-patterns-we-use)
- [Working with Supabase](#working-with-supabase)
  - [Supabase Client Setup](#supabase-client-setup)
  - [Basic CRUD with Supabase](#basic-crud-with-supabase)
  - [Real-time Subscriptions](#real-time-subscriptions)
  - [Authentication with Supabase](#authentication-with-supabase)
  - [Row Level Security (RLS)](#row-level-security-rls)
  - [PostgreSQL Functions](#postgresql-functions)
- [Database Migrations with Supabase and Docker](#database-migrations-with-supabase-and-docker)
  - [What are Migrations and Why Do We Need Them?](#what-are-migrations-and-why-do-we-need-them)
  - [Setting Up Your Local Environment](#setting-up-your-local-environment)
  - [Creating and Running Migrations](#creating-and-running-migrations)
  - [Migration Philosophy: Idempotent Changes](#migration-philosophy-idempotent-changes)
  - [Seed Data Management](#seed-data-management)
  - [Verifying Your Migrations](#verifying-your-migrations)
  - [Docker Management](#docker-management)
- [Advanced SQL Techniques](#advanced-sql-techniques)
  - [Using JSON/JSONB in PostgreSQL](#using-jsonjsonb-in-postgresql)
  - [Common Table Expressions (CTEs)](#common-table-expressions-ctes)
  - [Recursive Queries](#recursive-queries)
  - [Full-Text Search](#full-text-search)
- [Performance Optimization](#performance-optimization)
  - [Indexing Strategy](#indexing-strategy)
  - [Query Optimization](#query-optimization)
  - [Materialized Views](#materialized-views)
- [Best Practices for SQL at WithMe.Travel](#best-practices-for-sql-at-withmetravel)
- [Real-World Example: Creating a Trip](#real-world-example-creating-a-trip)
- [Pro Tips and Troubleshooting](#pro-tips-and-troubleshooting)
  - [Common Issues and Solutions](#common-issues-and-solutions)
- [Core Commands Reference](#core-commands-reference)
- [FAQ](#faq)
- [Glossary of SQL and Supabase Terms](#glossary-of-sql-and-supabase-terms)
- [Conclusion: Embracing SQL at WithMe.Travel](#conclusion-embracing-sql-at-withmetravel)

## Introduction to SQL and Our Database Architecture

### What is SQL and Why Do We Use It?

SQL (Structured Query Language) is the language we use to communicate with our database. Think of it as the translator between what we want to do with our data and how the database actually performs those operations. At WithMe.Travel, our entire data layer is built on PostgreSQL—a powerful, open-source relational database that Supabase wraps with developer-friendly tools.

When you're working with our app, you're constantly interacting with SQL behind the scenes:
- Fetching trip details? That's a SQL SELECT query.
- Creating a new itinerary? That's an INSERT.
- Updating user preferences? That's an UPDATE.
- Removing a destination from a trip? That's a DELETE.

The beauty of SQL is that it's both simple to get started with and powerful enough to handle complex data relationships—perfect for a collaborative travel platform where users, trips, itineraries, and preferences all interconnect.

### Our Database Philosophy

At WithMe.Travel, we follow these principles with our database:

1. **Data Integrity First**: Structure matters. We use constraints, relationships, and types to ensure data stays consistent.
2. **Security By Design**: Row Level Security (RLS) controls who can see and modify which data.
3. **Performance Matters**: Proper indexing and query optimization keep the application snappy.
4. **Schema as Documentation**: Our database schema tells the story of our application's domain model.

### Supabase: PostgreSQL Made Friendly

Supabase gives us PostgreSQL superpowers with:
- Authentication built right into the database
- Real-time subscriptions for collaborative features
- Row-level security for granular access control
- API generation that turns our tables into endpoints
- Storage for managing user uploads
- Edge Functions for server-side logic

### WithMe.Travel Database Schema Overview

Our database has several core entities:

1. **Users** - Managed by Supabase Auth with extended profiles in `public.profiles`
2. **Trips** - The central entity representing a planned journey
3. **Trip Members** - Joining table for users and trips with roles
4. **Itinerary Items** - Activities, accommodations, and transport within trips
5. **Forms** - Collaborative data collection for trip planning
6. **Destinations** - Information about places people can visit
7. **Tags** - Categorization for trips and content

Understanding these relationships is key to writing effective queries.

## SQL Fundamentals for WithMe.Travel Team

### Basic SQL Structure

SQL statements follow predictable patterns. Let's look at some examples using our own tables:

```sql
-- Selecting data
SELECT name, destination, start_date 
FROM trips 
WHERE created_by = auth.uid() 
ORDER BY start_date DESC 
LIMIT 5;

-- Inserting data
INSERT INTO trip_members (trip_id, user_id, role, status) 
VALUES ('12345678-1234-1234-1234-123456789012', auth.uid(), 'editor', 'accepted');

-- Updating data
UPDATE trips 
SET destination = 'Paris, France', updated_at = now() 
WHERE id = '12345678-1234-1234-1234-123456789012';

-- Deleting data
DELETE FROM itinerary_items 
WHERE id = '12345678-1234-1234-1234-123456789012';
```

### Joining Tables

The real power of SQL comes when you combine data from multiple tables:

```sql
-- Get all trips with their member counts
SELECT 
    t.id, 
    t.name, 
    t.destination,
    COUNT(tm.user_id) as member_count
FROM 
    trips t
LEFT JOIN 
    trip_members tm ON t.id = tm.trip_id
WHERE 
    t.created_by = auth.uid()
GROUP BY 
    t.id, t.name, t.destination;
```

### Common SQL Patterns We Use

#### The Auth Check Pattern

We frequently need to check if the current user can access data:

```sql
-- In a query
SELECT * FROM trips WHERE created_by = auth.uid();

-- In RLS policies
CREATE POLICY "Users can view their own trips" ON trips
    FOR SELECT USING (created_by = auth.uid());
```

#### The Pagination Pattern

For performance, we paginate results:

```sql
-- Basic limit/offset pagination
SELECT * FROM trips ORDER BY created_at DESC LIMIT 10 OFFSET 20;

-- Cursor-based pagination (more efficient)
SELECT * FROM trips
WHERE created_at < '2025-04-01T00:00:00Z'
ORDER BY created_at DESC
LIMIT 10;
```

#### The Search Pattern

Our search functionality uses text search capabilities:

```sql
-- Simple text search
SELECT * FROM trips
WHERE destination ILIKE '%paris%';

-- Full text search using PostgreSQL features
SELECT * FROM trips
WHERE to_tsvector('english', name || ' ' || description) @@ to_tsquery('english', 'paris & adventure');
```

## Working with Supabase

### Supabase Client Setup

In our Next.js app, we have three ways to access Supabase:

```typescript
// Server Component
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export default async function TripList() {
  const supabase = createServerComponentClient({ cookies });
  const { data: trips } = await supabase.from('trips').select('*');
  // ...
}

// API Route
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.from('trips').insert(/* ... */);
  // ...
}

// Client Component
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function TripEditor() {
  const supabase = createClientComponentClient();
  
  async function updateTrip() {
    const { data, error } = await supabase
      .from('trips')
      .update({ name: 'New Name' })
      .eq('id', tripId);
    // ...
  }
  // ...
}
```

### Basic CRUD with Supabase

Supabase gives us a beautiful API over PostgreSQL. Here's how we handle Create, Read, Update, Delete:

```typescript
// CREATE
const { data, error } = await supabase
  .from('trips')
  .insert({
    name: 'Summer in Rome',
    description: 'Exploring Italian culture and cuisine',
    start_date: '2025-06-01',
    end_date: '2025-06-14',
    destination: 'Rome, Italy'
  })
  .select();

// READ
const { data, error } = await supabase
  .from('trips')
  .select(`
    id, 
    name, 
    destination,
    trip_members (
      user_id,
      role,
      profiles (name, avatar_url)
    )
  `)
  .eq('id', tripId);

// UPDATE
const { data, error } = await supabase
  .from('trips')
  .update({ description: 'Updated description' })
  .eq('id', tripId)
  .select();

// DELETE
const { error } = await supabase
  .from('trips')
  .delete()
  .eq('id', tripId);
```

### Real-time Subscriptions

One of the most powerful features we use is real-time updates for collaboration:

```typescript
// Subscribe to changes in a trip's itinerary
const channel = supabase
  .channel('itinerary-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'itinerary_items',
      filter: `trip_id=eq.${tripId}`
    },
    (payload) => {
      console.log('Change received!', payload);
      updateItinerary(payload.new);
    }
  )
  .subscribe();

// Clean up on component unmount
return () => {
  supabase.removeChannel(channel);
};
```

### Authentication with Supabase

Our authentication system leverages Supabase Auth:

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      first_name: 'Jane',
      last_name: 'Doe'
    }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
const { error } = await supabase.auth.signOut();
```

### Row Level Security (RLS)

RLS is the backbone of our security model. Here's how we use it:

```sql
-- Enable RLS on a table
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Create a policy for viewing trips
CREATE POLICY "Trip members can view trips" ON trips
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trip_members
            WHERE trip_members.trip_id = trips.id
            AND trip_members.user_id = auth.uid()
        )
    );
    
-- Create a policy for editing trips (only admins)
CREATE POLICY "Trip admins can edit trips" ON trips
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM trip_members
            WHERE trip_members.trip_id = trips.id
            AND trip_members.user_id = auth.uid()
            AND trip_members.role = 'admin'
        )
    );
```

### PostgreSQL Functions

We use database functions for complex operations:

```sql
-- Function to get all trips a user is part of
CREATE OR REPLACE FUNCTION get_user_trips()
RETURNS SETOF trips AS $$
BEGIN
    RETURN QUERY
    SELECT t.*
    FROM trips t
    JOIN trip_members tm ON t.id = tm.trip_id
    WHERE tm.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Using the function
SELECT * FROM get_user_trips();
```

## Database Migrations with Supabase and Docker

### What are Migrations and Why Do We Need Them?

Migrations are how we safely evolve our database schema over time. Think of each migration as a version control commit for your database—it captures a specific change and allows us to:

1. Track all changes to our schema
2. Apply changes consistently across environments
3. Roll back problematic changes if needed
4. Collaborate without stepping on each other's toes

### Setting Up Your Local Environment

Supabase uses Docker to run a local instance of PostgreSQL and other services. Here's how to get set up:

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Check your version
supabase --version

# Update to latest version
brew upgrade supabase

# Initialize local Supabase in our project
cd withme.travel-main
supabase init

# Start Supabase services
supabase start

# Link to our remote project (you'll need access)
supabase link --project-ref YOUR_PROJECT_REF
```

### Creating and Running Migrations

Migrations live in the `supabase/migrations` directory and follow a naming pattern of `<timestamp>_name.sql`.

```bash
# Create a migration file
supabase migration new add_tags_to_trips

# This creates: supabase/migrations/20250504000000_add_tags_to_trips.sql
```

Now you can edit the file with your changes:

```sql
-- Add tags column to trips table
ALTER TABLE IF EXISTS public.trips
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for tag searches
CREATE INDEX IF NOT EXISTS idx_trips_tags ON public.trips USING GIN (tags);
```

To apply your migration:

```bash
# Push migrations to local development
supabase db push

# Push migrations to production (Be careful here!)
supabase db push --db-url $PRODUCTION_DB_URL
```

### Migration Philosophy: Idempotent Changes

Our migrations should be *idempotent*, which means they can be run multiple times without changing the result beyond the first execution:

```sql
-- Good: Uses IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.trip_tags (
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (trip_id, tag_id)
);

-- Good: Checks if column exists before adding
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trips' 
        AND column_name = 'is_public'
    ) THEN
        ALTER TABLE public.trips ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;
END $$;
```

### Seed Data Management

Seed data provides initial content for development and testing:

```sql
-- File: 20250504100000_seed_destinations.sql

-- Only insert if the record doesn't exist
INSERT INTO public.destinations (id, name, country, description)
SELECT 
    '11111111-1111-1111-1111-111111111111',
    'Rome',
    'Italy',
    'The Eternal City with ancient ruins and vibrant street life'
WHERE 
    NOT EXISTS (
        SELECT 1 FROM public.destinations 
        WHERE id = '11111111-1111-1111-1111-111111111111'
    );
```

### Verifying Your Migrations

Always verify that your migrations worked as expected:

```sql
-- Verification migration
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trips' 
        AND column_name = 'tags'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE 'Verification passed: tags column exists in trips table';
    ELSE
        RAISE WARNING 'Verification failed: tags column does not exist in trips table';
    END IF;
END $$;
```

### Docker Management

Supabase services run in Docker containers, which you can manage:

```bash
# View running Supabase containers
docker ps | grep supabase

# Check logs from a specific service
docker logs supabase_db_1

# Restart a specific service
docker restart supabase_db_1

# Clean up Docker resources
docker compose -f supabase/docker/docker-compose.yml down -v
```

## Advanced SQL Techniques

### Using JSON/JSONB in PostgreSQL

We store flexible data structures using JSONB:

```sql
-- Query inside JSON data
SELECT 
    id, 
    name,
    template_data->'questions' as questions
FROM 
    form_templates
WHERE 
    template_data->'settings'->>'allowMultipleResponses' = 'true';

-- Update a value inside JSON
UPDATE form_templates
SET template_data = jsonb_set(
    template_data, 
    '{settings,allowMultipleResponses}', 
    'false'::jsonb
)
WHERE id = '12345678-1234-1234-1234-123456789012';
```

### Common Table Expressions (CTEs)

CTEs help organize complex queries:

```sql
-- Get trips with their most active members
WITH trip_activity AS (
    SELECT 
        trip_id,
        user_id,
        COUNT(*) as action_count
    FROM 
        activities
    GROUP BY 
        trip_id, user_id
),
ranked_members AS (
    SELECT
        trip_id,
        user_id,
        action_count,
        RANK() OVER (PARTITION BY trip_id ORDER BY action_count DESC) as rank
    FROM
        trip_activity
)
SELECT 
    t.id,
    t.name,
    p.display_name as most_active_member,
    rm.action_count
FROM 
    trips t
JOIN 
    ranked_members rm ON t.id = rm.trip_id AND rm.rank = 1
JOIN 
    profiles p ON rm.user_id = p.id;
```

### Recursive Queries

We use recursive queries for hierarchical data:

```sql
-- Get all destinations and their parent regions
WITH RECURSIVE destination_hierarchy AS (
    -- Base case: top-level destinations
    SELECT 
        id,
        name,
        parent_id,
        name as path,
        1 as level
    FROM 
        destinations
    WHERE 
        parent_id IS NULL
    
    UNION ALL
    
    -- Recursive step: add child destinations
    SELECT 
        d.id,
        d.name,
        d.parent_id,
        dh.path || ' > ' || d.name,
        dh.level + 1
    FROM 
        destinations d
    JOIN 
        destination_hierarchy dh ON d.parent_id = dh.id
)
SELECT * FROM destination_hierarchy ORDER BY path;
```

### Full-Text Search

We implement search using PostgreSQL's text search capabilities:

```sql
-- Create a search vector for trips
ALTER TABLE trips ADD COLUMN search_vector tsvector;

-- Update trigger to maintain the search vector
CREATE OR REPLACE FUNCTION trips_search_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector = 
        setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.destination, '')), 'A');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER trips_search_update
BEFORE INSERT OR UPDATE ON trips
FOR EACH ROW EXECUTE FUNCTION trips_search_update();

-- Create an index for faster searching
CREATE INDEX trips_search_idx ON trips USING GIN (search_vector);

-- Search query example
SELECT 
    id, 
    name, 
    ts_rank(search_vector, query) as rank
FROM 
    trips,
    to_tsquery('english', 'rome & food') as query
WHERE 
    search_vector @@ query
ORDER BY 
    rank DESC;
```

## Performance Optimization

### Indexing Strategy

Proper indexing is crucial for performance:

```sql
-- Index for foreign keys
CREATE INDEX idx_trip_members_trip_id ON trip_members(trip_id);
CREATE INDEX idx_trip_members_user_id ON trip_members(user_id);

-- Compound index for common query patterns
CREATE INDEX idx_trips_created_by_date ON trips(created_by, start_date DESC);

-- Partial index for common filtering
CREATE INDEX idx_trip_members_active ON trip_members(trip_id, user_id) 
WHERE status = 'accepted';
```

### Query Optimization

Tips for writing efficient queries:

```sql
-- Use specific columns instead of SELECT *
SELECT id, name, destination FROM trips;

-- Use EXISTS for checking relationships
SELECT * FROM trips t
WHERE EXISTS (
    SELECT 1 FROM trip_members tm
    WHERE tm.trip_id = t.id AND tm.user_id = auth.uid()
);

-- Use EXPLAIN ANALYZE to understand query plans
EXPLAIN ANALYZE
SELECT * FROM trips
WHERE destination ILIKE '%paris%';
```

### Materialized Views

For complex reports and analytics:

```sql
-- Create a materialized view for trip statistics
CREATE MATERIALIZED VIEW trip_stats AS
SELECT
    t.id,
    t.name,
    t.destination,
    COUNT(DISTINCT tm.user_id) as member_count,
    COUNT(DISTINCT i.id) as itinerary_item_count,
    MIN(i.start_time) as first_activity,
    MAX(i.end_time) as last_activity
FROM
    trips t
LEFT JOIN
    trip_members tm ON t.id = tm.trip_id
LEFT JOIN
    itinerary_items i ON t.id = i.trip_id
GROUP BY
    t.id, t.name, t.destination;

-- Create indexes on the materialized view
CREATE INDEX idx_trip_stats_destination ON trip_stats(destination);

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW trip_stats;
```

## Best Practices for SQL at WithMe.Travel

1. **Always Use Row Level Security**: Never rely on frontend security alone
2. **Keep Track of Database Changes**: Use migrations for every schema change
3. **Test Queries Locally First**: Use local Supabase before touching production
4. **Use Descriptive Naming**: Table and column names should be self-explanatory
5. **Document Complex Queries**: Add comments to explain what's happening
6. **Version Control Your Migrations**: Commit all migration files to git
7. **Be Cautious with Joins**: Multiple joins can create performance issues
8. **Use Transactions for Related Changes**: Ensure atomicity for complex operations
9. **Consider Query Performance**: Use EXPLAIN ANALYZE to check execution plans
10. **Keep Migrations Idempotent**: Safe to run multiple times
11. **Use IF EXISTS/IF NOT EXISTS**: Make migrations idempotent to prevent failures on reapplication
12. **Separate Schema from Data**: Keep schema changes and data seeding in different migrations

## Real-World Example: Creating a Trip

Let's walk through a complete example from our codebase. We'll create a new trip with members:

1. **Define the operation in SQL**

```sql
-- In a migration file: Create function to create a trip with members
CREATE OR REPLACE FUNCTION create_trip_with_members(
    trip_name TEXT,
    trip_description TEXT,
    trip_start_date TIMESTAMPTZ,
    trip_end_date TIMESTAMPTZ,
    trip_destination TEXT,
    member_emails TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_trip_id UUID;
    member_user_id UUID;
    member_email TEXT;
BEGIN
    -- Create trip
    INSERT INTO trips (
        name,
        description,
        start_date,
        end_date,
        destination,
        created_by
    ) VALUES (
        trip_name,
        trip_description,
        trip_start_date,
        trip_end_date,
        trip_destination,
        auth.uid()
    )
    RETURNING id INTO new_trip_id;
    
    -- Add creator as admin
    INSERT INTO trip_members (
        trip_id,
        user_id,
        role,
        status
    ) VALUES (
        new_trip_id,
        auth.uid(),
        'admin',
        'accepted'
    );
    
    -- Add members
    FOREACH member_email IN ARRAY member_emails
    LOOP
        -- Find user by email
        SELECT id INTO member_user_id 
        FROM auth.users 
        WHERE email = member_email;
        
        -- If user exists, add as member
        IF member_user_id IS NOT NULL THEN
            INSERT INTO trip_members (
                trip_id,
                user_id,
                role,
                status
            ) VALUES (
                new_trip_id,
                member_user_id,
                'editor',
                'invited'
            );
        END IF;
    END LOOP;
    
    RETURN new_trip_id;
END;
$$;
```

2. **Apply the migration**

```bash
supabase db push
```

3. **Use in your application code**

```typescript
// API route for creating a trip
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request) {
  const { name, description, startDate, endDate, destination, memberEmails } = await request.json();
  
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data, error } = await supabase.rpc('create_trip_with_members', {
    trip_name: name,
    trip_description: description,
    trip_start_date: startDate,
    trip_end_date: endDate,
    trip_destination: destination,
    member_emails: memberEmails
  });
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  
  return Response.json({ tripId: data });
}
```

## Pro Tips and Troubleshooting

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| RLS blocking access | Check your policies and the current auth.uid() |
| Slow queries | Add appropriate indexes and analyze with EXPLAIN |
| Migration conflicts | Use unique timestamps and coordinate with team |
| Auth issues | Check token expiration and refresh token flow |
| Data type errors | Ensure types match between code and database |
| Foreign key violations | Check referential integrity before deletes |
| Connection limits | Review connection pooling settings |
| Stale real-time data | Check event payload filtering and subscription setup |
| Migration not running | Check naming format `<timestamp>_name.sql` |
| Foreign key constraint errors | Ensure tables are created in the correct order |
| Duplicate constraints | Use IF NOT EXISTS in constraint creation |
| Authentication failures | Check connection string and credentials |
| Corrupted migrations | Use `supabase db reset` locally or recreate migrations |

## Core Commands Reference

Here's your cheat sheet for common Supabase CLI commands:

| Command | Description |
|---------|-------------|
| `supabase start` | Starts all local Supabase services |
| `supabase stop` | Stops all local Supabase services |
| `supabase status` | Shows status of local Supabase services |
| `supabase db reset` | Resets local database to a clean state |
| `supabase db push` | Apply local migrations to the database |
| `supabase db diff` | Show difference between local and remote schemas |
| `supabase migration new` | Create a new migration file |
| `supabase link` | Link to a remote Supabase project |
| `supabase db execute` | Execute SQL directly against the database |
| `supabase secrets set` | Set secrets for Edge Functions |
| `supabase functions deploy` | Deploy Edge Functions |
| `supabase login` | Log in to Supabase CLI |
| `supabase gen types` | Generate TypeScript types from your database schema |

## FAQ

### When should I use raw SQL vs. the Supabase client?

Use the Supabase client for:
- Standard CRUD operations
- Simple joins and filters
- When working in client components

Use raw SQL for:
- Complex queries with multiple joins
- Recursive queries
- Performance-critical operations
- Database functions and stored procedures

Example of raw SQL with Supabase:

```typescript
const { data, error } = await supabase.from('trips').select('*');  // Client API
const { data, error } = await supabase.rpc('get_user_trips');      // Function
const { data, error } = await supabase.query(`                     // Raw SQL
  SELECT t.*, COUNT(tm.user_id) as member_count
  FROM trips t
  LEFT JOIN trip_members tm ON t.id = tm.trip_id
  GROUP BY t.id
`);
```

### How do I safely make changes to an existing production table?

```sql
-- When adding columns
ALTER TABLE IF EXISTS public.forms
    ADD COLUMN IF NOT EXISTS new_column_name TEXT;

-- When removing columns (create a backup first)
CREATE TABLE IF NOT EXISTS forms_backup AS SELECT * FROM forms;
ALTER TABLE public.forms DROP COLUMN IF EXISTS old_column_name;

-- When modifying a column
ALTER TABLE public.forms
    ALTER COLUMN column_name TYPE new_data_type;
    
-- When renaming columns (safer than dropping/adding)
ALTER TABLE public.forms RENAME COLUMN old_name TO new_name;
```

### What's the most reliable way to reset my local environment?

```bash
# Stop Supabase
supabase stop

# Remove all containers and volumes
docker compose -f supabase/docker/docker-compose.yml down -v

# Restart everything
supabase start
```

### How do I manage environment-specific migrations?

Use conditional logic in your migrations:

```sql
DO $$
BEGIN
    -- Check if we're in development environment
    IF current_setting('app.environment', true) = 'development' THEN
        -- Development-only changes
        INSERT INTO config(key, value) VALUES('debug_mode', 'true');
    END IF;
END $$;
```

### How do I handle custom types and functions?

Create them in a dedicated migration that runs early:

```sql
-- Create custom type
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');

-- Create helper function
CREATE OR REPLACE FUNCTION is_trip_member(trip_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM trip_members
        WHERE trip_id = $1 AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Should I use the Supabase CLI or the dashboard for schema changes?

The short answer: for WithMe.Travel, we use the CLI and migration files for all schema changes. Here's why:

- **Version control**: Changes are tracked in git
- **Peer review**: PRs allow team review of schema changes
- **Consistent environments**: Same changes applied to all environments
- **Rollback possibility**: Clear migration history
- **Testing**: Can test migrations in CI/CD pipelines

Use the dashboard for:
- Quick exploration and prototyping
- Examining data
- Managing users and authentication
- Checking logs and monitoring

### How do I handle conflicting migrations?

When multiple team members create migrations simultaneously, conflicts can arise. Here's our approach:

1. **Use unique timestamps**: Each migration should have a unique timestamp prefix
2. **Communicate changes**: Notify team members when creating migrations
3. **Run migrations sequentially**: Apply migrations in timestamp order
4. **Test independently**: Ensure each migration works independently
5. **Verify idempotency**: Ensure migrations can be applied multiple times without error

## Glossary of SQL and Supabase Terms

**SQL Terms:**
- **SELECT**: Retrieves data from tables
- **INSERT**: Adds new rows to tables
- **UPDATE**: Modifies existing data
- **DELETE**: Removes rows from tables
- **JOIN**: Combines data from multiple tables
- **WHERE**: Filters query results
- **GROUP BY**: Aggregates data into groups
- **INDEX**: Speeds up data retrieval
- **CONSTRAINT**: Enforces data rules
- **VIEW**: Virtual table based on query results

**Supabase Terms:**
- **RLS (Row Level Security)**: PostgreSQL's mechanism for controlling row-level access
- **JWT (JSON Web Token)**: Authentication tokens used by Supabase Auth
- **Storage Bucket**: File storage container in Supabase Storage
- **Edge Function**: Serverless function that runs on Supabase's edge network
- **Service Role Key**: High-privilege API key for server-side operations

## Conclusion: Embracing SQL at WithMe.Travel

At WithMe.Travel, SQL isn't just a necessary technology—it's a powerful tool that enables us to build a collaborative, real-time platform. By understanding SQL fundamentals and Supabase's capabilities, you'll be able to contribute more effectively to our codebase and build features that delight our users.

Remember:
- The database schema tells the story of our application
- Row Level Security is the foundation of our security model
- Migrations keep our environments in sync
- Well-designed queries lead to better performance

Happy querying!

