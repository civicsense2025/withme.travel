import type { Meta, StoryObj } from '@storybook/react';
import { AdminStatsCard } from '@/app/admin/components/AdminStatsCard';
import { Users, DollarSign, ShoppingCart, ArrowUpRight } from 'lucide-react';

const meta = {
  title: 'Admin/AdminStatsCard',
  component: AdminStatsCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AdminStatsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PositiveTrend: Story = {
  args: {
    title: 'Total Users',
    value: '3,524',
    change: '+14.6%',
    trend: 'up',
    icon: <Users className="h-5 w-5 text-primary" />,
  },
};

export const NegativeTrend: Story = {
  args: {
    title: 'Revenue',
    value: '$45,231',
    change: '-5.2%',
    trend: 'down',
    icon: <DollarSign className="h-5 w-5 text-primary" />,
  },
};

export const NeutralTrend: Story = {
  args: {
    title: 'New Bookings',
    value: '482',
    change: 'No change',
    trend: 'neutral',
    icon: <ShoppingCart className="h-5 w-5 text-primary" />,
  },
};

export const LargeNumbers: Story = {
  args: {
    title: 'Page Views',
    value: '1,429,347',
    change: '+28.4%',
    trend: 'up',
    icon: <ArrowUpRight className="h-5 w-5 text-primary" />,
  },
};
