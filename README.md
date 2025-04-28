# WithMe.Travel - Group Trip Planning Made Easy

WithMe.Travel is a collaborative platform for planning and organizing group trips. Our goal is to become the "Partiful" of group trip planning—focusing on speed, ease of use, intuitiveness, and reliability rather than competing on feature quantity.

## 📚 Documentation

All documentation is organized in the `docs/` directory:

- [**Main Documentation**](docs/DOCUMENTATION.md) - Complete overview of the application
- [**Authentication System**](docs/authentication.md) - Details about our Supabase authentication implementation
- [**Content Guide**](docs/CONTENT_GUIDE.md) - Guidelines for creating authentic city profiles
- [**Codebase Structure**](docs/CODEBASE_STRUCTURE.md) - Overview of project organization
- [**Database Structure**](docs/database_structure.md) - Database schema and relationships
- [**Itinerary Template Structure**](docs/ITINERARY_TEMPLATE_STRUCTURE.md) - How trip templates are organized
- [**Implementation Plan**](docs/implementation_plan.md) - Roadmap for new features
- [**Adaptation Plan**](docs/adaptation-plan.md) - Plan for adjusting to new requirements

## 🚀 Core Features

### Content Sharing & Personalization
- **Content Layering**: Original content, shared content, generated content, customized versions
- **Attribution Tracking**: Original source tracking, attribution metadata, content lineage
- **Travel Preferences**: Styles (adventurous, relaxed, cultural, etc.), pace preferences, budget ranges
- **Sharing Features**: Item copying, customization support, attribution preservation

### Trip Planning & Collaboration
- **Trip Creation**: Multi-step form with essential details, dates, travelers, vibe, budget, and privacy settings
- **Itinerary Building**: Add places, notes, and links with drag-and-drop reordering
- **Member Management**: Role-based permissions (admin, editor, contributor, viewer)
- **Real-time Collaboration**: See who's editing, add comments, vote on items

### Technical Highlights
- **Modern Stack**: Next.js App Router, Supabase, Tailwind CSS, Shadcn/ui
- **Authentication**: Secure login with email/password or Google Sign-In
- **Database**: Robust schema with Row Level Security (RLS) policies
- **SEO Optimization**: Canonical URLs, meta tags, structured data

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **UI Components**: Shadcn/ui (customized Radix UI components)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: React Context, custom hooks
- **Deployment**: Vercel

## 📅 Changelog

### Timeline Navigation

| Date | Major Changes |
|------|--------------|
| [2025-04-30](#2025-04-30---current-development) | Trip Hooks Restructuring |
| [2025-04-29](#2025-04-29---authentication--trip-management) | Authentication Overhaul, Trip Creation & Editing |
| [2025-04-27](#2025-04-27---core-refactoring--component-development) | Core Refactoring & UI Components |
| [2025-04-24](#2025-04-24---destination--search-features) | Destination Pages, Search Functionality, Trip Tags |
| [Full Changelog](docs/CHANGELOG.md) | Comprehensive change history |

### [2025-04-30] - Current Development

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
- ✅ **Authentication & Authorization**: Foundational system is robust
- ✅ **Trip Creation & Editing**: Core backend/frontend flows implemented
- 🚧 **Itinerary Building & Management**: Basic structure exists; improving UX/UI
- 🚧 **Member Management**: Basic invite/access checks functional; needs UI refinement
- 🚧 **Focused Collaboration**: Voting API started; needs UI integration
- ✅ **Core Refactoring & Stability**: Ongoing improvements
- ✅ **Foundational UI Components**: Key reusable components available

### ⏳ Lower Priority / Deferred Features:
- 📉 **Expense Tracking**: Native expense tracking planned for future
- 📉 **Standalone Destination Pages**: Functional but not current focus
- 📉 **Global Search**: Basic implementation started, but deferred
- 📉 **Like/Save Functionality**: Components exist, but backend integration deferred
- 📉 **Destination Reviews**: Frontend components built; backend planned
- 📉 **Public Itinerary Templates**: Frontend page exists; data management deferred

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

