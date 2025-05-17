# withme.travel UI Component System

This directory contains the UI component system for withme.travel, organized according to atomic design principles and feature-based architecture.

## Directory Structure

```
ui/
├── atoms/           # Core UI atoms
├── molecules/       # Core UI molecules
├── organisms/       # Core UI organisms
├── templates/       # Core UI templates
├── pages/           # Core UI pages
├── features/        # Feature-specific components
│   ├── trips/       # Trip planning components
│   ├── groups/      # Group management components
│   ├── destinations/ # Destination components
│   └── ...more features
├── storybook.config.ts  # Storybook configuration
└── README.md        # This file
```

## Organization Philosophy

Our UI component system follows a dual organization strategy:

1. **Core UI**: Generic, reusable components that aren't tied to a specific domain feature
   - Organized by atomic design levels (atoms, molecules, organisms, templates, pages)
   - Used across multiple feature domains
   - Examples: Button, Card, Modal, Form inputs

2. **Feature-Based Components**: Components specific to a domain feature
   - Organized by feature first, then by atomic design levels
   - Specific to a particular domain or feature
   - Examples: TripCard, DestinationDetail, GroupMemberList

## Atomic Design Levels

Each component is classified according to its complexity level:

- **Atoms**: Basic building blocks, smallest indivisible components
  - Simple UI elements like buttons, inputs, icons, badges
  - Cannot be broken down further into functional UI

- **Molecules**: Combinations of atoms that form simple components
  - Composite components with basic functionality
  - Examples: form fields, cards, dialogs

- **Organisms**: Complex UI components that form distinct sections
  - Self-contained, complex components
  - Often combine multiple molecules together
  - Examples: navigation bars, tabbed interfaces, complex forms

- **Templates**: Page layouts without specific content
  - Define layout structure and placement
  - Focus on composition rather than specific content
  - Examples: page templates, section layouts

- **Pages**: Complete page compositions
  - Fully composed pages with actual content
  - Often the entry point for features

## Feature Domains

Components are organized into the following feature domains:

- **trips**: Trip planning, management, and display
- **groups**: Group management and collaboration
- **destinations**: Destination content and discovery
- **itinerary**: Itinerary planning and management
- **places**: Place search and management
- **user**: User profiles and settings
- **auth**: Authentication and authorization
- **collaboration**: Real-time collaboration tools
- **debug**: Debugging and development tools
- **analytics**: Analytics and reporting
- **admin**: Admin interfaces and tools

## Usage Guidelines

### Importing Components

Always import components using the feature-based paths:

```tsx
// Core UI components
import { Button } from '@/components/ui/atoms';
import { Card } from '@/components/ui/molecules';

// Feature-specific components
import { TripCard } from '@/components/ui/features/trips';
import { GroupMemberList } from '@/components/ui/features/groups';
```

### Creating New Components

When creating a new component:

1. Determine if it belongs in Core UI or a specific feature domain
2. Identify the appropriate atomic design level
3. Create the component in the correct directory
4. Export it through the appropriate index.ts file
5. Create a Storybook story for the component

### Storybook Organization

Components are organized in Storybook following the same structure:

- Core UI components: `Core UI/[Atomic Level]/[Component Name]`
- Feature components: `Features/[Feature Domain]/[Atomic Level]/[Component Name]`

## Migration Status

We are currently migrating to this feature-based atomic structure. See the [Storybook Migration Plan](../../docs/storybook-migration-plan.md) for details on the migration status and process.
