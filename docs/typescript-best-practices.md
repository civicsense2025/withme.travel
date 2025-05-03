# TypeScript Best Practices for withme.travel

## Introduction

This document outlines TypeScript best practices for the withme.travel project to ensure consistent type safety, reduce common errors, and increase development velocity. By following these guidelines, we can minimize the time spent fixing TypeScript errors and create a more robust, maintainable codebase.

## Table of Contents

1. [Project Structure and Type Organization](#project-structure-and-type-organization)
2. [Constants and Import Patterns](#constants-and-import-patterns)
3. [Supabase Client Usage](#supabase-client-usage)
4. [Type Definition Strategies](#type-definition-strategies)
5. [Null and Undefined Handling](#null-and-undefined-handling)
6. [Development Workflow](#development-workflow)
7. [Refactoring Strategies](#refactoring-strategies)
8. [Common TypeScript Errors and Solutions](#common-typescript-errors-and-solutions)

## Project Structure and Type Organization

### Core Type Files

- **Global types** should be defined in `types/global.d.ts` 
- **Database types** should be defined in `types/database.types.ts`
- **Domain-specific types** should be co-located with their related functionality

### Type Source of Truth

Maintain a single source of truth for types. Avoid defining the same type in multiple places.

✅ **Good Practice:**
```typescript
// types/global.d.ts
export interface Trip {
  id: string;
  name: string;
  destination_id?: string;
  start_date?: string;
  end_date?: string;
  created_by: string;
  // other properties...
}
```

Then import this type where needed:

```typescript
import type { Trip } from '@/types/global';
```

❌ **Bad Practice:**
Defining similar but slightly different Trip interfaces in multiple files.

### Type-First Approach

Define types before implementing functions or components. This helps catch issues early and clarifies expectations.

✅ **Good Practice:**
```typescript
// Define interface first
interface TripCardProps {
  trip: Trip;
  isEditable: boolean;
  onEdit?: (tripId: string) => void;
}

// Then implement with the defined interface
export function TripCard({ trip, isEditable, onEdit }: TripCardProps) {
  // Implementation...
}
```

## Constants and Import Patterns

### Database Constants

All database constants should be defined in `utils/constants/database.ts` and imported from there. Never redefine these constants locally.

✅ **Good Practice:**
```typescript
// Import database tables
import { TABLES } from '@/utils/constants/database';

// Use imported constants
const { data } = await supabase.from(TABLES.TRIPS).select('*');
```

❌ **Bad Practice:**
```typescript
// Redefining constants locally
const TABLES = {
  TRIPS: 'trips',
  USERS: 'users'
};
```

### Status and Enum Constants

Status and enum-type constants should be defined in `constants/status.ts` and imported from there.

✅ **Good Practice:**
```typescript
// Import status enums
import { TRIP_ROLES, TripRole } from '@/constants/status';

// Use imported constants
if (userRole === TRIP_ROLES.ADMIN) {
  // Allow admin actions
}
```

### Local Constants for Missing Fields

If you need database field names that aren't exported by the central constants file, define them locally with a clear comment:

✅ **Good Practice:**
```typescript
import { TABLES } from '@/utils/constants/database';

// Local field definitions for those not in central constants
const FIELDS = {
  TRIPS: {
    ID: 'id',
    NAME: 'name',
    // Other fields needed in this file...
  }
};
```

### Barrel Exports

Use barrel exports (index.ts files) for related functionality to simplify imports.

✅ **Good Practice:**
```typescript
// hooks/index.ts
export * from './use-trip-budget';
export * from './use-trip-itinerary';
export * from './use-trip-mutations';
```

This enables importing multiple hooks in one line:
```typescript
import { useTripBudget, useTripItinerary, useTripMutations } from '@/hooks';
```

## Supabase Client Usage

### Client Creation

Use the appropriate client creation function based on where the code is running:

- **API Routes**: `createRouteHandlerClient()`
- **Server Components**: `createServerComponentClient()`
- **Client Components**: `getBrowserClient()`

✅ **Good Practice:**
```typescript
// In API routes
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient();
  // Use supabase...
}
```

❌ **Bad Practice:**
```typescript
// Incorrect: awaiting the client creation
const supabase = await createRouteHandlerClient();

// Incorrect: passing parameters that aren't needed
const supabase = createRouteHandlerClient(request);
```

### Awaiting Async Methods

Always await Supabase asynchronous methods. The client itself is not a Promise.

✅ **Good Practice:**
```typescript
const supabase = createRouteHandlerClient();
const { data, error } = await supabase.auth.getUser();
```

❌ **Bad Practice:**
```typescript
// Missing await for async methods
const { data, error } = supabase.auth.getUser(); 
```

### Error Handling

Always check for errors in Supabase responses:

✅ **Good Practice:**
```typescript
const { data, error } = await supabase.from(TABLES.TRIPS).select('*');

if (error) {
  console.error('Error fetching trips:', error);
  return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
}

// Only process data if there's no error
return NextResponse.json({ trips: data });
```

## Type Definition Strategies

### Use Type Guards

Create type guards to safely narrow types:

✅ **Good Practice:**
```typescript
// Type guard function
function isTripMember(obj: any): obj is TripMember {
  return obj && 
         typeof obj === 'object' && 
         'role' in obj && 
         typeof obj.role === 'string';
}

// Usage
if (isTripMember(member)) {
  // TypeScript knows member has the role property
  const role = member.role;
}
```

### Use Interface Extension for Related Types

Extend interfaces for related entities to maintain consistency:

✅ **Good Practice:**
```typescript
// Base interface
interface BaseItem {
  id: string;
  created_at: string;
  updated_at: string;
}

// Extended interface
interface ItineraryItem extends BaseItem {
  trip_id: string;
  title: string;
  description?: string;
  // other properties...
}
```

### Use Discriminated Unions for State

Use discriminated unions to handle different states:

✅ **Good Practice:**
```typescript
type FetchState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success', data: T }
  | { status: 'error', error: Error };

// Usage
const [state, setState] = useState<FetchState<Trip[]>>({ status: 'idle' });

// Type-safe state handling
if (state.status === 'success') {
  // TypeScript knows data exists here
  return <TripList trips={state.data} />;
} else if (state.status === 'error') {
  // TypeScript knows error exists here
  return <ErrorDisplay message={state.error.message} />;
}
```

## Null and Undefined Handling

### Use Optional Chaining

Always use optional chaining (`?.`) when accessing properties that might be undefined or null:

✅ **Good Practice:**
```typescript
// Safe property access
const tripName = trip?.name;
const creatorId = trip?.created_by;
```

### Use Nullish Coalescing

Use the nullish coalescing operator (`??`) for default values:

✅ **Good Practice:**
```typescript
// Provide defaults for null/undefined values
const title = trip?.name ?? 'Untitled Trip';
const items = section?.items ?? [];
```

### Check for Property Existence

Use `in` operator to check if a property exists on an object:

✅ **Good Practice:**
```typescript
if (response && 'is_public' in response && response.is_public) {
  // Safe to access the property
}
```

### Array Methods with Null Safety

Always check that arrays exist before calling methods on them:

✅ **Good Practice:**
```typescript
// Safe array methods
const filteredItems = (section?.items || []).filter(item => item.id !== removeId);
```

## Development Workflow

### Pre-Commit TypeScript Check

Always run TypeScript checks before committing code:

```bash
# Check for TypeScript errors
npx tsc --noEmit
```

Consider adding this to your pre-commit hook or CI pipeline.

### Use VSCode TypeScript Features

Enable VSCode TypeScript features:
- Error highlighting
- Auto-completion
- Quick fixes
- Refactoring tools

Configure your editor to show TypeScript errors inline.

### Progressive Type Checking

Enable stricter TypeScript checks progressively:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## Refactoring Strategies

### Incremental Typing

When dealing with large untyped sections of code, add types incrementally:

1. Start with basic types (`any` if necessary)
2. Refine to more specific types (`object`, `string[]`, etc.)
3. Finally, create proper interfaces and type definitions

### Type Assertion with Caution

Use type assertions only when you're certain about the type:

✅ **Good Practice:**
```typescript
// Use type assertion when you know the correct type
const items = data as ItineraryItem[];
```

Always follow a type assertion with validation when possible:

```typescript
const items = data as ItineraryItem[];
// Validate the data matches the expected type
if (!Array.isArray(items) || items.some(item => !item.id)) {
  throw new Error('Invalid data format');
}
```

### Refactoring API Routes

When refactoring API routes:

1. Create a new route with proper typing
2. Test thoroughly
3. Redirect the old route to the new one
4. Eventually remove the old route

## Common TypeScript Errors and Solutions

### "Property 'X' does not exist on type 'Y'"

This usually indicates a missing type definition or property.

**Solution:** 
- Check if you're using the correct type
- Update your interfaces to include the property
- Use optional properties (`property?: Type`) if appropriate

### "Type 'X' is not assignable to type 'Y'"

This indicates a type mismatch between what you're providing and what's expected.

**Solution:**
- Check if you're using the correct types
- Use type assertions if you're certain about the type
- Update your interfaces to match the expected types

### "Cannot use namespace 'X' as a type"

This occurs when trying to use a namespace as a type.

**Solution:**
- Import the specific type from the namespace
- Use typeof if you need the type of the namespace itself

```typescript
// Incorrect
import { Database } from '@/types/database.types';
const client: Database = createClient();

// Correct
import type { Database } from '@/types/database.types';
const client: Database = createClient();
```

### "Property 'X' is missing in type '{}' but required in type 'Y'"

This happens when an object doesn't have all required properties of a type.

**Solution:**
- Add the missing properties
- Make the properties optional if appropriate
- Use Partial<Type> for partial objects

```typescript
// For partial objects
const partialTrip: Partial<Trip> = { name: 'Weekend Getaway' };
```

## Conclusion

By following these TypeScript best practices, we can create a more robust, maintainable, and error-resistant codebase for withme.travel. These guidelines will help reduce the time spent fixing TypeScript errors and allow us to focus more on building features.

Remember, TypeScript is a tool to help us write better code—use it to your advantage rather than fighting against it. When in doubt, consult this guide or ask for help from the team.

