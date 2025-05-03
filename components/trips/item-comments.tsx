'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, ThumbsUp, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// NOTE: Presence context is disabled to prevent build errors
// import { usePresenceContext } from '@/components/presence/presence-context';

export interface Comment {
  id: string;
  item_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_name?: string;
  user_avatar?: string;
  likes_count?: number;
  has_liked?: boolean;
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
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  
  // Mock empty active users array (presence feature disabled)
  const activeUsers: {
    user_id: string;
    editing_item_id?: string;
    name?: string;
    avatar_url?: string;
  }[] = [];
  // Ensure supabase client is initialized once and is non-null
  const supabase = createClient() || null;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active collaborators for this item
  const itemCollaborators = activeUsers.filter(
    (u) => u.editing_item_id === itemId || comments.some((c) => c.user_id === u.user_id)
  );

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      if (!supabase) return;
      
      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from('trip_item_comments')
          .select(
            `
            *,
            profiles:user_id (
              name,
              avatar_url
            ),
            likes:trip_comment_likes (
              id,
              user_id
            )
          `
          )
          .eq('item_id', itemId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Process the comments data
        const processedComments = data.map((comment) => ({
          id: comment.id,
          item_id: comment.item_id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          user_name: comment.profiles?.name || null,
          user_avatar: comment.profiles?.avatar_url || null,
          likes_count: comment.likes ? comment.likes.length : 0,
          has_liked: comment.likes
            ? comment.likes.some((like: any) => like.user_id === user?.id)
            : false
        }));

        setComments(processedComments);
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

    if (isOpen && itemId) {
      loadComments();
    }
  }, [isOpen, itemId, supabase, toast, user?.id]);

  // Set up realtime subscription for comments
  useEffect(() => {
    if (!isOpen || !itemId || !supabase) return;

    // Subscribe to changes in comments
    const subscription = supabase
      .channel(`item-comments-${itemId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_item_comments',
          filter: `item_id=eq.${itemId}`,
        },
        () => {
          // Refetch comments when changes occur
          supabase
            .from('trip_item_comments')
            .select(
              `
            *,
            profiles:user_id (
              name,
              avatar_url
            ),
            likes:trip_comment_likes (
              id,
              user_id
            )
          `
            )
            .eq('item_id', itemId)
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
              if (error) {
                console.error('Error in subscription:', error);
                return;
              }

              // Process the comments data
              const processedComments = data.map((comment) => ({
                id: comment.id,
                item_id: comment.item_id,
                user_id: comment.user_id,
                content: comment.content,
                created_at: comment.created_at,
                updated_at: comment.updated_at,
                user_name: comment.profiles?.name || null,
                user_avatar: comment.profiles?.avatar_url || null,
                likes_count: comment.likes ? comment.likes.length : 0,
                has_liked: comment.likes
                  ? comment.likes.some((like: any) => like.user_id === user?.id)
                  : false
              }));

              setComments(processedComments);
            });
        }
      )
      .subscribe();

    return () => { 
      if (supabase) {
        supabase.removeChannel(subscription);
      }
    };
  }, [isOpen, itemId, supabase, user?.id]);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user || !supabase) return;

    try {
      setIsSending(true);

      const { error } = await supabase.from('trip_item_comments').insert({
        item_id: itemId,
        trip_id: tripId,
        user_id: user.id,
        content: commentText.trim(),
      });

      if (error) throw error;

      setCommentText('');
      if (onNewComment) onNewComment();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Failed to add comment',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleLikeComment = useCallback(
    async (commentId: string, currentlyLiked: boolean) => {
      if (!user || !supabase) return;

      try {
        if (currentlyLiked) {
          // Unlike
          await supabase
            .from('trip_comment_likes')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', user.id);
        } else {
          // Like
          await supabase.from('trip_comment_likes').insert({
            comment_id: commentId,
            user_id: user.id,
            trip_id: tripId,
          });
        }

        // Optimistically update UI
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                has_liked: !currentlyLiked,
                likes_count: currentlyLiked
                  ? (comment.likes_count || 0) - 1
                  : (comment.likes_count || 0) + 1,
              };
            }
            return comment;
          })
        );
      } catch (error) {
        console.error('Error liking/unliking comment:', error);
        toast({
          title: 'Failed to update like',
          description: 'Please try again later',
          variant: 'destructive',
        });
      }
    },
    [user, supabase, tripId, toast]
  );

  const handleEditComment = useCallback(async () => {
    if (!editingCommentId || !commentText.trim() || !user || !supabase) return;

    try {
      setIsSending(true);

      const { error } = await supabase
        .from('trip_item_comments')
        .update({
          content: commentText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCommentId)
        .eq('user_id', user.id); // Ensure user can only edit their own comments

      if (error) throw error;

      // Update local state
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === editingCommentId) {
            return {
              ...comment,
              content: commentText.trim(),
              updated_at: new Date().toISOString(),
            };
          }
          return comment;
        })
      );

      setEditingCommentId(null);
      setCommentText('');
    } catch (error) {
      console.error('Error editing comment:', error);
      toast({
        title: 'Failed to edit comment',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  }, [editingCommentId, commentText, user, supabase, toast]);

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!user || !supabase) return;

      try {
        const { error } = await supabase
          .from('trip_item_comments')
          .delete()
          .eq('id', commentId)
          .eq('user_id', user.id); // Ensure user can only delete their own comments

        if (error) throw error;

        // Update local state
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast({
          title: 'Failed to delete comment',
          description: 'Please try again later',
          variant: 'destructive',
        });
      }
    },
    [user, supabase, toast]
  );

  const startEditing = useCallback((comment: Comment) => {
    setEditingCommentId(comment.id);
    setCommentText(comment.content);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingCommentId(null);
    setCommentText('');
  }, []);

  const renderComment = useCallback(
    (comment: Comment) => {
      const isEditing = editingCommentId === comment.id;
      const isOwnComment = comment.user_id === user?.id;
      const timeDisplay = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
      const wasEdited = comment.created_at !== comment.updated_at;

      return (
        <div key={comment.id} className="flex gap-3 py-3">
          <UserAvatar name={comment.user_name} src={comment.user_avatar} size="sm" />

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{comment.user_name || 'Unknown user'}</span>
                <span className="text-xs text-muted-foreground ml-2">{timeDisplay}</span>
                {wasEdited && <span className="text-xs text-muted-foreground ml-1">(edited)</span>}
              </div>

              {isOwnComment && !isEditing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => startEditing(comment)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Edit your comment..."
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelEditing}
                    disabled={isSending}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEditComment}
                    disabled={!commentText.trim() || isSending}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm">{comment.content}</p>

                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 text-xs ${comment.has_liked ? 'text-primary' : ''}`}
                  onClick={() => handleLikeComment(comment.id, !!comment.has_liked)}
                >
                  <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                  {comment.likes_count || 0}
                </Button>
              </>
            )}
          </div>
        </div>
      );
    },
    [
      editingCommentId,
      user?.id,
      commentText,
      isSending,
      handleEditComment,
      cancelEditing,
      handleDeleteComment,
      handleLikeComment,
      startEditing,
    ]
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          {showCommentCount && comments.length > 0 && (
            <Badge
              variant="secondary"
              className="px-1 h-4 min-w-4 flex items-center justify-center"
            >
              {comments.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Comments on {itemName}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {itemCollaborators.length > 0 && (
              <div className="flex items-center mt-1 gap-1">
                <span className="text-xs text-muted-foreground">Collaborators:</span>
                <div className="flex -space-x-1">
                  {itemCollaborators.slice(0, 3).map((user) => (
                    <UserAvatar
                      key={user.user_id}
                      name={user.name ?? 'Unknown user'}
                      src={user.avatar_url ?? undefined}
                      size="sm"
                      className="border-2 border-background h-5 w-5"
                    />
                  ))}
                  {itemCollaborators.length > 3 && (
                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted border-2 border-background text-[10px]">
                      +{itemCollaborators.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <Separator />

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <p className="text-sm text-muted-foreground">Loading comments...</p>
              </div>
            ) : (
              <ScrollArea className="px-4" style={{ maxHeight }}>
                {comments.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No comments yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Be the first to comment!</p>
                  </div>
                ) : (
                  <div className="divide-y">{comments.map(renderComment)}</div>
                )}
              </ScrollArea>
            )}
          </CardContent>

          <CardFooter className="flex flex-col pt-3 pb-2 px-4 gap-2">
            <Textarea
              ref={textareaRef}
              placeholder={`Add a comment about ${itemName}...`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="resize-none min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!commentText.trim() || isSending}
                onClick={handleSubmitComment}
              >
                <Send className="h-4 w-4 mr-2" />
                Comment
              </Button>
            </div>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}