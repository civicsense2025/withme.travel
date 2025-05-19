# withme.travel Component Library

This directory contains all UI components for the withme.travel application. The components are organized by functionality and follow a structured pattern for better maintainability and discoverability.

## Directory Structure

Our component library is organized as follows:

```
components/
  ├── ui/                     # Core UI components
  │   ├── button/             # Button components
  │   │   ├── button.tsx      # Button implementation
  │   │   ├── button.stories.tsx  # Button stories
  │   │   └── utils.ts        # Button utilities
  │   ├── card.tsx            # Card component
  │   ├── dialog.tsx          # Dialog component
  │   └── ...                 # Other UI components
  │
  ├── layout/                 # Layout components
  │   ├── navbar.tsx          # Navigation bar
  │   ├── footer.tsx          # Footer
  │   └── ...                 # Other layout components
  │
  ├── trips/                  # Trip-related components
  │   ├── trip-card.tsx       # Trip card component
  │   ├── trip-details.tsx    # Trip details component
  │   └── ...                 # Other trip components
  │
  ├── destinations/           # Destination-related components
  │   ├── destination-card.tsx # Destination card
  │   └── ...                 # Other destination components
  │
  ├── groups/                 # Group-related components
  │   └── ...                 # Group components
  │
  ├── user/                   # User-related components
  │   └── ...                 # User components
  │
  └── feedback/               # Feedback components
      ├── templates/          # Feedback templates
      │   └── ...             # Template components
      └── ...                 # Other feedback components
```

## Storybook Integration

Each component should have a corresponding `.stories.tsx` file for Storybook documentation. This helps with:

1. Component discovery and exploration
2. Understanding component usage
3. Testing component variations
4. Showing component states

### Adding a New Component to Storybook

To add a new component to Storybook:

1. Create the component file (e.g., `my-component.tsx`)
2. Add a stories file (e.g., `my-component.stories.tsx`)
3. Alternatively, run `pnpm generate-stories` to auto-generate story files

## Component Design Principles

When creating components, follow these principles:

1. **Single Responsibility**: Each component should do one thing well
2. **Composability**: Design components to work together
3. **Reusability**: Components should be reusable across the application
4. **Accessibility**: Ensure components are accessible (keyboard navigation, ARIA attributes)
5. **Performance**: Optimize components for performance (memoization, lazy loading)
6. **Responsive Design**: Components should work across device sizes

## Component File Structure

Each component file should follow this structure:

````tsx
'use client'; // If client component

import React from 'react';
// Import dependencies...

// Component interface
export interface MyComponentProps {
  // Props definition...
}

/**
 * MyComponent - Description of what it does
 *
 * @example
 * ```tsx
 * <MyComponent prop1="value" />
 * ```
 */
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // Component logic...

  return (
    // JSX markup...
  );
}
````

## Styling Guidelines

- Use Tailwind CSS for styling
- Follow the design system's color tokens and spacing
- Use CSS variables for theming (light/dark mode)
- Avoid inline styles
- Use consistent class naming

## Testing Components

All components should have tests:

- Unit tests for logic
- Visual tests via Storybook
- Accessibility tests
- Integration tests for complex components

## Best Practices

1. **Prop Types**: Always define prop types with TypeScript interfaces
2. **Default Props**: Provide sensible defaults when possible
3. **Error Handling**: Include error states and fallbacks
4. **Loading States**: Show loading states for async operations
5. **Documentation**: Add JSDoc comments to explain component purpose and usage
6. **Design System Consistency**: Follow the design system guidelines

## Accessibility

Accessibility is a core principle in our component design. All components should:

1. Follow WCAG 2.1 AA guidelines
2. Support keyboard navigation
3. Work with screen readers
4. Maintain appropriate color contrast
5. Include proper ARIA attributes

### Accessibility Features

#### VisuallyHidden Component

The `VisuallyHidden` component allows content to be hidden visually while remaining accessible to screen readers:

```tsx
import { VisuallyHidden } from '@/components/ui/visually-hidden';

// Usage examples:
<button>
  Save
  <VisuallyHidden> changes to your profile</VisuallyHidden>
</button>

// Or use the CSS class directly
<span className={visuallyHidden}>Screen reader only text</span>
```

#### Todo Component

The `Todo` component has been enhanced with comprehensive accessibility features:

- **Keyboard Navigation**: All actions can be performed via keyboard
- **Screen Reader Announcements**: State changes are announced to screen readers
- **ARIA Attributes**: Proper roles, states, and properties
- **Focus Management**: Predictable focus behavior
- **Semantic HTML**: Using appropriate HTML elements

Example:

```tsx
import { Todo, TodoItem } from '@/components/Todo';

const initialItems: TodoItem[] = [
  {
    id: '1',
    text: 'Book flights',
    completed: false,
    category: 'travel',
    priority: 'high',
  },
  // More items...
];

export function MyComponent() {
  return (
    <Todo
      title="Trip Planning"
      initialItems={initialItems}
      onToggle={async (id, completed) => {
        // Handle toggle action
      }}
    />
  );
}
```

## Component Development Guidelines

When creating or modifying components, follow these guidelines:

### Accessibility Checklist

- [ ] Component is keyboard navigable
- [ ] Interactive elements have appropriate focus styles
- [ ] Color contrast meets WCAG AA standards (4.5:1 for normal text)
- [ ] Proper ARIA roles, states, and properties are used
- [ ] Screen reader announcements for important state changes
- [ ] Hidden content is properly hidden from screen readers when appropriate
- [ ] Touch targets are at least 44×44 pixels

### Code Structure

- Use TypeScript for type safety
- Include JSDoc comments for props
- Provide sensible defaults for optional props
- Export component types for reuse
- Follow the project's naming conventions

### Testing

- Include unit tests for component logic
- Test keyboard navigation and screen reader compatibility
- Add Storybook stories to document component usage

## Available Components

Here's a list of our main components:

### UI Components

- `Button`: Primary action element with variants
- `Input`, `Select`, `Checkbox`: Form controls
- `Card`: Container for grouped content
- `Badge`: Small status indicators

### Specialized Components

- `Todo`: Accessible todo list component with filtering, categories, and priorities
- `DestinationCard`: Card displaying destination information
- `TripCard`: Card displaying trip information

### Layout Components

- `Container`: Responsive container with padding
- `Layout`: Page layout with header and footer

### Accessibility Utilities

- `VisuallyHidden`: Hides content visually but keeps it accessible to screen readers
- `FocusTrap`: Traps focus within a container for modals
- `LiveRegion`: Announces content changes to screen readers

## Contributing

When contributing new components or modifying existing ones:

1. Ensure your component meets our accessibility standards
2. Add comprehensive documentation and examples
3. Include Storybook stories demonstrating various states
4. Run tests to verify functionality
5. Update this README if you add a new section of components
