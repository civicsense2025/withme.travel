# Admin Editor Components

This directory contains components for inline editing of destination, country, and continent data by admin users.

## Component Structure

The admin components are organized as follows:

- **Core Components**

  - `InlineAdminEditor.tsx`: The base component for all inline editing
  - `AdminAccessCheck.tsx`: Component to conditionally render content only for admins

- **Entity-Specific Components**

  - `DestinationAdminEditor.tsx`: Editor for destination data
  - `CountryAdminEditor.tsx`: Editor for country data
  - `ContinentAdminEditor.tsx`: Editor for continent data

- **Page Integration Components**

  - `DestinationPageAdminEditor.tsx`: Ready-to-use component for destination pages
  - `CountryPageAdminEditor.tsx`: Ready-to-use component for country pages
  - `ContinentPageAdminEditor.tsx`: Ready-to-use component for continent pages

- **Types and Utilities**
  - `types.ts`: TypeScript type definitions
  - `index.ts`: Barrel export file

## Usage

### Basic Usage

Import the component for the entity type you want to edit:

```tsx
import { DestinationPageAdminEditor } from '@/components/admin';

// In your page component:
<DestinationPageAdminEditor destination={destination} />;
```

### Country Pages

```tsx
import { CountryPageAdminEditor } from '@/components/admin';

// In your page component:
<CountryPageAdminEditor country={countryName} stats={countryStats} />;
```

### Continent Pages

```tsx
import { ContinentPageAdminEditor } from '@/components/admin';

// In your page component:
<ContinentPageAdminEditor continent={continentName} stats={continentStats} />;
```

### Admin Access Check

You can use the `AdminAccessCheck` component to conditionally render any content only for admin users:

```tsx
import { AdminAccessCheck } from '@/components/admin';

// In your component:
<AdminAccessCheck>
  <div>This content is only visible to admins</div>
</AdminAccessCheck>

// With fallback content:
<AdminAccessCheck fallback={<p>You need admin access</p>}>
  <div>Admin-only content</div>
</AdminAccessCheck>
```

## API Reference

### InlineAdminEditor

The base component for all inline editing.

```tsx
interface InlineAdminEditorProps {
  entityType: 'destination' | 'country' | 'continent';
  entityId: string;
  fields: InlineEditField[];
  onSave: (entityId: string, data: Record<string, any>) => Promise<boolean>;
  className?: string;
}
```

### Entity-Specific Editors

These components wrap the `InlineAdminEditor` with predefined fields for each entity type.

```tsx
// Destination Editor
interface DestinationAdminEditorProps {
  destination: {
    id: string;
    name: string;
    description: string;
    // ... other properties
  };
}

// Country Editor
interface CountryAdminEditorProps {
  country: string;
  stats?: {
    // ... country stats properties
  };
}

// Continent Editor
interface ContinentAdminEditorProps {
  continent: string;
  stats?: {
    // ... continent stats properties
  };
}
```

## Backend API

The admin editing components rely on API endpoints for updating entities:

- **Destinations**: `PUT /api/admin/destinations/[id]`
- **Countries**: `PUT /api/admin/countries/[name]`
- **Continents**: `PUT /api/admin/continents/[name]`

## Security

All admin components and API endpoints check for admin privileges before allowing edits. The admin check is implemented in:

- `app/admin/utils/auth.ts`: Server-side admin check
- Component-level checks using `useAuth` hook and checking `user?.user_metadata?.is_admin`
