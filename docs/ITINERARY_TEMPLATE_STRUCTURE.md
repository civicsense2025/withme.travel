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

- **Template Stability**: Modifications to a template do _not_ retroactively change user trips that have already applied it.
- **User Customization**: Users can freely modify their itinerary items (derived from a template) without affecting the original template.
- **Schema Clarity**: Template-specific fields (like quality scores or internal flags) can be managed separately without cluttering the user item schema.

### Integration with the Trips Feature

The itinerary template system is tightly integrated with the `app/trips` feature in the following ways:

- **Trip Creation Flow**: In `app/trips/create/components/CreateTripForm.tsx`, the `CreateTripForm` component offers built-in trip templates (`TRIP_TEMPLATES`) for quickstart. Selecting a template populates the form with default values (title, dates, tags, etc.).
- **Dynamic Template Listing**: On the trips listing page (`app/trips/page.tsx`), a dedicated section can render public templates by fetching from `GET /api/itineraries/[slug]` and displaying them via `ItineraryTemplateCard` components.
- **Apply Template to Existing Trips**: The `POST /api/itineraries/[slug]/use` endpoint (implemented in `app/api/itineraries/[slug]/use/route.ts`) is invoked by trip management pages (`app/trips/[tripId]/manage`) to apply a selected template, creating corresponding `itinerary_sections` and `itinerary_items` in the target trip.
- **Empty State Quickstarts**: The `EmptyTrips` component (`components/empty-trips.tsx`) presents quickstart destination suggestions, linking into the create flow (`/trips/create?destination=...`), which can tie into both default templates and new trip creation logic.
- **API Usage**: Both client-side code (React components) and server-side actions in the trips feature leverage the template API routes (`app/api/itineraries/[slug]` and its `use` sub-route) to fetch, display, and apply templates in a seamless user experience.

## Constants and Relationships

The application uses constants for table names, field names, and relationships, which serve as the **single source of truth** for the database structure. These are found in `utils/constants/database.ts`:

- **Table Names**: Use `TABLES.ITINERARY_TEMPLATES`, `TABLES.ITINERARY_TEMPLATE_SECTIONS`, `TABLES.ITINERARY_TEMPLATE_ITEMS`, etc.
- **Field Names**: Access field names like `FIELDS.ITINERARY_TEMPLATES.TITLE`, `FIELDS.ITINERARY_TEMPLATE_SECTIONS.TEMPLATE_ID`, `FIELDS.ITINERARY_TEMPLATE_ITEMS.SECTION_ID`, etc.
- **Enums**: Database enum values are available via `ENUMS.*`, such as `ENUMS.TEMPLATE_TYPE`.
- **Relationships**: Foreign key relationships are outlined in the `RELATIONSHIPS` object within the constants file.

**Always refer to `utils/constants/database.ts` for the most accurate and up-to-date schema details.** Avoid relying on potentially outdated schema definitions elsewhere.

## Database Schema Overview

Instead of embedding static `CREATE TABLE` statements, this section provides a high-level overview of the tables involved. For specific column names, types, constraints, and relationships, please consult the `TABLES`, `FIELDS`, and `RELATIONSHIPS` exports in `utils/constants/database.ts`.

### Core Structure Tables

1.  **`TABLES.TRIPS`**:

    - **Description**: Represents an actual trip created by a user. This is the primary record for a user's planned journey. It can be created from scratch or by applying an `itinerary_template`.
    - **Required Fields**:
      - `created_by`: uuid (links to the user who created the trip)
      - `name`: text (the name of the trip)
      - `destination_id`: uuid (the destination for the trip)
      - `duration_days`: integer (the total number of days for the trip)

2.  **`TABLES.ITINERARY_SECTIONS`**:

    - **Description**: Represents sections within a specific user trip (`trip_id`), organizing the itinerary into manageable parts (e.g., Day 1, Day 2). These are often created by copying the structure from `itinerary_template_sections` when a template is applied.
    - **Required Fields**:
      - `trip_id`: uuid (foreign key linking to the `trips` table, indicating which trip this section belongs to)
      - `day_number`: integer (indicates which day this section corresponds to within the trip)

3.  **`TABLES.ITINERARY_ITEMS`**:

    - **Description**: Represents individual activities or events planned for a specific day within a user's trip (`trip_id`). When created from a template, these items are copies of `itinerary_template_items`, linked via fields like `source_template_item_id` (or similar attribution mechanism) to track their origin.
    - **Required Fields**:
      - `trip_id`: uuid (foreign key linking to the `trips` table, indicating which trip this item belongs to)
      - `day`: integer (indicates which day this item is scheduled for)
      - `title`: text (the title or name of the itinerary item)

4.  **`TABLES.ITINERARY_TEMPLATES`**:

    - **Description**: Represents a reusable template for a trip itinerary. Serves as the blueprint for creating new trips or populating existing ones.
    - **Required Fields**:
      - `title`: character varying(255) (the title of the template)
      - `destination_id`: uuid (the destination for the template)
      - `duration_days`: integer (the total number of days for the template)

5.  **`TABLES.ITINERARY_TEMPLATE_SECTIONS`**:

    - **Description**: Represents sections within an itinerary template (`trip_id` here refers to the template ID), organizing the template structure.
    - **Required Fields**:
      - `trip_id`: uuid (foreign key linking to the `itinerary_templates` table, indicating which template this section belongs to)
      - `day_number`: integer (indicates which day this section corresponds to within the template)

6.  **`TABLES.ITINERARY_TEMPLATE_ITEMS`**:
    - **Description**: Represents individual activities or events planned within an itinerary template (`template_id`). These serve as the source items when a template is applied to a trip.
    - **Required Fields**:
      - `template_id`: uuid (foreign key linking to the `itinerary_templates` table, indicating which template this item belongs to)
      - `day`: integer (indicates which day this item is scheduled for within the template)
      - `title`: text (the title or name of the itinerary item)

