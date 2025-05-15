/**
 * GroupCirclesSection.stories.tsx
 *
 * Storybook stories for the GroupCirclesSection component.
 * Showcases interactive group circles, animated member avatars, and group detail panel.
 *
 * @module components/GroupCirclesSection.stories
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import { GroupCirclesSection } from './GroupCirclesSection';
import type { Meta, StoryObj } from '@storybook/react';

// ============================================================================
// STORYBOOK METADATA
// ============================================================================

const meta: Meta<typeof GroupCirclesSection> = {
  title: 'Home/GroupCirclesSection',
  component: GroupCirclesSection,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f8fafc' },
        { name: 'dark', value: '#18181b' },
      ],
    },
    docs: {
      description: {
        component:
          'A playful, animated section for visualizing group travel circles and collaborative planning. Click a group to expand and interact with members.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof GroupCirclesSection>;

// ============================================================================
// DEFAULT STORY
// ============================================================================

export const Default: Story = {
  render: () => <GroupCirclesSection />,
  name: 'Default (Light Mode)',
};

// ============================================================================
// DARK MODE STORY
// ============================================================================

export const DarkMode: Story = {
  render: () => <div style={{ background: '#18181b', minHeight: '100vh', padding: 0 }}>
    <GroupCirclesSection mode="dark" />
  </div>,
  name: 'Dark Mode',
  parameters: {
    backgrounds: { default: 'dark' },
  },
}; 