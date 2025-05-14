'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TypedSupabaseClient } from '@/utils/supabase/browser-client';

// Update ItemType to match the expanded type in like-button.tsx
type ItemType =
  | 'destination'
  | 'itinerary'
  | 'trip'
  | 'template'
  | 'attraction'
  | 'place'
  | 'guide'
  | 'collection';

interface UseLikesOptions {
  itemId: string;
  itemType: ItemType;
  initialLiked?: boolean;
}

// Type for a like response item
interface LikeItem {
  id: string;
  user_id: string;
  item_id: string;
  item_type: string;
  created_at: string;
}

export function useLikes({ itemId, itemType, initialLiked = false }: UseLikesOptions) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  // Check authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      if (!supabase) return;

      try {
        const { data } = await supabase.auth.getUser();
        setIsAuthenticated(!!data.user);
      } catch (err) {
        console.error('Error checking auth status:', err);
        setIsAuthenticated(false);
      }
    }

    if (supabase) {
      checkAuth();
    }
  }, [supabase]);

  // Fetch initial like status if user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !itemId) return;

    const checkLikeStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/likes?itemType=${itemType}&itemId=${itemId}`);
        const data = await response.json();

        // Check if this item is in user's likes
        if (response.ok && Array.isArray(data.data)) {
          const isItemLiked = data.data.some(
            (like: LikeItem) => like.item_id === itemId && like.item_type === itemType
          );
          setIsLiked(isItemLiked);
        }
      } catch (err) {
        console.error('Error checking like status:', err);
        setError('Failed to check if item is liked');
      } finally {
        setIsLoading(false);
      }
    };

    checkLikeStatus();
  }, [itemId, itemType, isAuthenticated]);

  const toggleLike = useCallback(async () => {
    if (!isAuthenticated) {
      setError('You must be signed in to save items');
      return;
    }

    if (!itemId) {
      setError('No item specified');
      return;
    }

    try {
      setIsLoading(true);

      if (isLiked) {
        // Remove like
        const response = await fetch(`/api/likes?itemId=${itemId}&itemType=${itemType}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove from saved items');
        }
      } else {
        // Add like
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId, itemType }),
        });

        if (!response.ok) {
          throw new Error('Failed to save item');
        }
      }

      // Update local state
      setIsLiked(!isLiked);
      setError(null);
    } catch (err: any) {
      console.error('Error toggling like:', err);
      setError(err.message || 'Failed to update saved status');
    } finally {
      setIsLoading(false);
    }
  }, [itemId, itemType, isLiked, isAuthenticated]);

  return {
    isLiked,
    isLoading,
    error,
    toggleLike,
    isAuthenticated,
  };
}
