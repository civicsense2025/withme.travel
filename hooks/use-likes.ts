import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';

type LikeItemType = 'destination' | 'itinerary' | 'attraction';

interface Like {
  id: string;
  user_id: string;
  item_id: string;
  item_type: LikeItemType;
  created_at: string;
}

export function useLikes() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [likes, setLikes] = useState<Like[]>([]);
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetched = useRef<string | null>(null); // store user id

  // Memoized fetchLikes
  const fetchLikes = useCallback(async () => {
    if (!user) {
      setLikes([]);
      setLikedItemIds(new Set());
      hasFetched.current = null;
      return;
    }
    // Only fetch if we haven't already for this user
    if (hasFetched.current === user.id) return;
    hasFetched.current = user.id;
    try {
      setIsLoading(true);
      const response = await fetch('/api/likes', {
        credentials: 'include',
      });
      if (response.status === 401) {
        setLikes([]);
        setLikedItemIds(new Set());
        return;
      }
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch likes');
      }
      const responseData = await response.json();
      const likesData = responseData.data || [];
      setLikes(likesData);
      setLikedItemIds(new Set(likesData.map((like: Like) => like.item_id)));
    } catch (error) {
      console.error('Error fetching likes:', error);
      if (user) {
        toast({
          title: 'Error',
          description: 'Failed to fetch likes. Please try again later.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Only fetch likes when user ID changes, with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (!isAuthLoading && user) {
      // Reset hasFetched if user changes
      if (hasFetched.current !== user.id) {
        hasFetched.current = null;
      }
      debounceRef.current = setTimeout(() => {
        fetchLikes();
      }, 300);
    } else if (!user && !isAuthLoading) {
      setLikes([]);
      setLikedItemIds(new Set());
      hasFetched.current = null;
    }
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [user?.id, isAuthLoading, fetchLikes]);

  // Check if an item is liked
  const isLiked = (itemId: string) => {
    return likedItemIds.has(itemId);
  };

  // Toggle like status for an item
  const toggleLike = async (itemId: string, itemType: LikeItemType): Promise<boolean> => {
    if (!user) return false;

    const currentlyLiked = isLiked(itemId);

    try {
      if (currentlyLiked) {
        // Unlike
        const response = await fetch(`/api/likes?itemId=${itemId}&itemType=${itemType}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to unlike item');
        }

        setLikes((prev) => prev.filter((like) => like.item_id !== itemId));
        setLikedItemIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });

        return false;
      } else {
        // Like
        const response = await fetch('/api/likes', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemId,
            itemType,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to like item');
        }

        const newLike = await response.json();
        setLikes((prev) => [...prev, newLike]);
        setLikedItemIds((prev) => new Set([...prev, itemId]));

        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like status. Please try again later.',
        variant: 'destructive',
      });
      return currentlyLiked;
    }
  };

  return {
    likes,
    isLiked,
    toggleLike,
    isLoading: isLoading || isAuthLoading,
  };
}
