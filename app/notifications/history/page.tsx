'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Archive, Trash2, ChevronLeft, ChevronRight, AlertTriangle, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import type { Notification } from '@/types/notifications';

interface NotificationHistoryItem extends Notification {
  archived_at: string;
  sender_name?: string;
  sender_avatar_url?: string;
}

interface NotificationStats {
  unread_count: number;
  total_count: number;
  archived_count: number;
  high_priority_count: number;
  retention_days: number;
}

interface PaginationData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export default function NotificationHistoryPage() {
  const [historyItems, setHistoryItems] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [clearInProgress, setClearInProgress] = useState(false);
  
  // Available notification types for filtering
  const [notificationTypes, setNotificationTypes] = useState<string[]>(['all']);
  
  useEffect(() => {
    fetchNotificationHistory();
  }, [pagination.page]);
  
  const fetchNotificationHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/notifications/history?page=${pagination.page}&pageSize=${pagination.pageSize}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch notification history');
      }
      
      const data = await response.json();
      setHistoryItems(data.history || []);
      setPagination(data.pagination);
      setStats(data.stats);
      
      // Extract unique notification types for filtering
      if (data.history && data.history.length > 0) {
        const uniqueTypes = Array.from(new Set(data.history.map((item: NotificationHistoryItem) => item.notification_type))) as string[];
        const types = ['all', ...uniqueTypes];
        setNotificationTypes(types);
      }
    } catch (error) {
      console.error('Error fetching notification history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearHistory = async () => {
    setClearInProgress(true);
    try {
      const response = await fetch('/api/notifications/history', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear notification history');
      }
      
      await fetchNotificationHistory();
      setOpenClearDialog(false);
      toast({
        title: 'History cleared',
        description: 'Your notification history has been cleared',
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear notification history',
        variant: 'destructive',
      });
    } finally {
      setClearInProgress(false);
    }
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };
  
  const formatNotificationType = (type: string) => {
    return type.replace(/_/g, ' ');
  };
  
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
  
  // Filter notifications by type
  const filteredHistoryItems = historyItems.filter(item => 
    filter === 'all' || item.notification_type === filter
  );
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notification History</h1>
            <p className="text-muted-foreground">
              {stats?.archived_count 
                ? `You have ${stats.archived_count} archived notifications` 
                : 'No archived notifications'}
              {stats?.retention_days && (
                <span className="ml-1">
                  (kept for {stats.retention_days} days)
                </span>
              )}
            </p>
          </div>
          
          <div className="flex gap-2">
            {historyItems.length > 0 && (
              <Dialog open={openClearDialog} onOpenChange={setOpenClearDialog}>
                <DialogTrigger>
                  <div>
                    <Button variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear History
                    </Button>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear Notification History</DialogTitle>
                    <DialogDescription>
                      This will permanently delete all your archived notifications. 
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setOpenClearDialog(false)}
                      disabled={clearInProgress}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleClearHistory}
                      disabled={clearInProgress}
                    >
                      {clearInProgress ? 'Clearing...' : 'Clear History'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Link href="/notifications">
              <Button variant="default">
                <Archive className="h-4 w-4 mr-2" />
                Active Notifications
              </Button>
            </Link>
          </div>
        </div>
        
        {historyItems.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue>Filter by type</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'all' ? 'All types' : formatNotificationType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <div className="border rounded-lg overflow-hidden">
          {loading ? (
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
          ) : filteredHistoryItems.length === 0 ? (
            <div className="p-12 text-center">
              <Archive className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No archived notifications</h3>
              <p className="text-muted-foreground">
                {filter !== 'all'
                  ? `You don't have any archived ${formatNotificationType(filter)} notifications.`
                  : "When you archive notifications, they'll appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredHistoryItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12">
                      {item.sender_avatar_url ? (
                        <AvatarImage src={item.sender_avatar_url} alt="" />
                      ) : null}
                      <AvatarFallback>
                        {item.sender_name?.substring(0, 2).toUpperCase() || 'N'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">
                          {item.title}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.archived_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">{item.content}</p>
                      
                      <div className="flex items-center mt-2">
                        {getPriorityBadge(item.priority)}
                        <Badge variant="outline" className="text-xs font-normal">
                          {formatNotificationType(item.notification_type)}
                        </Badge>
                        
                        <div className="ml-auto flex items-center text-xs text-muted-foreground">
                          <span className="mr-2">Created: {format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                          <span>Archived: {format(new Date(item.archived_at), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.pageSize + 1}-
              {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Retention info */}
        {stats && stats.retention_days && (
          <div className="flex items-start gap-3 p-4 mt-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              {stats.retention_days < 365 ? (
                <>
                  <p>
                    <strong>Free account:</strong> Notification history is automatically deleted after {stats.retention_days} days.
                  </p>
                  <p className="mt-1">
                    Upgrade to premium to keep your notification history for a full year.
                  </p>
                </>
              ) : (
                <p>
                  <strong>Premium account:</strong> Your notification history is kept for {stats.retention_days} days.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 