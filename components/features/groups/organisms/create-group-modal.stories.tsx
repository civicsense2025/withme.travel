import type { Meta, StoryObj } from '@storybook/react';
import { CreateGroupModal } from './create-group-modal';
import { useState } from 'react';

const meta: Meta<typeof CreateGroupModal> = {
  title: 'Features/Groups/Organisms/CreateGroupModal',
  component: CreateGroupModal,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof CreateGroupModal>;

export const Open: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <CreateGroupModal isOpen={open} onClose={() => setOpen(false)} onGroupCreated={(g) => alert('Created: ' + JSON.stringify(g))} />
    );
  },
}; 