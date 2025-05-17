import type { Meta, StoryObj } from '@storybook/react';
import { TripStatusBadge } from './TripStatusBadge';

const meta: Meta<typeof TripStatusBadge> = {
  title: 'Trips/Atoms/TripStatusBadge',
  component: TripStatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['planning', 'active', 'completed', 'past', 'upcoming'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showIcon: {
      control: 'boolean',
    },
    solid: {
      control: 'boolean',
    },
    pill: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TripStatusBadge>;

export const Planning: Story = {
  args: {
    status: 'planning',
    size: 'md',
    showIcon: true,
    solid: false,
    pill: true,
  },
};

export const Active: Story = {
  args: {
    ...Planning.args,
    status: 'active',
  },
};

export const Completed: Story = {
  args: {
    ...Planning.args,
    status: 'completed',
  },
};

export const Past: Story = {
  args: {
    ...Planning.args,
    status: 'past',
  },
};

export const Upcoming: Story = {
  args: {
    ...Planning.args,
    status: 'upcoming',
  },
};

export const Solid: Story = {
  args: {
    ...Planning.args,
    solid: true,
  },
};

export const Small: Story = {
  args: {
    ...Planning.args,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    ...Planning.args,
    size: 'lg',
  },
};

export const NoIcon: Story = {
  args: {
    ...Planning.args,
    showIcon: false,
  },
};

export const Rectangular: Story = {
  args: {
    ...Planning.args,
    pill: false,
  },
};

export const CustomLabel: Story = {
  args: {
    ...Planning.args,
    label: 'In progress',
  },
};

// A collection of all statuses in a group
export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <TripStatusBadge status="planning" />
      <TripStatusBadge status="active" />
      <TripStatusBadge status="completed" />
      <TripStatusBadge status="past" />
      <TripStatusBadge status="upcoming" />
    </div>
  ),
};

// Same with solid style
export const AllSolidStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <TripStatusBadge status="planning" solid />
      <TripStatusBadge status="active" solid />
      <TripStatusBadge status="completed" solid />
      <TripStatusBadge status="past" solid />
      <TripStatusBadge status="upcoming" solid />
    </div>
  ),
}; 