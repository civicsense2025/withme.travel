## withme.travel: Application Run-through & Documentation

### I. Introduction

`withme.travel` aims to simplify the process of planning group trips, from initial brainstorming and destination selection to managing logistics and coordinating participants. It provides tools for creating detailed trip plans, collaborating with fellow travelers, and discovering potential destinations. The platform utilizes Next.js, Supabase for backend and authentication, and Tailwind CSS with a custom design system for styling.

### II. User Flow / Feature Run-through

Here's a typical journey a user might take through the application:

1.  **Landing & Authentication:**
    *   A user arrives at the homepage (`app/page.tsx`).
    *   The `HeroSection` (`components/hero-section.tsx`) displays an engaging heading, a dynamic tagline showcasing different planning types (e.g., "group planning", "family vacations"), and a prominent search bar (`components/location-search.tsx`) to explore destinations.
    *   Animated `CityBubbles` (`components/city-bubbles.tsx`) float in the background, providing visual interest and quick links to popular destination types.
    *   To access personalized features like creating or viewing trips, the user needs to authenticate.
    *   Users can navigate to `/login` or `/signup`. The `LoginForm` (`components/login-form.tsx`) handles email/password login and Google Sign-In via Supabase.
    *   The `middleware.ts` intercepts requests, checks for a valid Supabase session using `createClient` from `@/utils/supabase/server`, and refreshes the session cookie as needed. It protects routes requiring authentication.
    *   Upon successful login/signup, the user is typically redirected back to their intended page or the main trips dashboard.

2.  **Creating a New Trip:**
    *   Authenticated users can click the "New Trip" button (present in the `Navbar` and user dropdown).
    *   This navigates them to the multi-step trip creation form at `/trips/create` (`app/trips/create/page.tsx`).
    *   **(Optional Pre-fill):** If the user navigated from a destination page via a link like `/trips/create?destination_id=...`, the form attempts to fetch and pre-fill the destination details using the `useEffect` hook and the `/api/destinations/id/[id]` endpoint.
    *   **Step 1: Details:**
        *   Enter Trip Name (required).
        *   URL Friendly Name (slug) is auto-generated from the name but can be manually edited (using `generateSlug` from `lib/utils`).
        *   Enter an optional Description.
        *   Use the `LocationSearch` component to find and select a Destination (required). The component debounces input and fetches results from `/api/destinations/search/[query]`.
    *   **Step 2: Dates:**
        *   Select date flexibility: Specific Dates, Approximate Month/Season, or Undecided.
        *   If "Specific Dates" is chosen, `Calendar` components (`components/ui/calendar`) within `Popover`s allow selecting start and end dates.
    *   **Step 3: Travel Buddies:**
        *   Enter the number of travelers (defaults to 1 if left blank or invalid).
    *   **Step 4: Trip Vibe:**
        *   Select the general vibe (Relaxed, Adventure, Cultural, etc.) using `RadioGroup`.
    *   **Step 5: Budget Range:**
        *   Select the budget preference (Budget-friendly, Moderate, Luxury, etc.) using `RadioGroup`.
    *   **Step 6: Privacy Settings:**
        *   Toggle whether the trip should be public using a `Switch`.
    *   **Navigation:** Users can navigate between steps using "Back" and "Next" buttons. The "Next" button is disabled until the current step's required fields are valid (`isStepValid` function). A progress sidebar (desktop) or horizontal stepper (mobile) indicates the current stage.
    *   **Submission:**
        *   On the final step, the "Create Trip" button becomes active.
        *   Clicking it triggers the `handleSubmit` function.
        *   Frontend validation checks required fields again (name, slug, destination object with id/name).
        *   A `tripData` object is constructed with the validated form inputs.
        *   A POST request is sent to `/api/trips/create` with `tripData` and the authenticated `userId`.
    *   **API & Database Interaction:**
        *   The `/api/trips/create/route.ts` endpoint receives the request.
        *   It authenticates the user again server-side and verifies the `userId`.
        *   It logs the received `tripData`.
        *   It calls the Supabase RPC function `create_trip_with_owner`, passing `tripData` (JSONB) and `owner_id` (UUID).
        *   The `create_trip_with_owner` SQL function (`migrations/create_trip_with_owner_function.sql`) executes:
            *   Validates required fields within the JSONB (`name`, `slug`, `destination_id`, `destination_name`).
            *   Checks slug uniqueness and appends random characters if needed.
            *   Starts a transaction.
            *   Inserts the core trip data into the `trips` table.
            *   Inserts a record into the `trip_members` table, assigning the creator as 'owner'.
            *   Commits the transaction.
            *   Returns a JSONB object indicating success (`{success: true, trip_id: ..., slug: ...}`) or failure (`{success: false, error: ..., detail: ...}`).
        *   The API route receives the response from the RPC.
        *   If successful, it returns a 201 status with the `tripId`, potentially updated `slug`, and a `redirectUrl` (e.g., `/trips/[tripId]`).
        *   If the RPC or API encountered an error, it logs the details and returns an appropriate error response (e.g., 400 for validation errors from SQL, 500 for other errors) with an error message.
    *   **Redirection:**
        *   The frontend receives the API response.
        *   If successful, it uses `router.push` to navigate to the `redirectUrl` provided by the API.
        *   If unsuccessful, it displays the error message received from the API using the `renderError` function and an `Alert` component.

