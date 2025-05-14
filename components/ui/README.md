# UI Components & Storybook Guide

This directory contains all of our shared UI components and their corresponding Storybook stories.

## Storybook Organization

Our Storybook is organized into five main sections:

1. **Design System**: Core foundations - colors, typography, spacing, theme
2. **Core UI**: Reusable, atomic UI components (Button, Input, Card, etc.)
3. **Features**: Feature-specific components (TripCard, ItineraryCard, etc.)
4. **Product Marketing**: Components for marketing/landing pages
5. **App Layout**: Navigation, layouts, and containers

## Running Storybook

To run Storybook locally:

```bash
pnpm storybook
```

This will start Storybook on [http://localhost:6006](http://localhost:6006).

## Creating New Components

When adding new components:

1. Create your component file in the appropriate directory:

   - Base UI components: `components/ui/`
   - Feature-specific components: in their feature directory or `components/features/`
   - Layout components: `components/layout/`

2. Follow our component structure:

   ```tsx
   'use client';

   import React from 'react';
   import { cn } from '@/lib/utils';

   export interface MyComponentProps {
     className?: string;
     children?: React.ReactNode;
     // Add other props...
   }

   export function MyComponent({
     className,
     children,
     // Destructure other props...
   }: MyComponentProps) {
     return <div className={cn('base-classes', className)}>{children}</div>;
   }
   ```

3. Export the component from `components/ui/index.ts` if appropriate

## Adding Storybook Stories

For each component, create a `.stories.tsx` file with the same name:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Category/MyComponent', // Place in the correct category
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define controls for your props
  },
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    // Default props
  },
};

// Add additional variants/stories
export const Alternate: Story = {
  args: {
    // Different props
  },
};
```

### Category Naming

Use the appropriate title prefix based on the component type:

- `Design System/...` - For foundational elements
- `Core UI/...` - For basic UI components
- `Features/...` - For feature-specific components
- `Product Marketing/...` - For marketing components
- `App Layout/...` - For layout and structural components

### Story Variants

Include stories for:

- Default state
- Different prop combinations
- Important variants
- Edge cases (e.g., overflow, empty states)
- Dark mode (if has meaningful differences)

## Component Documentation

Use JSDoc comments to document your components:

```tsx
/**
 * Component for displaying a card with consistent styling.
 * @example
 * <Card>
 *   <CardHeader>Title</CardHeader>
 *   <CardContent>Content</CardContent>
 * </Card>
 */
export interface CardProps {
  /** Additional class names */
  className?: string;
  /** Card contents */
  children: React.ReactNode;
  /** Makes the card more visually prominent */
  elevated?: boolean;
}
```

## Guidelines for Consistent Components

- **Always use design tokens** for colors, spacing, typography
- **Support dark mode** by using CSS variables or the `useTheme` hook
- **Make components responsive** by default
- **Keep components focused** - prefer composition over complex, monolithic components
- **Use TypeScript** for type safety and better docs
- **Avoid hardcoding content** - prefer props for all content
- **Consider accessibility**: keyboard navigation, ARIA attributes, color contrast

## Storybook Controls & Args

Take advantage of Storybook's controls:

```tsx
// In your Meta definition:
argTypes: {
  variant: {
    control: 'select',
    options: ['default', 'primary', 'outline'],
    description: 'The visual style of the button',
  },
  size: {
    control: 'radio',
    options: ['sm', 'md', 'lg'],
    description: 'The size of the button',
  },
  disabled: {
    control: 'boolean',
    description: 'Whether the button is disabled',
  },
},
```

## Testing Components

Components should be tested in Storybook before use:

1. Visual testing: Check all states/variants
2. Responsive testing: Test mobile, tablet, and desktop views
3. Dark mode testing: Verify appearance in both light/dark modes
4. Interaction testing: Ensure clicks, hovers, and focus states work
5. Accessibility testing: Use the a11y addon to check for issues

## Getting Help

If you have questions about our UI components or Storybook setup, contact the design system team.
