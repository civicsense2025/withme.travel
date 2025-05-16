/**
 * GroupCard Component Stories
 * 
 * Storybook stories for the GroupCard component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GroupCard } from './GroupCard';

// ============================================================================
// META
// ============================================================================

const meta: Meta<typeof GroupCard> = {
  title: 'Features/Groups/Molecules/GroupCard',
  component: GroupCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof GroupCard>;

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default story with minimal props
 */
export const Default: Story = {
  args: {
    id: 'group-1',
    name: 'Travel Buddies',
    description: 'Friends who travel together',
    activePlansCount: 2,
    members: [
      {
        id: 'user-1',
        name: 'John Doe',
        avatarUrl: 'https://i.pravatar.cc/150?u=user1',
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        avatarUrl: 'https://i.pravatar.cc/150?u=user2',
      },
    ],
  },
};

/**
 * Many members story
 */
export const ManyMembers: Story = {
  args: {
    ...Default.args,
    members: [
      {
        id: 'user-1',
        name: 'John Doe',
        avatarUrl: 'https://i.pravatar.cc/150?u=user1',
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        avatarUrl: 'https://i.pravatar.cc/150?u=user2',
      },
      {
        id: 'user-3',
        name: 'Robert Johnson',
        avatarUrl: 'https://i.pravatar.cc/150?u=user3',
      },
      {
        id: 'user-4',
        name: 'Emily Davis',
        avatarUrl: 'https://i.pravatar.cc/150?u=user4',
      },
      {
        id: 'user-5',
        name: 'Michael Brown',
        avatarUrl: 'https://i.pravatar.cc/150?u=user5',
      },
    ],
  },
};

/**
 * No active plans
 */
export const NoActivePlans: Story = {
  args: {
    ...Default.args,
    activePlansCount: 0,
  },
};

/**
 * No description
 */
export const NoDescription: Story = {
  args: {
    ...Default.args,
    description: undefined,
  },
};

/**
 * Responsive demo with multiple cards
 */
export const ResponsiveGrid: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <GroupCard {...args} name="Travel Buddies" />
        <GroupCard {...args} name="College Friends" description="Planning our reunion" />
        <GroupCard {...args} name="Family Vacation" activePlansCount={3} />
        <GroupCard {...args} name="Work Trip" activePlansCount={1} />
      </div>
    </div>
  ),
}; 