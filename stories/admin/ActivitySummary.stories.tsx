import type { Meta, StoryObj } from '@storybook/react';
import { ActivitySummary } from '@/app/admin/components/ActivitySummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const meta = {
  title: 'Admin/ActivitySummary',
  component: ActivitySummary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Story />
          </CardContent>
        </Card>
      </div>
    ),
  ],
} satisfies Meta<typeof ActivitySummary>;

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
