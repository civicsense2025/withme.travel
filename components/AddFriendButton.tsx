'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'
import { UserPlus, UserCheck, UserX, Loader2 } from 'lucide-react';
import { API_ROUTES } from '@/utils/constants/routes';

export type FriendStatus = 'none' | 'requested' | 'pending' | 'friends';

interface AddFriendButtonProps {
  userId: string;
  initialStatus?: FriendStatus;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  onStatusChange?: (newStatus: FriendStatus) => void;
}

export function AddFriendButton({
  userId,
  initialStatus = 'none',
  size = 'default',
  variant = 'default',
  className = '',
  onStatusChange,
}: AddFriendButtonProps) {
  const [status, setStatus] = useState<FriendStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (status === 'none') {
        // Send friend request
        const response = await fetch(API_ROUTES.FRIENDS.REQUEST, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ receiver_id: userId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to send friend request');
        }

        const newStatus: FriendStatus = 'requested';
        setStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);

        toast({
          title: 'Friend request sent',
          description: 'The user will be notified of your request',
        });
      } else if (status === 'pending') {
        // Accept friend request
        // This would need the request ID, which we don't have here.
        // In a real implementation, we'd need to pass the request ID to this component.
        toast({
          title: 'Please use notifications',
          description: 'Respond to friend requests through your notifications',
          variant: 'destructive',
        });
      } else if (status === 'friends' || status === 'requested') {
        // Unfriend or cancel request
        const response = await fetch(API_ROUTES.FRIENDS.UNFRIEND, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ friend_id: userId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to remove friend');
        }

        const newStatus: FriendStatus = 'none';
        setStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);

        toast({
          title: status === 'friends' ? 'Friend removed' : 'Request cancelled',
          description:
            status === 'friends'
              ? 'The user has been removed from your friends'
              : 'Your friend request has been cancelled',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Return different buttons based on friend status
  if (status === 'none') {
    return (
      <Button
        onClick={handleClick}
        size={size}
        variant={variant}
        className={className}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4 mr-2" />
        )}
        Add Friend
      </Button>
    );
  }

  if (status === 'requested') {
    return (
      <Button
        onClick={handleClick}
        size={size}
        variant="outline"
        className={className}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <UserX className="h-4 w-4 mr-2" />
        )}
        Cancel Request
      </Button>
    );
  }

  if (status === 'pending') {
    return (
      <Button
        onClick={handleClick}
        size={size}
        variant="outline"
        className={className}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <UserCheck className="h-4 w-4 mr-2" />
        )}
        Accept Request
      </Button>
    );
  }

  if (status === 'friends') {
    return (
      <Button
        onClick={handleClick}
        size={size}
        variant="outline"
        className={className}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <UserCheck className="h-4 w-4 mr-2" />
        )}
        Friends
      </Button>
    );
  }

  return null;
}
