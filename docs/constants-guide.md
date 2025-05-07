# Constants Management Guide

This guide explains how to use and manage constants in the withme.travel codebase for maximum clarity, maintainability, and type safety.

## Core Principles

- **Single Source of Truth:** All constants live in `utils/constants/` and are grouped by domain (database, routes, status, UI, etc.).
- **Direct Imports Only:** Always import constants directly from their specific file (e.g., `utils/constants/database.ts`). **Never import from `utils/constants.ts` or any index file.**
- **Type Safety:** Use TypeScript types and enums exported from constants files. Never use magic strings or numbers.
- **Defensive Usage:** Always check for null/undefined and use enums/types for validation. Never assume a constant exists—handle missing/invalid values gracefully.

## Directory Structure

- `database.ts`: Database tables, fields, enums, and types (e.g., `TABLES`, `FIELDS`, `ENUMS`, `TripRole`, `ItemStatus`).
- `routes.ts`: API and page route constants (`API_ROUTES`, `PAGE_ROUTES`).
- `status.ts`: Status enums, roles, and notification types.
- `ui.ts`: UI constants (themes, limits, display helpers).
- `validation.ts`: Validation rules, regex, and Zod schemas.
- `colors.ts`: Color palettes and mappings.

## Usage Patterns

### Database Constants

```typescript
import { TABLES, FIELDS, ENUMS, type TripRole } from '@/utils/constants/database';

// Always use enums/types for roles/statuses
if (member.role === ENUMS.TRIP_ROLES.ADMIN) {
  // ...
}

function updateRole(newRole: TripRole) {
  // newRole is type-safe
}
```

### Route Constants

```typescript
import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';

fetch(API_ROUTES.TRIPS);
<Link href={PAGE_ROUTES.TRIP_DETAILS(trip.id)}>View Trip</Link>
```

### Status & UI Constants

```typescript
import { TRIP_ROLES, NOTIFICATION_TYPES } from '@/utils/constants/status';
import { TIME_FORMATS, CATEGORY_DISPLAY } from '@/utils/constants/ui';

if (member.role === TRIP_ROLES.EDITOR) { /* ... */ }
const formatted = format(date, TIME_FORMATS.DISPLAY_DATE);
const info = CATEGORY_DISPLAY[item.category];
```

### Validation & Defensive Programming

- Always validate values before using them as keys for constants.
- Use enums/types for all status/category/role checks.
- Handle missing/invalid values with fallback logic.

```typescript
import { CATEGORY_DISPLAY } from '@/utils/constants/ui';

const info = CATEGORY_DISPLAY[item.category] || DEFAULT_CATEGORY_DISPLAY;
```

## Deprecated: Never Do This

- **Never import from `utils/constants.ts` or `utils/constants/index.ts`.**
- **Never use `DB_*` prefixed constants in new code.**
- **Never use magic strings for roles, statuses, or categories.**

## User Data: Auth vs. Profile

- Use `TABLES.USERS` for auth (Supabase `auth.users`)
- Use `TABLES.PROFILES` for public profile data (`public.profiles`)
- Most joins and lookups use `PROFILES` for display/user info

## Summary Checklist

- [x] Import only from the specific constants file you need
- [x] Use enums/types for all roles, statuses, and categories
- [x] Validate all values before using as keys
- [x] Never use index files or legacy/DB_* constants
- [x] Handle missing/invalid values defensively