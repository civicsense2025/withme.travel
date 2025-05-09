'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/contexts/notification-context';
import { useNotificationCount } from '@/contexts/notification-count-context';
import { PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, List } from 'lucide-react';
import { trackNotificationClick } from '@/utils/notification-deeplinks';
import { NOTIFICATION_TYPES } from '@/utils/constants/status';
import { FriendRequestNotification } from './friend-request-notification';

interface NotificationPopoverContentProps {
  onOpen: (open: boolean) => void;
}

export default function NotificationPopoverContent({ onOpen }: NotificationPopoverContentProps) {
  const router = useRouter();
  const { notifications, loading, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const { refreshUnreadCount } = useNotificationCount();
  
  // Load notifications content when opened
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);
  
  const handleNotificationClick = async (notificationId: string, url?: string | null) => {
    // Mark as read and track the click
    await Promise.all([
      markAsRead([notificationId]),
      trackNotificationClick(notificationId)
    ]);
    
    // Update the unread count after marking as read
    refreshUnreadCount();
    
    // Navigate if there's a URL
    if (url) {
      router.push(url);
      onOpen(false);
    }
  };
  
  const handleFriendRequestAction = async (notificationId: string, success: boolean) => {
    if (success) {
      // Mark the notification as read after the action is taken
      await markAsRead([notificationId]);
      refreshUnreadCount();
      refreshNotifications();
    }
  };
  
  // Get notification priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="h-2 w-2 rounded-full bg-destructive inline-block mr-1.5"></span>;
      case 'medium':
        return <span className="h-2 w-2 rounded-full bg-amber-500 inline-block mr-1.5"></span>;
      case 'low':
      default:
        return null;
    }
  };
  
  // Render notification based on type
  const renderNotification = (notification: any) => {
    // Handle friend request notifications
    if (notification.type === NOTIFICATION_TYPES.FRIEND_REQUEST_RECEIVED) {
      return (
        <FriendRequestNotification 
          notification={notification} 
          onAction={(action, success) => handleFriendRequestAction(notification.id, success)}
        />
      );
    }
    
    // Default notification rendering
    return (
      <div
        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors
          ${!notification.read ? 'bg-primary/5' : ''}`}
        onClick={() => handleNotificationClick(notification.id, notification.action_url)}
      >
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            {notification.sender?.avatar_url ? (
              <AvatarImage src={notification.sender.avatar_url} alt="" />
            ) : null}
            <AvatarFallback>
              {notification.sender?.name?.substring(0, 2).toUpperCase() || 'N'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p
                className={`text-sm font-medium ${!notification.read ? 'text-primary' : ''}`}
              >
                {getPriorityBadge(notification.priority)}
                {notification.title}
              </p>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <PopoverContent className="w-[380px] p-0" align="end">
      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/50">
        <h3 className="font-semibold">Notifications</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild className="h-8 text-xs px-2">
            <Link href="/settings/notifications">
              <Settings className="h-3.5 w-3.5 mr-1" />
              <span>Settings</span>
            </Link>
          </Button>
          {notifications.some(n => !n.read) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await markAllAsRead();
                refreshUnreadCount();
              }}
              className="h-8 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>
      <ScrollArea className="h-[400px]">
        {loading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No notifications</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div key={notification.id}>
                {renderNotification(notification)}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <div className="border-t p-2">
        <Button variant="ghost" size="sm" asChild className="w-full justify-center">
          <Link href="/notifications">
            <List className="h-4 w-4 mr-2" />
            View all notifications
          </Link>
        </Button>
      </div>
    </PopoverContent>
  );
} 