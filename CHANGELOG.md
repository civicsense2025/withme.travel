# Changelog

## [2025-05-10] - Admin Panel, Research, Notifications, Group Planning, and UI Overhaul

### Added

- **Admin Panel:** New admin dashboard and API routes for analytics, research, surveys, triggers, participants, and more.
- **User Testing:** User testing flows and survey management improvements.
- **Research & Surveys:** Research tracking system, survey creation, analytics dashboards, triggers, and participant management.
- **Notification System:** Major improvements to notifications, including preferences, analytics, deep links, and real-time updates.
- **Invite System:** Enhanced group invite and referral system, including new API endpoints and UI flows.
- **Group Planning:** Wildcard routes for group plans, improved group ideas/whiteboard, and collaborative features.
- **Itinerary Templates:** Expanded itinerary template management and admin editing tools.
- **Visual/UI Overhaul:** New visual changes across the dashboard, admin, and trip planning UIs. Responsive design improvements and new components.
- **Viator Integration:** Added Viator booking and experience components.
- **Multi-City Selector:** New multi-city selector for trips.
- **Performance & Refactoring:** Major refactors for performance, code quality, and maintainability.

### Changed

- **SSR/Client Data Flow:** Improved SSR-to-client hydration for trip pages, with robust handling of trip data shape and initial props.
- **TypeScript & Linter:** Fixed numerous TypeScript and linter errors, especially around trip member profiles and context providers.
- **API Consistency:** Standardized API responses for trip and member data.
- **UI/UX:** Improved error boundaries, loading states, and user feedback throughout the app.
- **Notification & Invite UX:** Streamlined notification and invite flows for better user experience.

### Fixed

- **Trip Page Loading:** Fixed trip page loading issues caused by inconsistent trip data shapes between SSR and client.
- **Profile Embedding:** Resolved ambiguous profile embedding in trip members API.
- **Bugfixes:** Addressed various bugs in itinerary, group planning, notifications, and admin features.
- **Refactors:** Cleaned up and refactored large portions of the codebase for maintainability and performance.

### Migration & Infra

- **Database:** Added/updated migrations for research tracking, notifications, and group planning features.
- **Dependencies:** Updated and locked dependencies for stability.

## [2025-05-06] - Collaborative Idea Board & WhiteboardControls Fixes

### Added

- Group plans and idea whiteboard system with Comments & Reactions
- Admin dashboard and admin API routes
- User ID persistence in localStorage for improved user tracking
- New layout for collaborative plans

### Major Fixes & Improvements

- **WhiteboardControls Clickability & Layering**

  - Changed the WhiteboardControls wrapper in `IdeasWhiteboard` from `absolute` to `fixed` positioning, ensuring it stays in place regardless of other element transforms.
  - Dramatically increased the z-index for WhiteboardControls from 50/100 to 1000, guaranteeing it appears above all other elements.
  - Added `pointer-events-auto !important` to `.whiteboard-controls` in CSS to force the controls to receive pointer events and be clickable.
  - Updated the main content area in `IdeasWhiteboard` to use a new `.board-content` class for improved stacking context.
  - Added a dedicated `.board-background` class with explicit pointer-events handling to prevent event capture issues.
  - Ensured no transparent overlays or grid layers block interaction with controls.

- **TypeScript & Linter Fixes**
  - Fixed a linter/type error in the `useDeviceCapabilities` function by ensuring `hasLimitedMemory` is always a boolean value, not `number | boolean`.

### Result

- WhiteboardControls now:
  1. Appear at the bottom center (fixed position)
  2. Are fully clickable and interactive (high z-index, pointer events)
  3. Maintain proper stacking above all other content

### Key Lessons & Best Practices

- **Z-Index & Stacking Contexts**

  - Always explicitly manage z-index for interactive and overlay elements. Use very high z-index values (e.g., 1000+) for floating controls that must always be on top.
  - Use dedicated CSS classes (e.g., `.board-background`, `.board-content`, `.whiteboard-controls`) to create clear stacking layers and avoid accidental overlaps.

- **Pointer Events & Clickability**

  - Use `pointer-events: auto` on interactive controls and `pointer-events: none` on overlays (like grid/cursor layers) to ensure only the right elements capture events.
  - If controls are not clickable, check for invisible overlays or stacking context issues before debugging event handlers.

- **Event Propagation**

  - Always check event targets in mouse handlers. Prevent panning/dragging logic from triggering when clicking on controls, buttons, or input fields.
  - Use `stopPropagation()` only when necessary—prefer to structure the DOM so that event bubbling is not a problem.

- **Component Structure**

  - Render overlays (like grid or SVG connections) _before_ interactive content in the DOM to ensure proper layering.
  - Use wrapper divs with explicit z-index and pointer-events for all floating UI (modals, controls, dropdowns, etc.).

- **TypeScript & Defensive Coding**

  - Always ensure computed values (like `hasLimitedMemory`) are strictly typed as boolean to avoid subtle bugs and linter errors.
  - Use type-safe hooks and context for collaborative state (presence, ideas, etc.).

- **Debugging Strategies**

  - Use temporary event debugger components to visualize which elements are capturing events.
  - If highlighting/selecting one element highlights everything, check for a full-screen overlay or a parent with pointer-events issues.
  - When in doubt, comment out overlays/cursors and reintroduce them one by one to isolate the problem.

