'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/lib/hooks/use-toast'

interface Poll {
  id: number;
  title: string;
  description: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  options: PollOption[];
  user_has_voted: boolean;
  total_votes: number;
}

interface PollOption {
  id: number;
  poll_id: number;
  text: string;
  votes: number;
  has_voted: boolean;
}

export function useTripPolls(tripId: string) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPolls = useCallback(async () => {
    if (!tripId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trips/${tripId}/vote/polls`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch polls');
      }

      const data = await response.json();
      setPolls(data);
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch polls');
      toast({
        title: 'Error',
        description: 'Failed to load trip polls',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [tripId, toast]);

  const castVote = useCallback(
    async (pollId: number, optionId: number) => {
      if (!tripId || !pollId || !optionId) return;

      try {
        const response = await fetch(`/api/trips/${tripId}/vote/${pollId}/cast`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            optionId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to cast vote');
        }

        // Optimistically update the UI
        setPolls((currentPolls) =>
          currentPolls.map((poll) => {
            if (poll.id !== pollId) return poll;

            // Find the previously voted option (if any)
            const previousVote = poll.options.find((opt) => opt.has_voted);

            // Update options with the new vote
            const updatedOptions = poll.options.map((option) => {
              if (option.id === optionId) {
                return {
                  ...option,
                  votes: previousVote ? option.votes : option.votes + 1,
                  has_voted: true,
                };
              }

              if (previousVote && option.id === previousVote.id) {
                return {
                  ...option,
                  votes: option.votes - 1,
                  has_voted: false,
                };
              }

              return option;
            });

            return {
              ...poll,
              options: updatedOptions,
              user_has_voted: true,
            };
          })
        );

        toast({
          description: 'Your vote has been recorded',
        });

        // Refresh polls to ensure data consistency
        setTimeout(() => {
          fetchPolls();
        }, 1000);
      } catch (err) {
        console.error('Error casting vote:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to cast your vote',
          variant: 'destructive',
        });
      }
    },
    [tripId, fetchPolls, toast]
  );

  const createPoll = useCallback(
    async (pollData: any) => {
      if (!tripId) return null;

      try {
        const response = await fetch(`/api/trips/${tripId}/vote/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pollData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create poll');
        }

        const data = await response.json();

        toast({
          description: 'Poll created successfully',
        });

        // Refresh polls to include the new one
        fetchPolls();

        return data;
      } catch (err) {
        console.error('Error creating poll:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to create poll',
          variant: 'destructive',
        });
        return null;
      }
    },
    [tripId, fetchPolls, toast]
  );

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  return {
    polls,
    loading,
    error,
    fetchPolls,
    castVote,
    createPoll,
    activePolls: polls.filter((p) => p.is_active),
    completedPolls: polls.filter((p) => !p.is_active),
  };
}
