'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Loader2 } from 'lucide-react';
import { API_ROUTES } from '@/utils/constants/routes';
import { useToast } from '@/components/ui/use-toast';
import { NOTIFICATION_TYPES } from '@/utils/constants/status';
import Link from 'next/link';

interface FriendRequestNotificationProps {
  notification: {
    id: string;
    data: {
      sender_id: string;
      sender_name: string;
      request_id: string;
    };
  };
  onAction?: (action: 'accept' | 'decline', success: boolean) => void;
}

export function FriendRequestNotification({
  notification,
  onAction,
}: FriendRequestNotificationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionTaken, setActionTaken] = useState<'accept' | 'decline' | null>(null);
  const { toast } = useToast();

  if (!notification || notification?.data?.sender_id === undefined) {
    return null;
  }

  const handleAction = async (action: 'accept' | 'decline') => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(API_ROUTES.FRIENDS.RESPOND, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: notification.data.request_id,
          action,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${action} friend request`);
      }

      setActionTaken(action);
      
      toast({
        title: action === 'accept' ? 'Friend request accepted' : 'Friend request declined',
        description: action === 'accept' 
          ? `${notification.data.sender_name} is now your friend` 
          : `You declined ${notification.data.sender_name}'s friend request`,
      });
      
      if (onAction) {
        onAction(action, true);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
      
      if (onAction) {
        onAction(action, false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Return different UI based on if action has been taken
  if (actionTaken) {
    return (
      <div className="flex items-center p-2">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={`/api/users/${notification.data.sender_id}/avatar`} />
          <AvatarFallback>{notification.data.sender_name?.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm">
            {actionTaken === 'accept'
              ? `You and ${notification.data.sender_name} are now friends`
              : `You declined ${notification.data.sender_name}'s request`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center p-2">
      <Avatar className="h-10 w-10 mr-3">
        <AvatarImage src={`/api/users/${notification.data.sender_id}/avatar`} />
        <AvatarFallback>{notification.data.sender_name?.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm">
          <Link 
            href={`/profile/${notification.data.sender_id}`}
            className="font-medium hover:underline"
          >
            {notification.data.sender_name}
          </Link>{' '}
          sent you a friend request
        </p>
      </div>
      <div className="flex space-x-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-green-500"
          onClick={() => handleAction('accept')}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-red-500"
          onClick={() => handleAction('decline')}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 