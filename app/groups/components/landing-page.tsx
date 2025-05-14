'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Users,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle,
  MessageSquare,
  Vote,
  MapPinned,
} from 'lucide-react';
import InviteLinkBox from './InviteLinkBox';
import { FeatureTabs } from '@/components/FeatureTabs';
import { Container } from '@/components/container';
import HeroEmojiExplosion from '@/components/HeroEmojiExplosion';
import { motion, AnimatePresence } from 'framer-motion';

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
  'No more group chat chaos. Plan together, actually get things done.',
  "Turn 'who's in?' into 'we're booked!'—together.",
  'Stop arguing in the chat. Start planning for real.',
  'Group trips without the group headaches.',
];

const BOUNCE_EMOJIS = ['💃', '��', '👰‍♂️', '🤵'];

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
  const [headline] = useState(
    () => wittyHeadlines[Math.floor(Math.random() * wittyHeadlines.length)]
  );

  return (
    <Container size="full">
      <main className="flex min-h-screen flex-col w-full bg-white dark:bg-black overflow-hidden">
        {/* Hero Section with clean background */}
        <section className="py-24 w-full bg-white dark:bg-black">
          <div className="text-center px-6 md:px-10 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight">
              {headline.split(' ').map((word, i, arr) => (
                <React.Fragment key={i}>
                  {i === arr.length - 1 ? (
                    <span className="text-travel-purple">{word}</span>
                  ) : (
                    word
                  )}{' '}
                </React.Fragment>
              ))}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-16 mx-auto">
              From group brainstorming to perfectly planned trips in minutes. No endless group
              chats, no stress.
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
                  setError(
                    err instanceof Error ? err.message : 'Something went wrong. Please try again.'
                  );
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
              <div className="flex flex-col w-full gap-2">
                <input
                  type="text"
                  name="groupName"
                  placeholder="Name your group (e.g., Italy Squad 2024)"
                  required
                  className="flex-1 h-16 px-5 py-4 rounded-full border-2 border-black dark:border-zinc-700 bg-white dark:bg-black text-black dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-travel-purple"
                />
              </div>
              <Button
                type="submit"
                className="h-16 px-10 rounded-full bg-gradient-to-r from-travel-purple to-purple-400 hover:from-purple-400 hover:to-travel-purple text-white font-medium text-lg w-full relative overflow-visible"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>

            {/* Emoji explosion at the bottom of hero section */}
            <div className="flex justify-center mt-10">
              <HeroEmojiExplosion variant="people-bounce" size={40} />
            </div>
          </div>
        </section>

        {/* Features Demo Section */}
        <section className="py-24 w-full bg-zinc-50 dark:bg-zinc-900">
          <div className="px-6 md:px-10 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Plan together, <span className="text-travel-purple">travel better</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Every tool your group needs to turn trip ideas into reality—without the chaos.
              </p>
            </div>

            {/* FeatureTabs component */}
            <FeatureTabs />

            {/* Features Grid */}
            <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: <Vote className="h-10 w-10 text-travel-purple" />,
                  title: 'Group Polls',
                  description:
                    'Vote on destinations, dates, and activities to make decisions everyone feels good about.',
                },
                {
                  icon: <DollarSign className="h-10 w-10 text-travel-purple" />,
                  title: 'Split Expenses',
                  description:
                    'Track who paid for what and settle up easily—no more math headaches.',
                },
                {
                  icon: <MapPinned className="h-10 w-10 text-travel-purple" />,
                  title: 'Collaborative Map',
                  description:
                    'Pin and discover places you all want to visit, with easy visualization.',
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="border-2 border-black dark:border-zinc-800 bg-white dark:bg-black rounded-2xl shadow-sm"
                >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="mb-4 bg-zinc-50 dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 w-full">
          <div className="text-center px-6 md:px-10 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Travelers <span className="text-travel-purple">love</span> our groups
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-16 max-w-2xl mx-auto">
              See how travel groups are making trip planning stress-free.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  quote:
                    'Planning our Bali trip was a breeze instead of a nightmare. Everyone could contribute ideas and vote.',
                  author: 'Jamie S.',
                  trip: 'Bali, 8 friends',
                },
                {
                  quote:
                    "No more 'who owes what' drama. We tracked expenses in real-time and everyone paid their fair share.",
                  author: 'Michael T.',
                  trip: 'Europe, 4 couples',
                },
              ].map((testimonial, index) => (
                <Card
                  key={index}
                  className="bg-white dark:bg-black text-left p-6 border-2 border-black dark:border-zinc-800 rounded-2xl shadow-sm"
                >
                  <CardContent className="p-0">
                    <p className="text-lg mb-4">"{testimonial.quote}"</p>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.trip}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 w-full border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-center px-6 md:px-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Start your group, <span className="text-travel-purple">start the adventure</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 mx-auto">
              It takes less than a minute to create your first group.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full" onClick={() => setModalOpen(true)}>
                Create a Group
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={() => router.push('/groups/manage')}
              >
                View My Groups
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreateGroup={(group) => router.push(`/groups/${group.id}`)}
      />
    </Container>
  );
};

export default GroupsLandingPage;
