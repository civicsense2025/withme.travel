# Trips Feature Components

This directory contains all components related to trip planning, management, and visualization, organized according to atomic design principles.

## Directory Structure

```
trips/
├── atoms/           # Smallest, indivisible trip components
├── molecules/       # Composite components made up of atoms
├── organisms/       # More complex components that form a section
├── templates/       # Page layouts without specific content
├── pages/           # Complete page compositions
├── index.ts         # Main export file for all components
└── README.md        # This file
```

## Atomic Design Organization

- **Atoms**: Smallest, indivisible units specific to trips feature
  - Trip badges, icons, status indicators
  - Trip date displays, simple labels
  - Example: `TripStatusBadge`, `TripDateDisplay`

- **Molecules**: Combinations of atoms that work together
  - Dialog components, form elements
  - Small interactive components
  - Example: `EmptyTrips`, `ExportCalendarDialog`

- **Organisms**: Complex, feature-rich components
  - Trip cards, tabs with complex behavior
  - Lists of trip components with functionality
  - Example: `TripOverviewTab`, `MembersTab`, `BudgetTab`

- **Templates**: Layout compositions without specific content
  - Trip detail page template
  - Trip creation flow template
  - Example: `TripDetailTemplate`, `TripCreationTemplate`

- **Pages**: Complete compositions with all components
  - Fully composed pages with business logic
  - Example: `TripDetailPage`, `TripsListPage`

## Usage Guidelines

### Adding New Components

1. Determine the appropriate atomic level for your component
2. Add the component to the corresponding directory
3. Export the component from the directory's index.ts file
4. Add it to the main index.ts exports

Example:

```tsx
// trips/atoms/TripDateDisplay.tsx
export function TripDateDisplay({ startDate, endDate }: TripDateDisplayProps) {
  // Implementation
}

// trips/atoms/index.ts
export { TripDateDisplay } from './TripDateDisplay';

// trips/index.ts
export * from './atoms';
```

### Creating Stories

Use the `createFeatureStoryTitle` utility to create proper story paths:

```tsx
// trips/atoms/TripDateDisplay.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import { TripDateDisplay } from './TripDateDisplay';
import { createFeatureStoryTitle } from '../../storybook.config';

const meta: Meta<typeof TripDateDisplay> = {
  title: createFeatureStoryTitle('TRIPS', 'ATOMS', 'TripDateDisplay'),
  component: TripDateDisplay,
  // ...
};

export default meta;
type Story = StoryObj<typeof TripDateDisplay>;

export const Default: Story = {
  args: {
    startDate: '2023-06-01',
    endDate: '2023-06-07',
  },
};
```

## File Naming Conventions

- Component files: PascalCase.tsx (e.g., `TripCard.tsx`)
- Story files: PascalCase.stories.tsx (e.g., `TripCard.stories.tsx`)
- Utility files: kebab-case.ts (e.g., `trip-utils.ts`)
- Index files: index.ts

## Migration Notes

This directory is being gradually migrated to this atomic structure. During migration:

1. New components should be added directly to the atomic structure
2. Existing components will be moved in phases
3. The index.ts file maintains backward compatibility during migration 