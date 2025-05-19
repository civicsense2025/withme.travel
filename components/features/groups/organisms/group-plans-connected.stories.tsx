/**
 * Storybook stories for the GroupPlansConnected organism
 * 
 * @module features/groups/organisms/GroupPlansConnected
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GroupPlansConnected } from './group-plans-connected';

const meta: Meta<typeof GroupPlansConnected> = {
  title: 'Features/Groups/Organisms/GroupPlansConnected',
  component: GroupPlansConnected,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof GroupPlansConnected>;

export const Default: Story = {
  args: {
    groupId: 'group-123',
    canEdit: true,
    userId: 'user-456',
  },
};

export const ReadOnly: Story = {
  args: {
    groupId: 'group-123',
    canEdit: false,
    userId: 'user-456',
  },
};

export const WithCustomClass: Story = {
  args: {
    groupId: 'group-123',
    canEdit: true,
    userId: 'user-456',
    className: 'border border-gray-200 rounded-lg p-4 shadow-sm',
  },
}; 