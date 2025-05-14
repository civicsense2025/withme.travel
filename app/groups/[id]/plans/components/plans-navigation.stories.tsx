import type { Meta, StoryObj } from '@storybook/react';
import PlansNavigation from './plans-navigation';

const meta: Meta<typeof PlansNavigation> = {
  title: 'Features/Trip/PlansNavigation',
  component: PlansNavigation,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    groupId: { control: 'text', description: 'Group ID' },
    groupName: { control: 'text', description: 'Group Name' },
    planName: { control: 'text', description: 'Plan Name (optional)' },
  },
};

export default meta;
type Story = StoryObj<typeof PlansNavigation>;

export const Default: Story = {
  args: {
    groupId: 'group-123',
    groupName: 'Barcelona Crew',
    planName: 'Summer 2024',
  },
};

export const NoPlanName: Story = {
  args: {
    groupId: 'group-123',
    groupName: 'Barcelona Crew',
    planName: undefined,
  },
};
