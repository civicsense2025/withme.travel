# WithMe.Travel - Group Trip Planning Made Easy

WithMe.Travel is a collaborative platform for planning and organizing group trips. Our goal is to become the "Partiful" of group trip planning—focusing on speed, ease of use, intuitiveness, and reliability rather than competing on feature quantity.

## 📚 Documentation

All documentation is organized in the `docs/` directory:

- [**Main Documentation**](docs/DOCUMENTATION.md) - Complete overview of the application
- [**Authentication System**](docs/authentication.md) - Details about our Supabase authentication implementation
- [**API Routes & Server/Client Components Guide**](docs/api-routes-server-client.md) - How API Routes, RSC, and Client Components work together
- [**Constants Guide**](docs/constants-guide.md) - Guidelines for managing codebase constants
- [**Content Guide**](docs/CONTENT_GUIDE.md) - Guidelines for creating authentic city profiles
- [**Codebase Structure**](docs/CODEBASE_STRUCTURE.md) - Overview of project organization
- [**Database Structure**](docs/database_structure.md) - Database schema and relationships
- [**Itinerary Template Structure**](docs/ITINERARY_TEMPLATE_STRUCTURE.md) - How trip templates are organized
- [**Mobile Style Guide**](docs/mobile-style-guide.md) - Visual guidelines for the Expo mobile app
- [**Collaboration Features**](docs/collaboration-features.md) - Guide to real-time collaboration features
- [**Focus Mode**](docs/focus-mode.md) - Documentation for the trip focus mode
- [**Offline Support**](docs/offline-support.md) - Details about service worker and offline capabilities
- [**Implementation Plan**](docs/implementation_plan.md) - Roadmap for new features
- [**Adaptation Plan**](docs/adaptation-plan.md) - Plan for adjusting to new requirements
- [**Next.js Best Practices**](docs/nextjs-best-practices.md) - Technical guidelines for Next.js
- [**Next.js 15 Migration Guide**](docs/nextjs15-migration.md) - Critical changes when upgrading to Next.js 15
- [**Changelog**](docs/CHANGELOG.md) - Comprehensive change history

## ✨ Project Status

The authentication system, leveraging Supabase and `@supabase/ssr`, is now stable and robust after a recent overhaul. Previous issues related to refresh tokens and client/server state mismatches have been resolved. Database interactions consistently use constants from `utils/constants/database.ts` for better type safety and maintainability. Trip hooks have been restructured, and the trip creation/editing flows have been improved. A visual style guide for the upcoming mobile app is available.

The project now includes extensive real-time collaboration features including presence awareness, cursor tracking, focus mode, and voting/polling systems. We've also added client-side activity timelines and notifications to enhance the collaborative experience.

## 🚀 Core Features

### Content Sharing & Personalization

- **Content Layering**: Original content, shared content, generated content, customized versions
- **Attribution Tracking**: Original source tracking, attribution metadata, content lineage
- **Travel Preferences**: Styles (adventurous, relaxed, cultural, etc.), pace preferences, budget ranges
- **Sharing Features**: Item copying, customization support, attribution preservation

### Trip Planning & Collaboration

- **Trip Creation**: Multi-step form with essential details, dates, travelers, vibe, budget, and privacy settings (recently improved flow).
- **Itinerary Building**: Add places, notes, and links with drag-and-drop reordering (basic structure).
- **Member Management**: Role-based permissions (admin, editor, contributor, viewer), invite system.
- **Real-time Collaboration**: See who's editing, cursor tracking, focus mode, comments, vote on items.
- **Focus Mode**: Collaborative session mode for group decision making.
- **Voting System**: Create polls and vote on trip decisions.
- **Activity Timeline**: Track changes and updates to trip plans.
- **Offline Support**: Service worker implementation for basic offline functionality.

### Technical Highlights

- **Modern Stack**: Next.js 15, React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Authentication**: Secure and stable login with email/password or Google Sign-In using `@supabase/ssr`.
- **Database**: Robust schema with Row Level Security (RLS) policies and standardized constants.
- **SEO Optimization**: Canonical URLs, meta tags, structured data
- **Constants Management**: Centralized and typed constants following `docs/constants-guide.md`.
- **Mobile Ready**: Design system defined in `docs/mobile-style-guide.md`.
- **Error Handling**: Comprehensive error tracking with Sentry integration.
- **Performance Monitoring**: Web Vitals tracking and custom metrics.

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS, Framer Motion
- **UI Components**: Shadcn/ui (customized Radix UI components)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: React Context, custom hooks (considering Zustand/Redux Toolkit for future complex needs)
- **Deployment**: Vercel
- **Monitoring**: Sentry for error tracking and performance monitoring

