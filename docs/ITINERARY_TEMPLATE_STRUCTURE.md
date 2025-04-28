# Itinerary Template Structure

This document explains the structure of itinerary templates in the withme.travel application.

## Overview

The application uses templates to help users quickly create itineraries for their trips. These templates are stored in separate tables from user-created itinerary items to maintain a clear separation of concerns and allow for independent management:

- **User-created itinerary items**: Stored in the `itinerary_items` table, connected to specific user trips. These represent the personalized plan for a particular trip.
- **Template itinerary items**: Stored in the `itinerary_template_items` table, forming reusable blueprints. These are available for users to browse and apply to their trips.

## Core Functionality

### Template Creation & Management
- Templates (`itinerary_templates`) define the overall structure, linking to a destination, creator, and basic metadata (duration, category, etc.).
- Sections (`itinerary_template_sections`) organize template items, typically by day, providing logical grouping (e.g., "Day 1: Arrival & Check-in").
- Items (`itinerary_template_items`) represent the specific activities, places, or notes within a template section.

### Applying Templates to Trips
When a user applies a template (identified by its `slug`) to their trip:
1. The application fetches the `itinerary_templates` record.
2. It retrieves all associated `itinerary_template_sections`.
3. For the target trip, it creates corresponding `itinerary_sections` records.
4. It fetches all `itinerary_template_items` for each template section.
5. For each template item, it creates a corresponding `itinerary_items` record linked to the user's trip and the newly created trip section.
   - Crucially, information like `source_template_item_id` is populated in the new `itinerary_items` record to maintain attribution.
6. The application records this usage event in the `template_applications` table, potentially including the template version used.

### Data Separation Benefits
The migration separating template items (`itinerary_template_items`) from user itinerary items (`itinerary_items`) provides key advantages:
- **Template Stability**: Modifications to a template do *not* retroactively change user trips that have already applied it.
- **User Customization**: Users can freely modify their itinerary items (derived from a template) without affecting the original template.
- **Schema Clarity**: Template-specific fields (like quality scores or internal flags) can be managed separately without cluttering the user item schema.
### Integration with the Trips Feature
The itinerary template system is tightly integrated with the `app/trips` feature in the following ways:
* **Trip Creation Flow**: In `app/trips/create/components/CreateTripForm.tsx`, the `CreateTripForm` component offers built-in trip templates (`TRIP_TEMPLATES`) for quickstart. Selecting a template populates the form with default values (title, dates, tags, etc.).
* **Dynamic Template Listing**: On the trips listing page (`app/trips/page.tsx`), a dedicated section can render public templates by fetching from `GET /api/itineraries/[slug]` and displaying them via `ItineraryTemplateCard` components.
* **Apply Template to Existing Trips**: The `POST /api/itineraries/[slug]/use` endpoint (implemented in `app/api/itineraries/[slug]/use/route.ts`) is invoked by trip management pages (`app/trips/[tripId]/manage`) to apply a selected template, creating corresponding `itinerary_sections` and `itinerary_items` in the target trip.
* **Empty State Quickstarts**: The `EmptyTrips` component (`components/empty-trips.tsx`) presents quickstart destination suggestions, linking into the create flow (`/trips/create?destination=...`), which can tie into both default templates and new trip creation logic.
* **API Usage**: Both client-side code (React components) and server-side actions in the trips feature leverage the template API routes (`app/api/itineraries/[slug]` and its `use` sub-route) to fetch, display, and apply templates in a seamless user experience.

## Database Structure

### Main Tables

1. **`itinerary_templates`** - Stores the main template information:
   - `id`, `title`, `slug`, `description`, `destination_id`, `duration_days`, etc.
   - References a destination and creator

2. **`itinerary_template_sections`** - Organizes template items by day/section:
   - `id`, `template_id`, `day_number`, `title`, `position`
   - Groups items logically, such as "Day 1: Arrival" or "Day 2: City Exploration"

3. **`itinerary_template_items`** - Contains the actual activities and places:
   - `id`, `template_id`, `section_id`, `day`, `item_order`, `title`, `description`, etc.
   - These are the items that get copied into a user's trip when they apply a template

## How Templates Are Applied

When a user applies a template to their trip:

