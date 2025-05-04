# Database Foreign Key Relationships Documentation

## itinerary_templates.created_by → auth.users.id

The `itinerary_templates` table has a `created_by` column with a foreign key constraint to `auth.users.id`, not to `profiles.id` as might be expected.

```sql
-- The actual foreign key constraint in the database:
itinerary_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
```

## How to Query User Data in API Routes

Because of this structure, when querying user information related to `created_by`, you need to:

1. Use a direct reference to the `created_by` column rather than a join through `profiles`:

```sql
-- CORRECT: Direct reference to auth.users
SELECT *, 
       creator:created_by(id, email, raw_user_meta_data)
FROM itinerary_templates

-- INCORRECT: Attempting to join through profiles
SELECT *,
       profiles:created_by(id, name, avatar_url)
FROM itinerary_templates
```

2. Extract user profile information from the `raw_user_meta_data` JSON field:

```javascript
// Transform raw user data into a consistent format
const authorInfo = {
  id: item.creator.id,
  name: item.creator.raw_user_meta_data?.name || 
        item.creator.email?.split('@')[0] || 
        'Unknown User',
  avatar_url: item.creator.raw_user_meta_data?.avatar_url || null,
};
```

## Why This Matters

This structure exists because Supabase Auth stores user data in the `auth.users` table, while our application's profile data is in the `profiles` table. While there is a connection between these tables (`profiles.id` references `auth.users.id`), some of our foreign keys point directly to `auth.users` instead of going through `profiles`.

This documentation will help prevent future errors when working with user relationships in the database. 