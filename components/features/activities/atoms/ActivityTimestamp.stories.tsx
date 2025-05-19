import type { Meta, StoryObj } from '@storybook/react';
import { ActivityTimestamp } from './ActivityTimestamp';

const meta: Meta<typeof ActivityTimestamp> = {
  title: 'Features/Activities/Atoms/ActivityTimestamp',
  component: ActivityTimestamp,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    timestamp: {
      control: 'date',
      description: 'The timestamp to display',
    },
    format: {
      control: 'select',
      options: ['relative', 'absolute', 'short', 'full'],
      description: 'Format of the timestamp display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityTimestamp>;

// Current timestamp
const now = new Date();
// An hour ago
const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
// A day ago
const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
// A week ago
const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
// A month ago
const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

export const Relative: Story = {
  args: {
    timestamp: hourAgo.toISOString(),
    format: 'relative',
  },
};

export const Absolute: Story = {
  args: {
    timestamp: hourAgo.toISOString(),
    format: 'absolute',
  },
};

export const JustNow: Story = {
  args: {
    timestamp: now.toISOString(),
    format: 'relative',
  },
};

export const AnHourAgo: Story = {
  args: {
    timestamp: hourAgo.toISOString(),
    format: 'relative',
  },
};

export const ADayAgo: Story = {
  args: {
    timestamp: dayAgo.toISOString(),
    format: 'relative',
  },
};

export const AWeekAgo: Story = {
  args: {
    timestamp: weekAgo.toISOString(),
    format: 'relative',
  },
};

export const AMonthAgo: Story = {
  args: {
    timestamp: monthAgo.toISOString(),
    format: 'relative',
  },
};

export const FullFormat: Story = {
  args: {
    timestamp: now.toISOString(),
    format: 'full',
  },
};

export const ShortFormat: Story = {
  args: {
    timestamp: now.toISOString(),
    format: 'short',
  },
}; 