1. The application fetches the template using its slug
2. It retrieves all sections belonging to that template
3. It creates corresponding sections in the user's trip
4. It fetches all template items for each section
5. It creates corresponding itinerary items in the user's trip
6. The usage is recorded in the `trip_template_uses` table

## Data Migration

We've migrated template items from the `itinerary_items` table to the `itinerary_template_items` table to maintain a clean separation between user-created content and template content. This ensures:

- Templates can be modified without affecting user trips that have already applied them
- User modifications to their itinerary don't affect the original templates
- Template items can have specialized fields and relationships without complicating the user item schema

## API Endpoints

- `GET /api/itineraries/[slug]` - Fetches details for a specific itinerary template (identified by its slug).
- `POST /api/itineraries/[slug]/use` - Initiates the process of applying a specified template to a user's trip.

## Constants and Relationships

The application uses constants for table names and field names, found in `utils/constants.ts`:

- `DB_TABLES.ITINERARY_TEMPLATE_ITEMS`
- `DB_TABLES.ITINERARY_TEMPLATE_SECTIONS`
- `DB_FIELDS.ITINERARY_TEMPLATE_ITEMS.*`

Relationships between these tables are defined in the `DB_RELATIONSHIPS` object. 


## Relevant Table Schemas

Here are the `CREATE TABLE` statements for the primary tables involved in the itinerary template system:

### Template Structure Tables

1.  **`itinerary_templates`** - Stores the main template information.

    ```sql
    CREATE TABLE public.itinerary_templates (
      id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
      title character varying(255) NOT NULL,
      slug text NOT NULL,
      description text NULL,
      destination_id uuid NOT NULL,
      duration_days integer NOT NULL,
      category character varying(50) NULL, -- Made nullable, consistency?
      created_by uuid NOT NULL,
      created_at timestamp with time zone NULL DEFAULT now(),
      updated_at timestamp with time zone NULL DEFAULT now(),
      is_published boolean NULL DEFAULT false,
      view_count integer NULL DEFAULT 0,
      use_count integer NULL DEFAULT 0,
      like_count integer NULL DEFAULT 0,
      featured boolean NULL DEFAULT false,
      cover_image_url text NULL,
      groupsize text NULL,
      tags text[] NULL,
      template_type character varying(50) NULL CHECK (((template_type)::text = ANY (ARRAY[('official'::character varying)::text, ('user_created'::character varying)::text, ('trip_based'::character varying)::text]))),
      source_trip_id uuid NULL, -- For templates generated from trips
      version integer NULL DEFAULT 1,
      copied_count integer NULL DEFAULT 0,
      last_copied_at timestamp with time zone NULL,
      metadata jsonb NULL DEFAULT '{}'::jsonb,
      CONSTRAINT itinerary_templates_pkey PRIMARY KEY (id),
      CONSTRAINT unique_itinerary_template_slug UNIQUE (slug),
      CONSTRAINT itinerary_templates_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES destinations(id),
      CONSTRAINT itinerary_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id), -- Assuming relation to auth users
      -- Note: Removed duplicate created_by_fkey1 and slug_key constraints if they were redundant
      CONSTRAINT itinerary_templates_source_trip_id_fkey FOREIGN KEY (source_trip_id) REFERENCES trips(id) ON DELETE SET NULL
    ) TABLESPACE pg_default;

    CREATE INDEX IF NOT EXISTS idx_itinerary_templates_destination_id ON public.itinerary_templates USING btree (destination_id) TABLESPACE pg_default;
    CREATE INDEX IF NOT EXISTS idx_itinerary_templates_created_by ON public.itinerary_templates USING btree (created_by) TABLESPACE pg_default;
    CREATE INDEX IF NOT EXISTS idx_itinerary_templates_slug ON public.itinerary_templates USING btree (slug) TABLESPACE pg_default;
    ```

