# Changelog

## [Unreleased] - YYYY-MM-DD

### Added

- Updated technical documentation across the project to reflect Next.js 15.3.1 and React 18.2.0
- Improved error handling and debugging information
- Added new authentication error types and recovery mechanisms
- Enhanced TypeScript types for better code safety
- Created `react-typescript-best-practices.md` guide to help prevent common React/TypeScript errors.

### Changed

- Optimized image loading and rendering for mobile devices
- Improved responsive layout for all trip screens
- Updated dependencies to latest stable versions

### Fixed

- Resolved numerous TypeScript errors across various components (`related-itineraries-widget`, `error-boundary`, `error-fallbacks`, `export-calendar-dialog`, `focus-session-provider`, `footer`, `google-places-autocomplete`, `hero-section`, `image-search-selector`, `itinerary-template-card`, `destination-reviews`, etc.) including:
  - Missing `useState`/`useRef`/`useEffect` hook declarations and initializations.
  - Incorrect `useEffect` dependency arrays and cleanup function syntax (e.g., `ref.current` usage).
  - Improper function/component structure (missing return statements, incorrect destructuring).
  - Incorrect `useCallback` dependencies.
  - Syntax errors in function return types (e.g., `return throw error`).
  - Incorrect usage of template literals in JSX attributes and strings.
  - Missing or incomplete `try...catch` blocks in async functions.
- Resolved authentication refresh issues on concurrent requests
- Fixed loading state display on slow connections
- Improved error recovery for failed API requests

### Strategic Focus: The "Partiful" of Group Trip Planning

Our primary goal is to become the go-to tool for casual group trip planning by focusing on **speed, ease of use, intuitiveness, and reliability**. We aim to differentiate by offering the best, most delightful user experience for the core tasks of planning and managing a group trip, rather than competing on the sheer number of features.

**Key Priorities:**

1.  **Core UX Obsession:** Radically simple and fast flow for creating trips, adding initial items, and inviting friends.
2.  **Streamlined Itinerary:** Fluid input for places, links, notes; smooth drag-and-drop reordering; clear visuals.
3.  **Focused Collaboration:** Simple, itinerary-focused features like voting on items.
4.  **Effortless Member Management:** Easy invites and clear, basic roles/permissions.
5.  **Performance & Reliability:** Fast data syncing and a snappy interface.

### Feature Status Overview

_(Reflecting focus on core Trip Building & Management)_

**🚀 Core Focus (Actively Developing/Refining):**

- **✅ Authentication & Authorization:** Foundational system is robust.
- **✅ Trip Creation & Editing:** Core backend/frontend flows implemented.
- **🚧 Itinerary Building & Management:** Basic structure exists (APIs, DB); focus on improving UX/UI for adding/reordering items (places, notes, links).
- **🚧 Member Management:** Basic invite/access checks functional; needs UI refinement and clear role definition.
- **🚧 Focused Collaboration:** Voting API started; needs UI integration for itinerary items.
- **✅ Core Refactoring & Stability:** Ongoing improvements to types, constants, clients, and routing.
- **✅ Foundational UI Components:** Reusable components like `LocationSearch` are available.

**⏳ Lower Priority / Deferred Features:**

- **📉 Expense Tracking / Splitwise:** Splitwise integration removed. Native expense tracking/payment deeplinks tabled for now.
- **📉 Standalone Destination Pages:** Functional but not a current focus (`/destinations/[city]`).
- **📉 Global Search Functionality:** Basic backend/frontend started, but deferred.
- **📉 Like/Save Functionality:** Components exist, but backend/integration deferred.
- **📉 Destination Reviews:** Components exist, but backend/integration deferred.
- **📉 Public Itinerary Templates:** Frontend page exists, but data source/management deferred.
- **📉 Trip Tag Management:** Fully implemented but considered lower priority for new development focus.

### Detailed Changes by Feature (Grouped by Priority)

#### 🚀 Core Focus Features

- **✅ Authentication & Authorization:**
  - Implemented dedicated API routes (`/api/auth/...`).
  - Refactored `AuthProvider` with improved state management and error handling.
  - Added `AuthErrorBoundary` component for graceful error recovery.
  - Standardized auth checks (`createClient()`, `getUser()`).
  - Resolved cookie, session, 401, and redirect issues.
  - Enhanced error handling with user-friendly messages and centralized error state.
  - Improved session refresh reliability and resource cleanup.
  - Resolved timing issues and race conditions in authentication flows.
