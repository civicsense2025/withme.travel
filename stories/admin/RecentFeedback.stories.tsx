import type { Meta, StoryObj } from '@storybook/react';
import { RecentFeedback } from '@/app/admin/components/RecentFeedback';

const meta = {
  title: 'Admin/RecentFeedback',
  component: RecentFeedback,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecentFeedback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InDarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  args: {},
};

export const Light = {
  parameters: { backgrounds: { default: 'light' } },
};

export const Dark = {
  parameters: { backgrounds: { default: 'dark' } },
};