2.  **`itinerary_template_sections`** - Organizes template items by day/section.

    ```sql
    CREATE TABLE public.itinerary_template_sections (
      id uuid NOT NULL DEFAULT gen_random_uuid(), -- Changed to uuid for consistency
      template_id uuid NOT NULL,
      day_number integer NOT NULL,
      title text NULL,
      position integer NOT NULL DEFAULT 0,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now(),
      CONSTRAINT itinerary_template_sections_pkey PRIMARY KEY (id),
      CONSTRAINT itinerary_template_sections_template_id_fkey FOREIGN KEY (template_id) REFERENCES itinerary_templates(id) ON DELETE CASCADE,
      CONSTRAINT itinerary_template_sections_template_day_unique UNIQUE (template_id, day_number) -- Ensure unique day per template
    ) TABLESPACE pg_default;

    CREATE INDEX IF NOT EXISTS idx_itinerary_template_sections_template_id ON public.itinerary_template_sections USING btree (template_id) TABLESPACE pg_default;
    CREATE INDEX IF NOT EXISTS idx_itinerary_template_sections_template_day ON public.itinerary_template_sections USING btree (template_id, day_number) TABLESPACE pg_default;
    ```

3.  **`itinerary_template_items`** - Contains the actual activities and places for a template.

    ```sql
    CREATE TABLE public.itinerary_template_items (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      template_id uuid NOT NULL,
      section_id uuid NOT NULL, -- Link to the section
      day integer NOT NULL, -- Kept for potential direct day reference, ensure consistency with section
      item_order integer NOT NULL DEFAULT 0,
      title text NULL,
      description text NULL,
      start_time time without time zone NULL,
      end_time time without time zone NULL,
      location text NULL,
      place_id uuid NULL,
      created_at timestamp with time zone NULL DEFAULT now(),
      updated_at timestamp with time zone NULL DEFAULT now(),
      -- Add other relevant fields mirroring itinerary_items if needed (e.g., cost, category, duration)
      -- Consider if template items need basic attribution or quality metrics
      CONSTRAINT itinerary_template_items_pkey PRIMARY KEY (id),
      CONSTRAINT fk_itinerary_template_items_template_id FOREIGN KEY (template_id) REFERENCES itinerary_templates(id) ON DELETE CASCADE,
      CONSTRAINT fk_itinerary_template_items_section_id FOREIGN KEY (section_id) REFERENCES itinerary_template_sections(id) ON DELETE CASCADE,
      CONSTRAINT fk_itinerary_template_items_place_id FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL,
      CONSTRAINT itinerary_template_items_day_check CHECK ((day > 0))
    ) TABLESPACE pg_default;

    CREATE INDEX IF NOT EXISTS idx_itinerary_template_items_template_id ON public.itinerary_template_items USING btree (template_id) TABLESPACE pg_default;
    CREATE INDEX IF NOT EXISTS idx_itinerary_template_items_section_id ON public.itinerary_template_items USING btree (section_id) TABLESPACE pg_default;
    CREATE INDEX IF NOT EXISTS idx_itinerary_template_items_day_order ON public.itinerary_template_items USING btree (template_id, day, item_order) TABLESPACE pg_default; -- Or use section_id, item_order
    CREATE INDEX IF NOT EXISTS idx_itinerary_template_items_place_id ON public.itinerary_template_items USING btree (place_id) TABLESPACE pg_default;
    ```

### User Trip Structure Tables (Related)

These tables store user-specific trip data, which interacts with templates when applied.

1.  **`itinerary_sections`** - Organizes user itinerary items into sections (often days).

    ```sql
    CREATE TABLE public.itinerary_sections (
      id uuid NOT NULL DEFAULT gen_random_uuid(),
      trip_id uuid NOT NULL,
      day_number integer NOT NULL,
      date date NULL,
      title text NULL,
      position integer NOT NULL DEFAULT 0,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now(),
      CONSTRAINT itinerary_sections_pkey PRIMARY KEY (id),
      CONSTRAINT itinerary_sections_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      CONSTRAINT itinerary_sections_trip_id_day_number_key UNIQUE (trip_id, day_number)
    ) TABLESPACE pg_default;

    CREATE INDEX IF NOT EXISTS idx_itinerary_sections_trip_id ON public.itinerary_sections USING btree (trip_id) TABLESPACE pg_default;
    ```

