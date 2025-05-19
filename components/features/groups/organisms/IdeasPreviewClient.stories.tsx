import type { Meta, StoryObj } from '@storybook/react';
import IdeasPreviewClient from './IdeasPreviewClient';

const meta: Meta<typeof IdeasPreviewClient> = {
  title: 'Features/Groups/Organisms/IdeasPreviewClient',
  component: IdeasPreviewClient,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof IdeasPreviewClient>;

export const Default: Story = {
  args: {
    groupId: 'g1',
    groupName: 'Adventure Crew',
    groupEmoji: '🌍',
    initialIdeas: [
      { id: 'i1', group_id: 'g1', title: 'Go to Bali', type: 'destination', created_at: new Date().toISOString(), votes_up: 3, votes_down: 0 },
      { id: 'i2', group_id: 'g1', title: 'Surfing', type: 'activity', created_at: new Date().toISOString(), votes_up: 2, votes_down: 1 },
    ],
  },
}; 