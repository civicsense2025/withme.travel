import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryCard } from './ItineraryCard';
import { Globe } from 'lucide-react';

const meta: Meta<typeof ItineraryCard> = {
  title: 'Features/ItineraryCard',
  component: ItineraryCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    travelerCount: { control: { type: 'number', min: 0, max: 100 } },
    onClick: { action: 'clicked' },
    imageUrl: { control: 'text' },
    location: { control: 'text' },
    duration: { control: 'text' },
    href: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ItineraryCard>;

export const Basic: Story = {
  args: {
    title: 'Weekend Getaway',
    description: 'A quick escape from the city with plenty of nature and relaxation.',
    travelerCount: 3,
    icon: <Globe className="h-5 w-5 text-blue-500" />,
  },
};

export const WithImage: Story = {
  args: {
    title: 'Paris Explorer',
    description:
      'Experience the City of Light with this comprehensive itinerary covering all the major attractions and hidden gems.',
    travelerCount: 2,
    location: 'Paris, France',
    duration: '5 days',
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    href: '#',
  },
};

export const NoDescription: Story = {
  args: {
    title: 'Beach Vacation',
    travelerCount: 4,
    location: 'Bali, Indonesia',
    duration: '7 days',
    imageUrl:
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc32?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
};

export const WithLink: Story = {
  args: {
    title: 'Mountain Trek',
    description: 'Challenging hikes with breathtaking views at every turn.',
    travelerCount: 2,
    location: 'Swiss Alps',
    duration: '4 days',
    imageUrl:
      'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    href: '/itineraries/mountain-trek',
  },
};

export const Grid: Story = {
  render: () => (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      style={{ maxWidth: '1000px' }}
    >
      <ItineraryCard
        title="Tokyo Adventure"
        description="Explore the fascinating blend of traditional and modern in Japan's capital."
        travelerCount={2}
        location="Tokyo, Japan"
        duration="6 days"
        imageUrl="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        href="#"
      />
      <ItineraryCard
        title="New York City"
        description="The city that never sleeps offers endless entertainment and cultural experiences."
        travelerCount={4}
        location="New York, USA"
        duration="4 days"
        imageUrl="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        href="#"
      />
      <ItineraryCard
        title="Santorini Escape"
        description="Relax on beautiful beaches and enjoy stunning Mediterranean views."
        travelerCount={2}
        location="Santorini, Greece"
        duration="5 days"
        imageUrl="https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        href="#"
      />
    </div>
  ),
};

export const LightMode: Story = {
  args: {
    title: 'Weekend Getaway',
    description: 'A quick escape from the city with plenty of nature and relaxation.',
    travelerCount: 3,
    icon: <Globe className="h-5 w-5 text-blue-500" />,
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: { description: { story: 'ItineraryCard in light mode.' } },
  },
};

export const DarkMode: Story = {
  args: {
    title: 'Weekend Getaway',
    description: 'A quick escape from the city with plenty of nature and relaxation.',
    travelerCount: 3,
    icon: <Globe className="h-5 w-5 text-blue-300" />,
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'ItineraryCard in dark mode.' } },
  },
};
