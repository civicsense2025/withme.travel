import type { Meta, StoryObj } from '@storybook/react';
import { UserNav } from './user-nav';

/**
 * Storybook stories for the UserNav component
 * Shows user navigation with and without menu open
 */
const meta: Meta<typeof UserNav> = {
  title: 'Layout/UserNav',
  component: UserNav,
  tags: ['autodocs'],
  argTypes: {
    user: { control: 'object', description: 'User object' },
    menuOpen: { control: 'boolean', description: 'Whether the menu is open' },
    onMenuToggle: { action: 'onMenuToggle', description: 'Menu toggle handler' },
  },
};
export default meta;
type Story = StoryObj<typeof UserNav>;

export const Default: Story = {
  args: {
    user: { id: '1', name: 'Jane Doe', avatarUrl: '/avatar.png' },
    menuOpen: false,
  },
};

export const MenuOpen: Story = {
  args: {
    user: { id: '1', name: 'Jane Doe', avatarUrl: '/avatar.png' },
    menuOpen: true,
  },
}; 