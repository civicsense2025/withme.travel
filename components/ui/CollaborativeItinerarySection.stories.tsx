import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CollaborativeItinerarySection } from './CollaborativeItinerarySection';

const meta: Meta<typeof CollaborativeItinerarySection> = {
  title: 'Product Marketing/CollaborativeItinerarySection',
  component: CollaborativeItinerarySection,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A collaborative itinerary section demo with real-time voting, avatars, and typing indicator. Fully themeable and design-system compliant.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CollaborativeItinerarySection>;

export const Default: Story = {
  render: () => <CollaborativeItinerarySection />,
  parameters: {
    docs: {
      description: {
        story: 'Default collaborative itinerary section in light mode.',
      },
    },
  },
};

export const DarkMode: Story = {
  args: { mode: 'dark' },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Collaborative itinerary section in dark mode.',
      },
    },
  },
};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
