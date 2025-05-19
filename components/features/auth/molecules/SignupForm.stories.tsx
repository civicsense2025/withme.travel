import type { Meta, StoryObj } from '@storybook/react';
import { SignupForm } from './SignupForm';

const meta: Meta<typeof SignupForm> = {
  title: 'Features/Auth/Molecules/SignupForm',
  component: SignupForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SignupForm>;

export const Default: Story = {
  args: {
    onSubmit: async (data) => {
      console.log('Form submitted with:', data);
      // Simulate API call
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
};

export const WithError: Story = {
  args: {
    onSubmit: async () => {
      // This won't actually be called due to the error state
      console.log('Form submitted');
    },
    error: 'Account creation failed. Email already exists.',
  },
};

export const Loading: Story = {
  args: {
    onSubmit: async () => {
      // This won't be called in the story
      console.log('Form submitted');
    },
    isLoading: true,
  },
};

export const WithSuccess: Story = {
  args: {
    onSubmit: async () => {
      console.log('Form submitted');
    },
    success: 'Account created successfully! Please check your email for verification.',
  },
};