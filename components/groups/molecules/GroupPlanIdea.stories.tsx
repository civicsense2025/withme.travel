import type { Meta, StoryObj } from '@storybook/react';
import { GroupPlanIdea } from './GroupPlanIdea';

const meta: Meta<typeof GroupPlanIdea> = {
  title: 'Groups/Molecules/GroupPlanIdea',
  component: GroupPlanIdea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onVote: { action: 'voted' },
    onComment: { action: 'comment clicked' },
    onEdit: { action: 'edit clicked' },
    onDelete: { action: 'delete clicked' },
    onPin: { action: 'pin toggled' },
    type: {
      control: { type: 'select' },
      options: ['destination', 'date', 'activity', 'budget', 'question', 'note', 'place', 'other'],
    },
    currentVote: {
      control: { type: 'radio' },
      options: ['up', 'down', 'none']
    }
  },
};

export default meta;
type Story = StoryObj<typeof GroupPlanIdea>;

const defaultArgs = {
  id: '1',
  title: 'Visit the Louvre Museum',
  description: 'We should definitely check out the Louvre when we visit Paris.',
  createdBy: {
    id: 'user1',
    name: 'Maya Johnson',
    avatarUrl: 'https://i.pravatar.cc/150?img=29'
  },
  createdAt: new Date().toISOString(),
  voteCount: 5,
  commentCount: 3,
  tags: ['museum', 'art', 'history'],
  metadata: {
    location: 'Paris, France',
    date: 'June 15-20',
    time: '10:00 AM - 5:00 PM',
    cost: '€17 per person'
  }
};

export const Destination: Story = {
  args: {
    ...defaultArgs,
    type: 'destination',
    title: 'Visit Barcelona in Spring',
    description: 'Barcelona has amazing weather in spring, and fewer tourists than summer.',
    currentVote: 'up',
    metadata: {
      ...defaultArgs.metadata,
      location: 'Barcelona, Spain'
    }
  },
};

export const Date: Story = {
  args: {
    ...defaultArgs,
    type: 'date',
    title: 'Travel in September',
    description: 'September has great weather, lower prices, and fewer crowds.',
    currentVote: 'none',
    tags: ['dates', 'planning', 'off-season'],
    metadata: {
      ...defaultArgs.metadata,
      date: 'September 10-20',
      cost: 'Cheaper than summer'
    }
  },
};

export const Activity: Story = {
  args: {
    ...defaultArgs,
    type: 'activity',
    title: 'Go surfing in Bali',
    description: 'Kuta and Canggu have great surfing spots for beginners and intermediates.',
    currentVote: 'up',
    tags: ['surfing', 'beach', 'outdoor'],
    metadata: {
      ...defaultArgs.metadata,
      location: 'Bali, Indonesia',
      time: 'Morning session'
    }
  },
};

export const Budget: Story = {
  args: {
    ...defaultArgs,
    type: 'budget',
    title: 'Stay under $1500 per person',
    description: 'We should aim to keep the total trip cost under $1500 per person including flights.',
    currentVote: 'down',
    voteCount: 2,
    tags: ['budget', 'planning', 'costs'],
    metadata: {
      cost: '$1500 per person'
    }
  },
};

export const WithImage: Story = {
  args: {
    ...defaultArgs,
    type: 'destination',
    title: 'Amalfi Coast, Italy',
    imageUrl: 'https://images.unsplash.com/photo-1533106958148-daaeab8b83fe?q=80&w=2070',
    tags: ['beach', 'coastline', 'mediterranean'],
    metadata: {
      ...defaultArgs.metadata,
      location: 'Amalfi Coast, Italy'
    }
  },
};

export const Pinned: Story = {
  args: {
    ...defaultArgs,
    type: 'destination',
    title: 'Tokyo, Japan in Cherry Blossom Season',
    isPinned: true,
    voteCount: 12,
    commentCount: 8,
    tags: ['cherry blossoms', 'spring', 'asia'],
    metadata: {
      ...defaultArgs.metadata,
      location: 'Tokyo, Japan',
      date: 'Late March - Early April'
    }
  },
};

export const Highlighted: Story = {
  args: {
    ...defaultArgs,
    type: 'activity',
    title: 'Hike the Inca Trail',
    isHighlighted: true,
    voteCount: 15,
    commentCount: 10,
    tags: ['hiking', 'machu picchu', 'adventure'],
    metadata: {
      ...defaultArgs.metadata,
      location: 'Peru',
      time: '4 days',
      cost: '$500-800 per person'
    }
  },
}; 