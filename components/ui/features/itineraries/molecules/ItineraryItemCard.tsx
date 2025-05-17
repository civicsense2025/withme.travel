/**
 * ItineraryItemCard Component
 * 
 * Displays an itinerary item with details, actions, and interactive elements
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  MoreVertical,
  Pencil,
  Trash,
  Copy,
  MessageSquare,
  ExternalLink,
  Smile,
  Send,
  X,
  CornerDownRight,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { DisplayItineraryItem, ItemVote } from '@/components/ui/features/itineraries/types';
import {
  CATEGORY_DISPLAY,
  DEFAULT_CATEGORY_DISPLAY,
  ITEM_TYPE_DISPLAY,
  DEFAULT_TYPE_DISPLAY,
} from '@/utils/constants/ui/ui';
import { ITINERARY_CATEGORIES } from '@/utils/constants/status';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';
import type { ItineraryItemReaction } from '@/types/itinerary-reactions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatTime, getTimeDisplay } from '@/components/ui/features/itineraries/utils';

// Extend the DisplayItineraryItem interface locally to include url
export interface ExtendedItineraryItem extends Omit<DisplayItineraryItem, 'votes'> {
  url?: string | null;
  votes: {
    up: number;
    down: number;
    total: number;
    userVote: 'up' | 'down' | null;
    upVoters?: string[] | any[]; // Allow string[] for storybook
    downVoters?: string[] | any[]; // Allow string[] for storybook
  };
}

export interface ItineraryItemCardProps {
  item: ExtendedItineraryItem;
  className?: string;
  dayNumber?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  isOverlay?: boolean; // Added for drag overlay
  isCoreItem?: boolean; // For core items (accommodation/transportation)
  editable?: boolean;
  [key: string]: any;
}

const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '🔥', '👎', '👏', '✨'];

// Interface for comment structure
interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user: {
    name: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
  reactions?: ItineraryItemReaction[];
}

/**
 * Redesigned Itinerary Item Card with header, content, footer layout
 * Similar to group idea cards but styled according to the visual guide
 */