3.  **Exploring & Interacting:**
    *   Users can explore destinations via the hero search, city bubbles, or the main "Destinations" link in the navbar.
    *   The `Navbar` (`components/navbar.tsx`) provides consistent navigation. It adapts responsively:
        *   **Desktop:** Shows links (My Trips, Destinations, etc.), search icon, theme toggle, "New Trip" button, and a user dropdown menu if logged in.
        *   **Mobile:** Hides desktop links, shows a hamburger menu icon. Toggling the menu opens a full-screen overlay (`motion.div` with backdrop) containing navigation links, user info (if logged in), search button, theme toggle, and logout button.
    *   The Theme Toggle (`components/theme-toggle.tsx`) uses `next-themes` to switch between light and dark modes, updating CSS variables defined in `globals.css`.
    *   The Search functionality (triggered via navbar icon or mobile menu button) likely uses the `SearchProvider` (`contexts/search-context.tsx`) to open a search modal/dialog (implementation details not fully reviewed but context exists).

### III. Technical Deep Dive

1.  **Project Structure:**
    *   `app/`: Next.js App Router structure. Contains pages, layouts, API routes.
        *   `app/api/`: Server-side API route handlers.
        *   `app/(pages)/`: Folders for different application sections (e.g., `trips`, `destinations`, `auth`, `admin`).
    *   `components/`: Reusable React components.
        *   `components/ui/`: Likely Shadcn/ui components.
        *   `components/admin/`: Specific components for the admin dashboard.
    *   `lib/`: Utility functions (e.g., `utils.ts` containing `cn` and `generateSlug`).
    *   `utils/`: More specific utilities, constants (`constants.ts`), Supabase client/server helpers (`supabase/`).
    *   `styles/`: Global CSS files (potentially conflicting/duplicate `globals.css` files noted).
    *   `migrations/`: SQL migration files, including function definitions like `create_trip_with_owner_function.sql`.
    *   `contexts/`: React Context providers (e.g., `search-context.tsx`).
    *   `hooks/`: Custom React hooks (e.g., `use-debounce.ts`).

2.  **Authentication System:**
    *   Relies heavily on `@supabase/auth-helpers-nextjs`.
    *   Client-side interactions managed via `createClient` from `@/utils/supabase/client`.
    *   Server-side (API routes, Server Components) uses `createClient` from `@/utils/supabase/server`, handling session cookies.
    *   `middleware.ts` ensures session validity for protected routes.
    *   Login/Signup forms likely call Supabase auth methods (`signInWithPassword`, `signUp`, `signInWithOAuth`).
    *   User session data (including metadata like `avatar_url`, `name`) is accessed via `supabase.auth.getUser()`.
    *   The `AuthProvider` (`components/auth-provider.tsx`) likely wraps the application to provide user/profile context globally.

3.  **Trip Creation Workflow:**
    *   **Frontend (`app/trips/create/page.tsx`):**
        *   Uses React hooks (`useState`, `useEffect`) for managing form state.
        *   Leverages server components (`Suspense`) and client components.
        *   Implements multi-step logic with state (`currentStep`).
        *   Uses `useSearchParams` to handle potential pre-filled destination IDs.
        *   Includes client-side validation (`isStepValid`, checks within `handleSubmit`).
        *   Makes `fetch` call to the dedicated API endpoint.
        *   Uses Framer Motion (`motion`, `AnimatePresence`) for step transitions and visual flair.
    *   **API Route (`app/api/trips/create/route.ts`):**
        *   Standard Next.js API route structure (`export async function POST(...)`).
        *   Uses server-side Supabase client for auth check and RPC call.
        *   Performs user ID verification.
        *   Calls `supabase.rpc('create_trip_with_owner', {...})`.
        *   Handles errors from the RPC call, parsing success/error flags and messages.
        *   Constructs JSON responses using `NextResponse.json()`.
    *   **Database Function (`migrations/create_trip_with_owner_function.sql`):**
        *   Written in PL/pgSQL.
        *   Declared with `SECURITY DEFINER` to bypass RLS for the duration of the function execution (necessary for inserting into `trips` and `trip_members` within one operation if RLS restricts direct inserts based on ownership).
        *   Accepts `trip_data JSONB` and `owner_id UUID`.
        *   Performs explicit validation on required fields extracted from `trip_data`.
        *   Uses a `BEGIN...EXCEPTION...END` block for transactional integrity and error handling (catches `unique_violation`, `foreign_key_violation`, `invalid_text_representation`, `check_violation`, `OTHERS`).
        *   Returns a consistent JSONB structure indicating success or failure with details.

