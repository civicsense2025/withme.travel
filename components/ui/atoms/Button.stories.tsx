/**
 * Button Stories
 *
 * Showcases the Button component with various styles and states.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import type { Meta, StoryObj } from '@storybook/react';
import { CATEGORIES } from '../storybook.config';
import { Button } from './Button';

// ============================================================================
// STORYBOOK METADATA
// ============================================================================

/**
 * ## Button Component
 * 
 * A versatile button component that serves as a primary interactive element.
 * 
 * ### Usage Guidelines
 * - Use primary buttons for main actions
 * - Use secondary buttons for alternative actions
 * - Use outline buttons for less important actions
 * - Use ghost buttons for inline actions
 * - Limit the number of primary buttons on a page
 */
const meta: Meta<typeof Button> = {
  title: CATEGORIES.ATOMS + '/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    componentSubtitle: 'Interactive button component',
    docs: {
      description: {
        component: 'A versatile button component that serves as a primary interactive element.'
      }
    }
  },
  args: {
    children: 'Button Text',
    variant: 'default',
    size: 'default',
    disabled: false,
    isLoading: false,
  },
  argTypes: {
    variant: {
      description: 'The visual style of the button',
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'link', 'danger'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      }
    },
    size: {
      description: 'The size of the button',
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      }
    },
    fullWidth: {
      description: 'Whether the button takes the full width of its container',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      }
    },
    isLoading: {
      description: 'Whether to show a loading indicator',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      }
    },
    startIcon: {
      description: 'Icon displayed before the button text',
      control: false,
    },
    endIcon: {
      description: 'Icon displayed after the button text',
      control: false,
    },
    onClick: { action: 'clicked' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default button with primary styling
 */
export const Default: Story = {
  args: {
    children: 'Default Button',
  },
};

/**
 * Secondary button variant
 */
export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

/**
 * Outline button variant
 */
export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

/**
 * Ghost button variant
 */
export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

/**
 * Link button variant
 */
export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

/**
 * Danger button variant
 */
export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
  },
};

/**
 * Disabled button state
 */
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

/**
 * Loading button state
 */
export const Loading: Story = {
  args: {
    children: 'Loading Button',
    isLoading: true,
  },
};

/**
 * Different button sizes
 */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Button {...args} size="sm">Small Button</Button>
      <Button {...args}>Default Button</Button>
      <Button {...args} size="lg">Large Button</Button>
    </div>
  ),
};

/**
 * Button with icon
 */
export const WithIcon: Story = {
  render: (args) => (
    <Button 
      {...args} 
      startIcon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      }
    >
      Button with Icon
    </Button>
  ),
};

/**
 * Full width button
 */
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
}; 