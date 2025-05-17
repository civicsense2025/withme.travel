import type { Meta, StoryObj } from '@storybook/react';
import { PresenceIndicator, PresenceIndicatorMember } from './PresenceIndicator';

const meta: Meta<typeof PresenceIndicator> = {
  title: 'Trips/Molecules/PresenceIndicator',
  component: PresenceIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    maxAvatars: { control: { type: 'number', min: 1, max: 10 } },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '240px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PresenceIndicator>;

const members: PresenceIndicatorMember[] = [
  { id: '1', name: 'Alice', imageUrl: 'https://i.pravatar.cc/300?img=1', status: 'online' },
  { id: '2', name: 'Bob', imageUrl: 'https://i.pravatar.cc/300?img=2', status: 'away' },
  { id: '3', name: 'Carol', imageUrl: 'https://i.pravatar.cc/300?img=3', status: 'offline' },
  { id: '4', name: 'Dave', imageUrl: 'https://i.pravatar.cc/300?img=4', status: 'busy' },
  { id: '5', name: 'Eve', imageUrl: 'https://i.pravatar.cc/300?img=5', status: 'online' },
];

export const Default: Story = {
  args: {
    members: members.slice(0, 3),
    maxAvatars: 4,
  },
};

export const ManyMembers: Story = {
  args: {
    members,
    maxAvatars: 3,
  },
};

export const AllAvatars: Story = {
  args: {
    members,
    maxAvatars: 10,
  },
}; 