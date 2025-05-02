# Next.js Best Practices for withme.travel: Production-Ready Code Guidelines

## 🔧 Project Structure & Error Prevention

- **Feature-Based Organization**: Structure your code around business features rather than technical concerns

  - Group related components, hooks, utilities, and tests together by feature
  - Example: `/features/city-profiles/components`, `/features/city-profiles/hooks`
  - Use absolute imports to prevent path resolution errors: `import { CityCard } from '@/features/city-profiles/components'`

- **Strict TypeScript Configuration**:

  - Enable `strict: true` in tsconfig.json
  - Use `noImplicitAny: true` to prevent type inference errors
  - Implement `exactOptionalPropertyTypes: true` for precise prop type checking
  - Add `noUncheckedIndexedAccess: true` to prevent undefined access errors

- **Consistent Naming Conventions**:

  - Use kebab-case for directories and files
  - Use PascalCase for React components with `.tsx` extension
  - Use camelCase for utilities/hooks with `.ts` extension
  - Create an `.eslintrc.js` rule to enforce these naming conventions

- **Clean Separation of Concerns**:

  - Keep UI components separate from business logic and data fetching
  - Use custom hooks for reusable logic
  - Create service layers for API interactions
  - Implement proper boundary testing between layers

- **Constants Management**: Refer to `docs/constants-guide.md` for guidelines on organizing and using constants, particularly the direct imports from `utils/constants/database.ts` (e.g., `TABLES`, `FIELDS`, `ENUMS`).

## 🚀 Performance Optimization & Build Error Prevention

- **Image Optimization**:

  - Use Next.js `Image` component with required props: `width`, `height`, and `alt`
  - Add mandatory `alt` text to all image elements to address jsx-a11y/alt-text warnings
  - Implement the `sizes` attribute for responsive images to prevent CLS
  - Use proper image formats with the `formats` array: `['image/webp', 'image/avif']`
  - Create image configuration validation using zod schemas

- **Font Optimization**:

  - Use `next/font` with explicit subsets to reduce bundle size
  - Preload critical fonts with `preload: true`
  - Implement `display: 'swap'` to prevent layout shifts
  - Create font fallback stacks for reliable rendering

- **Code Splitting & Chunk Management**:

  - Implement granular dynamic imports with named exports
  - Set up Webpack chunk analysis with size limits
  - Use bundle analyzer in CI pipeline to catch size regressions
  - Implement page-specific code splitting with proper loading states

- **Bundle Analysis & Dependency Management**:
  - Run regular dependency audits with `npm audit`
  - Use `depcheck` to identify unused dependencies
  - Implement import restrictions with eslint-plugin-import
  - Set up size-limit to enforce bundle size constraints

## 🔄 Rendering & Data Fetching

- **Strategic Rendering Choices**:

  - Use React Server Components by default to reduce client bundle
  - Explicitly mark client components with `'use client'` directive
  - Create clear boundaries between server and client components
  - Implement proper error boundaries for each rendering strategy

- **Efficient Data Fetching**:

  - Implement proper cache headers for static data
  - Use React Query with strict type checking for client-side data
  - Create retry mechanisms with exponential backoff
  - Implement proper error states for all data fetching scenarios

- **Loading & Error States**:

  - Create comprehensive error boundaries for each page section
  - Implement typed error responses from API endpoints
  - Use Suspense with fallback components for all async operations
  - Create skeleton loaders that match final UI dimensions to prevent layout shifts

- **Authentication & Supabase Client Usage**: Use `@supabase/ssr` utilities correctly for authentication and data fetching in different contexts.
  - **API Routes**: Use `await createApiRouteClient()` from `utils/supabase/ssr-client.ts`.
  - **Server Components**: Use `await createServerComponentClient()` from `utils/supabase/ssr-client.ts`.
  - **Client Components**: Use `getBrowserClient()` from `utils/supabase/browser-client.ts` (often via `useAuth` hook or directly for non-auth actions).
  - **Middleware**: Use `getMiddlewareClient` from `utils/supabase/unified.ts` (or its wrapper) and ensure `getSession()` is called for token refresh.
  - **See:** [API Routes & Server/Client Components Guide](docs/api-routes-server-client.md) for detailed patterns.

