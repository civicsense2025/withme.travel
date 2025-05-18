/**
 * Trip Image Stories
 * 
 * Storybook stories for the TripImage component
 * 
 * @module trips/atoms
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TripImage } from './TripImage';

const meta: Meta<typeof TripImage> = {
  title: 'Trips/Atoms/TripImage',
  component: TripImage,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  argTypes: {
    imageUrl: {
      control: 'text',
      description: 'URL of the trip image',
    },
    tripName: {
      control: 'text',
      description: 'Name of the trip',
    },
    showGradient: {
      control: 'boolean',
      description: 'Whether to show a gradient overlay',
    },
    isPublic: {
      control: 'boolean',
      description: 'Whether the trip is public',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TripImage>;

export const Default: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
    tripName: 'European Getaway',
    showGradient: true,
    isPublic: true,
  },
};

export const WithoutGradient: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
    tripName: 'European Getaway',
    showGradient: false,
    isPublic: true,
  },
};

export const Private: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
    tripName: 'European Getaway',
    showGradient: true,
    isPublic: false,
  },
};

export const NoPrivacyBadge: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
    tripName: 'European Getaway',
    showGradient: true,
  },
};

export const SquareAspectRatio: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
    tripName: 'European Getaway',
    aspectRatio: 'aspect-square',
    showGradient: true,
    isPublic: true,
  },
}; 