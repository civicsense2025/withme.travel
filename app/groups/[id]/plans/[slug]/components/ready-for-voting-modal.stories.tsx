import type { Meta, StoryObj } from '@storybook/react';
import { ReadyForVotingModal } from './ready-for-voting-modal';

const meta: Meta<typeof ReadyForVotingModal> = {
  title: 'Features/Trip/ReadyForVotingModal',
  component: ReadyForVotingModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ReadyForVotingModal is the dialog shown before moving to the voting phase. This component requires auth and presence context to be fully interactive.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onClose: { action: 'onClose', description: 'Close handler' },
    groupId: { control: 'text', description: 'Group ID' },
    planSlug: { control: 'text', description: 'Plan Slug' },
  },
};

export default meta;
type Story = StoryObj<typeof ReadyForVotingModal>;

export const Default: Story = {
  args: {
    onClose: () => {},
    groupId: 'group-123',
    planSlug: 'summer-2024',
  },
};
