/**
 * ThemeToggle Stories
 *
 * Showcases the ThemeToggle component for switching between light and dark modes.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './ThemeToggle';

// ============================================================================
// STORYBOOK METADATA
// ============================================================================

/**
 * ## ThemeToggle Component
 * 
 * A toggle button that switches between light and dark themes with animation.
 * 
 * ### Usage Guidelines
 * - Use in navigation bars or settings pages to allow users to switch themes
 * - Ensure the component has sufficient contrast in both light and dark modes
 * - Place in a consistent location across pages
 */
const meta: Meta<typeof ThemeToggle> = {
  title: 'Atoms/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    componentSubtitle: 'Theme switching control with animated icons',
    docs: {
      description: {
        component: 'A toggle button that allows users to switch between light and dark themes with a smooth animation.'
      }
    }
  },
  args: {
    emojiOnly: false,
    variant: 'ghost',
  },
  argTypes: {
    variant: {
      description: 'The visual style of the button',
      control: 'radio',
      options: ['ghost', 'outline'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'ghost' },
      }
    },
    emojiOnly: {
      description: 'Whether to show only emoji without text',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      }
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default ThemeToggle with ghost styling
 */
export const Default: Story = {};

/**
 * Outline variant for more visual prominence
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
  },
};

/**
 * Multiple theme toggles side by side
 */
export const ThemeToggles: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <ThemeToggle variant="ghost" />
      <ThemeToggle variant="outline" />
    </div>
  ),
}; 