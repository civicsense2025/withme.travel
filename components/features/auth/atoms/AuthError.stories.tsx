import type { Meta, StoryObj } from '@storybook/react';
import { AuthError } from './AuthError';

const meta: Meta<typeof AuthError> = {
  title: 'Features/Auth/Atoms/AuthError',
  component: AuthError,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AuthError>;

export const Default: Story = {
  args: {
    message: 'Invalid email or password',
  },
};

export const LongMessage: Story = {
  args: {
    message: 'An error occurred while trying to authenticate. Please check your credentials and try again. If the problem persists, contact support.',
  },
};

export const WithCustomClassName: Story = {
  args: {
    message: 'You need to verify your email before logging in',
    className: 'bg-orange-100 text-orange-800',
  },
};