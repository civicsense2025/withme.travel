'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { ArrowLeft } from 'lucide-react';
import { useLayoutMode } from '@/app/context/layout-mode-context';
import { Plan } from '../../types/plan';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/text';
import { VoteAndDecideSection } from '@/components/ui/VoteAndDecideSection';
import PlanIdeasClient from './plan-ideas-client';
import VotingClient from './voting-client';

interface PlansClientProps {
  groupId: string;
  planId: string;
  planSlug: string;
  planName: string;
  groupName: string;
  initialIdeas: any[];
  isAdmin: boolean;
  isCreator: boolean;
  userId: string;
  isAuthenticated: boolean;
  isGuest?: boolean;
  guestToken?: string | null;
}

const PlansClient: React.FC<PlansClientProps> = ({
  groupId,
  planId,
  planSlug,
  planName,
  groupName,
  initialIdeas,
  isAdmin,
  isCreator,
  userId,
  isAuthenticated,
  isGuest,
  guestToken,
}) => {
  const router = useRouter();
  const params = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creator, setCreator] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('ideas');

  // Get layout mode context to handle fullscreen
  const { setFullscreen } = useLayoutMode();

  // Set fullscreen mode when component mounts
  useEffect(() => {
    // Enable fullscreen mode (removes navbar)
    setFullscreen(true);

    // Cleanup: disable fullscreen mode when component unmounts
    return () => {
      setFullscreen(false);
    };
  }, [setFullscreen]);

  // Fetch plan data
  useEffect(() => {
    async function fetchPlan() {
      try {
        setLoading(true);
        setError(null);

        const planSlug = params?.slug as string;
        if (!planSlug || !groupId) {
          setError('Invalid plan or group ID');
          return;
        }

        console.log('Fetching plan data for:', { groupId, planSlug });

        const supabase = getBrowserClient();
        const { data, error: fetchError } = await supabase
          .from('group_plans')
          .select(
            `
            *,
            creator:created_by(
              id,
              email,
              name,
              avatar_url,
              username
            )
          `
          )
          .eq('group_id', groupId)
          .eq('slug', planSlug)
          .single();

        if (fetchError) {
          console.error('Error fetching plan:', fetchError);
          setError(fetchError.message);
          return;
        }

        if (!data) {
          setError('Plan not found');
          return;
        }

        console.log('Loaded plan data:', data);
        // Map DB data to Plan interface
        const planData: Plan = {
          id: data.id,
          name: data.name,
          description: data.description || undefined,
          slug: data.slug || '',
          created_at: data.created_at || '',
          created_by: data.created_by || '',
          group_id: data.group_id || '',
          is_active: !data.is_archived, // Convert is_archived to is_active
          metadata: {},
        };
        setPlan(planData);

        // Store creator info separately
        setCreator(data.creator);
      } catch (err) {
        console.error('-nexpected error loading plan:', err);
        setError('Failed to load plan data');
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, [groupId, params?.slug]);

  // Back to plans list
  const handleBackClick = () => {
    router.push(`/groups/${groupId}/plans`);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-pulse text-center">
          <h3 className="text-lg font-medium">Loading plan...</h3>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <div className="text-center space-yU4">
          <h3 className="text-xl font-medium text-destructive">Error Loading Plan</h3>
          <p className="text-muted-foreground">{error || 'Plan not found'}</p>
          <button
            onClick={handleBackClick}
            className="mt-4 pxU4 pyU2 bg-primary text-white rounded-md"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-wU7xl pyU4 space-yU6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href={`/groups/${groupId}/plans`} passHref>
            <Button variant="ghost" size="sm" className="mb-2">
              <ChevronLeft className="hU4 wU4 mr-1" /> Back to plans
            </Button>
          </Link>
          <Heading level={1} size="large" className="mb-1">
            {plan.name}
          </Heading>
          <Text className="text-sm text-muted-foreground">Plan together in {plan.group_id}</Text>
        </div>
      </div>
      <Separator />
      <Tabs defaultValue="ideas" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="vote">Vote & Decide</TabsTrigger>
          <TabsTrigger value="trip">Create Trip</TabsTrigger>
        </TabsList>

        <TabsContent value="ideas" className="mt-0">
          <PlanIdeasClient
            groupId={groupId}
            planId={plan.id}
            planSlug={plan.slug}
            planName={plan.name}
            groupName={plan.group_id}
            initialIdeas={initialIdeas}
            isAdmin={isAdmin}
            isCreator={isCreator}
            userId={userId}
            isAuthenticated={isAuthenticated}
            isGuest={isGuest}
            guestToken={guestToken}
          />
        </TabsContent>

        <TabsContent value="vote" className="mt-0">
          <div className="bg-card shadow-sm rounded-lg border">
            <VoteAndDecideSection />
          </div>
        </TabsContent>

        <TabsContent value="trip" className="mt-0">
          <VotingClient
            groupId={groupId}
            planSlug={plan.slug}
            groupName={plan.group_id}
            currentUserId={userId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlansClient;