## 🔍 SEO & Accessibility

- **Robust SEO Implementation**:

  - Use Next.js metadata API with typed schemas
  - Create a metadata validation layer for each page
  - Implement canonical URLs to prevent duplicate content
  - Add structured JSON-LD data with schema validation

- **Accessibility Standards**:
  - Run automated a11y testing in CI with axe-core
  - Create comprehensive keyboard navigation testing
  - Implement focus management utilities for complex interactions
  - Add aria-live regions for dynamic content updates

## 🗄️ State Management & React Hooks Error Prevention

- **Appropriate State Management**:

  - Use Zustand with TypeScript for global state management
  - Implement Redux Toolkit with typed slices for complex state
  - Create selector memoization to prevent unnecessary re-renders
  - Add middleware for logging state changes in development

- **Form Handling & Validation**:

  - Use React Hook Form with zod schemas for type-safe validation
  - Implement form submission retry mechanisms
  - Create controlled inputs with proper event handling
  - Set up form state persistence for multi-step forms

- **React Hooks Error Prevention**:

  - Create a custom ESLint configuration with proper settings for `react-hooks/exhaustive-deps`:
    ```js
    // .eslintrc.js
    module.exports = {
      extends: ['next/core-web-vitals'],
      rules: {
        'react-hooks/exhaustive-deps': [
          'error',
          {
            enableDangerousAutofixThisMayCauseInfiniteLoops: false,
            additionalHooks: '(useRecoilCallback|useRecoilTransaction_UNSTABLE)',
          },
        ],
      },
    };
    ```
  - Create a standard pattern for refs in cleanup functions by capturing current values:

    ```js
    // WRONG - This will cause ESLint warnings
    useEffect(() => {
      return () => {
        if (supabaseRef.current) {
          supabaseRef.current.removeAllChannels();
        }
      };
    }, []);

    // RIGHT - Capture current value inside the effect
    useEffect(() => {
      const currentSupabase = supabaseRef.current;
      return () => {
        if (currentSupabase) {
          currentSupabase.removeAllChannels();
        }
      };
    }, []);
    ```

  - Define constants outside component scope to avoid unnecessary dependencies:

    ```js
    // WRONG - Using aliased import or defining inside component
    import { API_ROUTES } from '@/utils/constants/index'; // Avoid index imports
    useEffect(() => {
      fetch(API_ROUTES.TAGS);
    }, [API_ROUTES.TAGS]); // Unnecessary dependency

    // RIGHT - Define constants in separate utilities file & import directly
    // utils/constants/routes.ts
    export const API_ROUTES = Object.freeze({
      TAGS: '/api/tags',
      TRIPS: '/api/trips',
    });

    // Component.tsx
    import { API_ROUTES } from '@/utils/constants/routes'; // Direct import

    useEffect(() => {
      fetch(API_ROUTES.TAGS);
    }, []); // No dependency needed for static constants
    ```

  - Use factories for memoized callbacks with complex dependencies:

    ```js
    // WRONG - Direct function reference causes lint warnings
    useEffect(() => {
      handleReconnect();
    }, []); // Missing dependency

    // RIGHT - Use callback factory pattern
    const createReconnectHandler = useCallback(() => {
      return async () => {
        // Reconnection logic
      };
    }, [dependencies]);

    useEffect(() => {
      const handleReconnect = createReconnectHandler();
      handleReconnect();
    }, [createReconnectHandler]);
    ```

## 🧪 Testing & Quality Assurance

- **Comprehensive Testing Strategy**:

  - Implement Jest with TypeScript for type checking in tests
  - Use React Testing Library with user-event for interaction testing
  - Create mock service worker (MSW) handlers for API testing
  - Set up Playwright for end-to-end testing with visual comparisons

