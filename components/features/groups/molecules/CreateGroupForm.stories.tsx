import type { Meta, StoryObj } from '@storybook/react';
import { CreateGroupForm } from '@/components/features/groups/molecules/CreateGroupForm';

const meta: Meta<typeof CreateGroupForm> = {
  title: 'Features/Groups/Molecules/CreateGroupForm',
  component: CreateGroupForm,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof CreateGroupForm>;

export const Default: Story = {
  args: {
    onGroupCreated: (group) => alert('Group created: ' + JSON.stringify(group)),
  },
}; 