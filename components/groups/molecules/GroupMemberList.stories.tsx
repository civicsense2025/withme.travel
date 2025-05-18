import type { Meta, StoryObj } from '@storybook/react';
import { GroupMemberList } from './GroupMemberList';

const meta: Meta<typeof GroupMemberList> = {
  title: 'Groups/Molecules/GroupMemberList',
  component: GroupMemberList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onInvite: { action: 'invite clicked' },
    onPromote: { action: 'member promoted' },
    onDemote: { action: 'member demoted' },
    onRemove: { action: 'member removed' },
    onResendInvite: { action: 'invite resent' }
  },
};

export default meta;
type Story = StoryObj<typeof GroupMemberList>;

// Sample members data
const members = [
  {
    id: 'user1',
    name: 'Alex Thompson',
    email: 'alex@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    role: 'owner',
    status: 'active',
    joinedAt: '2023-01-01T00:00:00Z',
    lastActive: '2023-06-01T00:00:00Z'
  },
  {
    id: 'user2',
    name: 'Jamie Rodriguez',
    email: 'jamie@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    role: 'admin',
    status: 'active',
    joinedAt: '2023-01-15T00:00:00Z',
    lastActive: '2023-06-02T00:00:00Z'
  },
  {
    id: 'user3',
    name: 'Morgan Lee',
    email: 'morgan@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=7',
    role: 'member',
    status: 'active',
    joinedAt: '2023-02-15T00:00:00Z',
    lastActive: '2023-06-03T00:00:00Z'
  },
  {
    id: 'user4',
    name: 'Taylor Smith',
    email: 'taylor@example.com',
    role: 'member',
    status: 'invited',
    joinedAt: '2023-05-01T00:00:00Z'
  },
  {
    id: 'user5',
    name: 'Jordan Patel',
    email: 'jordan@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
    role: 'member',
    status: 'left',
    joinedAt: '2023-02-01T00:00:00Z',
    lastActive: '2023-04-15T00:00:00Z'
  }
];

export const Default: Story = {
  args: {
    members,
    currentUserId: 'user3',
    isCurrentUserAdmin: false
  },
};

export const AsAdmin: Story = {
  args: {
    members,
    currentUserId: 'user2',
    isCurrentUserAdmin: true
  },
};

export const AsOwner: Story = {
  args: {
    members,
    currentUserId: 'user1',
    isCurrentUserAdmin: true
  },
};

export const EmptyList: Story = {
  args: {
    members: [],
    isCurrentUserAdmin: true
  },
};

export const WithPendingInvites: Story = {
  args: {
    members: [
      ...members,
      {
        id: 'user6',
        name: 'Riley Johnson',
        email: 'riley@example.com',
        role: 'member',
        status: 'invited',
        joinedAt: '2023-06-01T00:00:00Z',
      },
      {
        id: 'user7',
        name: 'Casey Wilson',
        email: 'casey@example.com',
        role: 'member',
        status: 'invited',
        joinedAt: '2023-06-02T00:00:00Z',
      }
    ],
    currentUserId: 'user2',
    isCurrentUserAdmin: true
  },
}; 