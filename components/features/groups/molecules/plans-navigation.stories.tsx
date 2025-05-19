import type { Meta, StoryObj } from '@storybook/react';
import { PlansNavigation } from './plans-navigation';

const meta: Meta<typeof PlansNavigation> = {
  title: 'Features/Groups/Molecules/PlansNavigation',
  component: PlansNavigation,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof PlansNavigation>;

export const Default: Story = {
  args: {
    groupId: 'group1',
    groupName: 'Travel Buddies',
  },
};

export const WithPlanName: Story = {
  args: {
    groupId: 'group1',
    groupName: 'Travel Buddies',
    planName: 'Summer 2024',
  },
}; 