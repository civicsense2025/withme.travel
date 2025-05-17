import { Meta, StoryObj } from '@storybook/react';
import { UserResearchForm } from './UserResearchForm';

const meta: Meta<typeof UserResearchForm> = {
  title: 'UI/Features/user/UserResearchForm',
  component: UserResearchForm,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    submitUrl: {
      control: 'text',
      description: 'URL to submit the form data to',
    },
    redirectUrl: {
      control: 'text',
      description: 'URL to redirect to after successful submission',
    },
    submitButtonText: {
      control: 'text',
      description: 'Text to display on the submit button',
    },
    loadingText: {
      control: 'text',
      description: 'Text to display while the form is submitting',
    },
    redirectDelay: {
      control: 'number',
      description: 'Delay before redirecting after submission',
    },
    onSuccess: { action: 'onSuccess' },
    onError: { action: 'onError' },
  },
};

export default meta;

type Story = StoryObj<typeof UserResearchForm>;

// Default form
export const Default: Story = {
  args: {
    submitUrl: '/api/mock-signup',
    redirectUrl: '/success',
    submitButtonText: 'Join the Alpha Program',
    loadingText: 'Signing you up…',
    redirectDelay: 1500,
  },
};

// Form with custom button text
export const CustomButtonText: Story = {
  args: {
    ...Default.args,
    submitButtonText: 'Sign Up for Beta',
    loadingText: 'Processing...',
  },
}; 