- **✅ Trip Creation & Editing:**
  - Backend: Validated inputs, enhanced errors in `create_trip_with_owner` SQL function. Improved logging/response in `/api/trips/create`. Ensured `slug`/`redirectUrl` in response.
  - Frontend: Built multi-step create form (`/trips/create`). Added validation. Integrated `LocationSearch`. Ensured correct payload. Improved error display/redirects.
  - Fixed `Edit Trip` button visibility and 404 on edit page.
- **🚧 Itinerary Building & Management:**
  - (Previous logs mention related APIs like `/api/trips/[tripId]/itinerary/...` and item additions, though not explicitly detailed here - assumed basis for current work).
- **🚧 Member Management:**
  - (Previous logs mention member API routes `/api/trips/[tripId]/members/...` and access checks - assumed basis for current work).
- **🚧 Focused Collaboration:**
  - (Voting API `/api/trips/[tripId]/itinerary/[itemId]/vote` likely exists based on previous structure).
- **✅ Core Refactoring & Stability:**
  - Types: Overhauled core types (`User`, `Trip`, etc.), Supabase types. Adjusted `Trip` type (`created_by`).
  - Constants: Updated `utils/constants.ts` extensively.
  - Supabase Client: Modernized client (`utils/supabase/client.ts`) using `@supabase/ssr`.
  - API/SSR: Corrected client usage/param handling.
  - Routing: Resolved dynamic route conflicts.
- **✅ Foundational UI Components:**
  - Created reusable `LocationSearch` (`components/location-search.tsx`).
  - Simplified `CityBubbles` animation.

#### ⏳ Lower Priority / Deferred Features

- **📉 Expense Tracking / Splitwise:**
  - Removed previous Splitwise integration implementation (backend service, API routes, cron job).
  - Decision made to table native expense tracking or payment app deeplinks for the time being.
- **📉 Standalone Destination Pages:**
  - Backend: Created API endpoints (`/api/destinations/[city]`, `/api/destinations/by-id/[id]`). Improved API error handling/validation.
  - Frontend: Created detail page (`/destinations/[city]`) with loading/error states and components.
- **📉 Global Search Functionality:**
  - Backend: Logic development started.
  - Frontend: Initial search page structure built (`/search`).
- **📉 Like/Save Functionality:**
  - Backend: Planned.
  - Frontend: Created `LikeButton`. Built `/saved` page structure.
- **📉 Destination Reviews:**
  - Backend: Planned.
  - Frontend: Built `DestinationReviews` component.
- **📉 Public Itinerary Templates:**
  - Frontend: Created page (`/itineraries/[slug]`).
- **📉 Trip Tag Management:**
  - Added `tags`, `trip_tags` tables.
  - Created `TagInput` component.
  - Integrated into `EditTripForm`.
  - Implemented API routes (`GET /api/tags`, `PUT /api/trips/[tripId]/tags`).
  - Resolved DB constraint/RLS errors.

### Learned

- **Supabase Authentication (Server-side):** Importance of server client (`createClient`), `getUser()` vs `getSession()`, secure cookie/session management in API routes.
- **Next.js Middleware & Routing:** Debugging redirects/encoding issues, impact of route structure and consistent dynamic parameters.
- **API Design & Development:** Value of consistent error handling/responses, detailed logging, and multi-level input validation.
- **Frontend Development:** Benefits of reusable components, challenges in managing complex form state and async data.
- **Next.js 15 Route Handlers:** Dynamic route parameters (params) are now delivered as Promises that must be awaited. This requires updating code from `params.id` to `await params.id` in all API route handlers. This change improves robustness by ensuring parameters are fully resolved before being used, preventing race conditions in dynamic route resolution.
- **Next.js 15 Route Handlers (Detailed):**
  - In Next.js 15, dynamic route parameters in API route handlers are delivered as Promises that must be awaited.
  - Previous pattern: `export async function GET(request, { params }) { const id = params.id; }`
  - New required pattern: `export async function GET(request, { params }) { const id = await params.id; }`
  - This applies to all dynamic route segments (e.g., `[tripId]`, `[itemId]`, `[token]`)
  - Failing to await these parameters can lead to subtle bugs where the parameter is undefined or a Promise object
  - This change was made to improve reliability by ensuring route parameters are fully resolved before handler execution
  - It's important to search for and update all API route handlers when upgrading to Next.js 15

