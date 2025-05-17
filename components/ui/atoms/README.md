# Core UI Atoms

Atoms are the smallest, indivisible UI components in our design system. They are the fundamental building blocks from which all other UI elements are composed.

## Characteristics of Atoms

- **Small and focused**: They serve a single purpose
- **Indivisible**: Cannot be broken down into smaller functional components
- **Reusable**: Used across multiple features and components
- **Generic**: Not tied to specific domain logic
- **No dependencies**: Should not depend on other components (except for icons)
- **Stateless** (mostly): Generally have minimal internal state

## Examples of Atoms

- Buttons
- Input fields
- Icons
- Badges
- Labels
- Typography elements
- Toggles
- Checkboxes
- Radio buttons
- Loading spinners
- Static content containers

## Directory Structure

```
atoms/
├── Button.tsx         # Button component
├── Button.stories.tsx # Button stories
├── Input.tsx          # Input component
├── Input.stories.tsx  # Input stories
├── index.ts           # Exports all atom components
└── README.md          # This file
```

## Creating Atom Components

When creating an atom component:

1. **Keep it simple**: Focus on a single responsibility
2. **Use design tokens**: For colors, spacing, typography, shadows, etc.
3. **Make it accessible**: Follow WCAG guidelines
4. **Support customization**: Accept className props for custom styling
5. **Document props**: Use TypeScript and JSDoc comments
6. **Create stories**: Document all states and variations

## Component Template

```tsx
/**
 * Button component for triggering actions
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Makes the button fill the width of its container */
  fullWidth?: boolean;
}

/**
 * Button component for triggering actions
 */
export function Button({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'button-base',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Storybook

Create comprehensive stories for each atom:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { CATEGORIES } from '../storybook.config';

const meta: Meta<typeof Button> = {
  title: CATEGORIES.CORE.ATOMS + '/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

// Include stories for all variants and states
```

## Do's and Don'ts

### Do's

- ✅ Keep atoms simple and focused
- ✅ Use TypeScript interfaces for props
- ✅ Support theme variants (light/dark)
- ✅ Make components accessible
- ✅ Use design tokens for styling
- ✅ Document all props

### Don'ts

- ❌ Include domain-specific logic
- ❌ Depend on complex state management
- ❌ Include data fetching logic
- ❌ Create large, complex components
- ❌ Hardcode design values (colors, spacing, etc.)
- ❌ Create atoms that depend on other components (except icons) 