# Constants Migration Guide

## Overview

We've refactored the constants organization in the codebase to improve maintainability and reduce coupling. This guide explains the new organization and how to migrate your imports.

## New Structure

Constants are now organized into domain-specific modules:

| File                          | Description                        | Examples                            |
| ----------------------------- | ---------------------------------- | ----------------------------------- |
| `utils/constants/database.ts` | Database tables, fields, and enums | `TABLES`, `FIELDS`, `TripRole`      |
| `utils/constants/routes.ts`   | API endpoints and page routes      | `API_ROUTES`, `PAGE_ROUTES`         |
| `utils/constants/status.ts`   | Status enums and state constants   | `TRIP_ROLES`, `PERMISSION_STATUSES` |
| `utils/constants/ui.ts`       | UI-related values and limits       | `THEME`, `LIMITS`                   |

The main index file `utils/constants/index.ts` re-exports everything for backward compatibility, but you should start importing from the specific files directly.

## Migration Steps

### 1. Preferred Approach: Import from Specific Modules

Update your imports to use the specific module:

```ts
// OLD
import { API_ROUTES, TRIP_ROLES, TABLES } from '@/utils/constants';

// NEW
import { API_ROUTES } from '@/utils/constants/routes';
import { TRIP_ROLES } from '@/utils/constants/status';
import { TABLES } from '@/utils/constants/database';
```

### 2. Temporary Approach: Continue Using Index

If you need more time to migrate, you can continue using the index file:

```ts
import { API_ROUTES, TRIP_ROLES, TABLES } from '@/utils/constants';
```

This will continue to work, but is less efficient as it loads all constants.

### 3. Use the Migration Helper

We've created a helper script that analyzes your codebase and suggests import changes:

```bash
node scripts/migrate-constants.js
```

This will scan for files importing from `@/utils/constants` and recommend specific import changes.

## Constants Reference

### Database Constants (`utils/constants/database.ts`)

- `TABLES`: Database table names
- `FIELDS`: Database field names
- `ENUMS`: Database enum values
- `DB_TABLES`, `DB_FIELDS`, `DB_ENUMS`: Legacy table/field constants
- `TripRole`: Enum for trip member roles
- Various type definitions based on these constants

### Route Constants (`utils/constants/routes.ts`)

- `API_ROUTES`: All API endpoint paths
- `PAGE_ROUTES`: All frontend navigation paths

### Status Constants (`utils/constants/status.ts`)

- `TRIP_ROLES`: User roles within a trip
- `PERMISSION_STATUSES`: Statuses for permission requests
- `ITINERARY_CATEGORIES`: Categories for itinerary items
- `ITEM_STATUSES`: Statuses for itinerary items
- `TRIP_STATUSES`: Trip statuses
- `SPLIT_TYPES`: Types of expense splits
- `TRIP_TYPES`: Types of trips
- `BUDGET_CATEGORIES`: Categories for budget items
- `TEMPLATE_CATEGORIES`: Categories for templates
- `TEMPLATE_TYPES`: Types of templates

### UI Constants (`utils/constants/ui.ts`)

- `THEME`: Theme colors and properties
- `LIMITS`: Form field limits and constraints
- `TIME_FORMATS`: Date and time display formats

## Benefits of the New Approach

1. **Reduced bundle size**: Import only the constants you need
2. **Better organization**: Constants grouped by domain
3. **Improved maintainability**: Easier to find and update related constants
4. **Better code completion**: IDE provides better suggestions with specific imports
5. **Reduced coupling**: Changes to one area don't require changes everywhere

## Common Issues During Migration

### Type Errors

If you're getting type errors after migration, ensure you're importing any required types:

```ts
// Don't forget to import types
import { TripRole } from '@/utils/constants/database';
import { ItemStatus } from '@/utils/constants/status';
```

### Import Conflicts

If you get errors about duplicate exports, check that you're not importing the same constant from multiple sources:

```ts
// WRONG
import { TRIP_ROLES } from '@/utils/constants';
import { TRIP_ROLES } from '@/utils/constants/status';

// RIGHT - Pick one source
import { TRIP_ROLES } from '@/utils/constants/status';
```

## Timeline

- **Current**: Both the old approach (via index) and new approach work
- **Near future**: We'll gradually migrate all files to use the specific imports
- **Long term**: We'll deprecate the root constants.ts file

## Files Requiring Special Attention

The following files still import from the old `utils/constants.ts` file because they use constants or types that need special handling:

1. `app/api/trips/[tripId]/itinerary/[itemId]/vote/route.ts` - Uses `VOTE_TYPES` which should be moved to a proper location
2. `app/api/trips/[tripId]/itinerary/route.ts` - Has a complex import with `TRIP_ROLES as DB_ENUMS`
3. `components/trending-destinations.tsx` - Uses `API_ENDPOINTS` which is not part of the standard constants
4. `lib/services/image-service.ts` - Uses `UNSPLASH_CONFIG` which should be moved to a configuration module

These files need to be handled on a case-by-case basis as part of a second phase of migration.
