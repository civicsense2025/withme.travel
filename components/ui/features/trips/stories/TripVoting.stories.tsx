/**
 * TripVoting Stories
 *
 * Showcases the TripVoting component for polls and voting.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import type { Meta, StoryObj } from '@storybook/react';
import { TripVoting } from '../organisms/TripVoting';

// ============================================================================
// STORYBOOK METADATA
// ============================================================================

/**
 * ## TripVoting Component
 * 
 * A voting component for trips that shows options, vote counts, and allows users to cast votes.
 * 
 * ### Usage Guidelines
 * - Use for collecting user preferences on trip dates, activities, or destinations
 * - Show voting results when appropriate
 * - Set expiration dates to create urgency
 */
const meta: Meta<typeof TripVoting> = {
  title: 'Features/Trips/TripVoting',
  component: TripVoting,
  parameters: {
    layout: 'centered',
    componentSubtitle: 'Voting interface for collaborative trip decisions',
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

// ============================================================================
// MOCK DATA
// ============================================================================

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

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default state with active voting
 */
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

/**
 * Shows the results of the vote
 */
export const ShowingResults: Story = {
  args: {
    ...Default.args,
    showResults: true,
  },
};

/**
 * Shows a completed vote
 */
export const Completed: Story = {
  args: {
    ...Default.args,
    isActive: false,
  },
}; 