### Features

- **Trip Tag Management:** Implemented functionality to add, remove, and view tags associated with trips.
  - Added `tags` and `trip_tags` database tables.
  - Created `TagInput` component with autocomplete for tag selection/creation.
  - Integrated `TagInput` into the `EditTripForm`.
  - Implemented API routes (`GET /api/tags`, `PUT /api/trips/[tripId]/tags`) for tag fetching and synchronization.
  - Separated tag handling from the main trip update API (`PATCH /api/trips/[tripId]`).

### Fixes

- **Authentication:**
  - Fixed reference errors in AuthProvider by improving initialization order of state and callbacks.
  - Resolved race conditions between authentication state updates and fallback timers.
  - Fixed issues with premature loading state completion causing perpetual loading UI.
  - Improved error handling to prevent uncaught exceptions in authentication flows.
  - Corrected cleanup and lifecycle management in AuthProvider to prevent memory leaks.
- **Tag Saving:** Resolved database constraint (`UNIQUE` on name, `NOT NULL` on slug/category) and RLS policy errors preventing tag creation and association during trip edits.
- **API/SSR:** Corrected Supabase client usage (`@supabase/ssr`) and parameter handling (`params`) in API routes and Server Components.
- **Trip Editing UI:** Fixed issue where "Edit Trip" button visibility was incorrect.
- **Trip Editing UI:** Fixed 404 error when navigating to the `/trips/[tripId]/edit` page.
- **Trip Type:** Adjusted Trip type definition (`utils/types.ts`) to use `created_by` instead of `user_id`.

### Refactoring

- **Core Types:** Overhauled core TypeScript types (`User`, `Trip`, `Destination`, `Itinerary`, `Tag`) and Supabase database types (`database.types.ts`) to align with recent schema changes and improve clarity. Created separate files for core types (e.g., `types/trip.ts`).
- **Constants:** Updated `utils/constants.ts` extensively with new table/field names, relationships, API routes, and helper constants (e.g., `QUERY_SNIPPETS`, `FOREIGN_KEYS`, `UNSPLASH_CONFIG`).
- **Supabase Client:** Modernized the client-side Supabase client (`utils/supabase/client.ts`) using `@supabase/ssr`'s recommended approach and default cookie management. Added a `resetClient` utility function.
- **Error Handling:** Added new `AuthErrorBoundary` component to gracefully recover from authentication errors. Implemented centralized error state management with user-friendly error messages and toast notifications.

### Platform Core Functionality

#### Technical Updates

- **Authentication Overhaul:**
  - Implemented dedicated API routes for `login`, `signup`, `logout`, and `me` (`/api/auth/...`) using Supabase server client for secure handling.
  - Refactored `AuthProvider` (`components/auth-provider.tsx`) to use the new API routes, manage user state (including profile data), and handle session updates.
  - Added new `AuthErrorBoundary` component to catch and gracefully handle authentication errors with user-friendly recovery options.
  - Enhanced error handling in `AuthProvider` with centralized error state, user-friendly messages, and toast notifications.
  - Improved session management with better initialization order, proper cleanup, and more reliable session refresh.
  - Fixed race conditions and timing issues in auth state updates that caused perpetual loading states.
  - Added proper lifecycle management with cleanup of timers, event listeners, and pending requests.
  - Implemented defensive coding patterns to prevent state updates after component unmount.
  - Standardized authentication checks across various API routes (e.g., members, notes) using `createClient()` and `getUser()` for consistency and security, replacing older `getSession()` methods.
  - Troubleshooted and fixed issues related to cookie parsing, session management, and unauthorized (401) errors during login/API access.
  - Addressed redirect issues, including double URL encoding problems, by refining middleware and client-side redirect logic.
  - Improved error handling and logging within authentication flows.
- **Trip Creation (SQL Function `create_trip_with_owner`):**
  - Validated required inputs (`name`, `slug`, `destination_id`, `destination_name`) within the SQL function to prevent errors.
  - Enhanced SQL function error messages for clearer feedback on validation failures or database issues (e.g., unique constraints).
