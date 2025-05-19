import type { Meta, StoryObj } from '@storybook/react';
import { GroupSettingsModal } from './GroupSettingsModal';
import { useState } from 'react';

const meta: Meta<typeof GroupSettingsModal> = {
  title: 'Features/Groups/Organisms/GroupSettingsModal',
  component: GroupSettingsModal,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupSettingsModal>;

export const Open: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <GroupSettingsModal
        group={{
          id: 'g1',
          name: 'Adventure Crew',
          description: 'A group for adventure lovers',
          created_by: 'u1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          emoji: '🌍',
          visibility: 'private',
          slug: 'adventure-crew',
        }}
        isOpen={open}
        onClose={setOpen}
      />
    );
  },
}; 