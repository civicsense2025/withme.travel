'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Calendar, DollarSign, MapPin, CheckCircle } from 'lucide-react';
import InviteLinkBox from './InviteLinkBox';
import Link from 'next/link';
import { PAGE_ROUTES } from '@/utils/constants/routes';
import { ItineraryDaySection } from '@/components/ItineraryDaySection';

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

/**
 * GroupsLandingPage is the public landing for /groups when not logged in.
 * It showcases the value of group trip planning and encourages quick group creation.
 */
const GroupsLandingPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // --- Hero Section ---
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 max-w-5xl mx-auto">
      {/* Hero */}
      <header className="mb-20 text-center flex flex-col items-center w-full">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          Plan your next adventure together
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
          From group brainstorming to perfectly planned trips in minutes. <br />No endless group chats, no stress.
        </p>
        {/* Playful visual placeholder */}
        <div className="mb-8 flex justify-center">
          <span className="text-6xl md:text-7xl">🌍</span>
        </div>
        {/* Inline Group Creation Form */}
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
            console.log('[Group Form] Submitting:', { groupName, website });
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
              console.log('[Group Form] Response status:', res.status);
              const data = await res.json();
              console.log('[Group Form] Response data:', data);
              if (!res.ok || !data.group?.id) {
                setError(data.error || 'Failed to create group.');
                setLoading(false);
                return;
              }
              router.push(`/groups/${data.group.id}`);
            } catch (err) {
              console.error('[Group Form] Error:', err);
              setError('Something went wrong. Please try again.');
              setLoading(false);
            }
          }}
          className="flex flex-col items-center w-full max-w-md mx-auto"
        >
          <label htmlFor="groupName" className="text-xl font-semibold mb-2 text-center">
            Your Group Trip Name
          </label>
          {/* Honeypot field for spam bots */}
          <input
            type="text"
            name="website"
            autoComplete="off"
            tabIndex={-1}
            style={{ display: 'none' }}
            aria-hidden="true"
          />
          <input
            id="groupName"
            name="groupName"
            type="text"
            required
            placeholder="Enter group trip name"
            className="w-full px-4 py-3 rounded-lg border border-muted-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg mb-4 shadow-sm"
            autoComplete="off"
            maxLength={64}
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-violet-400 hover:bg-violet-500 text-white font-semibold text-lg py-3 rounded-xl transition-colors shadow-md"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Start Group Trip'}
          </button>
          {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
        </form>
      </header>

      {/* Feature Demo Section */}
      <section className="mb-20 w-full grid md:grid-cols-3 gap-8">
        <Card className="flex flex-col items-center p-8">
          <Users className="h-10 w-10 text-violet-600 mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2 text-center">Collaborative Planning</CardTitle>
          <CardDescription className="text-base text-muted-foreground text-center">
          Plan together, vote on ideas, end the group chat chaos.
          </CardDescription>
        </Card>
        <Card className="flex flex-col items-center p-8">
          <DollarSign className="h-10 w-10 text-emerald-600 mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2 text-center">Easy Expense Tracking</CardTitle>
          <CardDescription className="text-base text-muted-foreground text-center">
          Split costs fairly, track payments, settle up smoothly.
          </CardDescription>
        </Card>
        <Card className="flex flex-col items-center p-8">
          <Calendar className="h-10 w-10 text-indigo-600 mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2 text-center">Centralized Info</CardTitle>
          <CardDescription className="text-base text-muted-foreground text-center">
          All travel details in one accessible place.
          </CardDescription>
        </Card>
      </section>

      {/* Demo Itinerary Section */}
      <section className="mb-20 w-full">
        <Card className="p-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-pink-500" /> Trip Itinerary (Demo)
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              See how easy it is to build a shared itinerary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ItineraryDaySection section={itinerarySection} />
          </CardContent>
        </Card>
      </section>

      {/* Demo Expenses Section */}
      <section className="mb-20 w-full">
        <Card className="p-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-emerald-500" /> Group Expenses (Demo)
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Track and split costs with your group.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-muted-foreground/10">
              {demoExpenses.map((exp) => (
                <li key={exp.id} className="flex justify-between py-2 text-lg">
                  <span>{exp.title} <span className="text-sm text-muted-foreground">(by {exp.paidBy})</span></span>
                  <span className="font-semibold">${exp.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-right text-xl font-bold">
              Total: ${demoExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Demo Poll Section */}
      <section className="mb-20 w-full">
        <Card className="p-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-violet-500" /> Group Poll (Demo)
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Vote on destinations, dates, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-lg font-medium">{demoPoll.question}</div>
            <ul className="space-y-3">
              {demoPoll.options.map((opt) => (
                <li key={opt.id} className="flex items-center gap-4">
                  <div className="w-2/3">
                    <div className="font-semibold">{opt.text}</div>
                    <div className="h-2 bg-violet-100 rounded-full mt-1">
                      <div
                        className="h-2 bg-violet-500 rounded-full transition-all"
                        style={{ width: `${(opt.votes / (totalVotes || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-1/3 text-right text-lg font-bold">
                    {opt.votes} <span className="text-sm text-muted-foreground">votes</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Invite Demo Section */}
      <section className="mb-20 w-full">
        <Card className="p-8 flex flex-col items-center">
          <CardTitle className="text-2xl font-bold mb-2">Invite Your Friends</CardTitle>
          <CardDescription className="text-base text-muted-foreground mb-4">
            Share a simple link and start planning together instantly.
          </CardDescription>
          <InviteLinkBox groupId="demo-group" />
        </Card>
      </section>

      <CreateGroupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreateGroup={() => {}}
      />

      {/* How it Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">How WithMe.Travel Groups Work</h2>
        <ol className="list-decimal list-inside space-y-2 text-left max-w-xl mx-auto">
          <li><strong>Create & Invite:</strong> Start a planning group and invite friends with a simple link, text, WhatsApp, or Instagram DM.</li>
          <li><strong>Brainstorm & Vote:</strong> Share destinations, dates, and budgets. Quick polls help find consensus.</li>
          <li><strong>Create Your Trip:</strong> One click transforms your plan into a full trip itinerary everyone can access.</li>
        </ol>
      </section>

      {/* Testimonials Placeholder */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">What travelers are saying</h2>
        <div className="bg-muted rounded-lg p-6 text-center text-muted-foreground">
          <em>"We planned our Barcelona trip in under an hour. Before WithMe, we spent weeks in endless group texts!"</em>
          <div className="mt-2 text-sm">— Alex T., Barcelona, 6 friends</div>
        </div>
      </section>
    </div>
  );
};

export default GroupsLandingPage; 