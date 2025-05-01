# Constants Management Guide

This guide outlines how constants are organized and should be used within the withme.travel codebase to ensure consistency, maintainability, and type safety.

## Core Principles

1.  **Single Source of Truth:** Constants should be defined in a single place to avoid duplication and make updates easier.
2.  **Organization:** Constants are grouped by domain (database, routes, UI, etc.) into specific files.
3.  **Clarity:** Use clear and descriptive names for constants.
4.  **Type Safety:** Leverage TypeScript for defining and using constants whenever possible.
5.  **Direct Imports:** Always import constants directly from their specific source file. Avoid using index files for imports.

## Directory Structure

All application-wide constants reside within the `utils/constants/` directory. Each file in this directory serves a specific domain:

-   `database.ts`: The **primary source** for all database-related constants (table names, field names, enums, functions, policies).
-   `routes.ts`: Defines API endpoint paths and page routes.
-   `status.ts`: Contains status enums, roles, and other status-related values.
-   `ui.ts`: Holds constants related to UI elements, themes, limits, etc.
-   `validation.ts`: Defines validation rules and patterns.
-   `api.ts`: Constants specific to API interactions.
-   `colors.ts`: Defines color palettes and theme colors.
-   *(Other files)*: Additional files may exist for other specific domains.

## Key Constant Files & Usage

### 1. Database Constants (`utils/constants/database.ts`)

This is the **most critical** constants file.

-   **Exports:** It directly exports objects for:
    -   `TABLES`: All database table names.
    -   `FIELDS`: Common and table-specific field names.
    -   `ENUMS`: Database enum values (e.g., `TRIP_ROLES`, `ITEM_STATUS`).
    -   `FUNCTIONS`: Database function names.
    -   `POLICIES`: RLS policy names.
-   **Legacy Exports (Avoid):** For backward compatibility, it also exports `DB_TABLES`, `DB_FIELDS`, etc. **Do not use these `DB_*` prefixed constants in new code.** Always use the direct exports (`TABLES`, `FIELDS`, etc.).
-   **Types:** It defines explicit TypeScript types for many enums (e.g., `TripRole`, `ItemStatus`) directly within the file to enhance type safety and avoid problematic external type imports.

**Correct Usage:**

```typescript
import { TABLES, FIELDS, ENUMS, type TripRole } from '@/utils/constants/database';

async function getUserTrip(userId: string, tripId: string) {
  const { data, error } = await supabase
    .from(TABLES.TRIP_MEMBERS)
    .select(`${FIELDS.TRIP_MEMBERS.ROLE}`)
    .eq(FIELDS.TRIP_MEMBERS.USER_ID, userId)
    .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
    .single();

  if (data?.role === ENUMS.TRIP_ROLES.ADMIN) {
    // ... handle admin case
  }
}

function updateRole(newRole: TripRole) {
  // newRole is type-safe
}
```

### 2. Route Constants (`utils/constants/routes.ts`)

Defines constants for API endpoints (`API_ROUTES`) and internal application page paths (`PAGE_ROUTES`).

**Correct Usage:**

```typescript
import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';

async function fetchTripData(tripId: string) {
  const response = await fetch(`${API_ROUTES.TRIPS}/${tripId}`);
  // ...
}

// In a Link component
// <Link href={PAGE_ROUTES.TRIPS.view(trip.id)}>View Trip</Link>
```

### 3. Other Constant Files

Import directly from other files in `utils/constants/` as needed.

**Correct Usage:**

```typescript
import { ITEM_STATUSES } from '@/utils/constants/status';
import { INPUT_LIMITS } from '@/utils/constants/ui';

if (item.status === ITEM_STATUSES.CONFIRMED) {
  // ...
}

// <Input maxLength={INPUT_LIMITS.TRIP_NAME} />
```

## Deprecated Index Files (Do Not Use for Imports)

-   `utils/constants.ts`
-   `utils/constants/index.ts`

These files exist primarily for backward compatibility or historical reasons. **Do not import constants from these index files.** Always import directly from the specific file (e.g., `utils/constants/database.ts`, `utils/constants/routes.ts`). This makes dependencies clearer and avoids potential bundling or type issues.

## Summary

-   Use `utils/constants/` as the central location.
-   Import directly from specific files (`database.ts`, `routes.ts`, etc.).
-   Use `TABLES`, `FIELDS`, `ENUMS` from `database.ts` (avoid `DB_*` prefixes).
-   Leverage the exported types from `database.ts` for type safety.
-   **Never** import from `utils/constants.ts` or `utils/constants/index.ts`. 