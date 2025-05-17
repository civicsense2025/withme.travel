/**
 * GroupCirclesSection Stories
 * 
 * Storybook stories for the GroupCirclesSection component showcasing different variants.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { GroupCirclesSection } from './GroupCirclesSection';
import { ThemeMode } from '@/utils/constants/design-system';

// ============================================================================
// METADATA
// ============================================================================

const meta: Meta<typeof GroupCirclesSection> = {
  title: 'UI/Features/groups/GroupCirclesSection',
  component: GroupCirclesSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
          The GroupCirclesSection component showcases group travel planning capabilities.
          
          It displays:
          - Multiple interactive group circles
          - Feature callout cards
          - A primary call-to-action button
          
          The component is responsive and supports both light and dark themes.
        `
      }
    }
  },
  argTypes: {
    mode: {
      control: {
        type: 'select',
        options: ['light', 'dark']
      },
      description: 'Theme mode override for the component'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '800px', background: 'var(--background, #fff)' }}>
        <Story />
      </div>
    )
  ]
};

export default meta;

// ============================================================================
// STORIES
// ============================================================================

type Story = StoryObj<typeof GroupCirclesSection>;

/**
 * Default story showing the GroupCirclesSection in light mode
 */
export const Default: Story = {};

/**
 * Dark mode variant of the GroupCirclesSection
 */
export const DarkMode: Story = {
  args: {
    mode: 'dark' as ThemeMode,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '800px', background: 'var(--background, #333)' }}>
        <Story />
      </div>
    )
  ]
};

/**
 * Mobile viewport representation for testing responsive layout
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
};

/**
 * Tablet viewport representation for testing responsive layout
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    }
  }
}; 