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
  title: 'Destinations/Atoms/DestinationImage',
  component: DestinationImage,
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
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
    destinationName: 'Paris',
    country: 'France',
    showGradient: true,
    aspectRatio: 'aspect-[4/3]',
    priority: false,
  },
};

export const WithAttribution: Story = {
  args: {
    ...Default.args,
    imageMetadata: exampleImageMetadata,
  },
};

export const WithoutGradient: Story = {
  args: {
    ...Default.args,
    showGradient: false,
  },
};

export const SquareAspectRatio: Story = {
  args: {
    ...Default.args,
    aspectRatio: 'aspect-square',
  },
};

export const PortraitAspectRatio: Story = {
  args: {
    ...Default.args,
    aspectRatio: 'aspect-[3/4]',
  },
};

export const WithPriority: Story = {
  args: {
    ...Default.args,
    priority: true,
  },
};

export const CustomAspectRatio: Story = {
  args: {
    aspectRatio: 'aspect-[16/9]',
  },
};

export const WithCustomStyling: Story = {
  args: {
    className: 'rounded-lg shadow-xl',
  },
};

export const DifferentDestination: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1555952494-efd681c7e3f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    destinationName: 'Tokyo',
    country: 'Japan',
    imageMetadata: {
      alt_text: 'Tokyo skyline with Mt. Fuji in the background',
      attribution: 'Photo by Jane Smith on Unsplash',
      photographer_name: 'Jane Smith',
      photographer_url: 'https://unsplash.com/@janesmith',
      source: 'unsplash',
      source_id: 'def456',
    },
  },
}; 