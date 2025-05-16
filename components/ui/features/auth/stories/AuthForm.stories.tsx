import type { Meta, StoryObj } from '@storybook/react';
import { AuthForm } from '../molecules/AuthForm';

/**
 * The AuthForm component provides authentication functionality with multiple modes.
 */
const meta: Meta<typeof AuthForm> = {
  title: 'Features/Auth/Molecules/AuthForm',
  component: AuthForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'radio',
      options: ['login', 'signup', 'reset-password'],
      description: 'The form mode (login, signup, reset-password)',
    },
    onSuccess: { 
      action: 'success',
      description: 'Callback function when authentication succeeds',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AuthForm>;

/**
 * Default login form
 */
export const Login: Story = {
  args: {
    mode: 'login',
  },
};

/**
 * Sign up form
 */
export const Signup: Story = {
  args: {
    mode: 'signup',
  },
};

/**
 * Forgot password form
 */
export const ResetPassword: Story = {
  args: {
    mode: 'reset-password',
  },
}; 