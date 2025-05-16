'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { UserX, Search, Check, Loader2 } from 'lucide-react';
import { API_ROUTES } from '@/utils/constants/routes';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

export type Friend = {
  id: string;
  friend_id: string;
  created_at: string;
  friend_profile: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  };
};

interface FriendsListProps {
  mode?: 'view' | 'select';
  title?: string;
  emptyMessage?: string;
  onSelect?: (selectedFriends: string[]) => void;
  preSelectedFriendIds?: string[];
  alreadyAddedIds?: string[];
  variant?: 'list' | 'grid';
  containerClassName?: string;
}

export function FriendsList({
  mode = 'view',
  title = 'Friends',
  emptyMessage = 'You have no friends yet',
  onSelect,
  preSelectedFriendIds = [],
  alreadyAddedIds = [],
  variant = 'list',
  containerClassName = '',
}: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(preSelectedFriendIds);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching friends from:', API_ROUTES.FRIENDS.LIST);
      const response = await fetch(API_ROUTES.FRIENDS.LIST);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Friends list API error:', response.status, errorText);
        throw new Error(`Failed to fetch friends: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Friends data received:', data);

      // Safely handle the data with proper type checking
      if (data?.success && Array.isArray(data.data?.friends)) {
        setFriends(data.data.friends || []);
      } else {
        console.error('Unexpected data format from friends API:', data);
        setFriends([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch friends');
      toast({
        title: "Couldn't load friends",
        description: 'There was a problem loading your friends. Please try again later.',
        variant: 'destructive',
      });
      setFriends([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfriend = async (friendId: string) => {
    try {
      const response = await fetch(API_ROUTES.FRIENDS.UNFRIEND, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friend_id: friendId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }

      // Remove from local state
      setFriends((prev) => prev.filter((friend) => friend.friend_id !== friendId));

      toast({
        title: 'Friend removed',
        description: 'Friend has been removed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove friend',
        variant: 'destructive',
      });
    }
  };

  const handleToggleSelect = (friendId: string) => {
    setSelectedFriendIds((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  useEffect(() => {
    // Call onSelect whenever selectedFriendIds changes
    if (onSelect) {
      onSelect(selectedFriendIds);
    }
  }, [selectedFriendIds, onSelect]);

  // Filter friends based on search query
  const filteredFriends = friends.filter((friend) =>
    friend.friend_profile.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group friends: first show those not already added, then show already added ones
  const sortedFriends = [...filteredFriends].sort((a, b) => {
    const aAdded = alreadyAddedIds.includes(a.friend_id);
    const bAdded = alreadyAddedIds.includes(b.friend_id);

    if (aAdded === bAdded) {
      return a.friend_profile.full_name.localeCompare(b.friend_profile.full_name);
    }

    return aAdded ? 1 : -1;
  });

  if (isLoading) {
    return (
      <>
        {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchFriends()} className="mt-2">
            <Loader2 className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  if (variant === 'grid') {
    // Avatar grid only, no search, no checkboxes, no extra info
    return (
      <div
        className={
          containerClassName ||
          'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 justify-center'
        }
      >
        {friends.map((friend) => (
          <div key={friend.friend_id} className="flex flex-col items-center">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={friend.friend_profile.avatar_url || ''} />
              <AvatarFallback>
                {friend.friend_profile.full_name.substring(0, 2).toUpperCase() || 'FR'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-center mt-1 text-muted-foreground">
              {friend.friend_profile.full_name}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Default: vertical list with search, checkboxes, etc.
  return (
    <div className="w-full">
      {title && <h3 className="font-medium mb-2">{title}</h3>}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {sortedFriends.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No matching friends found</p>
        ) : (
          sortedFriends.map((friend) => {
            const isAlreadyAdded = alreadyAddedIds.includes(friend.friend_id);
            return (
              <div
                key={friend.id}
                className={`flex items-center p-2 rounded-md border
                  ${isAlreadyAdded ? 'bg-muted/50' : 'hover:bg-muted/30'}
                  ${mode === 'select' && !isAlreadyAdded ? 'cursor-pointer' : ''}
                `}
                onClick={() => {
                  if (mode === 'select' && !isAlreadyAdded) {
                    setSelectedFriendIds((prev) =>
                      prev.includes(friend.friend_id)
                        ? prev.filter((id) => id !== friend.friend_id)
                        : [...prev, friend.friend_id]
                    );
                  }
                }}
              >
                {mode === 'select' && !isAlreadyAdded && (
                  <Checkbox
                    checked={selectedFriendIds.includes(friend.friend_id)}
                    className="mr-3"
                    onCheckedChange={() =>
                      setSelectedFriendIds((prev) =>
                        prev.includes(friend.friend_id)
                          ? prev.filter((id) => id !== friend.friend_id)
                          : [...prev, friend.friend_id]
                      )
                    }
                  />
                )}

                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={friend.friend_profile.avatar_url || ''} />
                  <AvatarFallback>
                    {friend.friend_profile.full_name.substring(0, 2).toUpperCase() || 'FR'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <Link
                    href={`/profile/${friend.friend_id}`}
                    className="font-medium hover:underline"
                  >
                    {friend.friend_profile.full_name}
                  </Link>
                </div>

                {isAlreadyAdded ? (
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Already added
                  </span>
                ) : (
                  mode === 'view' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnfriend(friend.friend_id);
                      }}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  )
                )}
              </div>
            );
          })
        )}
      </div>

      {mode === 'select' && (
        <div className="mt-4 flex justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedFriendIds.length} friend{selectedFriendIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
}
