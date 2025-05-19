import type { Meta, StoryObj } from '@storybook/react';
import { DashboardHeader } from './dashboard-header';

const meta: Meta<typeof DashboardHeader> = {
  title: 'Dashboard/DashboardHeader',
  component: DashboardHeader,
  argTypes: {
    userName: { control: 'text' },
    avatar-rl: { control: 'text' },
    travelStats: {
      control: 'object',
      defaultValue: {
        visitedCount: 12,
        plannedCount: 3,
        wishlistCount: 7,
        countriesCount: 5,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DashboardHeader>;

export const Playground: Story = {
  args: {
    userName: 'Taylor',
    avatar-rl: '',
    travelStats: {
      visitedCount: 12,
      plannedCount: 3,
      wishlistCount: 7,
      countriesCount: 5,
    },
  },
};
