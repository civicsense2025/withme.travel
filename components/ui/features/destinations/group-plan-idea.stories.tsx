import type { Meta, StoryObj } from '@storybook/react';
import { GroupPlanIdea } from './group-plan-idea';

const meta = {
  title: 'UI/Features/destinations/group-plan-idea',
  component: GroupPlanIdea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onVote: { action: 'voted' },
    onEdit: { action: 'edited' },
    onDelete: { action: 'deleted' },
  },
} satisfies Meta<typeof GroupPlanIdea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: '1',
    title: 'Visit the Eiffel Tower',
    description: 'We should definitely visit the Eiffel Tower while in Paris. It\'s an iconic landmark and offers amazing views of the city.',
    type: 'activity',
    createdBy: {
      id: '1',
      name: 'John Smith',
      avatarUrl: 'https://i.pravatar.cc/150?u=john',
    },
    createdAt: '2023-06-20T14:30:00Z',
    voteCount: 5,
    currentVote: 'none',
    commentCount: 3,
    metadata: {
      location: 'Eiffel Tower, Paris, France',
    },
  },
};

export const WithUserVote: Story = {
  args: {
    ...Default.args,
    currentVote: 'up',
    voteCount: 6,
  },
};

export const WithDownvote: Story = {
  args: {
    ...Default.args,
    currentVote: 'down',
    voteCount: 3,
  },
};

export const DateIdea: Story = {
  args: {
    id: '2',
    title: 'June 15-20, 2024',
    description: 'These dates work well with everyone\'s schedule and avoid the peak tourist season.',
    type: 'date',
    createdBy: {
      id: '2',
      name: 'Jane Doe',
      avatarUrl: 'https://i.pravatar.cc/150?u=jane',
    },
    createdAt: '2023-06-19T10:15:00Z',
    voteCount: 4,
    currentVote: 'none',
    commentCount: 2,
    metadata: {
      date: 'June 15-20, 2024',
    },
  },
};

export const DestinationIdea: Story = {
  args: {
    id: '3',
    title: 'Paris, France',
    description: 'Paris would be a great destination for our trip. It has amazing food, culture, and architecture.',
    type: 'destination',
    createdBy: {
      id: '3',
      name: 'Mike Johnson',
      avatarUrl: 'https://i.pravatar.cc/150?u=mike',
    },
    createdAt: '2023-06-18T08:45:00Z',
    voteCount: 7,
    currentVote: 'none',
    commentCount: 5,
    metadata: {
      location: 'Paris, France',
    },
  },
};

export const BudgetIdea: Story = {
  args: {
    id: '4',
    title: '$2,000 per person budget',
    description: 'Based on flight costs, accommodation, and activities, we should budget around $2,000 per person for this trip.',
    type: 'budget',
    createdBy: {
      id: '1',
      name: 'John Smith',
      avatarUrl: 'https://i.pravatar.cc/150?u=john',
    },
    createdAt: '2023-06-17T16:20:00Z',
    voteCount: 3,
    currentVote: 'none',
    commentCount: 8,
    metadata: {
      cost: '$2,000 per person',
    },
  },
};

export const QuestionIdea: Story = {
  args: {
    id: '5',
    title: 'Should we rent a car or use public transportation?',
    description: 'Trying to decide if we should rent a car for flexibility or rely on public transportation to save on parking and navigating city traffic.',
    type: 'question',
    createdBy: {
      id: '4',
      name: 'Sarah Williams',
      avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
    },
    createdAt: '2023-06-16T11:05:00Z',
    voteCount: 6,
    currentVote: 'none',
    commentCount: 10,
  },
};

export const NoteIdea: Story = {
  args: {
    id: '6',
    title: 'Important Packing Reminder',
    description: 'Don\'t forget that Spain uses Type C and Type F electrical outlets. Everyone should bring the right adapters for their devices!',
    type: 'note',
    createdBy: {
      id: '2',
      name: 'Jane Doe', 
      avatarUrl: 'https://i.pravatar.cc/150?u=jane',
    },
    createdAt: '2023-06-15T09:30:00Z',
    voteCount: 5,
    currentVote: 'none',
    commentCount: 2,
  },
};

export const PlaceIdea: Story = {
  args: {
    id: '7',
    title: 'Parc Güell',
    description: 'Another Gaudí masterpiece! This park has amazing views of the city and colorful mosaic work. It\'s a bit of a hike uphill, but definitely worth it.',
    type: 'place',
    imageUrl: 'https://images.unsplash.com/photo-1551102709-f96e74fea1a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    createdBy: {
      id: '3',
      name: 'Mike Johnson',
      avatarUrl: 'https://i.pravatar.cc/150?u=mike',
    },
    createdAt: '2023-06-14T14:20:00Z',
    voteCount: 9,
    currentVote: 'up',
    commentCount: 4,
    metadata: {
      location: 'Parc Güell, Barcelona, Spain',
    },
    tags: ['Park', 'Architecture', 'Views'],
  },
};

export const ActivityIdea: Story = {
  args: {
    ...Default.args,
    type: 'activity',
    imageUrl: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    voteCount: 12,
    currentVote: 'up',
    commentCount: 7,
    metadata: {
      location: 'Gothic Quarter, Barcelona',
      time: 'Evening, 7pm-10pm',
      cost: '€75-100 per person',
    },
    tags: ['Food', 'Tour', 'Local Experience'],
  },
};

export const PinnedIdea: Story = {
  args: {
    ...ActivityIdea.args,
    isPinned: true,
  },
};

export const HighlightedIdea: Story = {
  args: {
    ...PlaceIdea.args,
    isHighlighted: true,
  },
};

export const NoImage: Story = {
  args: {
    ...ActivityIdea.args,
    imageUrl: undefined,
  },
};

export const NoVotes: Story = {
  args: {
    ...DestinationIdea.args,
    voteCount: 0,
    currentVote: 'none',
  },
}; 