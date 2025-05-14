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
type Story = StoryObj<typeof meta>;

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
              survey_id: 'survey-1',
              name: 'John Smith',
              email: 'john@example.com',
              completed_at: new Date().toISOString(),
              source: 'Email',
              survey_title: 'Travel Preferences Survey',
            },
            {
              id: '2',
              survey_id: 'survey-2',
              name: 'Maria Garcia',
              email: 'maria@example.com',
              completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              source: 'Website',
              survey_title: 'User Experience Feedback',
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
