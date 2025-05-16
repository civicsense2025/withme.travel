# Itineraries Feature

This directory contains components for displaying and managing trip itineraries, following the atomic design pattern.

## Migration Status

We're in the process of migrating itinerary-related components from the old flat structure (`/components/itinerary/`) to this new feature-based organization. The goal is to improve code organization, reusability, and maintainability.

### Components Migration Plan

#### Atoms
- [ ] `DayDropZone.tsx` - Simple component for drag-and-drop targets
- [ ] `DroppableContainer.tsx` - Container with drop zone functionality
- [ ] `SortableItem.tsx` - Base wrapper for drag-and-drop items
- [ ] `place-autocomplete.tsx` - Input component for place search/selection

#### Molecules
- [x] `ItineraryItemCard.tsx` - Card component for displaying itinerary items
- [ ] `ItineraryDaySection.tsx` - Component to display a single day's itinerary items
- [ ] `event-url-input.tsx` - Enhanced input for event URLs
- [ ] `itinerary-share-button.tsx` - Button for sharing itineraries
- [ ] `use-itinerary-button.tsx` - Button component for using/applying itinerary templates
- [ ] `MobileStepper.tsx` - Mobile pagination component
- [ ] `VerticalStepper.tsx` - Vertical timeline navigation
- [ ] `TripDetailsSection.tsx` - Section showing trip details
- [ ] `itinerary-metadata-section.tsx` - Section showing itinerary metadata
- [ ] `ItineraryFilterControls.tsx` - Filtering controls for itineraries

#### Organisms
- [ ] `itinerary-display.tsx` - Container component for displaying an entire itinerary
- [ ] `itinerary-tab.tsx` - Tab component for the itinerary section of trips
- [ ] `QuickAddItemDialog.tsx` - Dialog for quickly adding items
- [ ] `UnscheduledItemsSection.tsx` - Section showing unscheduled items
- [ ] `itinerary-template-display.tsx` - Display component for itinerary templates

## Component Organization Guidelines

1. **File Naming**: Use PascalCase for component files (e.g., `ItineraryItemCard.tsx`) and camelCase for utility files (e.g., `useItinerarySort.ts`)

2. **Internal Directory Structure**:
   - `atoms/` - Small, reusable building blocks
   - `molecules/` - Medium-sized combinations of atoms
   - `organisms/` - Large, complex components composed of molecules and atoms
   - `hooks/` - Custom React hooks related to itineraries
   - `utils/` - Utility functions specific to itineraries

3. **Migration Process**:
   - Ensure imports use the new paths
   - Update interfaces to use types from `/types`
   - Fix any TypeScript errors during migration
   - Add Storybook stories for visual testing
   - Update references in other components

## Usage

```tsx
import { ItineraryItemCard, ItineraryDisplay } from '@/components/ui/features/itineraries';

// Use in your components
function TripsPage() {
  return (
    <div>
      <ItineraryDisplay items={itineraryItems} />
    </div>
  );
}
``` 