2.  **`itinerary_items`** - Stores individual items within a user's itinerary, potentially derived from templates.

    ```sql
    CREATE TABLE public.itinerary_items (
      id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
      trip_id uuid NOT NULL, -- Changed to NOT NULL, items should belong to a trip
      section_id uuid NULL, -- Link to user's itinerary section
      day_number integer NULL, -- Denormalized day number
      position numeric NULL, -- Order within the section/day
      title text NOT NULL,
      description text NULL, -- Consider separating original/personal notes
      original_description text NULL, -- From template or original source
      personal_notes text NULL, -- User's modifications/notes
      start_time time without time zone NULL,
      end_time time without time zone NULL,
      duration_minutes integer NULL,
      location text NULL,
      address text NULL,
      place_id uuid NULL,
      latitude numeric(10,8) NULL,
      longitude numeric(11,8) NULL,
      cost numeric(10,2) NULL,
      estimated_cost numeric NULL,
      currency text NULL,
      category public.itinerary_category NULL, -- Assuming enum type exists
      status public.item_status NULL DEFAULT 'suggested'::item_status, -- Assuming enum type exists
      cover_image_url text NULL,
      created_at timestamp with time zone NULL DEFAULT now(),
      updated_at timestamp with time zone NULL DEFAULT now(),
      created_by uuid NULL, -- User who added/modified this instance

      -- Content Layering & Attribution (from migrations)
      content_layer text NULL, -- e.g., 'original', 'customized', 'generated'
      source_template_item_id uuid NULL, -- Link back to the template item if copied
      source_item_id uuid NULL, -- Link back to another itinerary_item if copied/shared
      original_creator_id uuid NULL, -- User who originally created the content
      attribution_type text NULL, -- e.g., 'template', 'shared_trip', 'original'
      attribution_metadata jsonb NULL DEFAULT '{}'::jsonb,

      -- Quality & Popularity Metrics (from migrations)
      quality_tier text NULL, -- e.g., 'premium', 'standard', 'community'
      quality_score numeric NULL,
      popularity_score numeric NULL DEFAULT 0,
      view_count integer NULL DEFAULT 0,
      like_count integer NULL DEFAULT 0,
      share_count integer NULL DEFAULT 0, -- Renamed from copied_count for clarity?

      -- SEO Fields (from migrations)
      public_slug text NULL, -- Slug for publicly viewable items
      canonical_id uuid NULL, -- Reference to the canonical version (e.g., template item ID)
      canonical_url text NULL,
      meta_title text NULL,
      meta_description text NULL,
      meta_keywords text[] NULL,
      structured_data jsonb NULL DEFAULT '{}'::jsonb,

      -- Deprecated/Review Fields
      -- type text NULL, -- Use category?
      -- item_type text NULL, -- Use category or content_layer?
      -- is_custom boolean NULL DEFAULT false, -- Use content_layer?
      -- source_trip_id uuid NULL, -- Use source_item_id or attribution_metadata?
      -- share_status text NULL, -- Use is_published or similar?

      CONSTRAINT itinerary_items_pkey PRIMARY KEY (id),
      CONSTRAINT fk_itinerary_items_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      CONSTRAINT fk_itinerary_items_section FOREIGN KEY (section_id) REFERENCES itinerary_sections(id) ON DELETE SET NULL,
      CONSTRAINT fk_itinerary_items_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL,
      CONSTRAINT fk_itinerary_items_creator FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to auth user
      CONSTRAINT fk_itinerary_items_original_creator FOREIGN KEY (original_creator_id) REFERENCES auth.users(id) ON DELETE SET NULL,
      CONSTRAINT fk_itinerary_items_source_template_item FOREIGN KEY (source_template_item_id) REFERENCES itinerary_template_items(id) ON DELETE SET NULL,
      CONSTRAINT fk_itinerary_items_source_item FOREIGN KEY (source_item_id) REFERENCES itinerary_items(id) ON DELETE SET NULL,
      CONSTRAINT fk_itinerary_items_canonical FOREIGN KEY (canonical_id) REFERENCES itinerary_items(id) ON DELETE SET NULL -- Or template_items? Needs clarification
      -- Add check constraints for content_layer, attribution_type etc. if using enums or specific values
    ) TABLESPACE pg_default;

    CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id ON public.itinerary_items USING btree (trip_id) TABLESPACE pg_default;
    CREATE INDEX IF NOT EXISTS idx_itinerary_items_section_id ON public.itinerary_items USING btree (section_id) TABLESPACE pg_default;
    CREATE INDEX IF NOT EXISTS idx_itinerary_items_place_id ON public.itinerary_items USING btree (place_id) TABLESPACE pg_default;
    CREATE INDEX IF NOT EXISTS idx_itinerary_items_created_by ON public.itinerary_items USING btree (created_by) TABLESPACE pg_default;
    CREATE INDEX IF NOT EXISTS idx_itinerary_items_source_template_item_id ON public.itinerary_items USING btree (source_template_item_id) TABLESPACE pg_default;
    CREATE INDEX IF NOT EXISTS idx_itinerary_items_canonical_id ON public.itinerary_items USING btree (canonical_id) TABLESPACE pg_default;
    CREATE INDEX IF NOT EXISTS idx_itinerary_items_public_slug ON public.itinerary_items USING btree (public_slug) WHERE public_slug IS NOT NULL TABLESPACE pg_default;
    ```

