import type { Meta, StoryObj } from '@storybook/react';
import { CreateGroupForm } from './create-group-form';

const meta: Meta<typeof CreateGroupForm> = {
  title: 'Features/Groups/Molecules/CreateGroupForm',
  component: CreateGroupForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CreateGroupForm>;

export const Default: Story = {
  args: {
    onGroupCreated: (group) => {
      console.log('Group created:', group);
    },
  },
};

export const InModal: Story = {
  render: () => (
    <div className="pU6 bg-white rounded-lg shadow-lg max-w-md">
      <h2 className="text-xl font-semibold mbU4">Create a New Group</h2>
      <CreateGroupForm 
        onGroupCreated={(group) => {
          console.log('Group created:', group);
        }}
      />
    </div>
  ),
}; 