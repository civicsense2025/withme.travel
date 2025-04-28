# WithMe Travel Database Structure

## 1. User Management & Profiles

### Core Tables:
- **profiles**
  - `id` (FK to auth.users)
  - `name`, `email`, `avatar_url`, `bio`
  - `is_admin`, `location`, `website`

- **users** (extended user data)
  - Links to profile via ID

### User Preferences & Metadata:
- **user_interests** - User's travel interests/preferences
- **user_travel** - User's travel history and preferences
- **user_presence** - Track online/active status during collaboration
- **user_interactions** - Log of user interactions with the app
- **referrals** - Track user referrals/invites

## 2. Trip Core Structure

### Primary Tables:
- **trips**
  - `id` (primary key)
  - `created_by` (FK → profiles)
  - `name`, `description`, `trip_emoji`
  - `start_date`, `end_date`, `duration_days`
  - `destination_id` (FK → destinations)
  - `status` (planning/upcoming/in_progress/completed/cancelled)
  - `is_public`, `slug`, `public_slug` (for sharing)
  - `privacy_setting` ('private' | 'shared_with_link' | 'public' | null)
  - Various metrics (`likes_count`, `view_count`, etc.)

- **trip_members**
  - `trip_id` (FK → trips)
  - `user_id` (FK → profiles)
  - `role` (admin/editor/viewer/contributor)
  - `invited_by` (FK → profiles)
  - `joined_at` (timestamp)

### Trip Change & Historical Data:
- **trip_history** - Track changes to trips
- **trip_tags** - Link trips to tags for categorization
- **trip_images** - Photos associated with trips

## 3. Location Management

### Primary Tables:
- **destinations**
  - `id`
  - `city`, `country`, `continent`
  - `description`, `image_url`
  - Geographic data (latitude/longitude)
  - Metadata (ratings, descriptions, etc.)

- **places** 
  - Specific locations within destinations
  - `id`
  - `name`, `description`
  - `category` (attraction/restaurant/hotel/etc.)
  - `destination_id` (FK → destinations)
  - Location data, ratings, etc.

- **locations** - General location data
- **destination_tags** - Categorize destinations

## 4. Itinerary System

### Primary Tables:
- **itinerary_items**
  - `trip_id` (FK → trips)
  - `created_by` (FK → profiles)
  - `title`, `description`
  - `date`, `start_time`, `end_time`
  - `day_number` 
  - `place_id` (FK → places)
  - `category` (flight/accommodation/restaurant/etc.)
  - Location details, status, etc.

- **itinerary_sections**
  - `trip_id` (FK → trips)
  - `day_number`
  - `title`, `position`
  - Allows for organizing items into sections

### Voting/Feedback:
- **votes** - General voting table
- **itinerary_item_votes** - Track votes on itinerary items

## 5. Templates & Reusable Content

### Primary Tables:
- **itinerary_templates**
  - `id`
  - `title`, `description`
  - `destination_id` (FK → destinations)
  - `created_by` (FK → profiles)
  - `category`, `duration_days`
  - Metadata for discoverability

- **itinerary_template_sections** - Sections within templates
- **itinerary_template_items** - Items within template sections
- **template_sections** - Reusable template sections
- **template_activities** - Reusable activities for templates
- **trip_template_uses** - Track when templates are used

## 6. Collaboration Features

### Primary Tables:
- **collaborative_sessions**
  - Track real-time collaborative editing
  - `trip_id`, `document_id`, `document_type`
  - User presence and content

- **trip_notes**
  - Shared notes for a trip
  - `trip_id`, `content`
  - `updated_by`, `updated_at`

- **permission_requests** - Requests to join trips
- **invitations** - Formal invitations to trips

## 7. Media & Content Management

### Primary Tables:
- **albums**
  - Collections of images
  - `user_id`, `title`, `description`

- **trip_images**
  - Images associated with trips
  - `trip_id`, `album_id`
  - File info, metadata

- **image_metadata**
  - Detailed metadata for images
  - Attribution, source information
  - Dimensions, focal points, etc.

## 8. Expense Tracking

### Primary Tables:
- **budget_items**
  - `trip_id`, `title`, `amount`
  - `category`, `paid_by`
  - Split information

- **expenses**
  - Actual expenses recorded
  - `trip_id`, `title`, `amount`
  - `paid_by`, `category`, `date`

## 9. Tagging & Categorization

### Primary Tables:
- **tags**
  - General purpose tags
  - `id`, `name`

- **note_tags** - Tags applied to notes
- **trip_tags** - Tags applied to trips
- **user_suggested_tags** - User-suggested tags pending approval
- **destination_tags** - Tags applied to destinations

## Key Relationships:

1. **Trip-Member-Profile Chain**:
   - `trips` → `trip_members` (via trip_id)
   - `trip_members` → `profiles` (via user_id)

2. **Trip-Itinerary Hierarchy**:
   - `trips` → `itinerary_sections` (via trip_id)
   - `itinerary_sections` → `itinerary_items` (via section_id)

3. **Location Hierarchy**:
   - `destinations` contain `places`
   - `itinerary_items` reference `places`

4. **Template Structure**:
   - `itinerary_templates` → `itinerary_template_sections`
   - `itinerary_template_sections` → `itinerary_template_items`

5. **User Content Ownership**:
   - `profiles` own `trips` (via created_by)
   - `profiles` own `itinerary_items` (via created_by)
   - `profiles` own content (notes, images, etc.)

6. **Permission System**:
   - `trip_members.role` determines permissions
   - RLS policies enforce access based on membership

## Enumerated Types:

- **trip_role**: admin, editor, viewer, contributor
- **trip_status**: planning, upcoming, in_progress, completed, cancelled
- **item_status**: suggested, confirmed, rejected
- **vote_type**: up, down
- **itinerary_category**: flight, accommodation, attraction, restaurant, etc.
- **place_category**: attraction, restaurant, cafe, hotel, etc.
- **invitation_status**: pending, accepted, declined, expired

