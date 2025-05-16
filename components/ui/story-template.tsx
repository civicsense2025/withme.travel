/**
 * Story Template
 * 
 * This is a template for creating consistent Storybook stories.
 * Copy this file and modify it when creating a new story.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CATEGORIES } from './storybook.config';

// Import your component
import { Button } from './atoms/Button';

/**
 * ## Button Component
 * 
 * A versatile button component that supports various styles and states.
 * 
 * ### Usage Guidelines
 * - Use primary buttons for main actions
 * - Use secondary buttons for alternative actions
 * - Limit the number of primary buttons on a page
 */
const meta: Meta<typeof Button> = {
  title: CATEGORIES.ATOMS + '/Button',  // Format: [Category]/[Component]
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    // Component-specific parameters
    componentSubtitle: 'Interactive button component',
    docs: {
      description: {
        component: 'A versatile button component that supports various styles and states.'
      }
    }
  },
  // Define common props/args with defaults
  args: {
    children: 'Button Text',
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
  // Define argTypes to control how args are displayed in controls panel
  argTypes: {
    variant: {
      description: 'The visual style of the button',
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      }
    },
    size: {
      description: 'The size of the button',
      control: 'select',
      options: ['sm', 'md', 'lg'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' },
      }
    },
    onClick: { action: 'clicked' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * Default button with primary styling
 */
export const Default: Story = {
  args: {
    children: 'Primary Button',
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
 * Disabled button state
 */
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

/**
 * Different button sizes
 */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Button {...args} size="sm">Small Button</Button>
      <Button {...args}>Medium Button</Button>
      <Button {...args} size="lg">Large Button</Button>
    </div>
  ),
};

/**
 * Button with icon
 */
export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
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
        className="mr-2"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
      Button with Icon
    </Button>
  ),
}; 