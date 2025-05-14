import type { Meta, StoryObj } from '@storybook/react';
import { TripVoting } from './TripVoting';

const COMPONENT_CATEGORIES = {
  TRIP: 'Trip Features',
};

const meta: Meta<typeof TripVoting> = {
  title: 'Trip Features/TripVoting',
  component: TripVoting,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tripId: { control: 'text', description: 'Trip ID' },
    pollId: { control: 'text', description: 'Poll ID' },
    title: { control: 'text', description: 'Poll title' },
    description: { control: 'text', description: 'Poll description' },
    options: { control: 'object', description: 'Vote options' },
    isActive: { control: 'boolean', description: 'Is voting active?' },
    showResults: { control: 'boolean', description: 'Show results' },
    expiresAt: { control: 'date', description: 'Expiration date' },
    onVote: { control: false, description: 'Vote callback' },
  },
};

export default meta;
type Story = StoryObj<typeof TripVoting>;

const mockOptions = [
  {
    id: 'opt1',
    title: 'Option 1',
    description: 'First option',
    votes: 5,
    hasVoted: false,
    voters: [],
  },
  {
    id: 'opt2',
    title: 'Option 2',
    description: 'Second option',
    votes: 3,
    hasVoted: false,
    voters: [],
  },
];

export const Default: Story = {
  args: {
    tripId: 'trip-123',
    pollId: 'poll-abc',
    title: 'Where should we go next?',
    description: 'Vote for your favorite destination!',
    options: mockOptions,
    isActive: true,
    showResults: false,
    expiresAt: new Date(Date.now() + 86400000), // 1 day from now
    onVote: undefined,
  },
};
