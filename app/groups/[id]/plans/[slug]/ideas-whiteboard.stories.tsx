import type { Meta, StoryObj } from '@storybook/react';
import IdeasWhiteboard from './ideas-whiteboard';

const meta: Meta<typeof IdeasWhiteboard> = {
  title: 'Features/Trip/IdeasWhiteboard',
  component: IdeasWhiteboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'This story demonstrates the full Ideas Whiteboard experience. For atomic components, see their individual stories.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    groupId: { control: 'text', description: 'Group ID' },
    groupName: { control: 'text', description: 'Group Name' },
    planSlug: { control: 'text', description: 'Plan Slug' },
    planId: { control: 'text', description: 'Plan ID' },
    isAuthenticated: { control: 'boolean', description: 'Is Authenticated' },
    isGuest: { control: 'boolean', description: 'Is Guest' },
    isAdmin: { control: 'boolean', description: 'Is Admin' },
    isCreator: { control: 'boolean', description: 'Is Creator' },
    guestToken: { control: 'text', description: 'Guest Token (optional)' },
  },
};

export default meta;
type Story = StoryObj<typeof IdeasWhiteboard>;

export const Default: Story = {
  args: {
    groupId: 'groupU123',
    groupName: 'Barcelona Crew',
    planSlug: 'summerU2024',
    planId: 'planU456',
    isAuthenticated: true,
    isGuest: false,
    isAdmin: true,
    isCreator: true,
    guestToken: '',
  },
};