- **Code Quality Automation**:
  - Configure ESLint with typescript-eslint for static analysis
  - Use Prettier with clear format rules in .prettierrc
  - Implement husky pre-commit hooks with lint-staged
  - Add SonarQube scanning for code quality metrics
- **Type Safety Enforcement**:
  - Create pre-commit hooks that run TypeScript type checking
  - Implement automatic PR checks for type errors
  - Create shared type definitions for APIs and data models
  - Use type guards for proper narrowing instead of type assertions
  - Implement interface extension rather than type casting for related models

## 📝 React Hooks Best Practices

- **useEffect Dependency Management**:

  - Extract all dependencies into the component scope as constants when dealing with static values:

    ```jsx
    // WRONG
    useEffect(() => {
      fetchReviews(destinationId, pageNumber);
    }, []); // Missing dependency: fetchReviews

    // RIGHT
    // 1. Define reusable function outside component or in custom hook
    const useFetchReviews = (destinationId) => {
      const fetchReviews = useCallback(
        (page) => {
          // Implementation
        },
        [destinationId]
      );

      return fetchReviews;
    };

    // 2. In component:
    const fetchReviews = useFetchReviews(destinationId);
    useEffect(() => {
      fetchReviews(pageNumber);
    }, [fetchReviews, pageNumber]); // All dependencies included
    ```

  - Safely handle recurring dependencies like throttled functions:

    ```jsx
    // WRONG
    const throttledCursorUpdate = throttle((x, y) => {
      // Update cursor position
    }, 50);

    useEffect(() => {
      // Effect that uses throttledCursorUpdate
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }, []); // Missing throttledCursorUpdate dependency

    // RIGHT
    // 1. Create stable throttled function with useCallback + useRef
    const throttledFnRef = useRef(null);
    const throttledCursorUpdate = useCallback((x, y) => {
      if (!throttledFnRef.current) {
        throttledFnRef.current = throttle((x, y) => {
          // Update cursor position
        }, 50);
      }
      throttledFnRef.current(x, y);
    }, []);

    useEffect(() => {
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        // Clean up the throttled function
        throttledFnRef.current?.cancel();
      };
    }, [throttledCursorUpdate]); // Add as dependency safely
    ```

  - Use the function form of state setters to avoid dependencies:

    ```jsx
    // WRONG
    useEffect(() => {
      setItems(allItineraryItems); // Creates dependency on allItineraryItems
    }, [allItineraryItems]);

    // RIGHT
    useEffect(() => {
      setItems((currentItems) => {
        // Transform currentItems without external dependency
        return [...processedItems];
      });
    }, []); // No dependency on external state
    ```

- **useCallback/useMemo Optimization**:

  - Properly memoize callbacks by including all used variables:

    ```jsx
    // WRONG - Unnecessary dependency
    const updateItems = useCallback(() => {
      doSomething(value);
    }, [value, updateItemsAfterEdit]); // updateItemsAfterEdit isn't used

    // RIGHT
    const updateItems = useCallback(() => {
      doSomething(value);
    }, [value]); // Only include what's used
    ```

  - Create stable memo keys for expensive computations:

    ```jsx
    // WRONG - Unnecessary dependency causing recalculation
    const processedItems = useMemo(() => {
      return processItems(items);
    }, [items, allItineraryItems]); // allItineraryItems isn't used

    // RIGHT
    const processedItems = useMemo(() => {
      return processItems(items);
    }, [items]); // Only include dependencies that affect result
    ```

  - Use appropriate data structures for memo dependency tracking:

    ```jsx
    // WRONG - Object identity changes on every render
    const options = { sortBy: 'date', limit: 10 };
    const result = useMemo(() => {
      return expensiveCalculation(data, options);
    }, [data, options]); // options is a new object each render

    // RIGHT
    const sortBy = 'date';
    const limit = 10;
    const result = useMemo(() => {
      return expensiveCalculation(data, { sortBy, limit });
    }, [data, sortBy, limit]); // Primitive values don't change identity
    ```

