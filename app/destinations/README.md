# Destinations Page

This directory contains the implementation of the destinations page for withme.travel.

## Key Components

- `page.tsx` - Server component that provides layout and metadata
- `destinations-client.tsx` - Main client component for fetching and displaying destinations
- `loading.tsx` - Loading state component for streaming
- `error.tsx` - Error boundary component for error handling
- `constants.ts` - Shared constants and types
- `components/` - Reusable components specific to destinations page

## Features

### Data Management
- Fetches destinations from Supabase database
- Type-safe data handling with validation
- Proper error handling for API errors and network issues
- Empty state handling

### Loading States
- Skeleton UI during data loading
- Smooth transitions between states
- Loading progress announcements

### Accessibility
- Keyboard navigation support
- Screen reader announcements
- ARIA attributes for regions and elements
- Focus management for keyboard users
- Visual focus indicators

### Error Handling
- User-friendly error messages
- Retry functionality
- Error recovery paths
- Network error detection

## Implementation Notes

The implementation follows these key patterns:

1. **State Management** - Uses React hooks for local state
2. **Type Safety** - Comprehensive TypeScript types and validation
3. **Component Separation** - Client/server separation with proper boundaries
4. **Accessibility First** - Built with keyboard navigation and screen readers in mind
5. **Error Resilience** - Multiple layers of error handling

## Recent Fixes

- Fixed issue with destinations not loading properly
- Added proper image fallbacks for missing images
- Improved type safety and error handling
- Enhanced accessibility with keyboard navigation and screen reader support
- Added comprehensive documentation and comments

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run destinations-specific tests
pnpm test destinations

# Run tests with coverage
pnpm test:coverage
```

### Testing Strategy

The destinations page follows a multi-level testing approach:

1. **Unit Tests** - Testing individual components with mocked dependencies
2. **Integration Tests** - Testing components working together
3. **Accessibility Tests** - Verifying ARIA attributes and keyboard navigation
4. **Visual Regression Tests** - Ensuring UI remains consistent

### Key Test Cases

- Component renders in all states (loading, success, error, empty)
- Error handling works for different error types
- Data fetching and transformation is correct
- Accessibility features function as expected
- Keyboard navigation follows expected tab order
- Screen reader announcements are made at appropriate times

## Usage Examples

### Importing Components

```tsx
// Import destinations client component
import DestinationsClient from '@/app/destinations/destinations-client';

// Import individual destination card
import { DestinationCard } from '@/app/destinations/components';

// Import shared types
import { Destination } from '@/app/destinations/constants';
```

### Basic Implementation

```tsx
// Using destinations client in a page
import DestinationsClient from '@/app/destinations/destinations-client';

export default function CustomPage() {
  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Explore Destinations</h1>
      <DestinationsClient />
    </main>
  );
}
```

```tsx
// Using destination card in a custom component
import { Destination } from '@/app/destinations/constants';
import { DestinationCard } from '@/app/destinations/components';

interface Props {
  destinations: Destination[];
}

export function FeaturedDestinations({ destinations }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {destinations.slice(0, 4).map(destination => (
        <DestinationCard 
          key={destination.id}
          destination={destination} 
        />
      ))}
    </div>
  );
}
```

## Development Guidelines

### Adding New Features

1. **Plan First** - Document the feature's purpose and implementation strategy
2. **TypeScript** - Start by defining interfaces and types
3. **Component Structure** - Maintain separation of concerns
4. **Accessibility** - Ensure features are accessible from the beginning
5. **Test** - Add tests for the new feature
6. **Document** - Update this README and add code comments

### Code Style Expectations

- Follow the project's ESLint/Prettier configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components focused and reasonably sized
- Separate state management logic from rendering

### Type Safety Requirements

- Avoid using `any` type
- Define explicit interfaces for component props
- Use type guards to validate data from APIs
- Leverage TypeScript's utility types where appropriate
- Add proper return types for functions

By following these guidelines, you'll help maintain code quality and ensure the destinations page remains robust and accessible.

## Conclusion

The destinations page demonstrates a comprehensive implementation of a modern React component with:

- **TypeScript** - Strong typing and validation for code reliability
- **Accessibility** - WCAG-compliant with keyboard navigation and screen reader support
- **Error Handling** - Robust error recovery paths for all failure modes
- **Performance** - Optimized loading states and transitions
- **Documentation** - Complete implementation and usage documentation

This implementation serves as a reference for other components in the withme.travel application, showcasing patterns for data fetching, error handling, and accessibility that should be applied across the codebase.