## 📅 Changelog

### Timeline Navigation

| Date                                                                | Major Changes                                      |
| ------------------------------------------------------------------- | -------------------------------------------------- |
| [2025-05-01](#2025-05-01---constants-refactoring--docs-update)      | Constants Refactoring & Documentation Update       |
| [2025-04-30](#2025-04-30---trip-hooks-restructuring)                | Trip Hooks Restructuring                           |
| [2025-04-29](#2025-04-29---authentication--trip-management)         | Authentication Overhaul, Trip Creation & Editing   |
| [2025-04-27](#2025-04-27---core-refactoring--component-development) | Core Refactoring & UI Components                   |
| [2025-04-24](#2025-04-24---destination--search-features)            | Destination Pages, Search Functionality, Trip Tags |
| [Full Changelog](docs/CHANGELOG.md)                                 | Comprehensive change history                       |

### [2025-05-01] - Constants Refactoring & Docs Update

- Refactored `utils/constants/database.ts` to remove aliases (`DB_TABLES` -> `TABLES`, etc.) and use direct exports for improved clarity and type safety.
- Added backward-compatibility exports for `DB_*` constants.
- Defined database-related types explicitly within `database.ts` to resolve import issues.
- Created `docs/constants-guide.md` detailing the new structure and usage rules.
- Created `docs/api-routes-server-client.md` explaining the usage of API Routes, Server Components, and Client Components with Supabase clients (`createApiRouteClient`, `createServerComponentClient`, `getBrowserClient`).
- Updated `README.md`, `docs/authentication.md`, and `docs/nextjs-best-practices.md` to reference the new API/component guide and reflect current Supabase client usage patterns.
- Updated `README.md`, `docs/authentication.md`, and other documentation files to reflect current project status and stable authentication.

### [2025-04-30] - Trip Hooks Restructuring

#### Trip Hooks Restructuring

- Created and updated `app/trips/[tripId]/hooks/index.ts` to centralize hook exports
- Ensured correct exports for `use-trip-budget`, `use-trip-itinerary`, `use-trip-mutations`, `use-trip-presence`, and `use-trip-sheets`
- Fixed linter errors for missing import hooks

### [2025-04-29] - Authentication & Trip Management

#### Authentication Overhaul

- Implemented dedicated API routes (`/api/auth/...`) using Supabase server client
- Refactored `AuthProvider` with improved state management and error handling
- Added `AuthErrorBoundary` component for graceful error recovery
- Fixed race conditions and timing issues in auth state updates
- Improved session refresh reliability and resource cleanup

#### Trip Creation & Editing

- Backend: Validated inputs, enhanced error messages in `create_trip_with_owner` SQL function
- Frontend: Built multi-step create form (`/trips/create`) with validation
- Fixed "Edit Trip" button visibility and 404 on edit page

### [2025-04-27] - Core Refactoring & Component Development

#### Core Refactoring & Stability

- Types: Overhauled core types (`User`, `Trip`, etc.) and Supabase types
- Constants: Updated `utils/constants.ts` extensively
- Supabase Client: Modernized client using `@supabase/ssr`
- API/SSR: Corrected client usage and parameter handling
- Routing: Resolved dynamic route conflicts

#### UI Components

- Created reusable `LocationSearch` component
- Simplified `CityBubbles` animation
- Built `LikeButton` component for content interaction
- Created `DestinationReviews` component

### [2025-04-24] - Destination & Search Features

#### Destination Pages

- Backend: Created API endpoints for destination data
- Frontend: Built destination detail page with loading/error states
- Added components for destination images, descriptions, and badges

#### Search Functionality

- Backend: Started development of search logic
- Frontend: Built initial search page structure

#### Trip Tag Management

- Added `tags` and `trip_tags` database tables
- Created `TagInput` component with autocomplete
- Implemented API routes for tag fetching and synchronization

## 🚦 Feature Status

### 🚀 Core Focus (Actively Developing/Refining):

- ✅ **Authentication & Authorization**: Foundational system is robust (post-overhaul).
- ✅ **Trip Creation & Editing**: Core backend/frontend flows implemented and refined.
- ✅ **Constants & Core Structure**: Refactored for clarity and type safety.
- ✅ **Real-time Collaboration**: Implemented presence awareness, cursor tracking, section awareness.
- ✅ **Focus Mode**: Added collaborative session mode for group decision making.
- ✅ **Voting & Polling**: Implemented system for group decision making in trips.
- ✅ **Activity Timeline & Notifications**: Added tracking and alerting for trip activities.
- 🚧 **Itinerary Building & Management**: Basic structure exists; improving UX/UI.
- 🚧 **Member Management**: Basic invite/access checks functional; needs UI refinement.
- 📝 **Mobile App Development**: Style guide created; implementation ongoing.
- ✅ **Error Monitoring**: Implemented Sentry for error tracking and performance monitoring.
- ✅ **Offline Support**: Added service worker and offline capabilities.

### ⏳ Lower Priority / Deferred Features:

- **📉 Expense Tracking / Splitwise:** Splitwise integration removed. Native expense tracking/payment deeplinks tabled for now.
- **📉 Standalone Destination Pages:** Functional but not a current focus (`/destinations/[city]`).
- **📉 Global Search Functionality:** Basic backend/frontend started, but deferred.
- **📉 Like/Save Functionality:** Components exist, but backend/integration deferred.
- **📉 Destination Reviews:** Components exist, but backend/integration deferred.
- **📉 Public Itinerary Templates:** Frontend page exists, but data source/management deferred.

## 🔮 Future Enhancements

1. Machine learning for preference prediction
2. Advanced content recommendation engine
3. Social graph integration
4. Enhanced analytics and reporting
5. API rate limiting and quotas
6. Mobile application development

## 🏁 Getting Started

### Prerequisites

- Node.js 16+ (for local development)
- Supabase account (for authentication and database)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/withme.travel.git
   cd withme.travel
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   # Create .env.local file with:
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🤝 Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Documentation

- [Authentication System](docs/AUTHENTICATION.md) - Comprehensive documentation of our auth system
- [Content Guidelines](docs/CONTENT-GUIDELINES.md) - Guidelines for creating destination content
- [Next.js Best Practices](docs/BEST-PRACTICES.md) - Technical guidelines for working with Next.js
- [Next.js 15 Migration Guide](docs/nextjs15-migration.md) - Guide for upgrading to Next.js 15
- [API Documentation](docs/API.md) - API endpoints and usage examples

## 📝 Content Quality & Style Guide Summary

This section summarizes the key principles for content, primarily focusing on city profiles but applicable broadly where relevant. The full guide is available at [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md).

### Core Principles

- **Authentic Insider Perspective**: Write as a well-traveled friend sharing genuine insights and local knowledge. Balance appreciation with honesty about challenges.
- **Conversational Warmth**: Use casual, engaging, and natural language. Vary sentence structure and incorporate local flavor where appropriate.
- **Distinctive Character**: Adapt writing style to match the unique personality of each city or topic.
- **Organic Structure**: Let content flow naturally, avoiding rigid or formulaic paragraph structures.

### Key Elements

- **Specific Local References**: Include named places, streets, neighborhoods, and local details.
- **Sensory Experience**: Use vivid sensory details (sights, sounds, smells) to bring locations to life.
- **Authentic Local Experience**: Capture community dynamics, local rhythms, and use active, vibrant language.

### Style & Tone

- **Balance**: Mix practical info with atmosphere, history with trends, iconic spots with hidden gems.
- **Tone**: Avoid overly promotional language. Aim for warmth, helpfulness, enthusiasm balanced with honesty, and humor where appropriate. Align with the "friendly organizer" brand voice.

### Quality Standards

- **Markers**: Specific local references, authentic terminology, balanced perspective (positive/challenges), conversational flow.
- **Avoid**: Generic clichés, formal tone, rigid structure, exclusively positive portrayals, lack of specific detail.

Refer to the full [Content Guide](docs/CONTENT_GUIDE.md) for detailed guidelines, HTML structure requirements, and brand alignment details.

## Itinerary Templates

### Fixing Missing Sections in Templates

If you encounter templates without sections (like the "Traditional Kyoto: 4-Day Cultural Immersion" template), you can run the fix script to create the required sections and items:

```bash
# Connect to your database and run the SQL script
psql $DATABASE_URL -f migrations/fix_kyoto_template.sql
```

This will create the necessary sections and sample itinerary items for the template to display properly. You can use this pattern to create/fix other templates as needed.
