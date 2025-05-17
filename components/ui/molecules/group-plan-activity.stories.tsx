import type { Meta, StoryObj } from '@storybook/react';
import { GroupPlanActivity } from './group-plan-activity';

const meta: Meta<typeof GroupPlanActivity> = {
  title: 'UI/group-plan-activity',
  component: GroupPlanActivity,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['suggested', 'confirmed', 'rejected'],
    },
    onVote: { action: 'voted' },
    onExpand: { action: 'expanded' },
    onEdit: { action: 'edit clicked' },
    onDelete: { action: 'delete clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof GroupPlanActivity>;

const participants = [
  { id: 'user1', name: 'Jane Smith', avatarUrl: 'https://i.pravatar.cc/150?u=user1' },
  { id: 'user2', name: 'Mark Johnson', avatarUrl: 'https://i.pravatar.cc/150?u=user2' },
  { id: 'user3', name: 'Sarah Lee', avatarUrl: 'https://i.pravatar.cc/150?u=user3' },
  { id: 'user4', name: 'Tom Wilson', avatarUrl: 'https://i.pravatar.cc/150?u=user4' },
  { id: 'user5', name: 'Elena Rodriguez', avatarUrl: 'https://i.pravatar.cc/150?u=user5' },
];

export const SuggestedActivity: Story = {
  args: {
    id: 'activity-1',
    title: 'Visit Sagrada Familia',
    description: 'Explore the stunning Sagrada Familia, Antoni Gaudí\'s masterpiece and Barcelona\'s most iconic landmark. The basilica features intricate facades and colorful stained glass windows that create a mesmerizing play of light inside.',
    imageUrl: 'https://images.unsplash.com/photo-1583779457094-ab6f9164f5b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    location: 'Sagrada Familia, Barcelona, Spain',
    date: 'May 15, 2025',
    time: '10:00 AM',
    duration: '2 hours',
    tags: ['Architecture', 'Sightseeing', 'UNESCO'],
    voteCount: 12,
    currentVote: 'none',
    createdBy: {
      id: 'user1',
      name: 'Jane Smith',
      avatarUrl: 'https://i.pravatar.cc/150?u=user1',
    },
    participants: participants.slice(0, 3),
    status: 'suggested',
    isExpanded: false,
    isInteractive: true,
  },
};

export const ConfirmedActivity: Story = {
  args: {
    ...SuggestedActivity.args,
    id: 'activity-2',
    title: 'Tapas Tour in Gothic Quarter',
    description: "Experience Barcelona's vibrant food scene with a guided tapas tour through the historic Gothic Quarter. We'll visit 4 authentic tapas bars, sampling local specialties and learning about Catalan cuisine.",
    imageUrl: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    location: 'Gothic Quarter, Barcelona, Spain',
    date: 'May 16, 2025',
    time: '7:00 PM',
    duration: '3 hours',
    tags: ['Food', 'Tour', 'Evening'],
    voteCount: 15,
    currentVote: 'up',
    status: 'confirmed',
    participants: participants,
  },
};

export const RejectedActivity: Story = {
  args: {
    ...SuggestedActivity.args,
    id: 'activity-3',
    title: 'Day Trip to Montserrat',
    description: 'Take a day trip to the beautiful mountain of Montserrat and visit the famous monastery. This excursion might be too far from our Barcelona base for this trip.',
    imageUrl: 'https://images.unsplash.com/photo-1586951704331-9df3756cb648?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    location: 'Montserrat, Catalonia, Spain',
    date: 'May 17, 2025',
    time: '9:00 AM',
    duration: 'Full day',
    tags: ['Day Trip', 'Nature', 'Cultural'],
    voteCount: -3,
    currentVote: 'down',
    status: 'rejected',
    participants: participants.slice(0, 1),
  },
};

export const Expanded: Story = {
  args: {
    ...SuggestedActivity.args,
    isExpanded: true,
  },
};

export const NoImage: Story = {
  args: {
    ...SuggestedActivity.args,
    imageUrl: undefined,
  },
};

export const NonInteractive: Story = {
  args: {
    ...SuggestedActivity.args,
    isInteractive: false,
  },
};

export const ManyParticipants: Story = {
  args: {
    ...SuggestedActivity.args,
    participants: participants,
  },
}; 