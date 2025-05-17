/**
 * ProfileCard Component Stories
 * 
 * Storybook stories for the ProfileCard component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ProfileCard } from './ProfileCard';

// ============================================================================
// META
// ============================================================================

const meta: Meta<typeof ProfileCard> = {
  title: 'UI/Features/user/ProfileCard',
  component: ProfileCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onFollowToggle: { action: 'followToggled' },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ProfileCard>;

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default profile card with minimal information
 */
export const Default: Story = {
  args: {
    profile: {
      id: '1',
      name: 'Jane Smith',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      role: 'Travel Enthusiast',
    },
  },
};

/**
 * Profile with comprehensive information
 */
export const CompleteProfile: Story = {
  args: {
    profile: {
      id: '2',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      bio: 'Travel photographer and writer. Always seeking the next adventure in remote corners of the world. Passionate about sustainable tourism and authentic cultural experiences.',
      location: 'San Francisco, CA',
      website: 'https://alex-travels.example.com',
      created_at: '2021-06-15T00:00:00Z',
      role: 'Travel Writer',
      interests: ['Photography', 'Hiking', 'Cultural Experiences', 'Food Tourism', 'Adventure'],
      is_verified: true,
    },
    showFollowButton: true,
  },
};

/**
 * Profile with Follow button (not following)
 */
export const WithFollowButton: Story = {
  args: {
    profile: {
      id: '3',
      name: 'Maria Rodriguez',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
      bio: 'Fitness enthusiast and travel blogger. I explore the world one workout at a time.',
      location: 'Miami, FL',
      role: 'Travel Blogger',
    },
    showFollowButton: true,
    isFollowing: false,
  },
};

/**
 * Profile that the user is already following
 */
export const AlreadyFollowing: Story = {
  args: {
    profile: {
      id: '3',
      name: 'Maria Rodriguez',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
      bio: 'Fitness enthusiast and travel blogger. I explore the world one workout at a time.',
      location: 'Miami, FL',
      role: 'Travel Blogger',
    },
    showFollowButton: true,
    isFollowing: true,
  },
};

/**
 * Profile with link
 */
export const WithLink: Story = {
  args: {
    profile: {
      id: '4',
      name: 'David Chen',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      bio: 'Food lover and culinary explorer. Finding the best local dishes around the globe.',
      role: 'Food Explorer',
    },
    href: '#profile/david-chen',
  },
};

/**
 * Verified profile
 */
export const VerifiedProfile: Story = {
  args: {
    profile: {
      id: '5',
      name: 'Sarah Williams',
      avatar_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
      bio: 'Award-winning travel journalist with 10+ years of experience. Featured in National Geographic, Travel + Leisure, and CNN Travel.',
      location: 'London, UK',
      role: 'Travel Journalist',
      is_verified: true,
    },
  },
};

/**
 * Multiple profile cards in a grid
 */
export const ProfileGrid: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Travel Community</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <ProfileCard
          profile={{
            id: '1',
            name: 'Jane Smith',
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
            role: 'Travel Enthusiast',
            location: 'New York, NY',
          }}
          showFollowButton
        />
        <ProfileCard
          profile={{
            id: '2',
            name: 'Alex Johnson',
            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
            role: 'Travel Writer',
            location: 'San Francisco, CA',
            is_verified: true,
          }}
          showFollowButton
          isFollowing
        />
        <ProfileCard
          profile={{
            id: '3',
            name: 'Maria Rodriguez',
            avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
            role: 'Travel Blogger',
            location: 'Miami, FL',
          }}
          showFollowButton
        />
        <ProfileCard
          profile={{
            id: '4',
            name: 'David Chen',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            role: 'Food Explorer',
            location: 'Chicago, IL',
          }}
          showFollowButton
        />
      </div>
    </div>
  ),
}; 