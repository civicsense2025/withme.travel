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

# TypeScript Best Practices FAQ

## Table of Contents

1. [Fundamentals](#fundamentals)
2. [Type Safety](#type-safety)
3. [Interfaces vs. Types](#interfaces-vs-types)
4. [Generics](#generics)
5. [Advanced Types](#advanced-types)
6. [Error Handling](#error-handling)
7. [Asynchronous TypeScript](#asynchronous-typescript)
8. [Type Assertions](#type-assertions)
9. [Configuration](#configuration)
10. [Tooling](#tooling)
11. [Working with External Libraries](#working-with-external-libraries)
12. [Migrating from JavaScript](#migrating-from-javascript)
13. [Performance](#performance)
14. [Real-world Examples](#real-world-examples)

---

## Fundamentals

### Q: What's the primary goal of using TypeScript?

TypeScript's primary goal is to provide static type checking to help catch errors during development rather than at runtime. It adds type safety to JavaScript while maintaining compatibility with existing JavaScript code.

### Q: How does TypeScript's type checking work?

TypeScript analyzes your code and builds a dependency graph to understand how types flow through your application. It then verifies that values are being used according to their declared types. This happens during compilation (transpilation to JavaScript) and can also be continuously checked in your editor.

### Q: When should I use `any` type?

Use `any` sparingly, typically only in these scenarios:
- During migration from JavaScript to TypeScript
- When working with highly dynamic API responses
- As a temporary solution while you determine the proper type
- When dealing with third-party libraries without type definitions

For better type safety, consider `unknown` instead of `any` when possible.

### Q: What's the difference between `undefined` and `null`?

- `undefined`: Represents a variable that has been declared but not assigned a value
- `null`: Represents an intentional absence of any object value

In TypeScript, they are distinct types. The `strictNullChecks` compiler option helps manage both by requiring explicit checks for `null` and `undefined` values.

## Type Safety

### Q: What are "non-null assertion operators" and when should I use them?

The non-null assertion operator (`!`) tells TypeScript that a value cannot be `null` or `undefined`, even if its type suggests it might be. For example: `const name: string | null = getName(); const nameLength = name!.length;`

Use this operator only when:
1. You are absolutely certain the value cannot be null/undefined
2. You've performed a check that TypeScript cannot recognize
3. You're working with a framework that has guarantees TypeScript doesn't understand

Prefer explicit checks (`if (name) {...}`) when possible.

### Q: How can I prevent "undefined is not an object" runtime errors?

These common JavaScript errors can be prevented in TypeScript by:

1. Using optional chaining: `user?.address?.street`
2. Enabling `strictNullChecks` in your tsconfig
3. Using nullish coalescing for default values: `const name = user.name ?? 'Unknown'`
4. Adding explicit type guards: `if (user && 'address' in user) {...}`
5. Using destructuring with defaults: `const { name = 'Unknown' } = user`

### Q: What are type guards and how do I use them?

Type guards are expressions that perform runtime checks to guarantee the type of a value. They help TypeScript narrow down the type of a variable within a conditional block.

Common type guards:
- `typeof` operator: `if (typeof value === 'string') {...}`
- `instanceof` operator: `if (error instanceof HttpError) {...}`
- User-defined type guards: `function isUser(obj: any): obj is User {...}`
- Property checks: `if ('name' in object) {...}`
- Array checks: `if (Array.isArray(value)) {...}`

### Q: How do I handle optional properties effectively?

For optional properties (those that might be undefined), use:

1. Optional property syntax: `interface User { email?: string; }`
2. Optional chaining: `user?.email?.includes('@')`
3. Nullish coalescing for defaults: `const email = user.email ?? 'no-email'`
4. Destructuring with defaults: `const { email = 'no-email' } = user`
5. Type guards before access: `if (user.email) { /* email is defined here */ }`

## Interfaces vs. Types

### Q: When should I use an interface vs. a type alias?

**Use interfaces when:**
- Defining object shapes that might be extended
- Working with classes that need to implement a contract
- You need declaration merging (adding fields to same interface in multiple places)
- Creating public API contracts that others might extend

**Use type aliases when:**
- Creating union or intersection types
- Defining complex types with mapped types, conditional types, etc.
- Working with tuples or specific array types
- Creating a type alias for a simple primitive type

### Q: Can I extend both interfaces and types?

Yes, but with different syntax:

Interfaces use `extends`:
```typescript
interface Animal { name: string }
interface Dog extends Animal { breed: string }
```

Types use intersection (`&`):
```typescript
type Animal = { name: string }
type Dog = Animal & { breed: string }
```

Interfaces can extend types, and types can use interfaces in intersections.

### Q: What is declaration merging and when is it useful?

Declaration merging allows multiple declarations with the same name to be automatically merged. This works with interfaces but not with type aliases:

```typescript
interface User { name: string }
interface User { age: number }
// Merged as: interface User { name: string; age: number }
```

This is useful when:
- Extending third-party types without modifying source code
- Building module augmentation for existing libraries
- Progressively adding fields to a type across multiple files

## Generics

### Q: What are generics and when should I use them?

Generics allow you to write flexible, reusable functions and types that work with multiple data types while maintaining type safety. Use generics when:

1. Creating container types (arrays, promises, etc.)
2. Writing utility functions that should work with many types
3. Building reusable components with variable data types
4. Maintaining relationships between input and output types

Example:
```typescript
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

### Q: How do I constrain generics to certain types?

Use the `extends` keyword to constrain generic type parameters:

```typescript
interface HasLength { length: number }

// T must have a length property
function getLength<T extends HasLength>(obj: T): number {
  return obj.length;
}
```

This ensures that only types with compatible shapes can be used as type arguments.

### Q: What are some common patterns for using generics?

1. **Generic Functions:**
   ```typescript
   function map<T, U>(array: T[], fn: (item: T) => U): U[] {
     return array.map(fn);
   }
   ```

2. **Generic Interfaces:**
   ```typescript
   interface Repository<T> {
     getById(id: string): Promise<T>;
     getAll(): Promise<T[]>;
     create(item: Omit<T, 'id'>): Promise<T>;
   }
   ```

3. **Generic Classes:**
   ```typescript
   class Queue<T> {
     private items: T[] = [];
     enqueue(item: T): void { this.items.push(item); }
     dequeue(): T | undefined { return this.items.shift(); }
   }
   ```

4. **Generic Type Aliases:**
   ```typescript
   type Result<T> = { success: true; data: T } | { success: false; error: Error };
   ```

## Advanced Types

### Q: What are mapped types and when should I use them?

Mapped types allow you to create new types by transforming properties of existing types. Use them when:

1. Making all properties optional/required
2. Changing property types in a consistent way
3. Filtering properties based on type
4. Creating related types from a base type

Examples:
```typescript
// Make all properties optional
type Partial<T> = { [P in keyof T]?: T[P] };

// Make all properties read-only
type Readonly<T> = { readonly [P in keyof T]: T[P] };

// Pick specific properties
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
```

### Q: How do conditional types work?

Conditional types select a type based on a condition, similar to ternary expressions:

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```

Use them for:
1. Type inference based on input types
2. Filtering union types
3. Creating advanced utility types
4. Handling complex type relationships

### Q: What is the keyof operator and how is it used?

The `keyof` operator produces a union type of all property keys (string, number, or symbol) of a given type:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Type is "id" | "name" | "email"
type UserKeys = keyof User;
```

Use it for:
1. Creating type-safe property access
2. Building generic functions that work with object properties
3. Indexed access types: `User[UserKeys]`
4. Constraining generic parameters to valid object keys

### Q: What are utility types and which ones should I know?

TypeScript provides built-in utility types for common type transformations:

Essential utility types:
- `Partial<T>`: Makes all properties optional
- `Required<T>`: Makes all properties required
- `Readonly<T>`: Makes all properties readonly
- `Record<K, T>`: Creates a type with properties of type K and values of type T
- `Pick<T, K>`: Picks a subset of properties from T
- `Omit<T, K>`: Removes specific properties from T
- `Exclude<T, U>`: Excludes types from T that are assignable to U
- `Extract<T, U>`: Extracts types from T that are assignable to U
- `NonNullable<T>`: Removes null and undefined from T
- `ReturnType<F>`: Gets the return type of a function
- `Parameters<F>`: Gets the parameter types of a function as a tuple

## Error Handling

### Q: How should I type errors in TypeScript?

For robust error handling:

1. Create specific error classes:
   ```typescript
   class ApiError extends Error {
     constructor(public status: number, message: string) {
       super(message);
     }
   }
   ```

2. Use union types for expected errors:
   ```typescript
   type Result<T> = 
     | { success: true; data: T }
     | { success: false; error: ApiError | ValidationError };
   ```

3. Add type guards for error checking:
   ```typescript
   function isApiError(error: unknown): error is ApiError {
     return error instanceof ApiError;
   }
   ```

### Q: How do I handle exceptions safely in TypeScript?

1. Type the `catch` clause explicitly:
   ```typescript
   try {
     // risky operation
   } catch (error: unknown) {
     // Always use 'unknown' for caught errors
     if (error instanceof ApiError) {
       // Handle API error
     } else if (typeof error === 'string') {
       // Handle string error
     } else {
       // Handle other cases
     }
   }
   ```

2. Create type-safe error handling utilities:
   ```typescript
   async function tryCatch<T>(
     fn: () => Promise<T>
   ): Promise<[T, null] | [null, Error]> {
     try {
       const result = await fn();
       return [result, null];
     } catch (error) {
       return [null, error instanceof Error ? error : new Error(String(error))];
     }
   }
   ```

### Q: How can I ensure exhaustive error handling?

Use a "never" type check to ensure all cases are handled:

```typescript
function handleError(error: ApiError | ValidationError | DatabaseError) {
  if (error instanceof ApiError) {
    // Handle API error
  } else if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof DatabaseError) {
    // Handle database error
  } else {
    // Exhaustiveness check
    const _exhaustiveCheck: never = error;
    throw new Error(`Unhandled error type: ${_exhaustiveCheck}`);
  }
}
```

This pattern ensures if new error types are added, you'll get a compile-time error.

## Asynchronous TypeScript

### Q: How do I type Promises correctly?

1. Always specify the resolved value type:
   ```typescript
   function fetchUser(id: string): Promise<User> {
     // ...
   }
   ```

2. For async functions, TypeScript automatically wraps the return type in a Promise:
   ```typescript
   async function fetchUser(id: string): Promise<User> {
     // TypeScript understands this returns Promise<User>
     return (await api.get(`/users/${id}`)).data;
   }
   ```

3. For functions that might reject, consider using a Result type:
   ```typescript
   type Result<T> = Promise<{
     success: true;
     data: T;
   } | {
     success: false;
     error: Error;
   }>;
   ```

### Q: How do I handle async/await error handling with proper types?

1. Always type caught errors as `unknown`:
   ```typescript
   async function fetchData(): Promise<Data> {
     try {
       return await api.getData();
     } catch (error: unknown) {
       // Type guard to narrow the error type
       if (error instanceof ApiError) {
         // Handle API error
       }
       throw error; // Re-throw if unhandled
     }
   }
   ```

2. Consider a utility function for async error handling:
   ```typescript
   async function tryCatchAsync<T>(
     promise: Promise<T>
   ): Promise<[T, null] | [null, unknown]> {
     try {
       const data = await promise;
       return [data, null];
     } catch (error) {
       return [null, error];
     }
   }
   
   // Usage
   const [data, error] = await tryCatchAsync(fetchData());
   ```

### Q: How do I type event listeners correctly?

1. Use proper event types:
   ```typescript
   button.addEventListener('click', (event: MouseEvent) => {
     // event is properly typed
   });
   ```

2. For custom events, define proper event types:
   ```typescript
   interface CustomEvent {
     type: 'custom';
     payload: {
       id: string;
       value: number;
     };
   }
   
   function addEventListener(callback: (event: CustomEvent) => void) {
     // ...
   }
   ```

## Type Assertions

### Q: When should I use type assertions vs. type declarations?

**Use type declarations (`: Type`) when:**
- Defining variable types: `const user: User = { id: 1, name: 'Alice' };`
- Specifying function parameter and return types
- Creating typed objects from scratch
- When TypeScript can verify the type is correct

**Use type assertions (`as Type`) when:**
- Working with DOM elements: `document.getElementById('root') as HTMLDivElement`
- When you have more specific type information than TypeScript can infer
- Converting between compatible types
- Working with external data with known structure

Prefer type declarations when possible, as they're checked by the compiler.

### Q: What is the "non-null assertion operator" and when should I use it?

The non-null assertion operator (`!`) tells TypeScript a value cannot be null or undefined:

```typescript
function getLength(str: string | null) {
  return str!.length; // Asserts str is not null
}
```

Use it only when:
1. You've performed a check TypeScript doesn't recognize
2. You're working with a framework where you know values are initialized
3. You're certain a value exists (based on logic TypeScript can't follow)

Prefer explicit null checks when possible:
```typescript
function getLength(str: string | null) {
  if (str === null) throw new Error('String is null');
  return str.length; // TypeScript now knows str is string
}
```

### Q: What is the difference between `as Type` and `<Type>`?

Both are type assertions, but with different syntax:

```typescript
// Using "as Type" (preferred)
const elem = document.getElementById('root') as HTMLDivElement;

// Using "<Type>" (alternative)
const elem = <HTMLDivElement>document.getElementById('root');
```

The `as Type` syntax is preferred because:
1. It works in all contexts, including JSX
2. It's more readable in complex expressions
3. It's the recommended modern syntax

The angle bracket syntax (`<Type>`) doesn't work in JSX files as it conflicts with React's syntax.

## Configuration

### Q: What are the most important tsconfig.json settings to enable?

Enable these settings for better type safety:

```json
{
  "compilerOptions": {
    "strict": true,               // Enable all strict type checking options
    "noImplicitAny": true,        // Error on implied 'any' types
    "strictNullChecks": true,     // Enable strict null checks
    "strictFunctionTypes": true,  // Enable strict checking of function types
    "strictBindCallApply": true,  // Check 'bind', 'call', and 'apply' methods
    "strictPropertyInitialization": true, // Ensure class properties are initialized
    "noImplicitThis": true,       // Error on 'this' with implied 'any' type
    "alwaysStrict": true,         // Parse in strict mode
    
    "noUncheckedIndexedAccess": true, // Add 'undefined' to indexed access
    "exactOptionalPropertyTypes": true, // Distinguish between undefined and missing
    
    "noImplicitReturns": true,    // Ensure all code paths return a value
    "noFallthroughCasesInSwitch": true, // Error on fallthrough cases in switch
    "noUnusedLocals": true,       // Error on unused locals
    "noUnusedParameters": true    // Error on unused parameters
  }
}
```

### Q: How do I configure TypeScript for different environments?

Use environment-specific tsconfig files:

1. Base configuration (`tsconfig.json`):
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "strict": true,
       "esModuleInterop": true
     }
   }
   ```

2. For Node.js (`tsconfig.node.json`):
   ```json
   {
     "extends": "./tsconfig.json",
     "compilerOptions": {
       "module": "CommonJS",
       "moduleResolution": "node",
       "target": "ES2020",
       "lib": ["ES2020"],
       "types": ["node"]
     }
   }
   ```

3. For browser (`tsconfig.browser.json`):
   ```json
   {
     "extends": "./tsconfig.json",
     "compilerOptions": {
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "module": "ESNext"
     }
   }
   ```

### Q: What are path aliases and how do I set them up?

Path aliases help avoid verbose relative imports. Configure them in tsconfig.json:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

Then use them in your imports:
```typescript
import { Button } from '@components/Button';
import { formatDate } from '@utils/date';
```

For bundlers like webpack, you'll need to configure the same aliases in your build config.

## Tooling

### Q: What TypeScript-specific ESLint rules should I enable?

Essential ESLint rules for TypeScript:

```json
{
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/prefer-optional-chain": "warn",
    "@typescript-eslint/strict-boolean-expressions": "warn",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error"
  }
}
```

### Q: What VS Code extensions improve TypeScript development?

Essential VS Code extensions:

1. **TypeScript Error Translator**: Explains TypeScript errors in plain English
2. **ESLint**: Integrates ESLint for real-time linting
3. **Prettier**: Code formatting with TypeScript support
4. **Error Lens**: Shows errors inline in the editor
5. **TypeScript Importer**: Automatically imports types and functions
6. **Move TS**: Refactoring tools for TypeScript
7. **Type Coverage**: Shows how much of your code has type coverage

### Q: How can I debug type issues effectively?

1. Use the TypeScript playground (typescriptlang.org/play) for isolated testing
2. Add `// @ts-expect-error` comments to document expected errors
3. Create minimal reproducible examples for complex type issues
4. Use `type-coverage` to measure and improve type coverage
5. Add explicit type annotations during development, even if not required
6. Use `console.log(typeof variable)` for runtime type debugging
7. Create custom type debugging utilities:
   ```typescript
   type Debug<T> = { [K in keyof T]: T[K] };
   // Usage: type DebugUser = Debug<User>;
   ```

## Working with External Libraries

### Q: How do I handle libraries without TypeScript definitions?

Options for libraries without type definitions:

1. Check if definitions exist on DefinitelyTyped:
   ```bash
   npm install --save-dev @types/library-name
   ```

2. Create your own declaration file (`library-name.d.ts`):
   ```typescript
   declare module 'library-name' {
     export function someFunction(param: string): number;
     export class SomeClass {
       constructor(options?: { timeout?: number });
       method(): void;
     }
   }
   ```

3. Use a minimal declaration for a quick fix:
   ```typescript
   declare module 'library-name';
   ```

4. Consider module augmentation for partial typing:
   ```typescript
   import * as LibModule from 'library-name';
   
   declare module 'library-name' {
     export interface LibOptions {
       timeout?: number;
       retries?: number;
     }
   }
   ```

### Q: How do I add types to JSON or API responses?

1. Use type assertions for JSON responses:
   ```typescript
   const data = JSON.parse(jsonString) as { users: User[] };
   ```

2. Create type guards for validating:
   ```typescript
   function isUser(obj: unknown): obj is User {
     return (
       typeof obj === 'object' &&
       obj !== null &&
       'id' in obj &&
       'name' in obj
     );
   }
   
   const data = JSON.parse(jsonString);
   if (isUser(data)) {
     // data is now typed as User
   }
   ```

3. Use validation libraries with TypeScript support:
   ```typescript
   import { z } from 'zod';
   
   const UserSchema = z.object({
     id: z.number(),
     name: z.string(),
     email: z.string().email()
   });
   
   type User = z.infer<typeof UserSchema>;
   
   const validateUser = (data: unknown): User => {
     return UserSchema.parse(data);
   };
   ```

### Q: How do I properly type React components and hooks?

For React components:

1. Function components with `React.FC` (though direct function is often preferred):
   ```typescript
   type ButtonProps = {
     text: string;
     onClick: () => void;
   };
   
   // With React.FC
   const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
     return <button onClick={onClick}>{text}</button>;
   };
   
   // Direct function (often preferred)
   function Button({ text, onClick }: ButtonProps) {
     return <button onClick={onClick}>{text}</button>;
   }
   ```

2. For hooks with generics:
   ```typescript
   function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
     // implementation
   }
   
   // Usage
   const [user, setUser] = useLocalStorage<User | null>('user', null);
   ```

3. For event handlers:
   ```typescript
   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     // event is typed correctly
   };
   ```

## Migrating from JavaScript

### Q: What's the best strategy for migrating a JavaScript project to TypeScript?

1. **Incremental approach:**
   - Enable JavaScript files in your tsconfig: `"allowJs": true`
   - Add `.ts` files alongside existing `.js` files
   - Start with shared utilities and models
   - Use the `@ts-check` comment in JS files for gradual typing

2. **File-by-file migration:**
   - Rename `.js` to `.ts` one file at a time
   - Start with files with fewer dependencies
   - Use `any` temporarily for complex types
   - Address errors incrementally

3. **Set up proper tooling:**
   - Configure tsconfig.json with appropriate settings
   - Set up ESLint with TypeScript support
   - Add type checking to your CI pipeline
   - Add pre-commit hooks for type checking

### Q: How do I add types to existing JavaScript code incrementally?

1. **Start with JSDoc comments:**
   ```javascript
   /**
    * @param {string} name - The user's name
    * @param {number} age - The user's age
    * @returns {Object} The created user
    */
   function createUser(name, age) {
     return { name, age };
   }
   ```

2. **Create separate declaration files:**
   ```typescript
   // types.d.ts
   interface User {
     name: string;
     age: number;
   }
   
   declare function createUser(name: string, age: number): User;
   ```

3. **Add types gradually in TypeScript files:**
   ```typescript
   // Start with basic types
   interface User {
     name: string;
     age: number;
   }
   
   // Later expand with more specific types
   interface User {
     name: string;
     age: number;
     email?: string;
     role: 'admin' | 'user' | 'guest';
   }
   ```

### Q: How strict should my TypeScript configuration be when migrating?

Start with less strict settings and gradually increase strictness:

Initial migration (tsconfig.json):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "allowJs": true,
    "checkJs": false,
    "noImplicitAny": false,
    "strictNullChecks": false,
    "strict": false
  }
}
```

Intermediate stage:
```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strict": false
  }
}
```

Final goal:
```json
{
  "compilerOptions": {
    "allowJs": false,
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## Performance

### Q: How can I optimize TypeScript compilation performance?

1. **Project references:**
   - Split large projects into smaller sub-projects
   - Use the `references` field in tsconfig.json
   - Enable incremental compilation

2. **Incremental compilation:**
   ```json
   {
     "compilerOptions": {
       "incremental": true,
       "tsBuildInfoFile": "./buildcache/cache"
     }
   }
   ```

3. **Use exclude/include effectively:**
   ```json
   {
     "include": ["src/**/*"],
     "exclude": ["node_modules", "**/*.spec.ts", "dist"]
   }
   ```

4. **Skip type checking for node_modules:**
   ```json
   {
     "compilerOptions": {
       "skipLibCheck": true
     }
   }
   ```

5. **Use faster transpilers for development:**
   - esbuild
   - swc
   - ts-node with transpile-only mode

### Q: What's the performance impact of different TypeScript features?

Features from most to least performance impact:

1. **High impact:**
   - Complex mapped types with deep nesting
   - Excessive use of conditional types
   - Recursive type definitions
   - Type inference over large unions

2. **Medium impact:**
   - Large interface hierarchies
   - Extensive use of function overloads
   - Generic constraints with complex types
   - Index types with many possible keys

3. **Low impact:**
   - Basic interfaces and types
   - Simple generics
   - Primitive type unions
   - Type assertions

### Q: How can I reduce bundle size when using TypeScript?

1. **Use imports properly:**
   ```typescript
   // Better - imports only what's needed
   import { Button } from './components';
   
   // Worse - may include unused code
   import * as Components from './components';
   ```

2. **Avoid excessive type exports:**
   ```typescript
   // Export types separately
   export type { User, Account };
   
   // Export values normally
   export const createUser = () => {};
   ```

3. **Use tree-shaking friendly patterns:**
   - Export named functions instead of default exports
   - Use ES modules syntax consistently
   - Avoid side effects in modules

4. **Configure proper build tools:**
   - Use Terser for minification
   - Enable dead code elimination
   - Use bundle analyzers to identify bloat

## Real-world Examples

### Q: How do I type common API request/response patterns?

1. **Basic API client:**
   ```typescript
   interface ApiResponse<T> {
     data: T;
     status: number;
     message: string;
   }
   
   async function api<T>(url: string): Promise<ApiResponse<T>> {
     const response = await fetch(url);
     const json = await response.json();
     return json as ApiResponse<T>;
   }
   
   // Usage
   interface User {
     id: number;
     name: string;
   }
   
   const { data } = await api<User[]>('/users');
   // data is typed as User[]
   ```

2. **Error handling with discriminated unions:**
   ```typescript
   type ApiSuccess<T> = {
     success: true;
     data: T;
   };
   
   type ApiError = {
     success: false;
     error: {
       code: string;
       message: string;
     };
   };
   
   type ApiResult<T> = ApiSuccess<T> | ApiError;
   
   async function fetchData<T>(url: string): Promise<ApiResult<T>> {
     try {
       const response = await fetch(url);
       if (!response.ok) {
         return {
           success: false,
           error: {
             code: `HTTP_${response.status}`,
             message: response.statusText
           }
         };
       }
       const data = await response.json();
       return {
         success: true,
         data
       };
     } catch (error: unknown) {
       return {
         success: false,
         error: {
           code: 'NETWORK_ERROR',
           message: error instanceof Error ? error.message : String(error)
         }
       };
     }
   }
   
   // Usage with type narrowing
   const result = await fetchData<User>('/users/1');
   if (result.success) {
     // result.data is typed as User
     console.log(result.data.name);
   } else {
     // result.error is typed as { code: string; message: string }
     console.error(result.error.message);
   }
   ```

3. **Typed API client with methods:**
   ```typescript
   class ApiClient {
     private baseUrl: string;
     
     constructor(baseUrl: string) {
       this.baseUrl = baseUrl;
     }
     
     async get<T>(path: string): Promise<T> {
       const response = await fetch(`${this.baseUrl}${path}`);
       if (!response.ok) {
         throw new Error(`API error: ${response.status}`);
       }
       return response.json() as Promise<T>;
     }
     
     async post<T, R>(path: string, data: T): Promise<R> {
       const response = await fetch(`${this.baseUrl}${path}`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       });
       if (!response.ok) {
         throw new Error(`API error: ${response.status}`);
       }
       return response.json() as Promise<R>;
     }
   }
   
   // Usage
   const api = new ApiClient('https://api.example.com');
   const user = await api.get<User>('/users/1');
   const newUser = await api.post<UserInput, User>('/users', { name: 'Alice' });
   ```

### Q: How do I type form handling in TypeScript?

1. **Basic form with validation:**
   ```typescript
   interface FormValues {
     name: string;
     email: string;
     age: number;
   }
   
   interface FormErrors {
     [K in keyof FormValues]?: string;
   }
   
   function validateForm(values: FormValues): FormErrors {
     const errors: FormErrors = {};
     
     if (!values.name) {
       errors.name = 'Name is required';
     }
     
     if (!values.email) {
       errors.email = 'Email is required';
     } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
       errors.email = 'Invalid email format';
     }
     
     if (values.age < 18) {
       errors.age = 'Must be at least 18 years old';
     }
     
     return errors;
   }
   
   function submitForm(values: FormValues): void {
     const errors = validateForm(values);
     
     if (Object.keys(errors).length === 0) {
       // Submit form
       console.log('Form submitted', values);
     } else {
       // Show errors
       console.error('Form has errors', errors);
     }
   }
   ```

2. **React form with TypeScript:**
   ```typescript
   interface FormData {
     username: string;
     password: string;
     rememberMe: boolean;
   }
   
   function LoginForm() {
     const [formData, setFormData] = useState<FormData>({
       username: '',
       password: '',
       rememberMe: false
     });
     
     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const { name, value, type, checked } = e.target;
       setFormData({
         ...formData,
         [name]: type === 'checkbox' ? checked : value
       });
     };
     
     const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
       e.preventDefault();
       // Form submission logic
     };
     
     return (
       <form onSubmit={handleSubmit}>
         <input
           type="text"
           name="username"
           value={formData.username}
           onChange={handleChange}
         />
         <input
           type="password"
           name="password"
           value={formData.password}
           onChange={handleChange}
         />
         <label>
           <input
             type="checkbox"
             name="rememberMe"
             checked={formData.rememberMe}
             onChange={handleChange}
           />
           Remember me
         </label>
         <button type="submit">Login</button>
       </form>
     );
   }
   ```

### Q: How do I type complex state management patterns?

1. **Reducer with discriminated union actions:**
   ```typescript
   // State type
   interface State {
     users: User[];
     loading: boolean;
     error: string | null;
   }
   
   // Action types using discriminated unions
   type Action =
     | { type: 'FETCH_USERS_REQUEST' }
     | { type: 'FETCH_USERS_SUCCESS'; payload: User[] }
     | { type: 'FETCH_USERS_FAILURE'; error: string }
     | { type: 'ADD_USER'; payload: User }
     | { type: 'REMOVE_USER'; payload: { id: number } };
   
   // Reducer function
   function reducer(state: State, action: Action): State {
     switch (action.type) {
       case 'FETCH_USERS_REQUEST':
         return { ...state, loading: true, error: null };
       
       case 'FETCH_USERS_SUCCESS':
         return { ...state, loading: false, users: action.payload };
       
       case 'FETCH_USERS_FAILURE':
         return { ...state, loading: false, error: action.error };
       
       case 'ADD_USER':
         return { ...state, users: [...state.users, action.payload] };
       
       case 'REMOVE_USER':
         return {
           ...state,
           users: state.users.filter(user => user.id !== action.payload.id)
         };
       
       default:
         // Exhaustiveness check
         const _exhaustiveCheck: never = action;
         return state;
     }
   }
   ```

2. **Redux with TypeScript:**
   ```typescript
   // State types
   interface RootState {
     users: UsersState;
     auth: AuthState;
   }
   
   interface UsersState {
     data: User[];
     loading: boolean;
     error: string | null;
   }
   
   interface AuthState {
     user: User | null;
     token: string | null;
     isAuthenticated: boolean;
   }
   
   // Action creators with typed returns
   function fetchUsers(): ThunkAction<
     Promise<void>,
     RootState,
     unknown,
     Action<string>
   > {
     return async (dispatch) => {
       dispatch({ type: 'FETCH_USERS_REQUEST' });
       
       try {
         const response = await fetch('/api/users');
         const data: User[] = await response.json();
         
         dispatch({
           type: 'FETCH_USERS_SUCCESS',
           payload: data
         });
       } catch (error) {
         dispatch({
           type: 'FETCH_USERS_FAILURE',
           error: error instanceof Error ? error.message : 'Unknown error'
         });
       }
     };
   }
   
   // Typed selector
   const selectUsers = (state: RootState) => state.users.data;
   ```

## Common Anti-patterns and Troubleshooting

### Q: What are the most common TypeScript anti-patterns to avoid?

1. **Overusing `any` type:**
   ```typescript
   // Anti-pattern
   function processData(data: any): any {
     return data.map(item => item.value);
   }
   
   // Better
   function processData<T extends { value: V }, V>(data: T[]): V[] {
     return data.map(item => item.value);
   }
   ```

2. **Type assertions without validation:**
   ```typescript
   // Anti-pattern
   const userData = JSON.parse(data) as User;
   
   // Better
   function isUser(obj: unknown): obj is User {
     return (
       obj !== null &&
       typeof obj === 'object' &&
       'id' in obj &&
       'name' in obj
     );
   }
   
   const parsedData = JSON.parse(data);
   if (isUser(parsedData)) {
     // parsedData is now typed as User
     const userData = parsedData;
   } else {
     throw new Error('Invalid user data');
   }
   ```

3. **Ignoring null/undefined checks:**
   ```typescript
   // Anti-pattern
   function getLength(arr?: string[]) {
     return arr.length; // Might be undefined!
   }
   
   // Better
   function getLength(arr?: string[]) {
     return arr?.length ?? 0;
   }
   ```

4. **Object literal type widening:**
   ```typescript
   // Anti-pattern
   const config = { strictMode: true }; // Type is { strictMode: boolean }
   
   // Better - use const assertion
   const config = { strictMode: true } as const; // Type is { readonly strictMode: true }
   ```

5. **Unnecessarily complex types:**
   ```typescript
   // Anti-pattern - overly complex
   type UserAction<T extends { id: number }> = T extends { admin: boolean }
     ? { type: 'ADMIN_ACTION'; payload: T }
     : { type: 'USER_ACTION'; payload: T };
   
   // Better - simpler, more direct
   type AdminAction = { type: 'ADMIN_ACTION'; payload: { id: number; admin: true } };
   type RegularUserAction = { type: 'USER_ACTION'; payload: { id: number } };
   type UserAction = AdminAction | RegularUserAction;
   ```

### Q: How do I debug "Type 'X' is not assignable to type 'Y'" errors?

1. **Check property compatibility:**
   ```typescript
   // Error: Type '{ name: string; age: number }' is not assignable to type 'User'.
   // Property 'id' is missing in type '{ name: string; age: number }'.
   
   interface User {
     id: number;
     name: string;
     age: number;
   }
   
   // Missing 'id' property
   const user: User = {
     name: 'Alice',
     age: 30
   };
   
   // Fix: Add the missing property
   const correctUser: User = {
     id: 1,
     name: 'Alice',
     age: 30
   };
   ```

2. **Check for excess properties:**
   ```typescript
   // Error: Type '{ id: number; name: string; age: number; role: string; }'
   // is not assignable to type 'User'.
   // Object literal may only specify known properties, and 'role' does not exist in type 'User'.
   
   interface User {
     id: number;
     name: string;
     age: number;
   }
   
   // Extra 'role' property
   const user: User = {
     id: 1,
     name: 'Alice',
     age: 30,
     role: 'admin'
   };
   
   // Fix: Remove excess property or use type assertion
   const userWithRole = {
     id: 1,
     name: 'Alice',
     age: 30,
     role: 'admin'
   } as const;
   
   const user: User = {
     id: userWithRole.id,
     name: userWithRole.name,
     age: userWithRole.age
   };
   ```

3. **Check function parameter compatibility:**
   ```typescript
   // Error: Type '(event: MouseEvent) => void' is not assignable to type '(event: Event) => void'.
   
   function handleEvent(callback: (event: Event) => void) {
     // implementation
   }
   
   // More specific parameter type
   handleEvent((event: MouseEvent) => {
     console.log(event.clientX); // MouseEvent specific property
   });
   
   // Fix: Accept the more general Event type
   handleEvent((event: Event) => {
     // Need to check and cast if using MouseEvent properties
     if (event instanceof MouseEvent) {
       console.log(event.clientX);
     }
   });
   ```

### Q: How do I solve "Cannot find module" or "Cannot find name" errors?

1. **For "Cannot find module" errors:**
   - Check import path spelling and case sensitivity
   - Ensure the module is installed (for npm packages)
   - Check tsconfig.json module resolution settings:
     ```json
     {
       "compilerOptions": {
         "moduleResolution": "node",
         "baseUrl": ".",
         "paths": {
           "@/*": ["src/*"]
         }
       }
     }
     ```
   - Add type declarations for non-TypeScript modules:
     ```typescript
     // declarations.d.ts
     declare module 'untyped-module';
     ```

2. **For "Cannot find name" errors:**
   - Check variable scope and declaration
   - Ensure imports are correct
   - For global variables, add declarations:
     ```typescript
     // globals.d.ts
     interface Window {
       customProperty: string;
     }
     
     declare global {
       const GLOBAL_CONFIG: { apiUrl: string };
     }
     ```
   - For DOM elements, use type guards:
     ```typescript
     const element = document.getElementById('app');
     if (element) {
       // element is HTMLElement | null
       element.innerHTML = 'Hello';
     }
     ```

## TypeScript Evolution and Future

### Q: How do I keep up with TypeScript changes and new features?

1. **Official sources:**
   - [TypeScript Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html)
   - [TypeScript GitHub repository](https://github.com/microsoft/TypeScript)
   - [TypeScript Blog](https://devblogs.microsoft.com/typescript/)

2. **Community resources:**
   - TypeScript Weekly newsletter
   - TypeScript conferences (TSConf)
   - Popular TypeScript blogs and YouTube channels
   - TypeScript Discord and communities

3. **Stay current with tooling:**
   - Regularly update the TypeScript version in your projects
   - Try out beta/nightly releases for upcoming features
   - Set up experiments with new features in isolated projects

### Q: What upcoming TypeScript features should I be aware of?

Stay updated on the TypeScript roadmap for the latest upcoming features. Some examples include:
   
1. Variadic tuple types
2. Template literal types
3. Key remapping in mapped types
4. Recursive conditional types
5. Enhancing built-in utility types
6. Improved error messages and debugging

### Q: How do I contribute to the TypeScript ecosystem?

1. **Direct contributions:**
   - Report bugs on the [TypeScript GitHub repo](https://github.com/microsoft/TypeScript)
   - Suggest new features through GitHub issues
   - Contribute to the TypeScript compiler codebase
   - Improve documentation

2. **Indirect contributions:**
   - Create and maintain type definitions for untyped libraries
   - Build and share utility types
   - Create educational content about TypeScript
   - Share best practices and patterns

---

This FAQ is designed to be a living document. Regularly revisit and update it as TypeScript evolves and as you encounter new patterns and challenges in your codebase.