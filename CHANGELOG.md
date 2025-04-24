# Changelog

## [Unreleased] - YYYY-MM-DD

### Features
- **Trip Tag Management:** Implemented functionality to add, remove, and view tags associated with trips.
  - Added `tags` and `trip_tags` database tables.
  - Created `TagInput` component with autocomplete for tag selection/creation.
  - Integrated `TagInput` into the `EditTripForm`.
  - Implemented API routes (`GET /api/tags`, `PUT /api/trips/[tripId]/tags`) for tag fetching and synchronization.
  - Separated tag handling from the main trip update API (`PATCH /api/trips/[tripId]`).

### Fixes
- **Tag Saving:** Resolved database constraint (`UNIQUE` on name, `NOT NULL` on slug/category) and RLS policy errors preventing tag creation and association during trip edits.
- **API/SSR:** Corrected Supabase client usage (`@supabase/ssr`) and parameter handling (`params`) in API routes and Server Components.
- **Trip Editing UI:** Fixed issue where "Edit Trip" button visibility was incorrect.
- **Trip Editing UI:** Fixed 404 error when navigating to the `/trips/[tripId]/edit` page.

### Splitwise Integration

#### Technical Updates

*   **Database Schema (`supabase/migrations/001_splitwise_integration.sql`):**
    *   Created `splitwise_connections` table to store user OAuth tokens (`access_token`, `refresh_token`), token expiry (`expires_at`), and Splitwise user ID (`splitwise_user_id`). Linked to `auth.users` via `user_id`.
    *   Added `splitwise_group_id` (nullable bigint) column to the `trips` table to link trips to Splitwise groups.
    *   Implemented Row Level Security (RLS) policies on `splitwise_connections` to restrict access to the owner user.
    *   Included setup for `pgsodium` extension (for potential token encryption) and an `updated_at` trigger.
*   **Splitwise Service (`lib/services/splitwise.ts`):**
    *   Developed service functions for core Splitwise interactions:
        *   `storeSplitwiseCredentials`: Saves/updates tokens and user ID in the database.
        *   `getSplitwiseCredentials`: Retrieves stored credentials for a user.
        *   `getCurrentUser`: Fetches the current user's profile from Splitwise API.
        *   `refreshAccessToken`: Handles automatic refreshing of expired access tokens using the refresh token.
        *   `linkTripToSplitwiseGroup`: Updates a trip record with the corresponding Splitwise group ID.
    *   Introduced a custom `SplitwiseError` class for better error handling.
    *   Defined necessary TypeScript types for Splitwise API objects (`SplitwiseUser`, `SplitwiseGroup`, `SplitwiseExpense`, etc.).
*   **OAuth Callback (`app/api/splitwise/callback/route.ts`):**
    *   Implemented the server-side logic to handle the OAuth2 callback from Splitwise.
    *   Exchanges the authorization code for an access token and refresh token.
    *   Fetches the `splitwise_user_id` using the obtained access token.
    *   Stores the credentials securely using `storeSplitwiseCredentials`.
    *   Improved token validation (checking for `access_token` existence).
    *   Handled optional `refresh_token` and calculated `expires_at` (with default).
    *   Added specific error handling and user-friendly redirects based on success or failure states (e.g., auth failure, token exchange failure, storage failure).
*   **Constants (`utils/constants.ts`):**
    *   Added `DB_TABLES.SPLITWISE_CONNECTIONS`.
    *   Added `DB_FIELDS.SPLITWISE_CONNECTIONS` (defining fields like `USER_ID`, `ACCESS_TOKEN`, `SPLITWISE_USER_ID`, etc.).
    *   Added `DB_FIELDS.TRIPS.SPLITWISE_GROUP_ID`.
    *   Verified constants are used in relevant service and API files, avoiding hardcoded strings.

### Platform Core Functionality

#### Technical Updates

*   **Authentication Overhaul:**
    *   Implemented dedicated API routes for `login`, `signup`, `logout`, and `me` (`/api/auth/...`) using Supabase server client for secure handling.
    *   Refactored `AuthProvider` (`components/auth-provider.tsx`) to use the new API routes, manage user state (including profile data), and handle session updates.
    *   Standardized authentication checks across various API routes (e.g., members, notes) using `createClient()` and `getUser()` for consistency and security, replacing older `getSession()` methods.
    *   Troubleshooted and fixed issues related to cookie parsing, session management, and unauthorized (401) errors during login/API access.
    *   Addressed redirect issues, including double URL encoding problems, by refining middleware and client-side redirect logic.
    *   Improved error handling and logging within authentication flows.
*   **Trip Creation (SQL Function `create_trip_with_owner`):**
    *   Validated required inputs (`name`, `slug`, `destination_id`, `destination_name`) within the SQL function to prevent errors.
    *   Enhanced SQL function error messages for clearer feedback on validation failures or database issues (e.g., unique constraints).
