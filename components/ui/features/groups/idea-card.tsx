'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Calendar,
  MapPin,
  DollarSign,
  HelpCircle,
  Clipboard,
  Bookmark,
  Heart,
  Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { GROUP_PLAN_IDEA_TYPE, VOTE_TYPES } from '@/utils/constants/status';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { getBrowserClient } from '@/utils/supabase/browser-client';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  idea_id: string;
  parent_id: string | null;
  user?: {
    id: string;
    name?: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
}

interface IdeaCardProps {
  idea: {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    created_by: string | null;
    guest_token?: string | null;
    votes_up?: number;
    votes_down?: number;
    created_at: string;
    meta?: Record<string, any> | null;
    creator?: {
      id: string;
      email?: string;
      name?: string;
      user_metadata?: {
        full_name?: string;
        avatar_url?: string;
      };
    } | null;
    user_vote?: 'up' | 'down' | null;
    reactions?: Array<{
      type: string;
      user: {
        id: string;
        name?: string;
        email?: string;
        user_metadata?: {
          full_name?: string;
          avatar_url?: string;
        };
      };
    }>;
  };
  groupId: string;
  planId: string;
  isAuthenticated?: boolean;
  onVote?: (ideaId: string, voteType: 'up' | 'down') => void;
  onDelete?: (ideaId: string) => void;
  onEdit?: (ideaId: string) => void;
  truncateDescription?: boolean;
  className?: string;
}