### Relationships Overview

- **Static Relationships (Foreign Keys):**
  - `trips` <-> `itinerary_sections` (via `itinerary_sections.trip_id`)
  - `trips` <-> `itinerary_items` (via `itinerary_items.trip_id`)
  - `itinerary_templates` <-> `itinerary_template_sections` (via `itinerary_template_sections.trip_id`)
  - `itinerary_templates` <-> `itinerary_template_items` (via `itinerary_template_items.template_id`)
- **Dynamic Relationship (Template Application):**
  - When an `itinerary_template` is applied to a `trip`:
    - `itinerary_template_sections` are used to create corresponding `itinerary_sections` for the `trip`.
    - `itinerary_template_items` are copied to create corresponding `itinerary_items` for the `trip`, linked to the newly created `itinerary_sections`.
    - Attribution is maintained by storing a reference to the source template item within the created `itinerary_items` record (e.g., using a `source_template_item_id` field).

### Tracking & Validation Tables

1.  **`TABLES.TEMPLATE_APPLICATIONS`**: Records each instance where a specific template (`template_id`) is applied to a user's trip (`trip_id`). It logs who applied it (`applied_by`), when (`applied_at`), and the `template_version_used` (corresponding to `ITINERARY_TEMPLATES.version` at the time of application).

2.  **`TABLES.VALIDATION_LOGS`**: Used internally for tracking the validation status or quality checks performed on templates (`template_id`) or specific template items (`item_id`). Includes fields like `is_valid` and `validation_errors`.

### Summary

These tables form the core structure for managing itinerary templates (`itinerary_templates`, `itinerary_template_sections`, `itinerary_template_items`), applying them to user trips (`template_applications`), and storing the resulting user itinerary data (`itinerary_sections`, `itinerary_items`) with clear separation and attribution maintained during the application process. **Refer to `utils/constants/database.ts` for all specific field names and relationships.**

## Best Practices

- **Data Integrity**:
  - Review foreign key actions (`ON DELETE CASCADE`, `ON DELETE SET NULL`) carefully to match the desired data integrity behavior upon deletion of parent records (e.g., deleting a template should likely cascade to its sections and items).
  - Use PostgreSQL `ENUM` types where appropriate (e.g., for `template_type`, `category`, `status`) to enforce consistency and valid values. Define these types clearly.
- **Attribute Correctly**: When applying templates, diligently populate attribution fields (`source_template_item_id`, `attribution_type`, `original_creator_id` if applicable) in the created `itinerary_items` records.
- **Slug Management**: Ensure `itinerary_templates.slug` values are unique and URL-friendly. Implement a robust slug generation and update strategy.
- **Performance**:
  - Regularly review and optimize indexing strategies based on common query patterns (e.g., fetching templates by destination, fetching items for a section). The provided indices are a good starting point.
  - Be mindful of query complexity when fetching templates and their nested items, especially for display purposes. Consider optimized queries or denormalization if performance becomes an issue.
- **Security**:
  - Implement and rigorously test Row Level Security (RLS) policies on all relevant tables. Policies should control:
    - Who can create, view, update, or delete templates (`itinerary_templates`, `_sections`, `_items`).
    - Visibility of templates (e.g., based on `is_published` status or `template_type`).
    - Access to user-specific data (`itinerary_items`, `itinerary_sections`, `template_applications`).
- **Consistency**: Maintain consistency between template fields and the corresponding `itinerary_items` fields where data is copied (e.g., `title`, `description`, `place_id`).
- **Constants**: Continue using constants for table and field names (`utils/constants/database.ts`) to improve maintainability and reduce typos.
- **New Metadata Fields**: Leverage the new fields in `itinerary_templates` (`groupsize`, `tags`, `template_type`, `version`, `metadata`) for better filtering, categorization, and feature development.

## Ideas for Expansion

- **Template Versioning**: Enhance the `itinerary_templates.version` field to allow users to apply specific historical versions of a template. Track `template_version_used` more rigorously in `template_applications`. Consider how template updates affect existing versions.
- **User-Generated Templates**: Refine the process for users creating templates (`template_type = 'user_created'` or `'trip_based'`). Implement moderation, quality control, and potentially sharing/visibility settings.
- **Template Ratings & Reviews**: Add tables to allow users to rate and review templates, helping others discover high-quality options. Link reviews to `itinerary_templates`.
- **Dynamic Content Adaptation**: Explore mechanisms to adapt template items based on user preferences, trip dates (seasonality), or group size when applying a template. This could involve rules or conditional logic stored perhaps in `itinerary_template_items.metadata`.
- **Forking/Remixing Templates**: Allow users to "fork" an existing template to create their own customized version, maintaining a link to the original source.
- **Template Categories/Themes**: Expand beyond basic categories to include more nuanced themes (e.g., "Romantic Getaway", "Family Adventure", "Budget Travel").
- **Advanced Place Linking**: Improve the relationship between `itinerary_template_items` and `places`. Potentially store multiple place suggestions for a single template item slot.
- **Template Analytics**: Enhance tracking (`view_count`, `use_count`, `like_count`, `copied_count`) and potentially build dashboards to understand template popularity and usage patterns.
- **AI Integration**: Explore using AI to:
  - Generate template suggestions based on user input.
  - Validate or improve the quality of template items.
  - Suggest personalized modifications after a template is applied.
- **Component/Block Library**: Develop a concept of reusable template "blocks" (e.g., a standard "Museum Visit" block) that can be inserted into multiple templates.

### Deprecated/Review Field Notes (from itinerary_items)

- Fields like `type`, `item_type`, `is_custom`, `source_trip_id`, `share_status`