- **Trip Creation (API Endpoint `/api/trips/create`):**
  - Added logging of the complete `tripData` payload sent to the SQL function for easier debugging.
  - Improved logging to capture specific errors returned by the SQL function.
  - Updated API response handling to correctly use the `success` flag and `error` message from the SQL function.
  - Changed successful API response to include the final `slug` (potentially updated by SQL function) and a consistent `redirectUrl` (`/trips/[tripId]`).
- **Routing (`Next.js`):**
  - Resolved Next.js dynamic route conflicts (e.g., `[city]` vs `[id]`) by moving the ID-based destination API to `/api/destinations/by-id/[id]`.
  - Organized API routes more explicitly (e.g., `/by-id/`) to ensure Next.js correctly interprets URL parameters.
- **Destination Data (API & Validation):**
  - Created API endpoints to fetch destinations by city (`/api/destinations/[city]`) and ID (`/api/destinations/by-id/[id]`).
  - Improved API error handling (e.g., returning specific 404s, clearer validation messages) and standardized response formats.
  - Added detailed API logging to aid debugging.
  - Strengthened destination data validation: Added UUID format check for IDs, ensured required fields (`id`, `city`, `country`) are present, and automatically generated a destination name (`city, country`) if missing.
- **Search (Backend - _In Progress_):**
  - Developing backend search logic to allow searching across destinations, trips, etc.

#### Frontend Updates

- **Trip Creation (`app/trips/create/page.tsx`):**
  - Built the multi-step trip creation form (details, dates, travelers, vibe, budget, privacy).
  - Added frontend validation to check required fields (name, slug, destination) before submitting the form.
  - Integrated the reusable `LocationSearch` component for selecting the trip destination.
  - Ensured the `tripData` object sent to the API includes details from the selected/validated destination.
  - Improved frontend error display to show specific messages returned by the trip creation API.
  - Updated the form to redirect users using the `redirectUrl` provided by the API upon successful trip creation.
  - Corrected the API endpoint call used to fetch destination data when pre-filling the form (using `/api/destinations/by-id/[id]`).
- **Destination Pages (`app/destinations/[city]/page.tsx`):**
  - Created the destination detail page (`/destinations/[city]`) to display information fetched from the API.
  - Added loading indicators and error message displays for the destination detail page.
  - Added components to display destination image, description, ratings, planning info, and relevant badges.
- **Location Search (`components/location-search.tsx`):**
  - Created a reusable `LocationSearch` component for searching and selecting destinations across the site.
- **Search Page (`app/search/page.tsx`):**
  - Built the initial frontend structure for the main search page (`/search`) to display results.

### Additional Features

#### Technical Updates

- **Like/Save Functionality (Backend - _Planned_):**
  - Planning backend changes (database schema, API endpoints) to allow users to save/like items.
- **Destination Reviews (Backend - _Planned_):**
  - Planning backend changes (database schema, API endpoints) to allow users to add and view destination reviews.

#### Frontend Updates

- **City Bubbles Animation (`components/city-bubbles.tsx`):**
  - Simplified the `CityBubbles` animation by removing scroll-based parallax effects (`useScroll`, `useTransform`) to potentially improve performance.
  - Adjusted the animation's initial state and layout for better appearance.
- **Like Button (`components/like-button.tsx`):**
  - Created a reusable `LikeButton` component for the frontend (requires backend integration to function fully).
- **Destination Reviews (`components/destinations/destination-reviews.tsx`):**
  - Built the frontend component (`DestinationReviews`) to display reviews (requires backend integration).
- **Saved Items Page (`app/saved/page.tsx`):**
  - Built the frontend page (`/saved`) to display a user's saved items (requires backend integration).
- **Itinerary Templates (`app/itineraries/[slug]/page.tsx`):**
  - Created the page (`/itineraries/[slug]`) to display pre-defined itinerary templates.

### Learned

- **Supabase Authentication (Server-side):**
  - Learned the importance of using the Supabase _server_ client (`createClient`) within API routes for secure session handling and authentication checks (`getUser()`).
  - Understood the distinction between `getSession()` (legacy/client-side focused) and `getUser()` (preferred for server-side checks in App Router).
  - Reinforced best practices for managing Supabase sessions and cookies securely within Next.js API routes.
