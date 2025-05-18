import type { Meta, StoryObj } from '@storybook/react';
import { TabbledFeedback } from '@/app/admin/components/TabbledFeedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const meta = {
  title: 'Admin/TabbledFeedback',
  component: TabbledFeedback,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>User Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <Story />
          </CardContent>
        </Card>
      </div>
    ),
  ],
} satisfies Meta<typeof TabbledFeedback>;

export default meta;

type Story = StoryObj<typeof TabbledFeedback>;

export const Default: Story = {
  args: {},
  parameters: {
    mockData: [
      {
        url: '/api/admin/surveys/recent-responses',
        method: 'GET',
        status: 200,
        response: {
          responses: [
            {
              id: '1',
              form_id: 'form-1',
              user_id: 'user-123',
              status: 'completed',
              data: {
                name: 'John Smith',
                email: 'john@example.com',
                feedback: 'Great application, very intuitive!',
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              form_name: 'Travel Preferences Survey',
            },
            {
              id: '2',
              form_id: 'form-2',
              user_id: 'user-456',
              status: 'in_progress',
              data: {
                fullName: 'Maria Garcia',
                email: 'maria@example.com',
                rating: 4,
              },
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: null,
              form_name: 'User Experience Feedback',
            },
          ],
        },
      },
    ],
  },
};

export const EmptyState: Story = {
  args: {},
  parameters: {
    mockData: [
      {
        url: '/api/admin/surveys/recent-responses',
        method: 'GET',
        status: 200,
        response: {
          responses: [],
        },
      },
    ],
  },
};

export const LoadingState: Story = {
  args: {},
  parameters: {
    mockData: [
      {
        url: '/api/admin/surveys/recent-responses',
        method: 'GET',
        delay: 10000, // Long delay to show loading state
        status: 200,
        response: {
          responses: [],
        },
      },
    ],
  },
};