4.  **Key UI Components:**
    *   **Navbar (`components/navbar.tsx`):** Uses `useState` for mobile menu state, `usePathname` for active link styling, `useRouter` for navigation, `useAuth` for user context, `useTheme` for theme context, `useSearch` for search context. Employs Framer Motion (`AnimatePresence`, `motion.div`) for mobile menu animations. Uses Shadcn components (`Button`, `Avatar`, `DropdownMenu`, `Tooltip`).
    *   **LocationSearch (`components/location-search.tsx`):** Uses `useState`, `useEffect`, `useRef`. Implements debouncing (`useDebounce` hook) for search queries. Fetches data from the destination search API. Manages dropdown visibility and selection.
    *   **CityBubbles (`components/city-bubbles.tsx`):** Uses `useState`, `useEffect`, `useRef`. Leverages Framer Motion (`motion`, `useInView`, `useScroll`, `useTransform`) extensively for initial animation (`isInView`), scroll-based parallax effects (`useTransform` with `scrollYProgress`), and hover effects. Dynamically generates bubble positions and properties based on screen width (`windowWidth`). Includes a `BubbleItem` subcomponent. *Note: Scroll transforms were removed in a later step.*
    *   **Shadcn/ui Components:** Used throughout for base UI elements (Button, Card, Input, Label, Calendar, Popover, Switch, Alert, etc.), providing structure and accessibility.

5.  **Styling & Theming (`app/globals.css`):**
    *   Utilizes Tailwind CSS for utility-first styling.
    *   Defines CSS variables (`:root`, `.dark`) for theme colors (background, foreground, primary, accent, travel-specific colors like `--travel-purple`).
    *   Includes base styles, component layers (`@layer components`), and utility layers (`@layer utilities`).
    *   Defines custom components (`.gradient-text`, `.travel-card`) and utilities (`.animate-fade-in`, `.bubble-float`).
    *   Defines keyframes for animations (`@keyframes fadeIn`, `pulse-soft`, `bubble-float`).
    *   Configuration likely in `tailwind.config.js` (defines theme colors, extends utilities).

### IV. Setup & Running Locally

1.  **Clone:** `git clone <repository_url>`
2.  **Install Dependencies:** `npm install` or `pnpm install` (based on `pnpm-lock.yaml` presence).
3.  **Environment Variables:** Create a `.env.local` file in the root directory. Add your Supabase URL and Anon Key:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    # Add SUPABASE_SERVICE_ROLE_KEY if needed for admin operations
    # SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
    ```
4.  **Database Migrations:** Ensure your Supabase database schema matches the definitions in the `migrations/` folder. You might need to apply these using the Supabase CLI or dashboard. Specifically, ensure the `create_trip_with_owner` function is created.
5.  **Run Development Server:** `npm run dev` or `pnpm dev`.
6.  **Access:** Open `http://localhost:3000` in your browser.

### V. Recent Improvements & Key Takeaways (Trip Creation)

*   **Enhanced Validation:** Validation for required trip data (name, slug, destination) was added at multiple levels: frontend (`handleSubmit`), SQL function (`create_trip_with_owner`).
*   **Improved Error Handling:** The SQL function now returns more specific error messages for validation failures or database constraints. The API endpoint logs these errors better and passes informative messages back to the frontend. The frontend displays these specific errors to the user.
*   **Robust Data Flow:** The process of constructing the `tripData` payload in the frontend was refined to ensure necessary fields (like `destination.id` and `destination.name`) are included based on the validated `destination` object.
*   **Reliable Redirection:** The API now returns the final `redirectUrl`, which the frontend uses, ensuring consistency even if the slug was modified server-side for uniqueness.
*   **Increased Debuggability:** Added logging in the API route (`/api/trips/create`) shows the exact data being passed to the database function, aiding troubleshooting.

### VI. Potential Next Steps / Future Considerations

*   Implement remaining trip management features (editing, deleting, viewing details).
*   Develop the itinerary building functionality.
*   Add collaboration features (inviting members, commenting, voting - some API routes seem to exist but frontend implementation wasn't reviewed).
*   Refine the UI/UX based on user testing.
*   Address potential styling conflicts (duplicate `globals.css`).
*   Implement more robust profanity/content filtering.
*   Add notifications for trip updates or invites.
*   Expand admin dashboard functionality. 