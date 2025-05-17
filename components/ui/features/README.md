# Features Directory

This directory contains all feature-specific components organized by domain and atomic design principles.

## Directory Structure

```
features/
├── trips/              # Trip planning & management
├── groups/             # Group & collaboration
├── destinations/       # Destination content & discovery
├── itinerary/          # Itinerary planning & display
├── places/             # Place search & management
├── user/               # User profile & settings
├── auth/               # Authentication & authorization
├── collaboration/      # Real-time collaboration tools
├── debug/              # Debugging & development tools
├── analytics/          # Analytics & reporting
├── admin/              # Admin interfaces & tools
└── README.md           # This file
```

## Feature-Based Atomic Design

Each feature directory follows the same atomic design structure:

```
feature-name/
├── atoms/           # Smallest, indivisible components
├── molecules/       # Composite components made up of atoms
├── organisms/       # More complex components that form a section
├── templates/       # Page layouts without specific content
├── pages/           # Complete page compositions
├── index.ts         # Main export file for all components
└── README.md        # Feature-specific documentation
```

## Feature Domains

### Trips

Components related to trip planning, management, and visualization.

- Trip cards, trip tabs, trip forms
- Trip detail views and list views
- Trip creation and editing flows

### Groups

Components for group management and sharing.

- Group cards and lists
- Member management
- Invitations and permissions

### Destinations

Components for displaying and interacting with destination content.

- Destination cards and details
- City profiles and discovery
- Destination search and filtering

### Itinerary

Components for itinerary planning and management.

- Itinerary day sections
- Activity cards and timelines
- Scheduling interfaces

### Places

Components for place search, management, and display.

- Place search interfaces
- Map integration components
- Place detail views

### User

Components related to user profiles and settings.

- Profile views and editors
- User settings interfaces
- Preferences and accessibility

### Auth

Components for authentication and authorization.

- Login and signup forms
- Password reset flows
- Multi-factor authentication

### Collaboration

Components for real-time collaboration.

- Presence indicators
- Collaborative editors
- Real-time status indicators

### Debug

Components for debugging and development.

- Debug panels and consoles
- Performance monitoring
- Feature flag controls

### Analytics

Components for analytics and reporting.

- Charts and graphs
- Data visualization
- Export and reporting tools

### Admin

Components for administrative interfaces.

- Admin dashboards
- User management
- Content moderation tools

## Usage Guidelines

- Components should be placed in the feature domain that best represents their primary purpose
- Cross-cutting concerns should be placed in the appropriate feature domain most relevant to their use
- Components used across multiple features may be candidates for the core UI
- Each feature directory has its own README with detailed guidelines

## Storybook Integration

Use the `createFeatureStoryTitle` utility from storybook.config.ts:

```tsx
import { createFeatureStoryTitle } from '../storybook.config';

const meta = {
  title: createFeatureStoryTitle('TRIPS', 'MOLECULES', 'ComponentName'),
  component: ComponentName,
  // ...
};
```

## Migration Process

1. For new components, create them directly in the appropriate feature directory
2. For existing components, gradually move them to the correct feature & atomic level
3. Update imports and maintain backward compatibility during migration 