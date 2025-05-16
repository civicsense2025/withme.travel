/**
 * GroupCirclesSection.stories.tsx
 *
 * Storybook stories for the GroupCirclesSection component.
 * Showcases interactive group circles, animated member avatars, and group detail panel.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import type { Meta, StoryObj } from '@storybook/react';
import { CATEGORIES } from './ui/storybook.config';
import { GroupCirclesSection } from './GroupCirclesSection';

// ============================================================================
// STORYBOOK METADATA
// ============================================================================

/**
 * ## Group Circles Section
 * 
 * A playful, animated section for visualizing group travel circles and collaborative planning.
 * 
 * ### Usage Guidelines
 * - Use on the homepage to showcase collaborative planning features
 * - Ensure there's enough vertical space for the animations
 * - Consider performance impacts when using multiple instances
 */
const meta: Meta<typeof GroupCirclesSection> = {
  title: CATEGORIES.ORGANISMS + '/GroupCirclesSection',
  component: GroupCirclesSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    componentSubtitle: 'Interactive visualization of travel planning groups',
    docs: {
      description: {
        component:
          'A playful, animated section for visualizing group travel circles and collaborative planning. Click a group to expand and interact with members.',
      },
    },
  },
  argTypes: {
    mode: {
      description: 'The color mode for the component',
      control: 'radio',
      options: ['light', 'dark'],
      defaultValue: 'light',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'light' },
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof GroupCirclesSection>;

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default light mode version with standard configuration
 */
export const Default: Story = {
  args: {
    mode: 'light'
  },
};

/**
 * Dark mode variation that can be used on dark backgrounds
 */
export const DarkMode: Story = {
  args: {
    mode: 'dark'
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-900 min-h-[600px] w-full">
        <Story />
      </div>
    )
  ]
}; 