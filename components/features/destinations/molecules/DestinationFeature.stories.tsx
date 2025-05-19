import type { Meta, StoryObj } from '@storybook/react';
import { MapPin, Globe, Calendar, Utensils, Music, Camera, Briefcase, Waves } from 'lucide-react';
import { DestinationFeature } from './DestinationFeature';

const meta: Meta<typeof DestinationFeature> = {
  title: 'Destinations/Molecules/DestinationFeature',
  component: DestinationFeature,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    icon: <MapPin className="h-5 w-5" />,
    title: 'Location',
    description: 'Paris, France',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DestinationFeature>;

export const Default: Story = {
  args: {},
};

export const BestSeason: Story = {
  args: {
    icon: <Calendar className="h-5 w-5" />,
    title: 'Best Season',
    description: 'Spring (April-June) & Fall (September-October)',
  },
};

export const Cuisine: Story = {
  args: {
    icon: <Utensils className="h-5 w-5" />,
    title: 'Cuisine',
    description: 'World-class dining scene with 4.8/5 rating',
    accentColor: 'bg-amber-500',
  },
};

export const Nightlife: Story = {
  args: {
    icon: <Music className="h-5 w-5" />,
    title: 'Nightlife',
    description: 'Vibrant bar and club scene with 4.5/5 rating',
    accentColor: 'bg-purple-500',
  },
};

export const Attractions: Story = {
  args: {
    icon: <Camera className="h-5 w-5" />,
    title: 'Cultural Attractions',
    description: 'Museums, historic sites, architecture with 4.9/5 rating',
    accentColor: 'bg-red-500',
  },
};

export const BeachQuality: Story = {
  args: {
    icon: <Waves className="h-5 w-5" />,
    title: 'Beach Quality',
    description: 'Pristine sand, clear water with 4.7/5 rating',
    accentColor: 'bg-cyan-500',
  },
};

export const BusinessTravel: Story = {
  args: {
    icon: <Briefcase className="h-5 w-5" />,
    title: 'Business Travel',
    description: 'Major business hub with excellent facilities and 4.6/5 rating',
    accentColor: 'bg-gray-700',
  },
}; 