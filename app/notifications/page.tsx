'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@/contexts/notification-context';
import { useNotificationCount } from '@/contexts/notification-count-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Bell, Settings, Trash2 } from 'lucide-react';
import type { Notification } from '@/types/notifications';
import { useInView } from 'react-intersection-observer';

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    loading,
    hasMore,
    refreshNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  
  const { unreadCount, refreshUnreadCount } = useNotificationCount();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  
  // Setup intersection observer for infinite scrolling
  const { ref: loadMoreRef, inView } = useInView();
  
  // Load more notifications when the user scrolls to the bottom
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMoreNotifications();
    }
  }, [inView, hasMore, loading, loadMoreNotifications]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    let filtered = [...notifications];

    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter(notification => !notification.read);
    }

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(notification => notification.notification_type === filter);
    }

    setFilteredNotifications(filtered);
  }, [notifications, activeTab, filter]);

  const handleNotificationClick = async (notificationId: string, url?: string | null) => {
    await markAsRead([notificationId]);
    refreshUnreadCount();

    if (url) {
      router.push(url);
    }
  };

  // Get unique notification types for filter
  const notificationTypes = [
    'all',
    ...Array.from(new Set(notifications.map(n => n.notification_type))),
  ];

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="mr-2">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-amber-500 mr-2">Medium</Badge>;
      case 'low':
      default:
        return <Badge variant="outline" className="mr-2">Low</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                onClick={async () => {
                  await markAllAsRead();
                  refreshUnreadCount();
                }}
              >
                Mark all as read
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/settings/notifications">
                <Settings className="h-4 w-4 mr-2" />
                Notification Settings
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" className="w-[400px]" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All notifications' : type.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          {loading && notifications.length === 0 ? (
            <div className="p-4 divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-muted-foreground">
                {activeTab === 'unread' 
                  ? "You're all caught up! No unread notifications." 
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer 
                    ${!notification.read ? 'bg-primary/5' : ''}`}
                  onClick={() => handleNotificationClick(notification.id, notification.action_url)}
                >
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12">
                      {notification.sender?.avatar_url ? (
                        <AvatarImage src={notification.sender.avatar_url} alt="" />
                      ) : null}
                      <AvatarFallback>
                        {notification.sender?.name?.substring(0, 2).toUpperCase() || 'N'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                      
                      <div className="flex items-center mt-2">
                        {getPriorityBadge(notification.priority)}
                        <Badge variant="outline" className="text-xs font-normal">
                          {notification.notification_type.replace(/_/g, ' ')}
                        </Badge>
                        
                        <span className="text-xs text-muted-foreground ml-auto">
                          {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Infinite scroll loading indicator */}
              {hasMore && (
                <div ref={loadMoreRef} className="p-4 text-center">
                  {loading ? (
                    <div className="flex justify-center items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Scroll for more</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 