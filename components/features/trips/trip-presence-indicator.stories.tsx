import type { Meta, StoryObj } from '@storybook/react';
import { TripPresenceIndicator } from './trip-presence-indicator';

const meta: Meta<typeof TripPresenceIndicator> = {
  title: 'Product/Features/TripPresenceIndicator',
  component: TripPresenceIndicator,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof TripPresenceIndicator>;

const mockProps = {
  onlineCount: 3,
  totalCount: 5,
  users: [
    { id: '1', name: 'Alice', avatarUrl: '', status: 'online' },
    { id: '2', name: 'Bob', avatarUrl: '', status: 'online' },
    { id: '3', name: 'Carol', avatarUrl: '', status: 'online' },
    { id: '4', name: 'Dave', avatarUrl: '', status: 'offline' },
    { id: '5', name: 'Eve', avatarUrl: '', status: 'offline' },
  ],
};

export const Default: Story = { args: { ...mockProps } };
export const LightMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'light' } },
};
export const DarkMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'dark' } },
};
