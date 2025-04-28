'use client';

import { useNotifications } from '@/contexts/notification-context';
import { Bell } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export function NotificationIndicator() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    refreshNotifications
  } = useNotifications();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  
  // When popover opens, refresh notifications
  useEffect(() => {
    if (open) {
      refreshNotifications();
    }
  }, [open, refreshNotifications]);
  
  const handleNotificationClick = async (notificationId: string, url?: string) => {
    // Mark as read
    await markAsRead(notificationId);
    
    // Navigate if there's a URL
    if (url) {
      router.push(url);
      setOpen(false);
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative p-2 h-8 w-8"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/50">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              Mark all as read
            </Button>
          )}
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
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
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
                        <p className={`text-sm font-medium ${!notification.read ? 'text-primary' : ''}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 