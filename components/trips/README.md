# Trip Components

This directory contains a comprehensive set of components for creating, viewing, and managing trips, organized according to the Atomic Design methodology.

## Component Structure

### Atoms (Fundamental UI Elements)
- `TripCoverImage` - Displays the trip's cover image with appropriate sizing and fallbacks
- `TripDates` - Formats and displays trip start/end dates
- `TripDestinationBadge` - Displays destination information in a badge format
- `PresenceAvatar` - Shows user avatars with online/offline status indicators
- `TripStatusBadge` - Visual indicator of trip status (planning, active, completed)
- `ActivityIcon` - Icons representing different types of trip activities

### Molecules (Combinations of Atoms)
- `TripCardHeader` - Header portion of a trip card with image and title
- `TripCardFooter` - Footer portion of a trip card with stats and actions
- `ActivityItem` - Individual activity item with icon, details, and actions
- `TripMemberItem` - Component for displaying a single trip member
- `TripShareButton` - Button with sharing options for trips
- `ConnectionStatusIndicator` - Shows real-time connection status
- `PresenceIndicator` - Displays active members/viewers of a trip

### Organisms (Functional Components)
- `TripCard` - Complete card representing a trip in lists or grids
- `TripCreationForm` - Form for creating or editing trips
- `TripHeader` - Full header component for trip detail pages
- `ActivityTimeline` - Complete timeline of trip activities
- `TripMembersList` - List of members with management options
- `MultipleCitySelector` - Component for selecting multiple destinations
- `TripSidebar` - Sidebar with trip navigation and context

### Templates
- `TripsOverviewTemplate` - Layout for the trips listing page
- `TripDetailTemplate` - Layout for single trip view with all sections
- `TripCreationTemplate` - Layout for the trip creation flow

## Usage

### Basic Usage

Import individual components as needed:

```tsx
import { 
  TripCard,
  TripHeader,
  ActivityTimeline 
} from '@/components/trips';
```

Or import a complete template:

```tsx
import { TripDetailTemplate } from '@/components/trips';
```

### Example Implementation

```tsx
<TripDetailTemplate
  trip={tripData}
  members={members}
  activities={activities}
  isEditable={hasEditPermission}
  onShare={handleShare}
/>
```

## Design Principles

1. **Modularity**: Each component is reusable and has a single responsibility
2. **Composability**: Atoms combine into molecules, which combine into organisms
3. **Real-time Collaboration**: Components support presence awareness and collaborative editing
4. **Responsive Design**: All components work seamlessly across devices
5. **Design System Integration**: Components use the shared UI components library

## API Integration

- Components fetch data from the trips API via custom hooks
- Trip data is managed through endpoints in `app/api/trips/*`
- Real-time updates use Supabase Realtime features for presence and collaborative editing