- **Common Hooks Patterns**:

  - Implement safe cleanup for refs used in effects:

    ```jsx
    // WRONG - Using ref.current in cleanup function
    useEffect(() => {
      geocoderContainerRef.current?.addEventListener('click', handleClick);
      return () => {
        geocoderContainerRef.current?.removeEventListener('click', handleClick);
      };
    }, [handleClick]);

    // RIGHT - Capture current value in local variable
    useEffect(() => {
      const container = geocoderContainerRef.current;
      container?.addEventListener('click', handleClick);
      return () => {
        container?.removeEventListener('click', handleClick);
      };
    }, [handleClick]);
    ```

  - Use AbortController for cancellable fetch requests:

    ```jsx
    useEffect(() => {
      const controller = new AbortController();
      const signal = controller.signal;

      const fetchData = async () => {
        try {
          const response = await fetch(url, { signal });
          const data = await response.json();
          setData(data);
        } catch (error) {
          if (error.name !== 'AbortError') {
            setError(error);
          }
        }
      };

      fetchData();

      return () => {
        controller.abort();
      };
    }, [url]);
    ```

  - Create dedicated hook files for complex state management:

    ```jsx
    // hooks/use-trip-itinerary.ts
    export function useTripItinerary(tripId: string) {
      const [items, setItems] = useState<ItineraryItem[]>([]);

      // All itinerary-related logic isolated in a custom hook
      const updateItemsAfterEdit = useCallback((updatedItem) => {
        setItems(currentItems =>
          currentItems.map(item =>
            item.id === updatedItem.id ? updatedItem : item
          )
        );
      }, []);

      // Return only what's needed by components
      return {
        items,
        updateItemsAfterEdit
      };
    }
    ```

## 🚢 Deployment & Environment

- **CI/CD Pipeline**:

  - Create build validation checks in CI
  - Set up deployment previews with Vercel
  - Implement branch protection rules requiring passing tests
  - Use environment-specific validation for config variables

- **Environment Configuration**:
  - Use strongly typed environment variables with zod validation
  - Create a schema for required environment variables
  - Implement runtime checks for critical configuration
  - Set up separate environments (dev/staging/prod) with dedicated configs

## 🔒 Security Hardening

- **API Security**:

  - Implement rate limiting via Next.js middleware
  - Add CSRF protection for all authenticated routes
  - Create comprehensive input validation for all API endpoints
  - Set up proper HTTP security headers via Next.js config

- **Authentication & Authorization**:

  - Use Supabase Auth via `@supabase/ssr` helpers for secure session management.
  - Implement proper token rotation and invalidation (handled by Supabase/middleware).
  - Create role-based middleware for protected routes using the server client.
  - Consider MFA support for enhanced security in the future.

- **Data Protection**:
  - Implement proper data sanitization for all user inputs
  - Add output encoding to prevent XSS attacks
  - Create comprehensive logging that excludes sensitive data
  - Use Content Security Policy headers to mitigate injection attacks

## 📱 Mobile & Responsive Design

- **Mobile-First Development**:

  - Create component test fixtures for multiple viewport sizes
  - Implement responsive design testing in CI
  - Use container queries for complex responsive layouts
  - Set up device-specific error boundaries

- **Progressive Enhancement**:
  - Ensure core functionality works without JavaScript
  - Implement feature detection with proper fallbacks
  - Create offline support with service worker and Next PWA
  - Add degradation gracefully hooks for unsupported features

## 🗺️ City Profile Specific Optimizations

- **Dynamic City Content**:

  - Implement type-safe ISR for city profiles
  - Create comprehensive data validation for city profile schema
  - Use zod parsing for API responses to catch schema mismatches
  - Implement proper error boundaries for profile sections

- **Interactive Maps**:
  - Lazy load map components with proper loading states
  - Create fallback static maps for low-bandwidth conditions
  - Implement proper error handling for map API failures
  - Use skeleton loaders with fixed dimensions to prevent layout shifts

