import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { IdeaBoard } from './idea-board';
import type { GroupIdeaWithCreator } from '@/types/group-ideas';

const meta: Meta<typeof IdeaBoard> = {
  title: 'Groups/Plans/IdeaBoard',
  component: IdeaBoard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'IdeaBoard is the main board/grid for ideas. It expects API and context for full interactivity.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    groupId: { control: 'text', description: 'Group ID' },
    initialIdeas: { control: 'object', description: 'Initial ideas array' },
    isAuthenticated: { control: 'boolean', description: 'Is Authenticated' },
  },
};

export default meta;
type Story = StoryObj<typeof IdeaBoard>;

export const Default: Story = {
  args: {
    groupId: '123',
    initialIdeas: [
      {
        id: 'idea-1',
        group_id: 'group-123',
        created_by: 'user-1',
        guest_token: null,
        title: 'Try a tapas crawl',
        description: 'Sample idea for a group trip',
        type: 'activity',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        position: { x: 0, y: 0, w: 1, h: 1 },
        votes_up: 0,
        votes_down: 0,
        selected: false,
        meta: null,
        creator: {
          id: 'user-1',
          email: 'user1@example.com',
          user_metadata: {
            full_name: 'User One',
            avatar_url: 'https://example.com/avatar.png',
          },
        },
      },
      {
        id: 'idea-2',
        group_id: 'group-123',
        created_by: 'user-2',
        guest_token: null,
        title: 'Visit Sagrada Familia',
        description: 'Iconic Barcelona landmark',
        type: 'activity',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        position: { x: 0, y: 0, w: 1, h: 1 },
        votes_up: 0,
        votes_down: 0,
        selected: false,
        meta: null,
        creator: {
          id: 'user-2',
          email: 'user2@example.com',
          user_metadata: {
            full_name: 'User Two',
            avatar_url: 'https://example.com/avatar2.png',
          },
        },
      },
    ] as GroupIdeaWithCreator[],
    isAuthenticated: true,
  },
};
