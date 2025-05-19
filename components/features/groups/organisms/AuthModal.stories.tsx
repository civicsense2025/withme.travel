import type { Meta, StoryObj } from '@storybook/react';
import { AuthModal } from './AuthModal';

const meta: Meta<typeof AuthModal> = {
  title: 'Features/Groups/Organisms/AuthModal',
  component: AuthModal,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof AuthModal>;

export const Default: Story = {
  args: {
    onSignIn: () => alert('Sign In'),
    onClose: () => alert('Close'),
  },
}; 