## 🌐 Internationalization & Localization

- **Multi-language Support**:

  - Use next-i18next with TypeScript for type-safe translations
  - Implement locale-specific route handlers
  - Create translation validation to catch missing keys
  - Set up RTL support with proper CSS variables

- **Content Localization**:
  - Create locale-specific content validation
  - Implement proper fallbacks for missing translations
  - Add date, time, and currency formatting utilities
  - Set up locale-dependent tests to verify formatting

## 🔧 Advanced Error Prevention

- **Runtime Error Monitoring**:

  - Implement Sentry with source maps for accurate error reporting
  - Create custom error boundaries with fallback UI
  - Set up error fingerprinting for aggregation
  - Add user context to errors for better debugging

- **Performance Monitoring**:
  - Implement Web Vitals tracking with custom reporting
  - Create performance budgets with automated alerts
  - Set up real user monitoring (RUM) with detailed metrics
  - Add performance regression testing in CI

## 📚 Documentation & Knowledge Sharing

- **Code Documentation**:

  - Use TSDoc comments for all exported functions and components
  - Create storybook entries for UI components with controls
  - Implement automatic API documentation generation
  - Add architecture decision records (ADRs) for major decisions

- **Onboarding & Development**:
  - Create comprehensive local setup documentation
  - Implement pre-configured VSCode workspace settings
  - Add tools like `README.md` templates for new features
  - Create development environment validation scripts

## 🚧 Error Prevention Checklist

- **Pre-Deployment Verification**:
  - Run dead code elimination tools to remove unused imports
  - Verify API endpoint and route consistency
  - Check for memory leaks with React DevTools
  - Validate bundle sizes for key pages
- **Common Error Prevention**:

  - Implement exhaustive type checking for all code paths
  - Add null checking utilities (like nullish coalescing operator)
  - Create fallback mechanisms for failed network requests
  - Set up automatic retry strategies for transient errors

- **Build Optimization**:
  - Use Next.js build output analysis to identify issues
  - Implement caching strategies for static assets
  - Create optimal chunk splitting configurations
  - Set up automatic code splitting for large dependencies

## ⚠️ Fixing Common React Hooks & TypeScript Errors in withme.travel Code

- **React Hooks Exhaustive Dependencies Warnings**:

  - Create a `.eslintrc.js` with custom rules for exhaustive-deps:
    ```js
    module.exports = {
      extends: 'next/core-web-vitals',
      rules: {
        'react-hooks/exhaustive-deps': [
          'error',
          {
            additionalHooks: '(useRecoilCallback|useRecoilTransaction_UNSTABLE)',
          },
        ],
      },
    };
    ```
  - Fix `useCallback` unnecessary dependencies like in `use-trip-itinerary.ts`:

    ```js
    // WRONG - From use-trip-itinerary.ts:427
    useCallback(() => {
      handleItemUpdates(item);
    }, [item, updateItemsAfterEdit]); // updateItemsAfterEdit isn't used in function body

    // CORRECT
    useCallback(() => {
      handleItemUpdates(item);
    }, [item]); // Only include dependencies actually used in callback body
    ```

  - Fix `useMemo` unnecessary dependencies as in `trip-page-client.tsx`:

    ```js
    // WRONG - From trip-page-client.tsx:802
    const filteredItems = useMemo(() => {
      return items.filter((item) => item.category === activeCategory);
    }, [items, activeCategory, allItineraryItems]); // allItineraryItems isn't used

    // CORRECT
    const filteredItems = useMemo(() => {
      return items.filter((item) => item.category === activeCategory);
    }, [items, activeCategory]); // Only include dependencies used in calculation
    ```

  - Fix missing dependencies in `useEffect`:

    ```js
    // WRONG - From trip-page-client.tsx:1250
    useEffect(() => {
      const activeTab = tabs.find((tab) => tab.value === currentTab);
      setActiveTabContent(activeTab?.content || null);
    }, [currentTab]); // Missing tabs dependency

    // CORRECT - Include all dependencies
    useEffect(() => {
      const activeTab = tabs.find((tab) => tab.value === currentTab);
      setActiveTabContent(activeTab?.content || null);
    }, [currentTab, tabs]); // Add missing dependency
    ```

  - Fix API constants dependencies by defining them statically:

    ```js
    // WRONG - Importing from index or aliased constant
    import { API_ROUTES } from '@/utils/constants'; // Deprecated index import
    useEffect(() => {
      fetch(API_ROUTES.TAGS);
    }, [API_ROUTES.TAGS]); // Outer scope constant shouldn't be a dependency

    // CORRECT - Define API_ROUTES as a frozen object outside component
    // utils/constants/routes.ts
    export const API_ROUTES = Object.freeze({
      TAGS: '/api/tags',
      // other routes...
    });

    // In component
    import { API_ROUTES } from '@/utils/constants/routes'; // Direct import
    useEffect(() => {
      fetch(API_ROUTES.TAGS);
    }, []); // No dependency needed
    ```