export function IdeaCard({
  idea,
  groupId,
  planId,
  isAuthenticated = true,
  onVote,
  onDelete,
  onEdit,
  truncateDescription = true,
  className = '',
}: IdeaCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [currentVote, setCurrentVote] = useState<'up' | 'down' | null>(idea.user_vote || null);
  const [upvotes, setUpvotes] = useState(idea.votes_up || 0);
  const [downvotes, setDownvotes] = useState(idea.votes_down || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [commentsCount, setCommentsCount] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const supabase = getBrowserClient();

  useEffect(() => {
    if (sheetOpen) {
      fetchComments();
    }
  }, [sheetOpen, idea.id]);

  // Set up subscription for realtime updates
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel(`idea_comments_${idea.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_plan_idea_comments',
          filter: `idea_id=eq.${idea.id}`,
        },
        () => {
          if (sheetOpen) {
            fetchComments();
          } else {
            // Just update the count if sheet is closed
            fetchCommentCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, idea.id, sheetOpen]);

  const fetchCommentCount = async () => {
    try {
      const response = await fetch(`/api/group-plan-idea-comments/count?ideaId=${idea.id}`);

      if (!response.ok) {
        throw new Error(`Error fetching comment count: ${response.statusText}`);
      }

      const data = await response.json();
      setCommentsCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching comment count:', error);
    }
  };

  const fetchComments = async () => {
    try {
      setIsLoadingComments(true);
      const response = await fetch(
        `/api/group-plan-idea-comments?ideaId=${idea.id}&limit=50&offset=0`
      );

      if (!response.ok) {
        throw new Error(`Error fetching comments: ${response.statusText}`);
      }

      const data = await response.json();
      setComments(data.comments || []);
      setCommentsCount(data.comments?.length || 0);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    if (!commentContent.trim() || !isAuthenticated || isSubmittingComment) {
      return;
    }

    try {
      setIsSubmittingComment(true);

      const response = await fetch('/api/group-plan-idea-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea_id: idea.id,
          content: commentContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error posting comment: ${response.statusText}`);
      }

      const data = await response.json();

      // Add the new comment to the list and reset the input
      setComments((prev) => [...prev, data.comment]);
      setCommentsCount((prev) => prev + 1);
      setCommentContent('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmitComment();
    }
  };

  // Get icon based on idea type
  const getIdeaTypeIcon = () => {
    switch (idea.type) {
      case GROUP_PLAN_IDEA_TYPE.DESTINATION:
        return <MapPin className="h-4 w-4" />;
      case GROUP_PLAN_IDEA_TYPE.ACTIVITY:
        return <Bookmark className="h-4 w-4" />;
      case GROUP_PLAN_IDEA_TYPE.DATE:
        return <Calendar className="h-4 w-4" />;
      case GROUP_PLAN_IDEA_TYPE.BUDGET:
        return <DollarSign className="h-4 w-4" />;
      case GROUP_PLAN_IDEA_TYPE.QUESTION:
        return <HelpCircle className="h-4 w-4" />;
      case GROUP_PLAN_IDEA_TYPE.NOTE:
        return <Clipboard className="h-4 w-4" />;
      case GROUP_PLAN_IDEA_TYPE.PLACE:
        return <MapPin className="h-4 w-4" />;
      default:
        return <Bookmark className="h-4 w-4" />;
    }
  };

  // Format the idea type for display
  const formatIdeaType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Handle voting
  const handleVote = async (voteType: 'up' | 'down') => {
    if (!isAuthenticated || isVoting) return;

    try {
      setIsVoting(true);

      // Optimistically update UI
      if (currentVote === voteType) {
        // Remove vote if clicking the same button again
        setCurrentVote(null);
        if (voteType === 'up') {
          setUpvotes((prev) => Math.max(0, prev - 1));
        } else {
          setDownvotes((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Change vote or add new vote
        if (currentVote === 'up' && voteType === 'down') {
          setUpvotes((prev) => Math.max(0, prev - 1));
          setDownvotes((prev) => prev + 1);
        } else if (currentVote === 'down' && voteType === 'up') {
          setUpvotes((prev) => prev + 1);
          setDownvotes((prev) => Math.max(0, prev - 1));
        } else if (voteType === 'up') {
          setUpvotes((prev) => prev + 1);
        } else {
          setDownvotes((prev) => prev + 1);
        }
        setCurrentVote(voteType);
      }

      // Call API and parent handler
      const apiVoteType = currentVote === voteType ? null : voteType;
      if (onVote) {
        onVote(idea.id, apiVoteType || voteType);
      }

      // Make API call
      const response = await fetch(`/api/groups/${groupId}/ideas/${idea.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vote_type: apiVoteType || voteType,
          remove: currentVote === voteType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      // Revert optimistic update on error
      setCurrentVote(idea.user_vote || null);
      setUpvotes(idea.votes_up || 0);
      setDownvotes(idea.votes_down || 0);
    } finally {
      setIsVoting(false);
    }
  };

  // Group reactions by type for tooltip display
  const getGroupedReactions = () => {
    if (!idea.reactions) return {};

    const groupedReactions: Record<
      string,
      Array<{
        id: string;
        name: string;
      }>
    > = {};

    idea.reactions.forEach((reaction) => {
      if (!groupedReactions[reaction.type]) {
        groupedReactions[reaction.type] = [];
      }

      groupedReactions[reaction.type].push({
        id: reaction.user.id,
        name: reaction.user.user_metadata?.full_name || reaction.user.email || 'User',
      });
    });

    return groupedReactions;
  };

  // Reaction display elements
  const renderReactions = () => {
    const groupedReactions = getGroupedReactions();

    return (
      <div className="flex flex-wrap gap-1 mr-2">
        {Object.entries(groupedReactions).map(([type, users]) => (
          <TooltipProvider key={type}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center px-2 py-1 rounded-full bg-muted">
                  {type === 'heart' ? <Heart className="h-3 w-3 mr-1 text-red-500" /> : type}
                  <span className="ml-1 text-xs">{users.length}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="py-1">
                  <p className="font-medium mb-1">Reactions</p>
                  <ul className="space-y-1">
                    {users.map((user) => (
                      <li key={user.id} className="text-xs">
                        {user.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  };

  // If there are many reactions, show them in a tooltip
  const renderCompactReactions = () => {
    const groupedReactions = getGroupedReactions();
    const totalReactions = Object.values(groupedReactions).reduce(
      (sum, users) => sum + users.length,
      0
    );

    if (totalReactions === 0) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center px-2 py-1 rounded-full bg-muted">
              <Heart className="h-3 w-3 mr-1 text-red-500" />
              <span className="text-xs">{totalReactions}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-60">
            <div className="py-1">
              <p className="font-medium mb-2">Reactions</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {Object.entries(groupedReactions).map(([type, users]) => (
                  <div key={type} className="pb-2 border-b last:border-0">
                    <div className="flex items-center mb-1">
                      {type === 'heart' ? (
                        <Heart className="h-4 w-4 mr-1 text-red-500" />
                      ) : (
                        <span className="mr-1">{type}</span>
                      )}
                      <span className="text-sm font-medium">{users.length}</span>
                    </div>
                    <ul className="space-y-1">
                      {users.map((user) => (
                        <li key={user.id} className="text-xs">
                          {user.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className={cn('h-full flex flex-col p-6', className)}>
      <CardHeader className="pb-2 p-0">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="flex items-center gap-1">
            {getIdeaTypeIcon()}
            {formatIdeaType(idea.type)}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {format(new Date(idea.created_at), 'MMM d')}
          </div>
        </div>
        <CardTitle className="text-lg mt-2">{idea.title}</CardTitle>
        {idea.creator && (
          <CardDescription className="flex items-center gap-2 mt-1">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={idea.creator.user_metadata?.avatar_url || ''}
                alt={idea.creator.user_metadata?.full_name || idea.creator.email || 'User'}
              />
              <AvatarFallback>
                {(idea.creator.user_metadata?.full_name || idea.creator.email || 'U').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">
              {idea.creator.user_metadata?.full_name || idea.creator.email || 'Anonymous'}
            </span>
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-grow p-0 mt-2">
        {idea.description ? (
          <p className={truncateDescription ? 'line-clamp-3 text-sm' : 'text-sm'}>
            {idea.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description provided</p>
        )}
      </CardContent>

      <CardFooter className="pt-2 flex justify-between items-center p-0 mt-2">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 px-2',
                    currentVote === 'up' &&
                      'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  )}
                  onClick={() => handleVote('up')}
                  disabled={!isAuthenticated || isVoting}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span>{upvotes}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upvote this idea</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 px-2',
                    currentVote === 'down' &&
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  )}
                  onClick={() => handleVote('down')}
                  disabled={!isAuthenticated || isVoting}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  <span>{downvotes}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Downvote this idea</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Display reactions in compact format with tooltip */}
          {idea.reactions && idea.reactions.length > 0 && renderCompactReactions()}
        </div>

        <div className="flex items-center">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>{commentsCount}</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md w-[400px]">
              <SheetHeader className="pb-4 border-b">
                <SheetTitle>Comments on "{idea.title}"</SheetTitle>
              </SheetHeader>

              <div className="mt-4 mb-16 space-y-4 flex-1 overflow-auto max-h-[calc(100vh-180px)]">
                {isLoadingComments ? (
                  <div className="py-4 text-center text-muted-foreground">Loading comments...</div>
                ) : comments.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 pb-3 border-b">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={comment.user?.user_metadata?.avatar_url || ''}
                            alt={
                              comment.user?.user_metadata?.full_name ||
                              comment.user?.email ||
                              'User'
                            }
                          />
                          <AvatarFallback>
                            {(
                              comment.user?.user_metadata?.full_name ||
                              comment.user?.email ||
                              'U'
                            ).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">
                              {comment.user?.user_metadata?.full_name ||
                                comment.user?.email ||
                                'User'}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
                <form onSubmit={handleSubmitComment} className="flex w-full items-center gap-2">
                  <Input
                    ref={commentInputRef}
                    placeholder="Write a comment..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                    disabled={!isAuthenticated || isSubmittingComment}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="default"
                    disabled={!isAuthenticated || isSubmittingComment || !commentContent.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardFooter>
    </Card>
  );
}
