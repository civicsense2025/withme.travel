'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { MessageCircle, Send, X, ThumbsUp, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
// NOTE: Presence context is disabled to prevent build errors
// import { usePresenceContext } from '@/components/presence/presence-context';

export interface Comment {
  id: number;
  created_at: string;
  guest_token?: string | null;
  // TODO: Add user_id, content, etc. if/when schema supports it
}

interface ItemCommentsProps {
  itemId: string;
  tripId: string;
  itemName?: string;
  maxHeight?: string;
  showCommentCount?: boolean;
  onNewComment?: () => void;
}

export function ItemComments({
  itemId,
  tripId,
  itemName = 'this item',
  maxHeight = '400px',
  showCommentCount = true,
  onNewComment,
}: ItemCommentsProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  const supabase = createClient() || null;

  useEffect(() => {
    const loadComments = async () => {
      if (!supabase) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('itinerary_item_comments')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;

        // Type guard to ensure data is Comment[]
        if (data && Array.isArray(data)) {
          setComments(data as Comment[]);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error('Error loading comments:', error);
        toast({
          title: 'Failed to load comments',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, supabase, toast]);

  useEffect(() => {
    if (!isOpen || !supabase) return;
    const subscription = supabase
      .channel(`item-comments`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'itinerary_item_comments',
        },
        () => {
          supabase
            .from('itinerary_item_comments')
            .select('*')
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
              if (error) {
                console.error('Error in subscription:', error);
                return;
              }

              // Type guard to ensure data is Comment[]
              if (data && Array.isArray(data)) {
                setComments(data as Comment[]);
              } else {
                setComments([]);
              }
            });
        }
      )
      .subscribe();
    return () => {
      if (supabase) {
        supabase.removeChannel(subscription);
      }
    };
  }, [isOpen, supabase]);

  const renderComment = useCallback((comment: Comment) => {
    const timeDisplay = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
    return (
      <div key={comment.id} className="flex gap-3 py-3">
        {/* TODO: Display user info and content when schema supports it */}
        <div className="flex-1 space-y-1">
          <span className="text-xs text-muted-foreground ml-2">{timeDisplay}</span>
        </div>
      </div>
    );
  }, []);

  // Only render the list of comment timestamps
  return (
    <div style={{ maxHeight, overflowY: 'auto' }}>
      {isLoading ? <div>Loading comments...</div> : comments.map(renderComment)}
      {/* TODO: Add comment form and richer display if schema is updated */}
    </div>
  );
} 