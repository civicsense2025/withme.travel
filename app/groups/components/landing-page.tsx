'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Calendar, DollarSign, MapPin, CheckCircle } from 'lucide-react';
import InviteLinkBox from './InviteLinkBox';
import { FeatureTabs } from '@/components/FeatureTabs';

const CreateGroupModal = dynamic(() => import('./create-group-modal'), { ssr: false });

// --- Demo Data (matches real types) ---
const demoItinerarySection = {
  id: 'section-1',
  trip_id: 'demo-trip',
  position: 1,
  created_at: '2024-06-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
  day_number: 1,
  date: '2024-07-01',
  title: 'Day 1: Arrival & Tapas',
  items: [], // Will fill below
};

// Minimal demo profile for upVoters/downVoters
const demoProfile = {
  id: 'demo',
  name: 'Demo User',
  email: 'demo@example.com',
  avatar_url: null,
  username: null,
  bio: null,
  location: null,
  website: null,
  is_verified: false,
  created_at: '2024-06-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
};
const emptyVotes = {
  up: 0,
  down: 0,
  upVoters: [],
  downVoters: [],
  userVote: null,
};

// Fill items with minimal required ItineraryItem fields
const demoItineraryItems = [
  {
    id: '1',
    trip_id: 'demo-trip',
    created_at: '2024-06-01T00:00:00Z',
    section_id: 'section-1',
    title: 'Arrive in Barcelona',
    type: null,
    item_type: null,
    date: '2024-07-01',
    start_time: '15:00',
    end_time: '17:00',
    location: 'Hotel Arts',
    address: null,
    place_id: null,
    latitude: null,
    longitude: null,
    estimated_cost: null,
    currency: null,
    notes: null,
    description: 'Check in to hotel, welcome drinks at rooftop bar.',
    updated_at: null,
    created_by: null,
    is_custom: null,
    day_number: 1,
    category: null,
    status: null,
    position: 1,
    duration_minutes: null,
    cover_image_url: null,
    votes: emptyVotes,
    user_vote: null,
    creatorProfile: null,
    place: null,
    reactions: [],
  },
  {
    id: '2',
    trip_id: 'demo-trip',
    created_at: '2024-06-01T00:00:00Z',
    section_id: 'section-1',
    title: 'Tapas Crawl',
    type: null,
    item_type: null,
    date: '2024-07-01',
    start_time: '19:00',
    end_time: '22:00',
    location: 'El Born',
    address: null,
    place_id: null,
    latitude: null,
    longitude: null,
    estimated_cost: null,
    currency: null,
    notes: null,
    description: 'Explore El Born for the best tapas.',
    updated_at: null,
    created_by: null,
    is_custom: null,
    day_number: 1,
    category: null,
    status: null,
    position: 2,
    duration_minutes: null,
    cover_image_url: null,
    votes: emptyVotes,
    user_vote: null,
    creatorProfile: null,
    place: null,
    reactions: [],
  },
  {
    id: '3',
    trip_id: 'demo-trip',
    created_at: '2024-06-01T00:00:00Z',
    section_id: 'section-1',
    title: 'Beach Day',
    type: null,
    item_type: null,
    date: '2024-07-02',
    start_time: '10:00',
    end_time: '16:00',
    location: 'Barceloneta',
    address: null,
    place_id: null,
    latitude: null,
    longitude: null,
    estimated_cost: null,
    currency: null,
    notes: null,
    description: 'Relax at Barceloneta Beach, volleyball and sun.',
    updated_at: null,
    created_by: null,
    is_custom: null,
    day_number: 2,
    category: null,
    status: null,
    position: 3,
    duration_minutes: null,
    cover_image_url: null,
    votes: emptyVotes,
    user_vote: null,
    creatorProfile: null,
    place: null,
    reactions: [],
  },
];
const itinerarySection = { ...demoItinerarySection, items: demoItineraryItems };

const demoExpenses = [
  { id: 'e1', title: 'Hotel', amount: 1200, paidBy: 'Alex', date: '2024-07-01' },
  { id: 'e2', title: 'Tapas Dinner', amount: 180, paidBy: 'Jamie', date: '2024-07-01' },
  { id: 'e3', title: 'Beach Umbrella', amount: 40, paidBy: 'Taylor', date: '2024-07-02' },
];

const demoPoll = {
  question: 'Where should we go next?',
  options: [
    { id: 'p1', text: 'Barcelona, Spain', votes: 5 },
    { id: 'p2', text: 'Rome, Italy', votes: 2 },
    { id: 'p3', text: 'Paris, France', votes: 1 },
  ],
};

const totalVotes = demoPoll.options.reduce((sum, o) => sum + o.votes, 0);

const wittyHeadlines = [
  "No more group chat chaos. Plan together, actually get things done.",
  "Tired of endless DMs? Make group travel planning fun again.",
  "Turn 'who's in?' into 'we're booked!'—together.",
  "Stop arguing in the chat. Start planning for real.",
  "Group trips without the group headaches."
];

/**
 * GroupsLandingPage is the public landing for /groups when not logged in.
 * It showcases the value of group trip planning and encourages quick group creation.
 */
const GroupsLandingPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // Pick a witty headline on mount
  const [headline] = useState(() => wittyHeadlines[Math.floor(Math.random() * wittyHeadlines.length)]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 md:py-12 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8 md:gap-12">
        {/* Left: Hero Heading, Subheading, Group Title Form */}
        <div className="flex-1 flex flex-col items-start max-w-xl w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tight text-gradient bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
            {headline}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8">
            From group brainstorming to perfectly planned trips in minutes. No endless group chats, no stress.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              const form = e.currentTarget as HTMLFormElement & {
                groupName: { value: string };
                website: { value: string };
              };
              const groupName = form.groupName.value.trim();
              const website = form.website.value;
              if (!groupName) {
                setError('Please enter a group name.');
                setLoading(false);
                return;
              }
              try {
                const res = await fetch('/api/groups', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: groupName, website }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to create group.');
                if (!data.group?.id) throw new Error('No group ID returned.');
                router.push(`/groups/${data.group.id}`);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
                setLoading(false);
              }
            }}
            className="flex flex-col items-start w-full max-w-md gap-2 md:gap-3"
          >
            <label htmlFor="groupName" className="text-base md:text-lg font-semibold mb-1 md:mb-2">
              Your Group Trip Name
            </label>
            {/* Honeypot field for spam bots */}
            <input
              type="text"
              name="website"
              autoComplete="off"
              tabIndex={-1}
              className="hidden"
            />
            <input
              id="groupName"
              name="groupName"
              type="text"
              placeholder="e.g. Summer in Spain"
              className="mb-2 md:mb-3 px-3 md:px-4 py-2 md:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 w-full text-base md:text-lg shadow-sm"
              disabled={loading}
              maxLength={64}
              required
            />
            {error && <div className="text-red-500 text-xs md:text-sm mb-2">{error}</div>}
            <Button type="submit" size="lg" className="rounded-full px-6 md:px-8 py-2.5 md:py-3 font-bold text-base md:text-lg bg-gradient-to-br from-purple-500 to-pink-400 text-white shadow-lg hover:scale-105 transition-transform">
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </form>
        </div>
        {/* Right: FeatureTabs Demo */}
        <div className="flex-1 w-full max-w-xl mt-8 md:mt-0">
          <FeatureTabs />
        </div>
      </div>
    </div>
  );
};

export default GroupsLandingPage; 