- **Collaborative UI Patterns**
  - Virtualize large lists of ideas/cursors for performance.
  - Throttle high-frequency events (drag, cursor, presence) to avoid UI jank.
  - Memoize components and callbacks to prevent unnecessary re-renders in large collaborative boards.

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

## [2025-05-04] - Destinations and Project Infrastructure Update

### Added

- Destinations organized by slug, city, and country
- Continent tabs for browsing destinations
- Country sections within continent views
- Destination carousel for visual browsing
- Updated project structure with improved monorepo setup
- `/groups` is now a public landing page for logged-out users, with a friendly hero, "How it works" steps, testimonials, and a demo of the invite flow.
- **InviteLinkBox** supports one-tap invites via SMS, WhatsApp, Instagram DM (opens Direct inbox), Email, and Copy Link. All options are mobile-first and resilient, with clear microcopy for desktop users and Instagram's limitations.
- **Split experience:**
  - Logged-in users see their groups dashboard as before.
  - Visitors see the new landing page and can start the group creation flow without signing up.
- Defensive, accessible, and modern UX for all invite flows.
- **Onboarding & Invite Flow Improvements:**
  - Added Instagram DM (`instagram://direct-inbox`) as a new invite option, allowing users to quickly open Instagram Direct and paste the invite link to friends.
  - Updated onboarding flow for new users: visitors can now start group creation and invite friends before signing up, reducing friction and making the experience more viral and social.
  - Improved microcopy and tooltips to guide users through sharing on Instagram, WhatsApp, SMS, and Email.

### Fixed

- Fixed package-lock.json and package.json dependency issues
- Disabled `distDir` in next.config.mjs for better build compatibility
- Fixed destination likes functionality
- Improved .gitignore to better manage excluded files and directories

### Changed

- Updated pnpm-workspace.yaml to define package paths for the monorepo structure
- Improved project organization for better maintainability
- `/groups/page.tsx` no longer redirects unauthenticated users; it checks session and renders the appropriate view.
- `GroupsLandingPage` and `InviteLinkBox` are now used for both demo and real invite flows.
- Onboarding is now more seamless for new users, with a focus on quick group creation and sharing before authentication.

### Rationale

- Dramatically lowers friction for new users to start planning and inviting friends.
- Emphasizes mobile-first, viral group formation and sharing, including Instagram DM as a key channel for Gen Z and Millennial users.
- Sets the stage for even faster onboarding and group creation in future updates.

### Next Steps

- Wire up "Create a Group" CTA for logged-out users to the quick group creation modal/flow.
- Add more testimonials, visuals, and polish to the landing page.
- Add analytics for invite method usage and onboarding completion.

## [2025-05-03] - TypeScript Safety and Authentication Improvements

### Added

- Enhanced TypeScript safety with refined type definitions and error handling
- Improved Google Maps import functionality with support for selected place IDs
- New utility function for clearing and refreshing auth cookies
- Improved user feedback with toast notifications during import processes
- Debug logging for Supabase client initialization and auth state changes

### Changed

- Refactored authentication cookie handling with improved security
- Updated environment variables in .env.local
- Enhanced TypeScript safety guidelines with rules for type organization, constants usage, and error handling
- Improved code quality with consistent theming and documentation updates

### Fixed

- Enhanced security and error handling in clear-cookies API
- Fixed itinerary reordering functionality
- Addressed various build errors
- Improved TypeScript type safety across components and services

## [2025-05-02] - UI Refactoring and Build Optimizations

### Changed

- Refactored UI component exports for better modularity
- Removed unused imports across the codebase
- Streamlined theme usage in hooks
- Cleaned up TripDetailScreen by removing unreferenced variables
- Updated environment configuration for better build stability

### Fixed

- Multiple build-related fixes for production deployment
- Resolved environment configuration issues

## [2025-05-01] - Trip Builder and Itinerary Management

### Added

- Comprehensive trip builder updates
- Trip sections for better organization
- Trip creation from templates
- Debug panel for development testing

### Changed

- Updated itinerary template application process
- Temporarily disabled focus mode, presence indicators, and collaborative notes to focus on core functionality

### Fixed

- Various bug fixes in the trips functionality
- Resolved authentication issues
- Fixed UI glitches in the itinerary builder

## [2025-04-28] - Platform Enhancements and Collaboration Features

### Added

- New core functionality and security features
- Multiplayer/collaboration capabilities
- Focus mode for collaborative work
- Notification system for real-time updates

## [2025-04-27] - Authentication Improvements

### Fixed

- Fixed dynamic import in EditTripPage to be compatible with Server Components
- Improved authentication callback handling for better user experience
- Enhanced error handling in LoginForm to properly display error messages

## [2025-04-24] - Trip Itinerary and Integration Features

### Added

- Trip itinerary functionality
- Splitwise integration for expense tracking
- Vercel deployment configuration

### Fixed

- Various fixes across the platform

## [2025-04-22] - Initial Project Setup and Core Functionality

### Added

- Project initial setup and configuration
- Main routes for trip creation, itineraries, and admin
- Integration with Supabase database for itinerary templates and trip creation
- Caching and error handling for destinations API
- Fallback mock data for development

### Changed

- Optimized mobile performance
- Updated dependencies with pnpm

## [Unreleased]

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
