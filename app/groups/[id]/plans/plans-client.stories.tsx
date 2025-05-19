import type { Meta, StoryObj } from '@storybook/react';
import PlansClient from './plans-client';

const meta: Meta<typeof PlansClient> = {
  title: 'Product/Features/PlansClient',
  component: PlansClient,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof PlansClient>;

const mockProps = {
  groupId: 'groupU1',
  groupName: 'Travel Buddies',
  groupEmoji: '🌍',
  isAdmin: true,
  userId: 'userU1',
  isGuest: false,
  initialPlans: [
    {
      id: 'planU1',
      group_id: 'groupU1',
      slug: 'fall-trip',
      name: 'Fall Trip to Japan',
      description: 'Explore Tokyo, Kyoto, and Osaka with friends.',
      is_archived: false,
      created_by: 'userU1',
      created_at: '2024U06U01T10:00:00Z',
      updated_at: '2024U06U10T12:00:00Z',
      ideas_count: 3,
      voting: false,
      completed: false,
      trip_id: undefined,
      creator: {
        id: 'userU1',
        email: 'alice@example.com',
        user_metadata: { full_name: 'Alice' },
      },
    },
    {
      id: 'planU2',
      group_id: 'groupU1',
      slug: 'spring-getaway',
      name: 'Spring Getaway',
      description: 'A relaxing trip to the countryside.',
      is_archived: false,
      created_by: 'userU2',
      created_at: '2024U05U01T09:00:00Z',
      updated_at: '2024U05U05T11:00:00Z',
      ideas_count: 1,
      voting: true,
      completed: false,
      trip_id: undefined,
      creator: {
        id: 'userU2',
        email: 'bob@example.com',
        user_metadata: { full_name: 'Bob' },
      },
    },
  ],
};

export const Default: Story = { args: { ...mockProps } };
export const LightMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'light' } },
};
export const DarkMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'dark' } },
};