- **Ref Cleanup Issues in Collaborative UI Components**:

  - Fix ref value capture in cleanup functions:

    ```js
    // WRONG - From components/maps/mapbox-geocoder.tsx:80
    useEffect(() => {
      // Setup code...
      return () => {
        geocoderContainerRef.current?.remove(); // Will cause warning
      };
    }, []);

    // CORRECT - Capture ref value at the time effect runs
    useEffect(() => {
      const containerElement = geocoderContainerRef.current;
      // Setup code...
      return () => {
        containerElement?.remove(); // No warning
      };
    }, []);
    ```

  - Fix the cleanup for cursor tracking in presence components:

    ```js
    // WRONG - From components/presence/cursor-tracker.tsx:62
    useEffect(() => {
      // Setup code...
      return () => {
        cleanupRef.current?.removeAllListeners(); // Will cause warning
      };
    }, []);

    // CORRECT - Capture the current value inside effect
    useEffect(() => {
      const cleanup = cleanupRef.current;
      // Setup code...
      return () => {
        cleanup?.removeAllListeners(); // No warning
      };
    }, []);
    ```

- **Type Compatibility Errors in Trip Page Components**:

  - Fix type conversions between related user interfaces:

    ```ts
    // WRONG - From trip-page-client.tsx:1131
    const extendedPresence = user as ExtendedUserPresence; // Type error - incompatible types

    // CORRECT - Create properly typed conversion
    const extendedPresence: ExtendedUserPresence = {
      user_id: user.id,
      trip_id: tripId,
      status: 'online',
      last_active: new Date().toISOString(),
      name: user.user_metadata?.full_name || '',
      email: user.user_metadata?.email || '',
      avatar_url: user.user_metadata?.avatar_url || null,
      // Other required properties...
    };
    ```

  - Fix property access on `UserPresence` objects:

    ```ts
    // WRONG - From trip-page-client.tsx:1801, 2017, etc.
    const userName = userPresence.name; // Error: Property 'name' does not exist on UserPresence
    const userEmail = userPresence.email; // Error: Property 'email' does not exist on UserPresence
    const avatarUrl = userPresence.avatar_url; // Error: Property 'avatar_url' does not exist on UserPresence

    // CORRECT - Use proper type guards or add properties to interface

    // Option 1: Update UserPresence interface to include these properties
    interface UserPresence {
      user_id: string;
      status: string;
      // Add these missing properties
      name?: string;
      email?: string;
      avatar_url?: string;
    }

    // Option 2: Use type guard to safely access properties
    function isExtendedUserPresence(
      user: UserPresence
    ): user is UserPresence & { name: string; email: string; avatar_url: string } {
      return 'name' in user && 'email' in user && 'avatar_url' in user;
    }

    // Then use the guard safely
    const displayName = isExtendedUserPresence(userPresence) ? userPresence.name : 'Unknown User';
    ```

  - Fix missing exports in type modules:

    ```ts
    // WRONG - From hooks/use-presence.ts:9 (referencing types/presence.ts)
    // types/presence.ts
    type PresenceStatus = 'online' | 'offline' | 'away'; // Defined but not exported
    export interface UserPresence {
      status: PresenceStatus; // Uses non-exported type
    }

    // CORRECT - Add export keyword
    // types/presence.ts
    export type PresenceStatus = 'online' | 'offline' | 'away'; // Now exported
    export interface UserPresence {
      status: PresenceStatus; // Uses exported type
    }
    ```

