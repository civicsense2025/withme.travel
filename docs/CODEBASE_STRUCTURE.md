# WithMe.Travel Codebase Structure

This document outlines the primary directory structure and the purpose of key folders within the `withme.travel` codebase. It aims to help developers navigate the project and understand where different types of code reside.

## Core Application (`app/`)

This directory follows Next.js App Router conventions.

-   **Pages/Routes**: Folders directly under `app/` define routes (e.g., `app/login/`, `app/trips/[tripId]/`).
    -   **Route Groups**: Parenthesized folders like `(authenticated)/` group routes without affecting the URL path (e.g., for applying specific layouts or logic).
    -   `page.tsx`: Defines the UI for a specific route segment.
    -   `layout.tsx`: Defines a shared UI structure for a segment and its children.
-   **API Routes (`app/api/`)**: Contains backend API endpoints handled by Next.js.
    -   Organized by feature (e.g., `app/api/trips/`, `app/api/destinations/`, `app/api/auth/`).
    -   Route handlers (e.g., `route.ts`) define the logic for HTTP methods (GET, POST, etc.).
-   **Global Styles (`app/globals.css`)**: Contains base styles, Tailwind directives, and global CSS variables.
-   **Root Layout (`app/layout.tsx`)**: The main layout applied to the entire application.
-   **Metadata (`app/metadata.ts`)**: Defines default metadata for the application.

## Reusable UI Components (`components/`)

Contains React components used across different parts of the application.

-   **Organization**: Components are generally organized by feature (e.g., `components/trips/`, `components/destinations/`, `components/admin/`) or by general UI purpose (`components/ui/`, `components/layout/`).
-   **Naming**: Uses PascalCase for component file names (e.g., `TripCard.tsx`, `Button.tsx`).

## Reusable Logic & Hooks (`hooks/`, `lib/`)

-   **`hooks/`**: Contains custom React hooks (files starting with `use...`) encapsulating reusable stateful logic or side effects (e.g., `useTrips.ts`, `useDebounce.ts`).
-   **`lib/`**: Contains broader utility functions, service integrations, and potentially non-React-specific hooks.
    -   `lib/utils.ts`: General utility functions.
    -   `lib/services/`: Contains code for interacting with external services (e.g., Pexels, Unsplash, Supabase client setup).
    -   `lib/hooks/`: May contain additional hooks, potentially less tied to specific UI components.

## State Management (`contexts/`)

Contains definitions for React Contexts used for managing global or shared state across component trees (e.g., `SearchContext.tsx`).

## Utilities (`utils/`)

Contains utility functions, often grouped by domain.

-   `utils/supabase/`: Specific utilities related to Supabase interactions (e.g., helper functions for queries).

## Styling (`styles/`, `tailwind.config.ts`, `postcss.config.mjs`)

-   **`styles/`**: May contain additional global styles or specific CSS modules if not using Tailwind exclusively.
-   **`tailwind.config.ts`**: Configuration file for the Tailwind CSS framework, defining themes, plugins, and content paths.
-   **`postcss.config.mjs`**: Configuration for PostCSS, often used with Tailwind.

## Data & Database (`schema/`, `supabase/`)

-   **`schema/`**: Likely contains data validation schemas (e.g., using Zod) or potentially type definitions related to data structures.
-   **`supabase/`**: Contains configuration, database migrations, and tests specific to the Supabase backend.
    -   `supabase/migrations/`: SQL files defining database schema changes.
    -   `supabase/config.toml`: Supabase project configuration.

## Public Assets (`public/`)

Contains static assets served directly, accessible from the root URL path.

-   `public/images/`: Static images used in the application.
-   `public/design-sandbox/`: Assets specific to the design sandbox pages.

## Configuration Files (Root)

Contains top-level configuration files for the project and its tools:

-   `.env.*`: Environment variables.
-   `next.config.mjs`: Next.js configuration.
-   `tsconfig.json`: TypeScript configuration.
-   `package.json`: Project dependencies and scripts.
-   `pnpm-lock.yaml`: Exact dependency versions.
-   `.eslintrc.json`: ESLint configuration.
-   `middleware.ts`: Next.js middleware configuration.

---

This structure promotes feature-based organization and follows common Next.js conventions, aiming for clarity and maintainability. 