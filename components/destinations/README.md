# Destination Components

This directory contains a comprehensive set of components for displaying and managing travel destinations, organized according to the Atomic Design methodology.

## Component Structure

### Atoms (Fundamental UI Elements)
- `DestinationImage` - Displays an image of a destination with attribution and caption
- `DestinationRating` - Shows ratings for different aspects of a destination
- `DestinationBadge` - Styled badge for displaying destination metadata like seasons

### Molecules (Combinations of Atoms)
- `DestinationCard` - Card showing a destination with image and basic details
- `DestinationFeature` - Highlight of a specific feature or attribute of a destination
- `DestinationStatCard` - Shows a key statistic or metric about a destination

### Organisms (Functional Components)
- `DestinationDetail` - Complete view of a destination with all details and features
- `DestinationGrid` - Grid of destinations with filtering and sorting capabilities

## Usage

### Basic Usage

Import the desired components directly:

```tsx
import { 
  DestinationCard, 
  DestinationDetail,
  DestinationGrid 
} from '@/components/destinations';
```

### Legacy Components

Some components are still in the process of being migrated to the atomic structure:

```tsx
import { 
  PopularDestinations,
  PopularDestinationsCarousel,
  DestinationReviews,
  DestinationFeatureSection
} from '@/components/destinations';
```

## Examples

### Destination Card

```tsx
<DestinationCard
  destination={{
    id: "paris-france",
    name: "Paris",
    country: "France",
    image_url: "/images/destinations/paris.jpg",
    byline: "The City of Light"
  }}
  onClick={() => navigate(`/destinations/paris-france`)}
/>
```

### Destination Detail

```tsx
<DestinationDetail
  destination={{
    id: "tokyo-japan",
    name: "Tokyo",
    country: "Japan",
    description: "A vibrant metropolis that blends traditional culture with cutting-edge technology",
    cuisine_rating: 4.9,
    cultural_attractions: 4.8,
    best_season: "Spring"
  }}
/>
```

### Destination Grid

```tsx
<DestinationGrid
  destinations={destinations}
  onDestinationClick={handleDestinationSelect}
  showSearch={true}
  showFilters={true}
  columns={{ sm: 1, md: 2, lg: 3 }}
/>
```

## Design Principles

1. **Modularity**: Each component is reusable and has a single responsibility
2. **Composability**: Atoms combine into molecules, which combine into organisms
3. **Flexibility**: Components can be used individually or as part of larger interfaces
4. **Accessibility**: All components follow accessibility best practices
5. **Design System Integration**: Components use the shared UI components library

## Migration Plan

The destination components are being migrated to follow the atomic design methodology:

1. Create atomic structure (atoms, molecules, organisms)
2. Convert existing components into the new structure
3. Update imports across the codebase
4. Maintain backward compatibility during transition

This approach ensures a smooth transition without disrupting existing functionality. 