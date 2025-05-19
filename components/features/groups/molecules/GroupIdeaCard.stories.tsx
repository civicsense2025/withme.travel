import type { Meta, StoryObj } from '@storybook/react';
import { GroupIdeaCard } from './GroupIdeaCard';

const meta: Meta<typeof GroupIdeaCard> = {
  title: 'Features/Groups/Molecules/GroupIdeaCard',
  component: GroupIdeaCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GroupIdeaCard>;

const mockGroupIdea = {
  id: '123',
  title: 'Visit the Eiffel Tower',
  description: 'We should definitely check out the Eiffel Tower while in Paris. Best at sunset for amazing photos.',
  type: 'place',
  created_at: new Date(Date.now() - 3600000).toISOString(),
  votes_up: 5,
  votes_down: 1,
  comment_count: 3,
  user_id: 'user123',
  group_id: 'group123',
};

export const PlaceIdea: Story = {
  args: {
    idea: mockGroupIdea,
    showActions: true,
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked'),
    onVoteUp: () => console.log('Vote up clicked'),
    onVoteDown: () => console.log('Vote down clicked'),
  },
};

export const ActivityIdea: Story = {
  args: {
    idea: {
      ...mockGroupIdea,
      id: '124',
      title: 'Kayaking on the Seine',
      description: 'There are guided kayak tours on the Seine river. Should be fun!',
      type: 'activity',
      comment_count: 1,
      votes_up: 3,
      votes_down: 0,
    },
    showActions: true,
  },
};

export const NoteIdea: Story = {
  args: {
    idea: {
      ...mockGroupIdea,
      id: '125',
      title: 'Budget considerations',
      description: 'We should aim to keep accommodation under $150/night to stay within budget.',
      type: 'note',
      comment_count: 5,
      votes_up: 2, 
      votes_down: 2,
    },
    showActions: true,
  },
};

export const QuestionIdea: Story = {
  args: {
    idea: {
      ...mockGroupIdea,
      id: '126',
      title: 'Best time to visit museums?',
      description: 'When are the Louvre and Orsay least crowded? Morning or evening?',
      type: 'question',
      comment_count: 2,
      votes_up: 1,
      votes_down: 0,
    },
    showActions: true, 
  },
};

export const WithStartEndDates: Story = {
  args: {
    idea: {
      ...mockGroupIdea,
      id: '127',
      title: 'Wine tasting tour',
      description: 'Day trip to Loire Valley wine region',
      type: 'activity',
      start_date: '2024-08-15T09:00:00Z',
      end_date: '2024-08-15T18:00:00Z',
      comment_count: 0,
      votes_up: 4,
      votes_down: 0,
    },
    showActions: true,
  },
};

export const WithLink: Story = {
  args: {
    idea: {
      ...mockGroupIdea,
      id: '128',
      title: 'Recommended restaurant',
      description: 'This restaurant has amazing reviews and typical French cuisine',
      type: 'place',
      link: 'https://example.com/restaurant',
      comment_count: 1,
      votes_up: 3,
      votes_down: 0,
    },
    showActions: true,
  },
};

export const CompactView: Story = {
  args: {
    idea: mockGroupIdea,
    showActions: true,
    compact: true,
  },
};

export const Selected: Story = {
  args: {
    idea: mockGroupIdea,
    showActions: true,
    selected: true,
  },
};

export const WithoutActions: Story = {
  args: {
    idea: mockGroupIdea,
    showActions: false,
  },
}; 