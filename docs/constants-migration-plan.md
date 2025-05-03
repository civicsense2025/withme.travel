# Constants Migration Plan - Updated

## Current Status

Based on the latest TypeScript error analysis, we still have several specific issues to address across the codebase. These errors fall into well-defined categories that require targeted fixes.

## Error Categories and Action Plan

### 1. Database Constants Issues (Highest Priority)

#### Missing Database Exports

- `FIELDS` and `ENUMS` missing from `utils/constants/database.ts` in multiple files
- Type exports (like `TripRole`) still missing
- Affected files include `lib/trip-access.ts` and `utils/db.ts`

#### Action Items

1. Update `utils/constants/database.ts` to properly export all constants and types:
   ```typescript
   export const FIELDS = { ... }
   export const ENUMS = { ... }
   export type TripRole = typeof ENUMS.TRIP_ROLES[keyof typeof ENUMS.TRIP_ROLES]
   export type ItemStatus = typeof ENUMS.ITEM_STATUSES[keyof typeof ENUMS.ITEM_STATUSES]
   ```
2. Run the existing fix-database-constants script to update imports
3. Create validation test to ensure database.ts exports remain consistent

### 2. Supabase Cookie Handling Fixes (Critical)

#### Missing Awaits in Cookie Operations

- `utils/supabase/server.ts` has multiple missing awaits for cookie operations
- Affects all authentication operations using cookies

#### Action Items

1. Fix async cookie handling in `utils/supabase/server.ts`:
   ```typescript
   return await cookieStore.get(name)?.value;
   await cookieStore.set({ name, value, ...options });
   await cookieStore.delete({ name, ...options });
   ```
2. Add proper typing for cookie operations
3. Create tests for cookie operations to prevent regression

### 3. Presence System Implementation (High Priority)

#### Missing Interface Properties

- `ExtendedUserPresence` missing properties: `editing_item_id`, `page_path`
- `PresenceContextType` missing essential properties: `activeUsers`, `myPresence`, etc.
- Multiple implicit any parameters in `trip-presence-indicator.tsx`

#### Action Items

1. Update the ExtendedUserPresence interface:
   ```typescript
   export interface ExtendedUserPresence extends UserPresence {
     editing_item_id?: string;
     page_path?: string;
     // Other missing properties
   }
   ```
2. Fix PresenceContextType to include all needed properties:
   ```typescript
   export interface PresenceContextType {
     activeUsers: UserPresence[];
     myPresence: UserPresence | null;
     connectionState: string;
     error: Error | null;
     recoverPresence: () => Promise<void>;
     // Add other required properties
   }
   ```
3. Add explicit types to filter functions in trip-presence-indicator.tsx

### 4. Focus Session Implementation (High Priority)

#### Missing Interface Properties

- `FocusSession` missing required property: `has_joined`
- Causes type errors in components using FocusSession

#### Action Items

1. Update `FocusSession` interface to include all required properties:
   ```typescript
   export interface FocusSession {
     has_joined: boolean;
     // Other existing properties
   }
   ```
2. Add missing properties to FocusSessionContextType
3. Create a validation test for FocusSession interface consistency

### 5. Sentry Integration Issues (Medium Priority)

#### Missing Sentry Method Type

- `startTransaction` method missing from Sentry type definition
- Affects error tracking and performance monitoring

#### Action Items

1. Check Sentry SDK version and update if needed
2. Add proper type augmentation if required:

   ```typescript
   // In types/sentry.d.ts
   import '@sentry/nextjs';

   declare module '@sentry/nextjs' {
     namespace Sentry {
       function startTransaction(options: any): any;
     }
   }
   ```

3. Ensure proper error handling fallbacks

### 6. Testing Utilities Type Issues (Low Priority)

#### Dynamic Property Issues

- Type errors in `utils/testing/mock-supabase.ts` with dynamic property access
- Affects test reliability but not production code

#### Action Items

1. Fix type issues in mock-supabase.ts:

   ```typescript
   // Use proper indexable types
   interface MockFn {
     [key: string]: any;
   }

   // Then update implementation
   const mockFn = (() => {}) as unknown as MockFn;
   mockFn[method] = createMockChain();
   ```

2. Add proper type annotations to mock testing utilities
3. Consider isolating test utilities from production type checking

## Implementation Strategy

### Phase 1: Database Constants & Cookie Handling (Days 1-2)

1. Update `utils/constants/database.ts` to export all required constants and types
2. Fix async cookie handling in `utils/supabase/server.ts`
3. Run automated tests to verify fixes

### Phase 2: Presence & Focus Session Interfaces (Days 2-4)

1. Update all presence-related interfaces with missing properties
2. Fix FocusSession interfaces and add missing properties
3. Add explicit type annotations to all implicit any parameters

### Phase 3: Sentry & Testing Utilities (Days 4-5)

1. Fix Sentry type integration
2. Update testing utilities with proper types
3. Create validation tests for interface completeness

### Phase 4: Automated Fix Scripts (Days 5-7)

1. Enhance existing scripts to handle edge cases
2. Create new script for adding explicit type annotations
3. Create interface completion script for automatically detecting missing properties

## Scripts to Develop

1. **Enhanced Database Constants Fixer**:

   - Update to validate database.ts exports all necessary types
   - Fix any remaining incorrect imports

2. **Type Annotation Script**:

   - Detect callback parameters without explicit types
   - Add proper type annotations to these parameters

3. **Interface Validator**:
   - Analyze code to detect interface property usage
   - Automatically identify missing interface properties
   - Generate proper interface updates

## Validation & Testing

For each fix category, we need proper validation:

1. **Database Constants**:

   - Unit tests for constants exports
   - Integration tests using constants

2. **Cookie Handling**:

   - Authentication flow tests
   - Session management tests

3. **Presence System**:

   - UI tests for presence indicator
   - Type validation tests

4. **Focus Session**:
   - Session management tests
   - Interface validation tests

## Progress Tracking

- [ ] Update `utils/constants/database.ts` exports
- [ ] Fix async cookie handling in server.ts
- [ ] Update ExtendedUserPresence interface
- [ ] Update PresenceContextType interface
- [ ] Fix FocusSession interface
- [ ] Add explicit types to implicit any parameters
- [ ] Fix Sentry type integration
- [ ] Update testing utilities types
- [ ] Enhance fix-database-constants script
- [ ] Create type annotation script
- [ ] Create interface validation script
- [ ] Run comprehensive TypeScript validation

This updated plan addresses the specific errors identified in the latest analysis and provides a clear path to resolution with concrete action items for each issue category.
