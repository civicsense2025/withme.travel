/**
 * Storybook stories for the GroupMembersConnected organism
 * 
 * @module features/groups/organisms/GroupMembersConnected
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GroupMembersConnected } from './GroupMembersConnected';

const meta: Meta<typeof GroupMembersConnected> = {
  title: 'Features/Groups/Organisms/GroupMembersConnected',
  component: GroupMembersConnected,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof GroupMembersConnected>;

export const Default: Story = {
  args: {
    groupId: 'group-123',
    isAdmin: true,
    currentUserId: 'user-456',
  },
};

export const ReadOnly: Story = {
  args: {
    groupId: 'group-123',
    isAdmin: false,
    currentUserId: 'user-456',
  },
};

export const WithCustomClass: Story = {
  args: {
    groupId: 'group-123',
    isAdmin: true,
    currentUserId: 'user-456',
    className: 'border border-gray-200 rounded-lg p-4 shadow-sm',
  },
}; 