import type { Meta, StoryObj } from '@storybook/react';
import { DestinationReviews } from './DestinationReviews';
import { HttpResponse, http } from 'msw';

// Mock data for the reviews
const mockReviews = [
  {
    id: '1',
    userId: 'user-123',
    userName: 'Emily Johnson',
    userAvatar: 'https://randomuser.me/api/portraits/women/42.jpg',
    rating: 5,
    content: 'Absolutely loved this destination! The food was amazing and the local people were so friendly. The architecture was breathtaking, especially during sunset. Would definitely recommend visiting during spring when the weather is perfect.',
    date: '2023-05-15T10:30:00Z',
    helpful: 24,
    tags: ['Food', 'Architecture', 'Culture']
  },
  {
    id: '2',
    userId: 'user-456',
    userName: 'Michael Chen',
    userAvatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    rating: 4,
    content: 'Great experience overall. The beaches were clean and beautiful. Only giving 4 stars because some of the tourist attractions were a bit overpriced, but still worth visiting. The nightlife was fantastic!',
    date: '2023-04-20T14:15:00Z',
    helpful: 18,
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206'
    ],
    tags: ['Beaches', 'Nightlife']
  },
  {
    id: '3',
    userId: 'user-789',
    userName: 'Sarah Miller',
    rating: 3,
    content: 'Mixed feelings about this place. While the historical sites were fascinating, the crowds were overwhelming. Try to visit during off-season if possible. The local cuisine was delightful though!',
    date: '2023-03-10T09:45:00Z',
    helpful: 12,
    tags: ['History', 'Food']
  },
  {
    id: '4',
    userId: 'user-101',
    userName: 'David Wilson',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    content: 'One of the best travel experiences I\'ve ever had! The hiking trails offered stunning views and the local markets were filled with unique treasures. Don\'t miss the sunrise from Mount Vista - absolutely magical!',
    date: '2023-06-05T16:20:00Z',
    helpful: 35,
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
      'https://images.unsplash.com/photo-1519331379826-f10be5486c6f',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470'
    ],
    tags: ['Hiking', 'Nature', 'Markets']
  },
  {
    id: '5',
    userId: 'user-102',
    userName: 'Olivia Brown',
    rating: 4,
    content: 'We had a wonderful family vacation here. The kids loved the activities and we enjoyed the relaxing atmosphere. Some of the restaurants were a bit expensive, but the food quality was excellent.',
    date: '2023-05-28T11:10:00Z',
    helpful: 19,
    tags: ['Family', 'Relaxation']
  }
];

const meta: Meta<typeof DestinationReviews> = {
  title: 'Destinations/Molecules/DestinationReviews',
  component: DestinationReviews,
  parameters: {
    layout: 'padded',
    msw: {
      handlers: [
        http.get('/api/destinations/:destinationId/reviews', () => {
          return HttpResponse.json({
            reviews: mockReviews
          });
        }),
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    destinationId: {
      control: 'text',
      description: 'ID of the destination to fetch reviews for',
    },
    initialLimit: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Initial number of reviews to display',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-4xl bg-background p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DestinationReviews>;

export const Default: Story = {
  args: {
    destinationId: 'paris-123',
    initialLimit: 3,
  },
};

export const ShowAllReviews: Story = {
  args: {
    destinationId: 'paris-123',
    initialLimit: 10, // Higher than the number of available reviews
  },
};

export const LimitedInitialDisplay: Story = {
  args: {
    destinationId: 'paris-123',
    initialLimit: 1,
  },
}; 