import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/types/supabase';
import { Tag } from '@/hooks/use-tags';
import { useAuth } from '@/lib/hooks/use-auth';

export interface UserInterest {
  id: string;
  tag_id: string;
  strength: number;
  tag: Tag;
}

export function useInterests() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const getUserInterests = useCallback(async () => {
    if (!supabase) {
      console.error('Supabase client not available in useInterests');
      return [];
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_interests')
        .select(
          `
          *,
          tag:tags(*)
        `
        )
        .order('strength', { ascending: false });

      if (error) throw error;
      return data as UserInterest[];
    } catch (error) {
      console.error('Error fetching user interests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load interests',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  const updateInterest = useCallback(
    async (tagId: string, strength: number) => {
      if (!supabase) {
        console.error('Supabase client not available in useInterests');
        return false;
      }
      try {
        setIsLoading(true);

        if (strength < 0 || strength > 10) {
          throw new Error('Strength must be between 0 and 10');
        }

        const { error } = await supabase.from('user_interests').upsert({
          tag_id: tagId,
          strength,
        });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Interest updated',
        });

        return true;
      } catch (error) {
        console.error('Error updating interest:', error);
        toast({
          title: 'Error',
          description: 'Failed to update interest',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, toast]
  );

  const getRecommendedDestinations = useCallback(
    async (limit: number = 10) => {
      if (!supabase) {
        console.error('Supabase client not available in useInterests');
        return [];
      }
      try {
        setIsLoading(true);
        const { data, error } = await supabase.rpc('get_destination_recommendations', {
          p_limit: limit,
        });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load recommendations',
          variant: 'destructive',
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, toast]
  );

  return {
    isLoading,
    getUserInterests,
    updateInterest,
    getRecommendedDestinations,
  };
}