- **Next.js API Route Type Errors**:

  - Fix incorrect type definition in API routes:

    ```ts
    // WRONG - From app/api/admin/destinations/[id]/route.ts
    export async function PUT(
      request: Request,
      { params }: { params: { id: string } } // Incorrect types
    ) {
      // ...
    }

    // CORRECT - Use Next.js provided types
    import { NextRequest, NextResponse } from 'next/server';

    export async function PUT(
      request: NextRequest,
      { params }: { params: { id: string } }
    ): Promise<NextResponse> {
      // Implementation...
      return NextResponse.json({ success: true });
    }
    ```

  - Fix compatibility issues between similar types:

    ```ts
    // WRONG - From trip-page-client.tsx:1306
    const membersProp: MemberWithProfile[] = localMembers; // Type error

    // CORRECT - Create proper type conversion
    const membersProp: MemberWithProfile[] = localMembers.map((member) => ({
      ...member,
      privacySetting: member.privacySetting as TripPrivacySetting, // Properly cast to enum
    }));
    ```

- **Image Accessibility Issues**:

  - Add missing alt text to images:

    ```tsx
    // WRONG - From components/trips/activity-timeline.tsx:79
    <Image src={imageSrc} width={32} height={32} />

    // CORRECT - Add descriptive alt text
    <Image
      src={imageSrc}
      width={32}
      height={32}
      alt="Activity timeline item" // Added alt attribute
    />
    ```

## 🤝 Code Review Standards

- **Pull Request Requirements**:

  - Create automated PR templates with compliance checklist
  - Implement required reviewers for critical components
  - Set up code coverage requirements for new features
  - Add automated code quality analysis in PR comments

- **Review Checklist**:
  - Verify proper error handling in all async operations
  - Check for proper TypeScript type usage without `any`
  - Validate accessibility concerns for UI components
  - Review performance implications of new code
- **Pre-Merge Validation Script**:

  - Create a pre-merge script that validates React hooks dependencies:

    ```js
    // scripts/validate-hooks.js
    const { ESLint } = require('eslint');

    async function validateHooks() {
      const eslint = new ESLint({
        overrideConfig: {
          rules: {
            'react-hooks/exhaustive-deps': 'error',
          },
        },
      });

      const results = await eslint.lintFiles(['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}']);

      const errorCount = results.reduce((count, result) => {
        return count + result.errorCount;
      }, 0);

      if (errorCount > 0) {
        console.error(`Found ${errorCount} React hooks errors. Fix before merging!`);
        process.exit(1);
      }

      console.log('All React hooks dependencies are valid!');
    }

    validateHooks().catch((error) => {
      console.error(error);
      process.exit(1);
    });
    ```

  - Add custom step to check for common type compatibility issues:

    ```js
    // scripts/validate-types.js
    const { exec } = require('child_process');

    function validateTypeCompatibility() {
      return new Promise((resolve, reject) => {
        exec('npx tsc --noEmit', (error, stdout, stderr) => {
          if (error) {
            console.error('Type checking failed:');
            console.error(stderr);
            reject(new Error('Type checking failed'));
            return;
          }

          console.log('Type checking passed!');
          resolve();
        });
      });
    }

    validateTypeCompatibility().catch(() => {
      process.exit(1);
    });
    ```

  - Add the validation scripts to your CI workflow:

    ```yaml
    # .github/workflows/validate.yml
    name: Validate Code

    on:
      pull_request:
        branches: [main, develop]

    jobs:
      validate:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - uses: actions/setup-node@v3
            with:
              node-version: '18'
          - name: Install dependencies
            run: npm ci
          - name: Validate hooks
            run: node scripts/validate-hooks.js
          - name: Validate types
            run: node scripts/validate-types.js
    ```

