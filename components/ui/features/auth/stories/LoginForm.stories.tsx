import type { Meta, StoryObj } from '@storybook/react';
import { LoginForm } from '../molecules/LoginForm';
import { AuthModalContext } from '@/app/context/auth-modal-context';

/**
 * The LoginForm component provides email and social authentication for users.
 */
const meta: Meta<typeof LoginForm> = {
  title: 'Features/Auth/Molecules/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSuccess: { 
      action: 'success',
      description: 'Callback function when login succeeds',
    },
    primaryButtonText: { 
      control: 'text',
      description: 'Custom text for the primary button',
    },
    context: {
      control: 'select',
      options: [
        'default',
        'join-group',
        'create-group',
        'save-trip',
        'like-trip',
        'comment',
        'edit-trip',
        'invite-friends',
        'premium-feature',
        'vote-on-idea',
        'create-itinerary',
        'add-to-itinerary'
      ],
      description: 'Context where the login form is being used',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

/**
 * Default login form
 */
export const Default: Story = {
  args: {
    primaryButtonText: 'Sign In',
    context: 'default',
  },
};

/**
 * Trip context login form
 */
export const TripContext: Story = {
  args: {
    primaryButtonText: 'Sign In to View Trip',
    context: 'save-trip',
  },
};

/**
 * Checkout context login form
 */
export const CheckoutContext: Story = {
  args: {
    primaryButtonText: 'Sign In to Continue',
    context: 'premium-feature',
  },
}; 