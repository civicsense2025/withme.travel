/**
 * Destination Card Stories
 * 
 * Storybook stories for the DestinationCard component
 * 
 * @module destinations/molecules
 */

import type { Meta, StoryObj } from '@storybook/react';
import { DestinationCard } from './DestinationCard';

const meta: Meta<typeof DestinationCard> = {
  title: 'Destinations/Molecules/DestinationCard',
  component: DestinationCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  argTypes: {
    onClick: { action: 'clicked' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DestinationCard>;

// Sample destination data
const sampleDestination = {
  id: 'paris-france',
  name: 'Paris',
  city: 'Paris',
  country: 'France',
  byline: 'The City of Light',
  emoji: '🇫🇷',
  image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
  image_metadata: {
    alt_text: 'Eiffel Tower in Paris, France',
    photographer_name: 'John Smith',
    photographer_url: 'https://example.com/johnsmith',
    source: 'unsplash',
    source_id: 'abc123',
  },
};

export const Default: Story = {
  args: {
    destination: sampleDestination,
  },
};

export const WithOnClickHandler: Story = {
  args: {
    destination: sampleDestination,
    onClick: () => console.log('Destination card clicked'),
  },
};

export const WithoutCountry: Story = {
  args: {
    destination: {
      ...sampleDestination,
      country: null,
    },
  },
};

export const WithoutImage: Story = {
  args: {
    destination: {
      ...sampleDestination,
      image_url: null,
    },
  },
};

export const WithCustomClassName: Story = {
  args: {
    destination: sampleDestination,
    className: 'bg-primary-50 border-2 border-primary',
  },
};

export const WithLongName: Story = {
  args: {
    destination: {
      ...sampleDestination,
      name: 'Very Long Destination Name That Could Potentially Overflow',
      city: 'Very Long Destination Name That Could Potentially Overflow',
    },
  },
};

export const Tokyo: Story = {
  args: {
    destination: {
      id: 'tokyo',
      city: 'Tokyo',
      country: 'Japan',
      emoji: '🇯🇵',
      byline: 'Where tradition meets innovation',
      image_url: 'https://images.unsplash.com/photo-1555952494-efd681c7e3f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      image_metadata: {
        photographer_name: 'Jane Smith',
        source: 'unsplash',
      },
    },
  },
};

export const NewYork: Story = {
  args: {
    destination: {
      id: 'new-york',
      city: 'New York',
      country: 'United States',
      emoji: '🇺🇸',
      byline: 'The city that never sleeps',
      image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      image_metadata: {
        photographer_name: 'Michael Brown',
        source: 'unsplash',
      },
    },
  },
};

export const CardGrid: Story = {
  decorators: [
    (Story) => (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Story key={i} />
        ))}
      </div>
    ),
  ],
}; 