## Route Handler Type Changes in Next.js 15

In Next.js 15, the signature for route handlers that use dynamic segments has changed significantly. Dynamic route parameters are now delivered as **promises** that need to be awaited.

### The Issue

If you see this error during build:

```
Type error: Route "app/api/[dynamicSegment]/route.ts" has an invalid "GET" export:
  Type "{ params: { id: string; }; }" is not a valid type for the function's second argument.
```

Or runtime errors like:

```
TypeError: Cannot read properties of undefined (reading 'tripId')
```

This means your route handler is using the old Next.js 14 type signature for dynamic route parameters.

### The Fix: Dynamic Parameters as Promises

You need to:

1. Update the type signature to use `Promise<{ paramName: string }>`
2. Await the params object when accessing the parameters

#### ❌ Incorrect pattern (Next.js 14):

```typescript
// This will cause build errors in Next.js 15
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  // Use id directly
}
```

#### ✅ Correct pattern (Next.js 15):

```typescript
// This is the correct approach for Next.js 15
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Now use id after awaiting the params promise
}
```

### Real-World Example: Trip API Route

Here's a common example from our own codebase that needed to be updated:

#### ❌ Old implementation:

```typescript
// app/api/trips/[tripId]/route.ts
export async function GET(request: NextRequest, { params }: { params: { tripId: string } }) {
  const { tripId } = params; // This would be undefined in Next.js 15

  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.from('trips').select('*').eq('id', tripId).single();

  // Rest of implementation...
}
```

#### ✅ Fixed implementation:

```typescript
// app/api/trips/[tripId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params; // Await the params promise

  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.from('trips').select('*').eq('id', tripId).single();

  // Rest of implementation...
}
```

### Common Error Patterns

After updating to Next.js 15, be careful with these common mistakes:

1. **Forgetting to await params**:

```typescript
// 🚫 Wrong
const { tripId } = params; // params is a Promise, not an object!

// ✅ Correct
const { tripId } = await params;
```

2. **Accessing properties directly without destructuring**:

```typescript
// 🚫 Wrong
const tripId = params.tripId; // Error: Cannot read properties of Promise

// ✅ Correct
const awaitedParams = await params;
const tripId = awaitedParams.tripId;

// ✅ Better - use destructuring
const { tripId } = await params;
```

3. **TypeScript errors with Next.js types**:

```typescript
// 🚫 Wrong: importing outdated types
import { NextRequest } from 'next/server';
import { NextApiRequest } from 'next';

// ✅ Correct: use the current types
import { NextRequest, NextResponse } from 'next/server';
```

### Why the Change?

This change was made to improve the performance and flexibility of dynamic routes in Next.js. By making route parameters asynchronous:

1. The framework can fetch and validate parameters in parallel with other operations
2. It allows for more complex parameter resolution and validation
3. It better aligns with Next.js's overall approach to async rendering and data fetching

### Identifying and Fixing All Routes

To find all route handlers that might need updating, search for files matching this pattern:

```bash
find app/api -name "route.ts" -type f -path "*/[*"
```

This will find all route files within dynamic route segments (folders starting with `[`).

For each file found, update the parameter type to include Promise and modify the parameter access to use await.

### Additional Tips for Route Handlers

When working with Next.js 15 route handlers:

1. **Always use NextResponse**: Return responses using `NextResponse.json()` instead of creating new Response objects.

2. **Type your responses**: Add return types to your route handlers:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<YourResponseType>> {
  // Implementation...
}
```

3. **Handle errors consistently**: Create a standardized error response pattern:

```typescript
function createErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Then use it in your handlers
if (error) {
  return createErrorResponse('Failed to fetch trip data', 500);
}
```
