// ============================================================================
// GROUPS LANDING PAGE CLIENT COMPONENT
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/features/layout/organisms/container';
import HeroEmojiExplosion from '@/components/HeroEmojiExplosion';
import { DestinationsFAQ } from '@/components/features/faq';
import { useThemeSync } from '@/components/features/ui/ThemeProvider';
import { CollaborativeItinerarySection } from '@/components/features/groups/organisms/CollaborativeItinerarySection';
import { useGroups } from '@/lib/features/groups/hooks';
import { useToast } from '@/lib/hooks/use-toast'

const CreateGroupModal = dynamic(() => import('@/components/features/groups/molecules/CreateGroupModal'), { ssr: false });

const wittyHeadlines = [
  'No more group chat chaos. Plan together, actually get things done.',
  "Turn 'who's in?' into 'we're booked!'—together.",
  'Stop arguing in the chat. Start planning for real.',
  'Group trips without the group headaches.',
];

interface GroupsLandingPageClientProps {
  initialGroups?: any[];
  isAuthenticated?: boolean;
}

export function GroupsLandingPageClient({ initialGroups, isAuthenticated }: GroupsLandingPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [headline] = useState(
    () => wittyHeadlines[Math.floor(Math.random() * wittyHeadlines.length)]
  );
  const { isDark } = useThemeSync();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);
  const { addGroup } = useGroups(false); // Don't fetch on mount
  const { toast } = useToast();

  // --------------------------------------------------------------------------
  // HERO SECTION
  // --------------------------------------------------------------------------
  const HeroSection = () => (
    <section className="py-24 w-full bg-background">
      <div className="text-center px-6 md:px-10 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight text-foreground">
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
          From group brainstorming to perfectly planned trips in minutes. No endless group chats, no
          stress.
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
              const result = await addGroup({ name: groupName });
              if (result.success) {
                router.push(`/groups/${result.data.id}`);
              } else {
                throw new Error(result.error || 'Failed to create group.');
              }
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
          <input type="text" name="website" autoComplete="off" tabIndex={-1} className="hidden" />
          <div className="flex flex-col w-full gap-2">
            <input
              type="text"
              name="groupName"
              placeholder="Name your group (e.g., Italy Squad 2024)"
              required
              className="flex-1 h-16 px-5 py-4 rounded-full border-2 border-border bg-background text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-travel-purple"
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
        <div className="flex justify-center mt-16 mb-10">
          <HeroEmojiExplosion variant="people-bounce" size={40} />
        </div>
      </div>
    </section>
  );

  // --------------------------------------------------------------------------
  // FEATURES SECTION
  // --------------------------------------------------------------------------
  const FeaturesSection = () => (
    <section className="py-24 w-full bg-subtle">
      <div className="px-6 md:px-10 max-w-7xl mx-auto">
        <CollaborativeItinerarySection />
      </div>
    </section>
  );

  // --------------------------------------------------------------------------
  // CTA SECTION
  // --------------------------------------------------------------------------
  const CTASection = () => (
    <section className="py-24 w-full border-border bg-subtle">
      <div className="text-center px-6 md:px-10 max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight text-foreground">
          Start your group, <span className="text-travel-purple">start the adventure</span>
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-16 mx-auto">
          It takes less than a minute to create your first group.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
  );

  // --------------------------------------------------------------------------
  // FAQ SECTION
  // --------------------------------------------------------------------------
  const FAQSection = () => (
    <section className="py-24 w-full bg-background">
      <div className="px-6 md:px-10 max-w-6xl mx-auto">
        <DestinationsFAQ
          title="Group Travel FAQ"
          description="Find answers to common questions about planning group trips to destinations around the world"
          layout="sidebar"
        />
      </div>
    </section>
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await addGroup({ name, description });
      if (result.success) {
        setSuccess(true);
        setName('');
        setDescription('');
        toast({
          title: 'Group created successfully',
        });
      } else {
        throw new Error(result.error || 'Failed to create group');
      }
    } catch (err) {
      setError('Failed to create group');
      toast({
        title: 'Error',
        description: 'Failed to create group',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------------
  return (
    <Container size="full">
      <main className="flex min-h-screen flex-col w-full bg-background overflow-hidden">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
        <FAQSection />
      </main>
      <CreateGroupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onGroupCreated={(group: { id: string }) => router.push(`/groups/${group.id}`)}
      />
    </Container>
  );
}

// Default export for backward compatibility
export default GroupsLandingPageClient;
