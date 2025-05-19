import type { Meta, StoryObj } from '@storybook/react';
import { MapMarker } from './MapMarker';
import { Hotel, Utensils, Plane, Train, Camera } from 'lucide-react';

const meta: Meta<typeof MapMarker> = {
  title: 'Features/Maps/Atoms/MapMarker',
  component: MapMarker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MapMarker>;

export const Default: Story = {
  args: {
    label: 'Destination',
  },
};

export const Selected: Story = {
  args: {
    label: 'Destination',
    isSelected: true,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Golden Gate Bridge',
    showLabel: true,
  },
};

export const Primary: Story = {
  args: {
    label: 'Destination',
    variant: 'primary',
    showLabel: true,
  },
};

export const Danger: Story = {
  args: {
    label: 'Danger Zone',
    variant: 'danger',
    showLabel: true,
  },
};

export const Success: Story = {
  args: {
    label: 'Visited',
    variant: 'success',
    showLabel: true,
  },
};

export const Highlighted: Story = {
  args: {
    label: 'New Location',
    isHighlighted: true,
    showLabel: true,
  },
};

export const WithCustomIcon: Story = {
  args: {
    label: 'Hotel',
    showLabel: true,
    icon: <Hotel className="h-6 w-6" />,
  },
};

export const MarkerVariations: Story = {
  render: () => (
    <div className="flex gap-8">
      <MapMarker label="Restaurant" showLabel icon={<Utensils className="h-6 w-6" />} />
      <MapMarker label="Airport" showLabel icon={<Plane className="h-6 w-6" />} />
      <MapMarker label="Train Station" showLabel icon={<Train className="h-6 w-6" />} />
      <MapMarker label="Attraction" showLabel icon={<Camera className="h-6 w-6" />} />
    </div>
  ),
};