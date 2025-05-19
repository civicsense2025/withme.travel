import type { Meta, StoryObj } from '@storybook/react';
import GroupDetailClient from './group-detail-client';

const meta: Meta<typeof GroupDetailClient> = {
  title: 'Features/Groups/Organisms/GroupDetailClient',
  component: GroupDetailClient,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupDetailClient>;

export const Default: Story = {
  args: {
    group: {
      id: 'g1',
      name: 'Adventure Crew',
      description: 'A group for adventure lovers',
      created_by: 'u1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      emoji: '🌍',
      group_members: [
        { user_id: 'u1', role: 'owner', status: 'active', joined_at: new Date().toISOString() },
        { user_id: 'u2', role: 'member', status: 'active', joined_at: new Date().toISOString() },
      ],
    },
    membership: { user_id: 'u1', role: 'owner', status: 'active', joined_at: new Date().toISOString() },
    recentTrips: [],
    isAuthenticated: true,
  },
}; 