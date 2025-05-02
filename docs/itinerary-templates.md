# Itinerary Templates Documentation

## 1. Overview

Itinerary Templates provide a way for users to create, share, and reuse standardized trip structures. Instead of building every trip itinerary from scratch, users can start with a pre-defined template containing sections (days) and items (activities, flights, accommodation placeholders, etc.). This promotes consistency, saves planning time, and allows sharing of successful trip outlines.

Templates are distinct from specific trip itineraries:

- **Templates:** Generic, reusable structures, often date-agnostic.
- **Trip Itineraries:** Concrete plans tied to specific dates, travelers, and bookings for a particular trip.

## 2. Core Concepts

- **Template:** The top-level entity representing a reusable itinerary structure. Contains metadata like name, description, duration, creator, etc.
- **Template Section:** Represents a logical grouping within a template, typically corresponding to a day (e.g., "Day 1", "Day 2"). Sections are ordered.
- **Template Item:** Represents a specific activity, placeholder, or note within a template section (or unscheduled within the template). Contains details like title, description, category, estimated cost/duration, and potentially links to generic places.

## 3. Data Model / Schema

The itinerary template data is stored across several database tables:

- **`itinerary_templates`**: Stores the main template information.

  - Key Fields:
    - `id` (Primary Key)
    - `creator_id` (Foreign Key to `profiles.id` or `auth.users.id`)
    - `name` (text, required)
    - `description` (text, optional)
    - `duration_days` (integer, optional)
    - `is_public` (boolean, default: false) - Controls visibility/sharing.
    - `cover_image_url` (text, optional)
    - `slug` (text, unique, optional) - For public access URLs.
    - `category` (text, optional) - e.g., "Adventure", "Relaxation", "City Break"
    - `usage_count` (integer, default: 0) - Tracks how many times it's used.
    - `created_at`, `updated_at`
  - Table Constant: `TABLES.ITINERARY_TEMPLATES`

- **`itinerary_template_sections`**: Stores the sections (days) belonging to a template.

  - Key Fields:
    - `id` (Primary Key)
    - `template_id` (Foreign Key to `itinerary_templates.id`)
    - `day_number` (integer, optional) - Represents the day order (e.g., 1, 2, 3). Null for unscheduled sections.
    - `title` (text, optional) - Custom title for the section (e.g., "Arrival Day & Old Town Exploration").
    - `position` (integer) - Defines the order of sections within the template.
    - `created_at`, `updated_at`
  - Table Constant: `TABLES.ITINERARY_TEMPLATE_SECTIONS`

- **`itinerary_template_items`**: Stores the individual items within a template section.
  - Key Fields:
    - `id` (Primary Key)
    - `section_id` (Foreign Key to `itinerary_template_sections.id`) - Links item to a section.
    - `template_id` (Foreign Key to `itinerary_templates.id`, potentially redundant if `section_id` is always present, but useful for unscheduled items).
    - `title` (text, required)
    - `description` (text, optional)
    - `category` (enum/text, e.g., using `ENUMS.ITINERARY_CATEGORY`)
    - `estimated_cost` (numeric, optional)
    - `currency` (text, optional)
    - `duration_minutes` (integer, optional)
    - `start_time_relative` (text, optional) - e.g., "Morning", "Afternoon", "Evening", or offset like "+2h". Not a specific time.
    - `location_text` (text, optional) - Generic location description (e.g., "Near Eiffel Tower").
    - `place_id` (Foreign Key to `places.id`, optional) - Link to a specific place _if_ the template item is tied to a concrete location.
    - `notes` (text, optional)
    - `position` (integer) - Defines the order of items within a section.
    - `created_at`, `updated_at`
  - Table Constant: `TABLES.ITINERARY_TEMPLATE_ITEMS`

**Relationships:**

- One `itinerary_templates` record has many `itinerary_template_sections`.
- One `itinerary_template_sections` record has many `itinerary_template_items`.

## 4. Functionality

### 4.1. Creating Templates

- Users can create new templates, likely via a dedicated form (e.g., `/itineraries/submit`).
- The creation process involves defining template metadata (name, description, etc.) and adding sections and items.
- Items within templates should focus on structure and type (e.g., "Activity: Museum Visit", "Accommodation: Check-in") rather than specific bookings or times.

### 4.2. Using / Applying Templates

- Users can apply an existing template to a _new_ or _existing_ trip.
- This action typically copies the sections and items from the template into the target trip's `itinerary_sections` and `itinerary_items` tables.
- The application process needs to:
  - Map template sections/items to the trip's actual dates.
  - Potentially prompt the user for specific details (e.g., replace placeholder "Hotel" with an actual booked hotel).
  - Increment the `usage_count` on the template.
- An API endpoint like `/api/trips/[tripId]/apply-template/[templateId]` likely handles this logic.

### 4.3. Sharing and Discovery (Optional)

- Templates marked as `is_public` could be listed on a public discovery page (e.g., `/itineraries`).
- Users could browse and preview public templates.

## 5. API Endpoints

Relevant API routes likely include:

- `POST /api/itineraries`: Create a new itinerary template. (Or potentially `/api/itineraries/create`)
- `GET /api/itineraries`: List available templates (possibly filtered by public/user-owned).
- `GET /api/itineraries/[slug]`: Fetch details of a specific public template by its slug.
- `POST /api/trips/[tripId]/apply-template/[templateId]`: Apply a template structure to a specific trip.
- `PUT /api/itineraries/[templateId]`: Update an existing template.
- `DELETE /api/itineraries/[templateId]`: Delete a template.

_(Use constants from `utils/constants/routes.ts` like `API_ROUTES.ITINERARIES.CREATE`, `API_ROUTES.TRIPS.APPLY_TEMPLATE` when implementing)._

## 6. Technical Implementation Details

- **UI Components:** Components for creating/editing templates (`app/itineraries/submit/`), displaying template lists (`app/itineraries/`), and potentially a template browser/selector component.
- **Server Actions/API Logic:** Backend logic to handle CRUD operations for templates and the process of applying a template to a trip. This involves mapping and copying data between template tables and itinerary tables.
- **Database Functions:** Potentially SQL functions (e.g., `apply_itinerary_template`) could encapsulate the logic for copying template data to a trip itinerary for atomicity and performance.

## 7. Future Enhancements

- **Versioning:** Allow creators to update templates while preserving older versions.
- **Ratings & Reviews:** Allow users to rate and review public templates.
- **Advanced Placeholders:** More dynamic placeholders within templates (e.g., suggesting places based on trip destination).
- **Template Forking:** Allow users to copy and modify existing public templates.
- **Category/Tagging:** More robust filtering and searching for templates.
