import type { Meta, StoryObj } from '@storybook/react';
import { DestinationRelatedItineraries } from './DestinationRelatedItineraries';
import { HttpResponse, http } from 'msw';

// Mock API response for the component
const mockTrips = [
  {
    id: '1',
    name: 'Paris Weekend Getaway',
    startDate: '2023-06-15',
    endDate: '2023-06-18',
    destinationId: 'paris-123',
    destinationName: 'Paris',
    coverImageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    description: 'A romantic weekend in the city of lights with amazing food and culture.',
    publicSlug: 'paris-weekend-123',
    membersCount: 2,
    createdAt: '2023-05-10T10:00:00Z',
  },
  {
    id: '2',
    name: 'Paris Food Tour',
    startDate: '2023-07-10',
    endDate: '2023-07-14',
    destinationId: 'paris-123',
    destinationName: 'Paris',
    coverImageUrl: 'https://images.unsplash.com/photo-1549144511-f099e773c147',
    description: 'Exploring the best bistros, bakeries, and markets Paris has to offer.',
    publicSlug: 'paris-food-456',
    membersCount: 4,
    createdAt: '2023-05-12T14:30:00Z',
  },
];

const meta: Meta<typeof DestinationRelatedItineraries> = {
  title: 'Destinations/Molecules/DestinationRelatedItineraries',
  component: DestinationRelatedItineraries,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [
        http.get('/api/destinations/:destinationId/related-trips', () => {
          return HttpResponse.json({
            trips: mockTrips
          });
        }),
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    destinationId: {
      control: 'text',
      description: 'ID of the destination to fetch related trips for',
    },
    limit: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Maximum number of trips to display',
    },
    title: {
      control: 'text',
      description: 'Title to display above the trips',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[800px] p-6 bg-background">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DestinationRelatedItineraries>;

export const Default: Story = {
  args: {
    destinationId: 'paris-123',
    limit: 4,
    title: 'Related Itineraries',
  },
};

export const CustomTitle: Story = {
  args: {
    destinationId: 'paris-123',
    limit: 4,
    title: 'Popular Paris Trips',
  },
};

export const LimitedResults: Story = {
  args: {
    destinationId: 'paris-123',
    limit: 1,
    title: 'Featured Trip',
  },
}; 