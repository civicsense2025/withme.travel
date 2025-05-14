'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { ArrowLeft } from 'lucide-react';
import { useLayoutMode } from '@/app/context/layout-mode-context';
import { Plan } from '../../types/plan';
import Link from 'next/link';

const PlansClient: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const groupId = params?.id as string;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creator, setCreator] = useState<any | null>(null);

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
        console.error('Unexpected error loading plan:', err);
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
        <div className="text-center space-y-4">
          <h3 className="text-xl font-medium text-destructive">Error Loading Plan</h3>
          <p className="text-muted-foreground">{error || 'Plan not found'}</p>
          <button
            onClick={handleBackClick}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link
              href={`/groups/${groupId}/plans`}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Plans
            </Link>
            <h1 className="text-2xl font-bold">{plan.name}</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* This would normally contain the actual plan content */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Plan Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                <p className="text-muted-foreground">
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(plan.created_at || '').toLocaleDateString()}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Status:</span>{' '}
                  {plan.is_active ? 'Active' : 'Archived'}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Created By:</span> {creator?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Plan Description</h3>
                <p className="text-muted-foreground">
                  {plan.description || 'No description available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlansClient;
