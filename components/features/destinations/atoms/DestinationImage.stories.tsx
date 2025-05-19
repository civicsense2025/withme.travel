/**
 * Destination Image Stories
 * 
 * Storybook stories for the DestinationImage component
 * 
 * @module destinations/atoms
 */

import type { Meta, StoryObj } from '@storybook/react';
import { DestinationImage } from './DestinationImage';

const meta: Meta<typeof DestinationImage> = {
  title: 'Features/Destinations/Atoms/DestinationImage',
  component: DestinationImage,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    imageUrl: {
      control: 'text',
      description: 'URL of the destination image',
    },
    destinationName: {
      control: 'text',
      description: 'Name of the destination',
    },
    country: {
      control: 'text',
      description: 'Country name for alt text',
    },
    showGradient: {
      control: 'boolean',
      description: 'Whether to show a gradient overlay',
    },
    aspectRatio: {
      control: 'select',
      options: ['aspect-square', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-[16/9]', 'aspect-video'],
      description: 'CSS class for aspect ratio',
    },
    priority: {
      control: 'boolean',
      description: 'Priority loading for LCP images',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    imageMetadata: {
      control: 'object',
      description: 'Metadata for the image including attribution',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DestinationImage>;

// Example image data
const exampleImageMetadata = {
  alt_text: 'Beautiful view of Paris with the Eiffel Tower',
  photographer_name: 'John Smith',
  photographer_url: 'https://example.com/johnsmith',
  source: 'unsplash',
  source_id: 'abc123',
};

export const Default: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    destinationName: 'Paris',
    country: 'France',
    showGradient: true,
    aspectRatio: 'aspect-[4/3]',
    priority: false,
  },
};

export const WithAttribution: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
    destinationName: 'Barcelona',
    country: 'Spain',
    showGradient: true,
    aspectRatio: 'aspect-[4/3]',
    priority: false,
    imageMetadata: exampleImageMetadata,
  },
};

export const WithoutGradient: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1543832923-44667a44c804',
    destinationName: 'Tokyo',
    country: 'Japan',
    showGradient: false,
    aspectRatio: 'aspect-[4/3]',
    priority: false,
  },
};

export const SquareAspectRatio: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1542977466-24d0ecc0c471',
    destinationName: 'New York City',
    country: 'USA',
    showGradient: true,
    aspectRatio: 'aspect-square',
    priority: false,
  },
};

export const PortraitAspectRatio: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1569388330292-79cc1ec67270',
    destinationName: 'Rome',
    country: 'Italy',
    showGradient: true,
    aspectRatio: 'aspect-[3/4]',
    priority: false,
  },
};

export const WithPriority: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2',
    destinationName: 'Amsterdam',
    country: 'Netherlands',
    showGradient: true,
    aspectRatio: 'aspect-[4/3]',
    priority: true,
  },
};

export const WithCustomClasses: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1555952494-efd681c7e3f9',
    destinationName: 'Sydney',
    country: 'Australia',
    showGradient: true,
    aspectRatio: 'aspect-[16/9]',
    priority: false,
    className: 'rounded-lg shadow-xl',
  },
}; 