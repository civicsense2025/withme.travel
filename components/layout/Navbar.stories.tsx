import type { Meta, StoryObj } from '@storybook/react';
import { Navbar } from './Navbar';

/**
 * Storybook stories for the Navbar component
 * Shows navigation bar with and without user
 */
const meta: Meta<typeof Navbar> = {
  title: 'Layout/Navbar',
  component: Navbar,
  tags: ['autodocs'],
  argTypes: {
    user: { control: 'object', description: 'User object for logged-in state' },
    onSignOut: { action: 'onSignOut', description: 'Sign out handler' },
  },
};
export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  args: {
    user: undefined,
  },
};

export const LoggedIn: Story = {
  args: {
    user: { id: '1', name: 'Jane Doe', avatarUrl: '/avatar.png' },
  },
}; 