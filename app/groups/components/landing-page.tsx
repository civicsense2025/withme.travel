'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Calendar, DollarSign, MapPin, CheckCircle, MessageSquare, Vote, MapPinned } from 'lucide-react';
import InviteLinkBox from './InviteLinkBox';
import { FeatureTabs } from '@/components/FeatureTabs';
import { Container } from '@/components/container';

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
    <Container size="full">
      <main className="flex min-h-screen flex-col w-full bg-white dark:bg-black overflow-hidden">
        {/* Hero Section with gradient background */}
        <section className="py-20 w-full bg-gradient-to-br from-blue-400/10 to-teal-400/10">
          <div className="text-center px-6 md:px-10 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight bg-gradient-to-br from-blue-600 via-blue-500 to-teal-400 bg-clip-text text-transparent">
              {headline}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 mx-auto">
              From group brainstorming to perfectly planned trips in minutes. No endless group chats, no stress.
            </p>
            
            {/* Group creation form */}
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
              className="flex flex-col items-center w-full max-w-md mx-auto gap-4"
            >
              {/* Honeypot field for spam bots */}
              <input
                type="text"
                name="website"
                autoComplete="off"
                tabIndex={-1}
                className="hidden"
              />
              
              <div className="w-full">
                <div className="mb-2">
                  <label htmlFor="groupName" className="text-lg font-semibold">
                    Your Group Trip Name
                  </label>
                </div>
                <input
                  id="groupName"
                  name="groupName"
                  type="text"
                  placeholder="Summer Italy Trip 2025"
                  className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-travel-purple"
                  required
                />
                {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
              </div>
              
              <Button
                type="submit"
                className="w-full py-6 rounded-full bg-travel-purple hover:bg-purple-400 text-purple-900 text-lg font-medium"
                disabled={loading}
              >
                {loading ? 'Creating group...' : 'Create Free Group'}
              </Button>
              
              <p className="text-muted-foreground text-sm mt-2">
                No account needed. Invite friends with a link.
              </p>
            </form>
          </div>
        </section>

        {/* Features Section with clean, spacious design */}
        <section className="py-32 w-full bg-white dark:bg-black">
          <div className="text-center px-6 md:px-10 max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
              Plan <span className="text-travel-purple dark:text-travel-purple">Together</span>, Travel Better
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-24 mx-auto max-w-2xl">
              Everything you need to create amazing group trips without the headaches.
            </p>

            {/* Features grid with icons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
              <div className="flex flex-col items-center">
                <div className="bg-purple-50 dark:bg-purple-900/20 w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                  <MessageSquare className="text-travel-purple h-12 w-12" />
                </div>
                <h3 className="text-2xl md:text-3xl font-medium mb-4">Brainstorm Ideas</h3>
                <p className="text-lg text-muted-foreground max-w-xs">
                  Collect everyone's ideas in one place. No more scrolling through endless group chats.
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-purple-50 dark:bg-purple-900/20 w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                  <Vote className="text-travel-purple h-12 w-12" />
                </div>
                <h3 className="text-2xl md:text-3xl font-medium mb-4">Vote & Decide</h3>
                <p className="text-lg text-muted-foreground max-w-xs">
                  Everyone gets a say. Easily vote on activities, destinations, and timing.
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-purple-50 dark:bg-purple-900/20 w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                  <MapPinned className="text-travel-purple h-12 w-12" />
                </div>
                <h3 className="text-2xl md:text-3xl font-medium mb-4">Create Your Trip</h3>
                <p className="text-lg text-muted-foreground max-w-xs">
                  Turn your group's favorite ideas into a perfect itinerary that everyone can access.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section with tab interface */}
        <section className="py-24 w-full bg-neutral-50 dark:bg-neutral-900">
          <div className="px-6 md:px-10 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
                See How It Works
              </h2>
              <p className="text-xl text-muted-foreground mx-auto max-w-2xl">
                Our collaborative tools make group planning a breeze.
              </p>
            </div>
            
            <FeatureTabs />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 w-full bg-gradient-to-br from-blue-400/10 to-teal-400/10">
          <div className="text-center px-6 md:px-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
              Ready To Start Planning?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 mx-auto">
              Create your first group in seconds. No account required.
            </p>
            
            <Button
              onClick={() => setModalOpen(true)}
              size="lg"
              className="rounded-full bg-travel-purple hover:bg-purple-400 text-purple-900 text-lg py-6 px-10"
            >
              Create a Group Now
            </Button>
          </div>
        </section>
      </main>
      
      {/* Create Group Modal */}
      {modalOpen && (
        <CreateGroupModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreateGroup={(group) => router.push(`/groups/${group.id}`)}
        />
      )}
    </Container>
  );
};

export default GroupsLandingPage; 