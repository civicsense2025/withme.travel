import type { Meta, StoryObj } from '@storybook/react';
import { TripMemberItem } from './TripMemberItem';

const meta: Meta<typeof TripMemberItem> = {
  title: 'Trips/Molecules/TripMemberItem',
  component: TripMemberItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: 'select',
      options: ['admin', 'editor', 'viewer', 'contributor'],
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'away', 'busy', 'none'],
    },
    showRole: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TripMemberItem>;

export const Default: Story = {
  args: {
    id: '1',
    name: 'Jane Smith',
    imageUrl: 'https://i.pravatar.cc/300?img=2',
    role: 'editor',
    status: 'online',
    showRole: true,
  },
};

export const Admin: Story = {
  args: {
    ...Default.args,
    role: 'admin',
  },
};

export const Offline: Story = {
  args: {
    ...Default.args,
    status: 'offline',
  },
};

export const NoImage: Story = {
  args: {
    ...Default.args,
    imageUrl: null,
  },
};

export const NoRole: Story = {
  args: {
    ...Default.args,
    showRole: false,
  },
}; 