- **Next.js Middleware & Routing:**
  - Gained experience debugging redirect loops and URL encoding issues related to middleware and client-side navigation (`router.push`).
  - Learned that Next.js requires consistent dynamic route parameters (slug names) for nested routes.
  - Learned how route file/folder structure significantly impacts Next.js URL matching.
- **API Design & Development:**
  - Reinforced the importance of consistent API error handling and response structures.
  - Reinforced the value of detailed API logging, especially for debugging asynchronous processes.
  - Reinforced the need for input validation at multiple levels (client, API, database) to ensure data integrity.
- **Frontend Development:**
  - Recognized the benefits of creating reusable frontend components (`LocationSearch`, `LikeButton`) for maintainability.
  - Encountered challenges managing state in complex forms (like multi-step trip creation) and handling asynchronous data fetching effectively.
- **Error Boundaries & Resilient UX:**
  - Learned the importance of React error boundaries for preventing cascading failures in authentication flows.
  - Implemented a dedicated authentication error boundary that provides user recovery options instead of crashing the application.
  - Discovered techniques for handling transient network issues and authentication state race conditions.
  - Developed a better understanding of component lifecycle management with proper cleanup and state initialization.
- **State Management in Authentication:**
  - Gained insights into proper initialization order for state and callbacks to prevent reference errors.
  - Implemented centralized error state management with user-friendly messaging.
  - Learned techniques for preventing race conditions between authentication state updates.
  - Developed patterns for proper resource cleanup when components unmount during authentication flows.

## [2025-05-05] - Next.js 15 Migration & Stability

### Added

- Full Next.js 15.3.1 support with proper type safety
- Enhanced error boundary system with better recovery options
- Comprehensive service worker for offline support
- Web Vitals tracking and performance monitoring

### Changed

- Updated all dynamic route handlers to await params (required for Next.js 15)
- Improved middleware implementation for better security
- Optimized cookie handling with Next.js 15's enhanced cookie API
- Enhanced authentication system to work seamlessly with Next.js 15

### Fixed

- Resolved all route parameter issues in Next.js 15
- Fixed authentication issues with the new cookie handling system
- Improved error recovery across the application
- Enhanced TypeScript types for better code safety

## [2025-05-02] - Collaboration & Focus Mode Update

### Added

- Real-time collaboration features with presence awareness
- Cursor tracking for trip collaboration
- Focus mode for collaborative decision making
- Voting/polling system for group decisions
- Activity timeline to track trip changes
- Notifications for trip updates and activities
- Comments on itinerary items
- Service worker implementation for offline support
- Sentry integration for error monitoring
- Web vitals tracking for performance monitoring

### Changed

- Updated to Next.js 15.3.1 from Next.js 14
- Improved trip creation and editing flows
- Enhanced real-time data synchronization
- Optimized database queries for collaboration features

### Fixed

- Resolved presence indicator race conditions
- Fixed focus mode synchronization issues
- Improved error boundaries throughout the application

## [2025-05-02] - Documentation Update & Mobile Style Guide

- Created `docs/mobile-style-guide.md` detailing the visual design system and component guidelines for the Expo/React Native mobile application.
- Updated `README.md` and `docs/DOCUMENTATION.md` to include the new mobile style guide in the documentation list and reflect the current project status (stable auth, constants refactor, mobile app progress).
- Performed a consistency check across key documentation files (`authentication.md`, `constants-guide.md`, etc.) to ensure alignment with the latest documented features and database schema (`database_structure.md`).

## [2025-05-01] - Constants Refactoring & Docs Update

### Changed

- **Constants Refactoring:** Refactored `utils/constants/database.ts` to remove aliases (`DB_TABLES` -> `TABLES`, etc.) and use direct exports for improved clarity and type safety. Added backward-compatibility exports for `DB_*` constants. Defined database-related types explicitly within `database.ts` to resolve import issues.
- **Documentation:** Created `docs/constants-guide.md` detailing the new structure and usage rules. Updated `README.md`, `docs/authentication.md`, `docs/nextjs-best-practices.md`, `docs/nextjs15-migration.md`, and `docs/DOCUMENTATION.md` to reflect current project status, stable authentication using `@supabase/ssr`, and the new constants guidelines.

## [2025-04-30] - Trip Hooks Restructuring
