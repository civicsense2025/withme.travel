/**
 * Trip Info Stories
 * 
 * Storybook stories for the TripInfo component
 * 
 * @module trips/atoms
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TripInfo } from './TripInfo';

const meta: Meta<typeof TripInfo> = {
  title: 'Trips/Atoms/TripInfo',
  component: TripInfo,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  argTypes: {
    location: {
      control: 'text',
      description: 'Location of the trip',
    },
    dateRange: {
      control: 'text',
      description: 'Formatted date range',
    },
    memberCount: {
      control: 'number',
      description: 'Number of members/travelers',
    },
    showHoverEffect: {
      control: 'boolean',
      description: 'Whether to show hover effect on icons',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '280px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TripInfo>;

export const Default: Story = {
  args: {
    location: 'Paris, France',
    dateRange: 'Jun 15 - Jun 30, 2024',
    memberCount: 5,
    showHoverEffect: true,
  },
};

export const LocationOnly: Story = {
  args: {
    location: 'Tokyo, Japan',
    showHoverEffect: true,
  },
};

export const DateRangeOnly: Story = {
  args: {
    dateRange: 'Aug 10 - Aug 25, 2024',
    showHoverEffect: true,
  },
};

export const MemberCountOnly: Story = {
  args: {
    memberCount: 3,
    showHoverEffect: true,
  },
};

export const WithoutHoverEffect: Story = {
  args: {
    location: 'Barcelona, Spain',
    dateRange: 'Sep 5 - Sep 15, 2024',
    memberCount: 2,
    showHoverEffect: false,
  },
};

export const SingleMember: Story = {
  args: {
    location: 'New York, USA',
    dateRange: 'Jul 4 - Jul 10, 2024',
    memberCount: 1,
    showHoverEffect: true,
  },
};

export const LongLocation: Story = {
  args: {
    location: 'Sydney, New South Wales, Australia - Downtown Harbor Area',
    dateRange: 'Dec 20, 2024 - Jan 5, 2025',
    memberCount: 8,
    showHoverEffect: true,
  },
}; 