import type { Meta, StoryObj } from '@storybook/react';
import { GroupPlanCard } from './group-plan-card';

const meta = {
  title: 'Organisms/Groups/GroupPlanCard',
  component: GroupPlanCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GroupPlanCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    plan: {
      id: '1',
      title: 'Paris Trip',
      description: 'A wonderful weekend in Paris',
      createdAt: '2023-07-20T12:00:00Z',
      createdBy: {
        id: '1',
        name: 'Alex Johnson',
        avatarUrl: 'https://i.pravatar.cc/150?u=alex',
      },
      votes: {
        upvotes: 5,
        downvotes: 1,
        userVote: null,
      },
      ideas: [
        {
          id: '1',
          title: 'Visit the Eiffel Tower',
          type: 'activity',
          votes: {
            upvotes: 4,
            downvotes: 1,
            userVote: 'up',
          },
        },
        {
          id: '2',
          title: 'Dinner at Le Jules Verne',
          type: 'activity',
          votes: {
            upvotes: 3,
            downvotes: 2,
            userVote: null,
          },
        },
        {
          id: '3',
          title: 'Louvre Museum',
          type: 'activity',
          votes: {
            upvotes: 5,
            downvotes: 0,
            userVote: 'up',
          },
        },
      ],
      members: [
        {
          id: '1',
          name: 'Alex Johnson',
          avatarUrl: 'https://i.pravatar.cc/150?u=alex',
        },
        {
          id: '2',
          name: 'Sarah Williams',
          avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
        },
        {
          id: '3',
          name: 'Mike Chen',
          avatarUrl: 'https://i.pravatar.cc/150?u=mike',
        },
        {
          id: '4',
          name: 'Lisa Anderson',
          avatarUrl: 'https://i.pravatar.cc/150?u=lisa',
        },
      ],
    },
    onVote: (id, voteType) => {
      console.log(`Voted ${voteType} on plan ${id}`);
    },
    onViewDetails: (id) => {
      console.log(`Viewing details for plan ${id}`);
    },
  },
};

export const WithUserVote: Story = {
  args: {
    ...Default.args,
    plan: {
      ...Default.args.plan,
      votes: {
        upvotes: 5,
        downvotes: 1,
        userVote: 'up',
      },
    },
  },
};

export const MinimalContent: Story = {
  args: {
    plan: {
      id: '2',
      title: 'London Weekend',
      description: '',
      createdAt: '2023-07-18T10:30:00Z',
      createdBy: {
        id: '2',
        name: 'Sarah Williams',
        avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
      },
      votes: {
        upvotes: 2,
        downvotes: 0,
        userVote: null,
      },
      ideas: [],
      members: [
        {
          id: '2',
          name: 'Sarah Williams',
          avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
        },
      ],
    },
    onVote: (id, voteType) => {
      console.log(`Voted ${voteType} on plan ${id}`);
    },
    onViewDetails: (id) => {
      console.log(`Viewing details for plan ${id}`);
    },
  },
}; 