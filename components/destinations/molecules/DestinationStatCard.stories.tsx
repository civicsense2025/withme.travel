import type { Meta, StoryObj } from '@storybook/react';
import { Utensils, Music, Camera, Waves, DollarSign, Shield } from 'lucide-react';
import { DestinationStatCard } from './DestinationStatCard';

const meta: Meta<typeof DestinationStatCard> = {
  title: 'Destinations/Molecules/DestinationStatCard',
  component: DestinationStatCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Cuisine Rating',
    value: '4.8/5',
    icon: <Utensils className="h-full w-full" />,
    size: 'md',
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DestinationStatCard>;

export const Default: Story = {
  args: {},
};

export const CostPerDay: Story = {
  args: {
    label: 'Average Cost Per Day',
    value: '$150',
    description: 'Including accommodations, food, and attractions',
    icon: <DollarSign className="h-full w-full" />,
    trend: 'neutral',
  },
};

export const CulturalRating: Story = {
  args: {
    label: 'Cultural Attractions',
    value: '4.9/5',
    description: 'Museums, historic sites, architecture',
    icon: <Camera className="h-full w-full" />,
    trend: 'up',
    size: 'md',
  },
};

export const NightlifeRating: Story = {
  args: {
    label: 'Nightlife',
    value: '4.5/5',
    description: 'Vibrant bar and club scene',
    icon: <Music className="h-full w-full" />,
    trend: 'neutral',
    size: 'md',
  },
};

export const BeachQuality: Story = {
  args: {
    label: 'Beach Quality',
    value: '3.2/5',
    description: 'Limited beaches in the city',
    icon: <Waves className="h-full w-full" />,
    trend: 'down',
    size: 'md',
  },
};

export const SafetyRating: Story = {
  args: {
    label: 'Safety Rating',
    value: '4.7/5',
    description: 'Low crime rate, safe for tourists',
    icon: <Shield className="h-full w-full" />,
    trend: 'up',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    label: 'Cost Per Day',
    value: '$120',
    size: 'sm',
    icon: <DollarSign className="h-full w-full" />,
  },
};

export const Large: Story = {
  args: {
    label: 'Cultural Rating',
    value: '4.9/5',
    description: 'World-class museums and attractions',
    size: 'lg',
    icon: <Camera className="h-full w-full" />,
    trend: 'up',
  },
}; 