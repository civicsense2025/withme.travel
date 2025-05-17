/**
 * Storybook stories for PopularDestinationsGrid
 * Allows visual testing of the grid with mock data and both tooltip and dialog variants.
 */

import React, { useEffect, useState } from 'react';
import { PopularDestinationsGrid, Destination } from './popular-destinations';
import { Meta, StoryObj } from '@storybook/react';
import { StoryContext, StoryFn } from '@storybook/react';

// Type definition for our component props + the dataSource control
interface ExtendedProps {
  destinations: Destination[];
  showDialog?: boolean;
  showPopover?: boolean;
  dataSource?: 'mock' | 'api';
}

// Create a type for our custom meta configuration
type ExtendedMeta = Meta<typeof PopularDestinationsGrid> & {
  argTypes: {
    dataSource: {
      control: 'radio';
      options: string[];
      defaultValue: string;
      description: string;
      table: {
        category: string;
      };
    };
    showDialog: {
      control: 'boolean';
      description: string;
      table: {
        category: string;
      };
    };
    showPopover: {
      control: 'boolean';
      description: string;
      table: {
        category: string;
      };
    };
  };
};

const mockDestinations: Destination[] = [
  {
    id: '1',
    name: 'Tokyo',
    slug: 'tokyo',
    emoji: '🗼',
    byline: 'Japan',
    description: 'A vibrant city blending tradition and technology.',
    highlights: ['Sushi', 'Shibuya Crossing', 'Cherry Blossoms'],
  },
  {
    id: '2',
    name: 'Paris',
    slug: 'paris',
    emoji: '🗼',
    byline: 'France',
    description: 'The city of lights and romance.',
    highlights: ['Eiffel Tower', 'Cafés', 'Museums'],
  },
  {
    id: '3',
    name: 'New York',
    slug: 'new-york',
    emoji: '🗽',
    byline: 'USA',
    description: 'The city that never sleeps.',
    highlights: ['Broadway', 'Central Park', 'Skyscrapers'],
  },
  {
    id: '4',
    name: 'Sydney',
    slug: 'sydney',
    emoji: '🌉',
    byline: 'Australia',
    description: 'Harbor city with iconic landmarks.',
    highlights: ['Opera House', 'Beaches', 'Harbor Bridge'],
  },
  {
    id: '5',
    name: 'Rio',
    slug: 'rio',
    emoji: '🎉',
    byline: 'Brazil',
    description: 'Carnival, beaches, and mountains.',
    highlights: ['Carnival', 'Copacabana', 'Christ the Redeemer'],
  },
  {
    id: '6',
    name: 'London',
    slug: 'london',
    emoji: '🎡',
    byline: 'UK',
    description: 'History, culture, and modern life.',
    highlights: ['Big Ben', 'Museums', 'Pubs'],
  },
  // Add more mock destinations as needed
];

// Decorator for API data
const withApiData = (Story: StoryFn, context: StoryContext<ExtendedProps>) => {
  const [apiDestinations, setApiDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const useApiData = context.args.dataSource === 'api';
  
  useEffect(() => {
    if (useApiData) {
      setLoading(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/destinations/popular`
          : 'http://localhost:3000/api/destinations/popular';
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch destinations');
          }
          return response.json();
        })
        .then(data => {
          setApiDestinations(data.destinations || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching destinations:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [useApiData]);
  
  // If using API data but still loading
  if (useApiData && loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading destinations from API...</div>;
  }
  
  // If using API data but has error
  if (useApiData && error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }
  
  // If using API data and loaded successfully
  if (useApiData) {
    context.args.destinations = apiDestinations;
  }

  return <Story {...context} />;
};

const meta: ExtendedMeta = {
  title: 'UI/Features/trips/popular-destinations',
  component: PopularDestinationsGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [withApiData],
  argTypes: {
    dataSource: {
      control: 'radio',
      options: ['mock', 'api'],
      defaultValue: 'mock',
      description: 'Where to source the destination data from',
      table: {
        category: 'Data',
      }
    },
    showDialog: {
      control: 'boolean',
      description: 'Show dialog when clicked',
      table: {
        category: 'Display',
      }
    },
    showPopover: {
      control: 'boolean',
      description: 'Show popover on hover',
      table: {
        category: 'Display',
      }
    }
  }
};
export default meta;

type Story = StoryObj<typeof PopularDestinationsGrid & { dataSource?: 'mock' | 'api' }>;

export const TooltipVariant: Story = {
  args: {
    destinations: mockDestinations,
    showDialog: false,
    showPopover: false,
    dataSource: 'mock'
  } as ExtendedProps,
  render: (args) => <PopularDestinationsGrid 
    destinations={args.destinations} 
    showDialog={args.showDialog} 
    showPopover={args.showPopover} 
  />,
};

export const DialogVariant: Story = {
  args: {
    destinations: mockDestinations,
    showDialog: true,
    showPopover: false,
    dataSource: 'mock'
  } as ExtendedProps,
  render: (args) => <PopularDestinationsGrid 
    destinations={args.destinations} 
    showDialog={args.showDialog} 
    showPopover={args.showPopover} 
  />,
};

export const PopoverVariant: Story = {
  args: {
    destinations: mockDestinations,
    showDialog: false,
    showPopover: true,
    dataSource: 'mock'
  } as ExtendedProps,
  render: (args) => <PopularDestinationsGrid 
    destinations={args.destinations} 
    showDialog={args.showDialog} 
    showPopover={args.showPopover} 
  />,
  parameters: {
    docs: {
      description: {
        story: 'Hover over a destination to see details and quickly create a trip with one click.',
      },
    },
  },
};

export const RealApiData: Story = {
  args: {
    destinations: [],
    showDialog: false,
    showPopover: true,
    dataSource: 'api'
  } as ExtendedProps,
  render: (args) => <PopularDestinationsGrid 
    destinations={args.destinations} 
    showDialog={args.showDialog} 
    showPopover={args.showPopover} 
  />,
  parameters: {
    docs: {
      description: {
        story: 'Loads real destination data from the API.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    destinations: [],
    showDialog: false,
    showPopover: false,
    dataSource: 'mock'
  } as ExtendedProps,
  render: () => <div className="p-4 text-center text-muted-foreground">Loading destinations...</div>,
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state when destinations are being fetched.',
      },
    },
  },
}; 