### Tracking & Validation Tables

1.  **`template_applications`** - Tracks when a template is applied to a trip.

    ```sql
    CREATE TABLE public.template_applications (
      id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
      trip_id uuid NOT NULL,
      template_id uuid NOT NULL,
      applied_at timestamp with time zone NULL DEFAULT now(),
      applied_by uuid NULL,
      template_version_used integer NULL, -- Corresponds to itinerary_templates.version at time of application
      -- Fields related to generation/optimization process if applicable
      success_rate double precision NULL,
      optimization_level text NULL,
      fallbacks_used integer NULL,
      application_metadata jsonb NULL DEFAULT '{}'::jsonb,
      CONSTRAINT template_applications_pkey PRIMARY KEY (id),
      CONSTRAINT template_applications_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      CONSTRAINT template_applications_template_id_fkey FOREIGN KEY (template_id) REFERENCES itinerary_templates(id) ON DELETE CASCADE,
      CONSTRAINT template_applications_applied_by_fkey FOREIGN KEY (applied_by) REFERENCES auth.users(id) ON DELETE SET NULL,
      CONSTRAINT template_applications_trip_template_applied_key UNIQUE (trip_id, template_id, applied_at) -- Ensure unique application record per timestamp
    ) TABLESPACE pg_default;

    CREATE INDEX IF NOT EXISTS idx_template_applications_trip_id ON public.template_applications USING btree (trip_id) TABLESPACE pg_default;
    CREATE INDEX IF NOT EXISTS idx_template_applications_template_id ON public.template_applications USING btree (template_id) TABLESPACE pg_default;
    ```

2.  **`validation_logs`** - Logs validation status of templates or applied items. *Purpose: Primarily for internal tracking of template quality or automated checks.*

    ```sql
    CREATE TABLE public.validation_logs (
      id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
      trip_id uuid NULL, -- Optional: If validation occurred in context of a trip application
      template_id uuid NULL, -- Template being validated
      item_id uuid NULL, -- Optional: Specific template item being validated
      is_valid boolean NOT NULL,
      validation_errors text[] NULL,
      validated_at timestamp with time zone NULL DEFAULT now(),
      validated_by uuid NULL DEFAULT auth.uid(), -- Can be system or user ID
      CONSTRAINT validation_logs_pkey PRIMARY KEY (id),
      CONSTRAINT validation_logs_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL, -- Use SET NULL if trip deletion shouldn't remove log
      CONSTRAINT validation_logs_template_id_fkey FOREIGN KEY (template_id) REFERENCES itinerary_templates(id) ON DELETE SET NULL, -- Use SET NULL if template deletion shouldn't remove log
      CONSTRAINT validation_logs_item_id_fkey FOREIGN KEY (item_id) REFERENCES itinerary_template_items(id) ON DELETE SET NULL, -- Link to template item, use SET NULL
      CONSTRAINT validation_logs_target_check CHECK (COALESCE(template_id, item_id) IS NOT NULL) -- Ensure validation targets at least a template or item
    ) TABLESPACE pg_default;

    CREATE INDEX idx_validation_logs_template_id ON public.validation_logs USING btree (template_id) WHERE template_id IS NOT NULL;
    CREATE INDEX idx_validation_logs_item_id ON public.validation_logs USING btree (item_id) WHERE item_id IS NOT NULL;
    ```

### Summary

These tables form the core structure for managing itinerary templates (`itinerary_templates`, `itinerary_template_sections`, `itinerary_template_items`), applying them to user trips (`template_applications`), and storing the resulting user itinerary data (`itinerary_sections`, `itinerary_items`) with advanced features like content layering, attribution, and SEO enhancements based on recent migrations.

## Best Practices