export const ItineraryItemCard: React.FC<ItineraryItemCardProps> = React.memo(
  ({
    item,
    className,
    dayNumber,
    onEdit,
    onDelete,
    isOverlay = false,
    isCoreItem = false,
    editable = false,
    ...props
  }) => {
    const { user } = useAuth();
    const [reactions, setReactions] = useState<ItineraryItemReaction[]>(
      (item as any).reactions ?? []
    );
    const [loadingEmoji, setLoadingEmoji] = useState<string | null>(null);
    const [reactionPopoverOpen, setReactionPopoverOpen] = useState(false);
    const [showCommentsSidebar, setShowCommentsSidebar] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(0);

    // Group reactions by emoji
    const reactionsByEmoji = ALLOWED_EMOJIS.reduce(
      (acc, emoji) => {
        acc[emoji] = reactions.filter((r: ItineraryItemReaction) => r.emoji === emoji);
        return acc;
      },
      {} as Record<string, ItineraryItemReaction[]>
    );

    // Check if current user has reacted with each emoji
    const userEmoji = ALLOWED_EMOJIS.find((emoji) =>
      reactionsByEmoji[emoji]?.some((r: ItineraryItemReaction) => r.user_id === user?.id)
    );

    // Fetch latest reactions on mount or when item.id changes
    React.useEffect(() => {
      setReactions((item as any).reactions ?? []);
      // Optionally, fetch from API for freshest data
      // (uncomment if you want to always fetch)
      // fetchReactions();
    }, [item.id, (item as any).reactions]);

    /**
     * Fetch reactions for this item from the API
     */
    const fetchReactions = async () => {
      try {
        const res = await fetch(`/api/trips/${item.trip_id}/itinerary/${item.id}/reactions`);
        if (res.ok) {
          const data = await res.json();
          setReactions(data.reactions || []);
        }
      } catch (e) {
        // Ignore errors for now
      }
    };

    /**
     * Handle clicking an emoji: toggles reaction for current user
     * Closes the popover after selection
     */
    const handleEmojiClick = async (emoji: string) => {
      if (!user) return;
      setLoadingEmoji(emoji);
      try {
        const res = await fetch(`/api/trips/${item.trip_id}/itinerary/${item.id}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emoji }),
        });
        if (res.ok) {
          const data = await res.json();
          setReactions(data.reactions || []);
        }
        setReactionPopoverOpen(false); // Close popover after reaction
      } finally {
        setLoadingEmoji(null);
      }
    };

    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onEdit) onEdit();
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onDelete) onDelete();
    };

    // New function to fetch comments
    const fetchComments = async () => {
      if (!item.id || !item.trip_id) return;

      try {
        setIsLoadingComments(true);
        const res = await fetch(`/api/trips/${item.trip_id}/itinerary/${item.id}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
          setCommentsCount(data.count || 0);
        }
      } catch (e) {
        console.error('Error fetching comments:', e);
      } finally {
        setIsLoadingComments(false);
      }
    };

    // Handle posting a new comment
    const handlePostComment = async () => {
      if (!newComment.trim() || !user || !item.id || !item.trip_id) return;

      try {
        const res = await fetch(`/api/trips/${item.trip_id}/itinerary/${item.id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: newComment,
            parent_id: replyingTo
          }),
        });

        if (res.ok) {
          // Refresh comments
          await fetchComments();
          setNewComment('');
          setReplyingTo(null);
        }
      } catch (e) {
        console.error('Error posting comment:', e);
      }
    };

    // Handle reaction to a comment
    const handleCommentReaction = async (commentId: string, emoji: string) => {
      if (!user || !item.id || !item.trip_id) return;

      try {
        const res = await fetch(`/api/trips/${item.trip_id}/itinerary/${item.id}/comments/${commentId}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emoji }),
        });

        if (res.ok) {
          // Refresh comments to get updated reactions
          await fetchComments();
        }
      } catch (e) {
        console.error('Error reacting to comment:', e);
      }
    };

    // Handle click on comment button
    const handleCommentClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowCommentsSidebar(true);
      fetchComments();
    };

    // Render a comment with optional replies
    const renderComment = (comment: Comment, isReply = false) => {
      return (
        <div key={comment.id} className={cn("pb-3", isReply ? "ml-8" : "")}>
          <div className="flex items-start gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user.avatar_url || ''} />
              <AvatarFallback>{comment.user.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-secondary/40 p-3 rounded-lg">
                <div className="font-medium">{comment.user.name || 'Anonymous'}</div>
                <div className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
                  {comment.content}
                </div>
              </div>
              <div className="flex items-center mt-1 gap-1">
                <button 
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Reply
                </button>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Render replies if any */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      );
    };

    // Determine the category display name based on item's category
    const categoryDisplayName = item.category
      ? (CATEGORY_DISPLAY as any)[item.category]?.label || DEFAULT_CATEGORY_DISPLAY
      : DEFAULT_CATEGORY_DISPLAY;

    // Get the type display name based on the item's type/item_type
    const typeDisplayName =
      (ITEM_TYPE_DISPLAY as any)[item.type || '']?.label || 
      (ITEM_TYPE_DISPLAY as any)[item.item_type || '']?.label || 
      DEFAULT_TYPE_DISPLAY;

    // Use formatted start/end times if available
    const timeDisplay = getTimeDisplay(item.start_time, item.end_time);

    return (
      <div
        className={cn(
          'relative flex flex-col rounded-md border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200',
          isOverlay ? 'opacity-70 w-[calc(100%-8px)]' : 'w-full',
          isCoreItem ? 'border-primary/30 bg-primary/5' : '',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Header with title and actions */}
        <div className="flex justify-between items-start p-4 pb-2">
          <div>
            {dayNumber !== undefined && dayNumber !== null && (
              <div className="text-xs font-medium text-muted-foreground mb-1">Day {dayNumber}</div>
            )}
            <h3 className="text-lg font-semibold line-clamp-2">{item.title || '(Untitled)'}</h3>
          </div>

          {/* Actions dropdown */}
          {editable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", isHovered ? "opacity-100" : "opacity-0")}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditClick}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteClick}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Middle content section */}
        <div className="px-4 py-2 flex-grow">
          {/* Type and category badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {timeDisplay && (
              <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                {timeDisplay}
              </div>
            )}
            {typeDisplayName && typeDisplayName !== DEFAULT_TYPE_DISPLAY && (
              <div className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                {typeDisplayName}
              </div>
            )}
            {categoryDisplayName && categoryDisplayName !== DEFAULT_CATEGORY_DISPLAY && (
              <div className="bg-secondary/50 text-secondary-foreground text-xs px-2 py-1 rounded-full">
                {categoryDisplayName}
              </div>
            )}
          </div>

          {/* Location */}
          {item.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>{item.location}</span>
            </div>
          )}

          {/* Notes/description */}
          {item.notes && (
            <div className="text-sm mt-2 text-muted-foreground line-clamp-3 whitespace-pre-wrap">
              {item.notes}
            </div>
          )}
        </div>

        {/* Footer with voting, comments, and URL */}
        <div className="px-4 py-2 border-t flex flex-wrap items-center justify-between gap-2">
          {/* Left side with reactions */}
          <div className="flex items-center gap-1.5">
            {/* Reaction button/popover */}
            <Popover open={reactionPopoverOpen} onOpenChange={setReactionPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => e.stopPropagation()}>
                  {userEmoji ? (
                    <span className="text-lg">{userEmoji}</span>
                  ) : (
                    <Smile className="h-4 w-4" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="top">
                <div className="flex gap-1.5">
                  {ALLOWED_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-full hover:bg-secondary transition-colors",
                        reactionsByEmoji[emoji]?.some((r) => r.user_id === user?.id)
                          ? "bg-secondary"
                          : ""
                      )}
                      onClick={() => handleEmojiClick(emoji)}
                      disabled={loadingEmoji !== null}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Display reaction counts */}
            <div className="flex flex-wrap gap-1">
              {ALLOWED_EMOJIS.filter(emoji => (reactionsByEmoji[emoji]?.length || 0) > 0).map(
                (emoji) => (
                  <div
                    key={emoji}
                    className="flex items-center gap-0.5 bg-secondary/50 rounded-full px-1.5 py-0.5 text-xs"
                  >
                    <span>{emoji}</span>
                    <span>{reactionsByEmoji[emoji]?.length || 0}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right side with comments button & URL link */}
          <div className="flex items-center gap-2">
            {/* Comments button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCommentClick}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Comments</TooltipContent>
            </Tooltip>

            {/* External URL link if available */}
            {item.url && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View website</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Comments sidebar */}
        <AnimatePresence>
          {showCommentsSidebar && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 right-0 w-full sm:w-96 bg-card shadow-lg border-l z-50 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Comments</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowCommentsSidebar(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-grow">
                <div className="p-4">
                  {isLoadingComments ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map(comment => renderComment(comment))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                {replyingTo && (
                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <CornerDownRight className="h-4 w-4" />
                    <span>Replying to a comment</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setReplyingTo(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] flex-grow"
                  />
                  <Button 
                    size="icon" 
                    onClick={handlePostComment}
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
); 