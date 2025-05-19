import type { Meta, StoryObj } from '@storybook/react';
import { MapPin } from './MapPin';

const meta: Meta<typeof MapPin> = {
  title: 'Features/Maps/Atoms/MapPin',
  component: MapPin,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MapPin>;

export const Default: Story = {
  args: {
    index: 1,
  },
};

export const Selected: Story = {
  args: {
    index: 2,
    isSelected: true,
  },
};

export const Disabled: Story = {
  args: {
    index: 3,
    disabled: true,
  },
};

export const Primary: Story = {
  args: {
    index: 'A',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    index: 'B',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    index: '!',
    variant: 'danger',
  },
};

export const Success: Story = {
  args: {
    index: '✓',
    variant: 'success',
  },
};

export const Small: Story = {
  args: {
    index: 1,
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    index: 2,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    index: 3,
    size: 'lg',
  },
};

export const PinSequence: Story = {
  render: () => (
    <div className="flex gap-4">
      <MapPin index={1} />
      <MapPin index={2} />
      <MapPin index={3} />
      <MapPin index={4} />
      <MapPin index={5} />
    </div>
  ),
};