*   **Data Integrity**:
    *   Review foreign key actions (`ON DELETE CASCADE`, `ON DELETE SET NULL`) carefully to match the desired data integrity behavior upon deletion of parent records (e.g., deleting a template should likely cascade to its sections and items).
    *   Use PostgreSQL `ENUM` types where appropriate (e.g., `template_type`, `category`, `status`) to enforce consistency and valid values. Define these types clearly.
    *   Ensure consistency between `itinerary_template_sections.day_number` and `itinerary_template_items.day`. Consider if `itinerary_template_items.day` is strictly necessary if `section_id` reliably links to the day via `itinerary_template_sections`. If kept, ensure they are synchronized.
*   **Attribute Correctly**: When applying templates, diligently populate attribution fields (`source_template_item_id`, `attribution_type`, `original_creator_id` if applicable) in the created `itinerary_items` records.
*   **Slug Management**: Ensure `itinerary_templates.slug` values are unique and URL-friendly. Implement a robust slug generation and update strategy.
*   **Performance**:
    *   Regularly review and optimize indexing strategies based on common query patterns (e.g., fetching templates by destination, fetching items for a section). The provided indices are a good starting point.
    *   Be mindful of query complexity when fetching templates and their nested items, especially for display purposes. Consider optimized queries or denormalization if performance becomes an issue.
*   **Security**:
    *   Implement and rigorously test Row Level Security (RLS) policies on all relevant tables. Policies should control:
        *   Who can create, view, update, or delete templates (`itinerary_templates`, `_sections`, `_items`).
        *   Visibility of templates (e.g., based on `is_published` status or `template_type`).
        *   Access to user-specific data (`itinerary_items`, `itinerary_sections`, `template_applications`).
*   **Consistency**: Maintain consistency between template fields and the corresponding `itinerary_items` fields where data is copied (e.g., `title`, `description`, `place_id`).
*   **Constants**: Continue using constants for table and field names (`utils/constants.ts`) to improve maintainability and reduce typos.

## Ideas for Expansion

*   **Template Versioning**: Enhance the `itinerary_templates.version` field to allow users to apply specific historical versions of a template. Track `template_version_used` more rigorously in `template_applications`. Consider how template updates affect existing versions.
*   **User-Generated Templates**: Refine the process for users creating templates (`template_type = 'user_created'` or `'trip_based'`). Implement moderation, quality control, and potentially sharing/visibility settings.
*   **Template Ratings & Reviews**: Add tables to allow users to rate and review templates, helping others discover high-quality options. Link reviews to `itinerary_templates`.
*   **Dynamic Content Adaptation**: Explore mechanisms to adapt template items based on user preferences, trip dates (seasonality), or group size when applying a template. This could involve rules or conditional logic stored perhaps in `itinerary_template_items.metadata`.
*   **Forking/Remixing Templates**: Allow users to "fork" an existing template to create their own customized version, maintaining a link to the original source.
*   **Template Categories/Themes**: Expand beyond basic categories to include more nuanced themes (e.g., "Romantic Getaway", "Family Adventure", "Budget Travel").
*   **Advanced Place Linking**: Improve the relationship between `itinerary_template_items` and `places`. Potentially store multiple place suggestions for a single template item slot.
*   **Template Analytics**: Enhance tracking (`view_count`, `use_count`, `like_count`, `copied_count`) and potentially build dashboards to understand template popularity and usage patterns.
*   **AI Integration**: Explore using AI to:
    *   Generate template suggestions based on user input.
    *   Validate or improve the quality of template items.
    *   Suggest personalized modifications after a template is applied.
*   **Component/Block Library**: Develop a concept of reusable template "blocks" (e.g., a standard "Museum Visit" block) that can be inserted into multiple templates.

### Deprecated/Review Field Notes (from itinerary_items)

*   Fields like `type`, `item_type`, `is_custom`, `source_trip_id`, `share_status` noted in the `itinerary_items` schema seem potentially redundant or replaceable by newer fields (`category`, `content_layer`, `attribution_metadata`, `is_published`). Review and formally deprecate/remove if no longer needed to simplify the schema.
*   Clarify the purpose and referential integrity of `canonical_id` and `fk_itinerary_items_canonical`. Should it point to `itinerary_items` or `itinerary_template_items`?

*This document should be kept up-to-date as the template system evolves.*