*   **Trip Creation (API Endpoint `/api/trips/create`):**
    *   Added logging of the complete `tripData` payload sent to the SQL function for easier debugging.
    *   Improved logging to capture specific errors returned by the SQL function.
    *   Updated API response handling to correctly use the `success` flag and `error` message from the SQL function.
    *   Changed successful API response to include the final `slug` (potentially updated by SQL function) and a consistent `redirectUrl` (`/trips/[tripId]`).
*   **Routing (`Next.js`):**
    *   Resolved Next.js dynamic route conflicts (e.g., `[city]` vs `[id]`) by moving the ID-based destination API to `/api/destinations/by-id/[id]`.
    *   Organized API routes more explicitly (e.g., `/by-id/`) to ensure Next.js correctly interprets URL parameters.
*   **Destination Data (API & Validation):**
    *   Created API endpoints to fetch destinations by city (`/api/destinations/[city]`) and ID (`/api/destinations/by-id/[id]`).
    *   Improved API error handling (e.g., returning specific 404s, clearer validation messages) and standardized response formats.
    *   Added detailed API logging to aid debugging.
    *   Strengthened destination data validation: Added UUID format check for IDs, ensured required fields (`id`, `city`, `country`) are present, and automatically generated a destination name (`city, country`) if missing.
*   **Search (Backend - *In Progress*):**
    *   Developing backend search logic to allow searching across destinations, trips, etc.

#### Frontend Updates

*   **Trip Creation (`app/trips/create/page.tsx`):**
    *   Built the multi-step trip creation form (details, dates, travelers, vibe, budget, privacy).
    *   Added frontend validation to check required fields (name, slug, destination) before submitting the form.
    *   Integrated the reusable `LocationSearch` component for selecting the trip destination.
    *   Ensured the `tripData` object sent to the API includes details from the selected/validated destination.
    *   Improved frontend error display to show specific messages returned by the trip creation API.
    *   Updated the form to redirect users using the `redirectUrl` provided by the API upon successful trip creation.
    *   Corrected the API endpoint call used to fetch destination data when pre-filling the form (using `/api/destinations/by-id/[id]`).
*   **Destination Pages (`app/destinations/[city]/page.tsx`):**
    *   Created the destination detail page (`/destinations/[city]`) to display information fetched from the API.
    *   Added loading indicators and error message displays for the destination detail page.
    *   Added components to display destination image, description, ratings, planning info, and relevant badges.
*   **Location Search (`components/location-search.tsx`):**
    *   Created a reusable `LocationSearch` component for searching and selecting destinations across the site.
*   **Search Page (`app/search/page.tsx`):**
    *   Built the initial frontend structure for the main search page (`/search`) to display results.

### Additional Features

#### Technical Updates

*   **Like/Save Functionality (Backend - *Planned*):**
    *   Planning backend changes (database schema, API endpoints) to allow users to save/like items.
*   **Destination Reviews (Backend - *Planned*):**
    *   Planning backend changes (database schema, API endpoints) to allow users to add and view destination reviews.

#### Frontend Updates

*   **City Bubbles Animation (`components/city-bubbles.tsx`):**
    *   Simplified the `CityBubbles` animation by removing scroll-based parallax effects (`useScroll`, `useTransform`) to potentially improve performance.
    *   Adjusted the animation's initial state and layout for better appearance.
*   **Like Button (`components/like-button.tsx`):**
    *   Created a reusable `LikeButton` component for the frontend (requires backend integration to function fully).
*   **Destination Reviews (`components/destinations/destination-reviews.tsx`):**
    *   Built the frontend component (`DestinationReviews`) to display reviews (requires backend integration).
*   **Saved Items Page (`app/saved/page.tsx`):**
    *   Built the frontend page (`/saved`) to display a user's saved items (requires backend integration).
*   **Itinerary Templates (`app/itineraries/[slug]/page.tsx`):**
    *   Created the page (`/itineraries/[slug]`) to display pre-defined itinerary templates.

### Learned

*   **Supabase Authentication (Server-side):**
    *   Learned the importance of using the Supabase *server* client (`createClient`) within API routes for secure session handling and authentication checks (`getUser()`).
    *   Understood the distinction between `getSession()` (legacy/client-side focused) and `getUser()` (preferred for server-side checks in App Router).
    *   Reinforced best practices for managing Supabase sessions and cookies securely within Next.js API routes.
*   **Next.js Middleware & Routing:**
    *   Gained experience debugging redirect loops and URL encoding issues related to middleware and client-side navigation (`router.push`).
    *   Learned that Next.js requires consistent dynamic route parameters (slug names) for nested routes.
    *   Learned how route file/folder structure significantly impacts Next.js URL matching.
*   **API Design & Development:**
    *   Reinforced the importance of consistent API error handling and response structures.
    *   Reinforced the value of detailed API logging, especially for debugging asynchronous processes.
    *   Reinforced the need for input validation at multiple levels (client, API, database) to ensure data integrity.
*   **Frontend Development:**
    *   Recognized the benefits of creating reusable frontend components (`LocationSearch`, `LikeButton`) for maintainability.
    *   Encountered challenges managing state in complex forms (like multi-step trip creation) and handling asynchronous data fetching effectively. 