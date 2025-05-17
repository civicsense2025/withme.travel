import type { Meta, StoryObj } from '@storybook/react';
import { GroupMemberList } from './group-member-list';

const meta: Meta<typeof GroupMemberList> = {
  title: 'UI/Features/groups/group-member-list',
  component: GroupMemberList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onInvite: { action: 'invite clicked' },
    onPromote: { action: 'promote clicked' },
    onDemote: { action: 'demote clicked' },
    onRemove: { action: 'remove clicked' },
    onResendInvite: { action: 'resend invite clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof GroupMemberList>;

// Sample members data
const members = [
  {
    id: 'user1',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user1',
    role: 'admin' as const,
    status: 'active' as const,
    joinedAt: '2023-01-15T12:00:00Z',
    lastActive: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 'user2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user2',
    role: 'member' as const,
    status: 'active' as const,
    joinedAt: '2023-02-10T15:30:00Z',
    lastActive: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 'user3',
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user3',
    role: 'member' as const,
    status: 'invited' as const,
    joinedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: 'user4',
    name: 'Michael Wilson',
    email: 'michael.wilson@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user4',
    role: 'admin' as const,
    status: 'active' as const,
    joinedAt: '2023-03-05T09:15:00Z',
    lastActive: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
  },
  {
    id: 'user5',
    name: 'Sarah Lee',
    email: 'sarah.lee@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user5',
    role: 'member' as const,
    status: 'left' as const,
    joinedAt: '2023-01-20T11:45:00Z',
    lastActive: '2023-04-01T14:30:00Z',
  },
  {
    id: 'user6',
    name: 'David Brown',
    email: 'david.brown@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user6',
    role: 'member' as const,
    status: 'removed' as const,
    joinedAt: '2023-02-01T10:00:00Z',
    lastActive: '2023-03-15T16:20:00Z',
  },
];

export const Default: Story = {
  args: {
    members,
    currentUserId: undefined,
    isCurrentUserAdmin: false,
  },
};

export const AsAdmin: Story = {
  args: {
    members,
    currentUserId: 'user1',
    isCurrentUserAdmin: true,
  },
};

export const AsMember: Story = {
  args: {
    members,
    currentUserId: 'user2',
    isCurrentUserAdmin: false,
  },
};

export const EmptyList: Story = {
  args: {
    members: [],
    currentUserId: 'user1',
    isCurrentUserAdmin: true,
  },
};

export const OnlyActiveMembers: Story = {
  args: {
    members: members.filter(m => m.status === 'active'),
    currentUserId: 'user1',
    isCurrentUserAdmin: true,
  },
};

export const WithPendingInvites: Story = {
  args: {
    members: [
      ...members.filter(m => m.status === 'active').slice(0, 2),
      {
        id: 'user7',
        name: 'Jessica Taylor',
        email: 'jessica.taylor@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=user7',
        role: 'member' as const,
        status: 'invited' as const,
        joinedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      {
        id: 'user8',
        name: 'Robert Garcia',
        email: 'robert.garcia@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=user8',
        role: 'member' as const,
        status: 'invited' as const,
        joinedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 'user9',
        name: 'Lisa Martinez',
        email: 'lisa.martinez@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=user9',
        role: 'member' as const,
        status: 'invited' as const,
        joinedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      },
    ],
    currentUserId: 'user1',
    isCurrentUserAdmin: true,
  },
}; 