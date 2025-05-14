'use client';

import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/types/supabase';
import type { TypedSupabaseClient } from '@/utils/supabase/browser-client';

export type Tag = {
  id: string;
  name: string;
  slug: string;
  category: string;
  emoji?: string;
  description?: string;
  use_count: number | null;
  is_verified: boolean | null;
};

export type TagSuggestion = {
  id: string;
  tag_id: string;
  destination_id: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
};

export function useTags() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [supabase, setSupabase] = useState<TypedSupabaseClient | null>(null);

  // Initialize Supabase client safely in an effect
  useEffect(() => {
    // Only import and initialize in browser environment
    if (typeof window !== 'undefined') {
      import('@/utils/supabase/browser-client').then(({ getBrowserClient }) => {
        setSupabase(getBrowserClient());
      });
    }
  }, []);

  const getDestinationTags = useCallback(
    async (destinationId: string) => {
      if (!supabase) {
        console.error('Supabase client not available in useTags');
        return [];
      }
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('destination_tags')
          .select(
            `
          *,
          tag:tags(*)
        `
          )
          .eq('destination_id', destinationId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching destination tags:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tags',
          variant: 'destructive',
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, toast]
  );

  const suggestTag = useCallback(
    async (destinationId: string, tagData: Partial<Tag>) => {
      if (!supabase) {
        console.error('Supabase client not available in useTags');
        return false;
      }
      try {
        setIsLoading(true);

        // Defensive: Ensure tagData.name is defined and a string
        if (!tagData.name || typeof tagData.name !== 'string') {
          toast({
            title: 'Error',
            description: 'Tag name is required',
            variant: 'destructive',
          });
          setIsLoading(false);
          return false;
        }

        // First, try to find the tag by name
        const { data: tagResult, error: tagError } = await supabase
          .from('tags')
          .select('*')
          .eq('name', tagData.name)
          .maybeSingle();

        let tagId: string | undefined;
        if (tagError && tagError.code !== 'PGRST116') {
          // Only throw if error is not "no rows found"
          throw tagError;
        }

        if (!tagResult) {
          // Tag doesn't exist, create it
          const { data: newTag, error: createError } = await supabase
            .from('tags')
            .insert([
              {
                name: tagData.name,
                slug: tagData.name.toLowerCase().replace(/\s+/g, '-'),
                category: tagData.category || 'general',
                emoji: tagData.emoji,
                description: tagData.description,
              },
            ])
            .select()
            .single();

          if (createError || !newTag) throw createError || new Error('Failed to create tag');
          tagId = newTag.id;
        } else {
          tagId = tagResult.id;
        }

        if (!tagId) {
          toast({
            title: 'Error',
            description: 'Failed to resolve tag ID',
            variant: 'destructive',
          });
          setIsLoading(false);
          return false;
        }

        // Create the tag suggestion (user_suggested_tags table does not have tag_id, so use name/slug/category)
        const { error: suggestionError } = await supabase.from('user_suggested_tags').insert([
          {
            name: tagData.name,
            slug: tagData.name.toLowerCase().replace(/\s+/g, '-'),
            category: tagData.category || 'general',
            destination_id: destinationId,
          },
        ]);

        if (suggestionError) throw suggestionError;

        toast({
          title: 'Success',
          description: 'Tag suggestion submitted for review',
        });

        return true;
      } catch (error) {
        console.error('Error suggesting tag:', error);
        toast({
          title: 'Error',
          description: 'Failed to suggest tag',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, toast]
  );

  const voteOnTag = useCallback(
    async (destinationId: string, tagId: string, isUpvote: boolean) => {
      if (!supabase) {
        console.error('Supabase client not available in useTags');
        return false;
      }
      try {
        setIsLoading(true);

        // Defensive: Only increment the correct vote column
        const updateField = isUpvote ? { votes_up: 1 } : { votes_down: 1 };

        // Use PostgREST's increment syntax
        const { error } = await supabase
          .from('destination_tags')
          .update(
            {
              ...updateField,
            },
            { count: 'exact' }
          )
          .eq('destination_id', destinationId)
          .eq('tag_id', tagId);

        if (error) throw error;

        return true;
      } catch (error) {
        console.error('Error voting on tag:', error);
        toast({
          title: 'Error',
          description: 'Failed to record vote',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, toast]
  );

  const getUserInterests = useCallback(async () => {
    if (!supabase) {
      console.error('Supabase client not available in useTags');
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
      return data;
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

  const updateUserInterest = useCallback(
    async (tagId: string, strength: number) => {
      if (!supabase) {
        console.error('Supabase client not available in useTags');
        return false;
      }
      try {
        setIsLoading(true);

        const { error } = await supabase.from('user_interests').upsert({
          tag_id: tagId,
          strength,
        });

        if (error) throw error;

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

  const getTags = useCallback(async () => {
    if (!supabase) {
      console.error('Supabase client not available in useTags');
      return [];
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('use_count', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tags',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  const createTag = useCallback(
    async (name: string) => {
      if (!supabase) {
        console.error('Supabase client not available in useTags');
        return null;
      }
      try {
        setIsLoading(true);

        const { data: tagResult, error: tagError } = await supabase
          .from('tags')
          .select('*')
          .eq('name', name)
          .single();

        if (tagError) {
          // Tag doesn't exist, create it
          const { data: newTag, error: createError } = await supabase
            .from('tags')
            .insert({
              name: name,
              slug: name?.toLowerCase().replace(/\s+/g, '-'),
              category: 'general',
            })
            .select()
            .single();

          if (createError) throw createError;
          return newTag;
        } else {
          return tagResult;
        }
      } catch (error) {
        console.error('Error creating tag:', error);
        toast({
          title: 'Error',
          description: 'Failed to create tag',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, toast]
  );

  const addTagToTrip = useCallback(
    async (tripId: string, tagId: string) => {
      if (!supabase) {
        console.error('Supabase client not available in useTags');
        return false;
      }
      try {
        setIsLoading(true);

        const { error } = await supabase.from('destination_tags').insert({
          destination_id: tripId,
          tag_id: tagId,
        });

        if (error) throw error;

        return true;
      } catch (error) {
        console.error('Error adding tag to trip:', error);
        toast({
          title: 'Error',
          description: 'Failed to add tag to trip',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, toast]
  );

  const removeTagFromTrip = useCallback(
    async (tripId: string, tagId: string) => {
      if (!supabase) {
        console.error('Supabase client not available in useTags');
        return false;
      }
      try {
        setIsLoading(true);

        const { error } = await supabase
          .from('destination_tags')
          .delete()
          .eq('destination_id', tripId)
          .eq('tag_id', tagId);

        if (error) throw error;

        return true;
      } catch (error) {
        console.error('Error removing tag from trip:', error);
        toast({
          title: 'Error',
          description: 'Failed to remove tag from trip',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, toast]
  );

  return {
    isLoading,
    getDestinationTags,
    suggestTag,
    voteOnTag,
    getUserInterests,
    updateUserInterest,
    getTags,
    createTag,
    addTagToTrip,
    removeTagFromTrip,
  };
}
