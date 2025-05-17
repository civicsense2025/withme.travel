import type { Meta, StoryObj } from '@storybook/react';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';

const meta: Meta<typeof ConnectionStatusIndicator> = {
  title: 'Trips/Molecules/ConnectionStatusIndicator',
  component: ConnectionStatusIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['online', 'offline', 'connecting', 'error'],
    },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionStatusIndicator>;

export const Online: Story = {
  args: {
    status: 'online',
  },
};

export const Offline: Story = {
  args: {
    status: 'offline',
  },
};

export const Connecting: Story = {
  args: {
    status: 'connecting',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
  },
};

export const CustomLabel: Story = {
  args: {
    status: 'online',
    label: 'Connected to server',
  },
}; 