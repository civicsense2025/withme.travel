import type { Meta, StoryObj } from '@storybook/react';
import { CreatePollForm } from './CreatePollForm';

const meta: Meta<typeof CreatePollForm> = {
  title: 'Features/Trips/Molecules/CreatePollForm',
  component: CreatePollForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    tripId: {
      control: 'text',
      description: 'ID of the trip',
    },
    onSuccess: {
      action: 'success',
      description: 'Called when poll is successfully created',
    },
    onCancel: {
      action: 'cancel',
      description: 'Called when form is cancelled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CreatePollForm>;

export const Default: Story = {
  args: {
    tripId: 'trip-123',
  },
};

export const WithCancelButton: Story = {
  args: {
    tripId: 'trip-123',
    onCancel: () => console.log('Cancelled'),
  },
}; 