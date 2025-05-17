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
import { format } from 'date-fns';
import { DisplayItineraryItem } from '@/types/itinerary';
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

// Extend the DisplayItineraryItem interface locally to include url
interface ExtendedItineraryItem extends DisplayItineraryItem {
  url?: string | null;
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
            parent_id: replyingTo,
          }),
        });

        if (res.ok) {
          setNewComment('');
          setReplyingTo(null);
          await fetchComments(); // Refresh comments
        }
      } catch (e) {
        console.error('Error posting comment:', e);
      }
    };

    // Handle reactions on comments
    const handleCommentReaction = async (commentId: string, emoji: string) => {
      if (!user || !item.id || !item.trip_id) return;

      try {
        const res = await fetch(
          `/api/trips/${item.trip_id}/itinerary/${item.id}/comments/${commentId}/reactions`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emoji }),
          }
        );

        if (res.ok) {
          await fetchComments(); // Refresh comments with updated reactions
        }
      } catch (e) {
        console.error('Error reacting to comment:', e);
      }
    };

    // Load comments when the sidebar is opened
    React.useEffect(() => {
      if (showCommentsSidebar) {
        fetchComments();
      }
    }, [showCommentsSidebar]);

    // Handle comment click better
    const handleCommentClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowCommentsSidebar(!showCommentsSidebar);
    };

    // Render a single comment with its replies
    const renderComment = (comment: Comment, isReply = false) => {
      return (
        <div key={comment.id} className={cn('mb-4', isReply && 'ml-8 mt-2')}>
          <div className="flex items-start gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={comment.user.avatar_url || undefined} />
              <AvatarFallback>{comment.user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted p-2 rounded-md">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-medium">{comment.user.name || 'Anonymous User'}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>

              {/* Comment actions */}
              <div className="flex items-center mt-1 gap-1">
                {/* Reply button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                  className="h-6 px-2 text-xs"
                >
                  Reply
                </Button>

                {/* Comment reactions */}
                <div className="flex items-center gap-1">
                  {ALLOWED_EMOJIS.slice(0, 4).map((emoji) => {
                    const reactionCount =
                      comment.reactions?.filter((r) => r.emoji === emoji).length || 0;
                    const userReacted = comment.reactions?.some(
                      (r) => r.emoji === emoji && r.user_id === user?.id
                    );

                    if (reactionCount === 0 && !userReacted) return null;

                    return (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCommentReaction(comment.id, emoji)}
                        className={cn(
                          'h-5 px-1 py-0 rounded-full text-xs',
                          userReacted
                            ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                            : 'hover:bg-muted'
                        )}
                      >
                        {emoji} {reactionCount > 0 ? reactionCount : ''}
                      </Button>
                    );
                  })}

                  {/* Add reaction button */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 w-5 rounded-full p-0">
                        <Smile className="h-3 w-3 text-muted-foreground" />
                        <span className="sr-only">Add reaction</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-1" align="start">
                      <div className="grid grid-cols-4 gap-1">
                        {ALLOWED_EMOJIS.map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCommentReaction(comment.id, emoji)}
                            className="h-7 w-7 p-0"
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* Render replies (up to 2 levels only) */}
          {!isReply && comment.replies?.map((reply) => renderComment(reply, true))}

          {/* Reply form if replying to this comment */}
          {replyingTo === comment.id && (
            <div className="ml-8 mt-2 flex gap-2">
              <div className="w-6 flex justify-center">
                <CornerDownRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[60px] text-sm p-2"
                />
                <div className="flex justify-end gap-2 mt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReplyingTo(null)}
                    className="h-7"
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handlePostComment} className="h-7">
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    const address = item.address || item.location;

    // Format time for display and tooltip - converts 24h to 12h time
    const formatTime = (timeString: string | null): string => {
      if (!timeString) return '';
      try {
        // Try to parse time (assuming format like "14:30")
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return format(date, 'h:mm a'); // Returns "2:30 PM"
      } catch (e) {
        return timeString; // Return original if parsing fails
      }
    };

    const scheduleTime = item.start_time
      ? item.end_time
        ? `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`
        : formatTime(item.start_time)
      : null;

    const bgColorClass = cn(
      'bg-card hover:bg-card/90 dark:bg-card/90 dark:hover:bg-card/80',
      isCoreItem && 'bg-card/95 standard-border-l-4 border-l-primary/30'
    );

    // Get the appropriate category or type display
    let displayInfo = DEFAULT_CATEGORY_DISPLAY;

    if (item.category) {
      // Check if the category exists in our mapping
      // Using type assertion with 'as' since we know the structure
      const categoryKey = Object.values(ITINERARY_CATEGORIES).find((cat) => cat === item.category);

      if (categoryKey && categoryKey in CATEGORY_DISPLAY) {
        displayInfo = CATEGORY_DISPLAY[categoryKey as keyof typeof CATEGORY_DISPLAY];
      }
    } else if (item.type) {
      // Only look up the type if it's one of our known types
      const type = item.type.toLowerCase();
      if (
        type === 'accommodation' ||
        type === 'transportation' ||
        type === 'activity' ||
        type === 'food'
      ) {
        displayInfo = ITEM_TYPE_DISPLAY[type as keyof typeof ITEM_TYPE_DISPLAY];
      }
    }

    // Use formattedCategory if available, otherwise format snake_case to Title Case
    const displayCategory = item.formattedCategory || item.category;
    const displayCategoryFormatted = displayCategory
      ? typeof displayCategory === 'string' && displayCategory.includes('_')
        ? displayCategory
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
        : displayCategory
      : 'Unspecified';

    // Additional details for tooltip
    const details = [
      { label: 'Type', value: item.type || 'Unspecified' },
      { label: 'Category', value: displayCategoryFormatted },
      { label: 'Status', value: item.status || 'Unspecified' },
      { label: 'Notes', value: item.notes },
    ].filter((detail) => detail.value);

    // Filter out custom props that shouldn't go on DOM
    const { onVote, onStatusChange, ...restProps } = props;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 22, mass: 0.5 }}
        className={cn(
          'rounded-lg shadow-sm relative standard-border transition-all',
          bgColorClass,
          isOverlay && 'opacity-50',
          className
        )}
        {...restProps}
        tabIndex={isOverlay ? -1 : undefined}
        aria-hidden={isOverlay ? true : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Visual day indicator */}
        {dayNumber && (
          <div className="absolute -left-3 -top-3 rounded-full bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center shadow-md transform -rotate-12 opacity-70">
            <span className="text-xs font-semibold">{dayNumber}</span>
          </div>
        )}

        {/* CARD HEADER */}
        <div className="p-3 flex items-center justify-between border-b border-border/20">
          <div className="flex items-center gap-2">
            {/* Item type/category emoji icon */}
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center',
                displayInfo.color
              )}
            >
              <span className="text-base" aria-hidden="true">
                {displayInfo.emoji}
              </span>
            </div>

            {/* Title with tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <h3
                  className="font-semibold text-base truncate cursor-help max-w-[180px]"
                  title={item.title ?? 'Untitled'}
                >
                  {item.title || 'Untitled Item'}
                </h3>
              </TooltipTrigger>
              <TooltipContent className="bg-popover border border-border shadow-md w-64">
                <div className="space-y-2 p-1">
                  <p className="font-semibold">{item.title || 'Untitled Item'}</p>
                  {details.map(
                    (detail, i) =>
                      detail.value && (
                        <div key={i} className="text-xs">
                          <span className="font-medium">{detail.label}:</span> {detail.value}
                        </div>
                      )
                  )}
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Schedule time next to title if available */}
            {scheduleTime && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {scheduleTime}
              </span>
            )}
          </div>

          {/* Context Menu (right side of header) */}
          {!isOverlay && editable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8 rounded-full p-0',
                    isHovered ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={handleEditClick}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                {item.url && (
                  <DropdownMenuItem asChild>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Link
                    </a>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* CARD CONTENT */}
        <div className="p-3">
          {/* Description/notes */}
          {item.description && <p className="text-sm text-primary/90 mb-2">{item.description}</p>}
          {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
        </div>

        {/* CARD FOOTER */}
        <div className="p-3 pt-0 flex items-center justify-between border-t border-border/20 mt-2">
          {/* Address (left) */}
          {address && (
            <div className="text-xs text-muted-foreground flex items-center gap-1" title={address}>
              <MapPin className="w-3 h-3 flex-shrink-0 opacity-70" />
              <span className="truncate max-w-[180px]">{address}</span>
            </div>
          )}
          {!address && <div className="w-1 h-1"></div>}

          {/* Interactions (right) */}
          <div className="flex items-center gap-1">
            {/* Emoji reactions */}
            {Object.entries(reactionsByEmoji).map(([emoji, emojiReactions]) => {
              if (emojiReactions.length === 0) return null;
              const userReacted = emojiReactions.some((r) => r.user_id === user?.id);

              return (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEmojiClick(emoji)}
                  className={cn(
                    'h-6 px-1.5 py-0 rounded-full text-xs',
                    userReacted
                      ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                      : 'hover:bg-muted'
                  )}
                >
                  {emoji} {emojiReactions.length}
                </Button>
              );
            })}

            {/* Add reaction button */}
            <Popover open={reactionPopoverOpen} onOpenChange={setReactionPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                  <Smile className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="sr-only">Add reaction</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="grid grid-cols-4 gap-1">
                  {ALLOWED_EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEmojiClick(emoji)}
                      disabled={loadingEmoji === emoji}
                      className="h-8 w-8 p-0"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Comments button - with count if available */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCommentClick}
              className={cn(
                'h-6 w-6 rounded-full p-0',
                showCommentsSidebar && 'bg-primary/10 text-primary'
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="sr-only">Comments</span>
              {commentsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {commentsCount > 9 ? '9+' : commentsCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Comments sidebar/overlay */}
        <AnimatePresence>
          {showCommentsSidebar && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border/20 overflow-hidden"
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Comments</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowCommentsSidebar(false)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Comments list */}
                <ScrollArea className="max-h-[250px]">
                  {isLoadingComments ? (
                    <div className="py-8 text-center text-muted-foreground text-sm">
                      Loading comments...
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground text-sm">
                      No comments yet. Be the first to comment!
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      {comments.filter((c) => !c.replies).map((comment) => renderComment(comment))}
                    </div>
                  )}
                </ScrollArea>

                {/* New comment form */}
                {!replyingTo && (
                  <div className="mt-3 flex gap-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="min-h-[60px] text-sm"
                    />
                    <Button
                      size="sm"
                      className="h-full"
                      onClick={handlePostComment}
                      disabled={!newComment.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

// Add display name
ItineraryItemCard.displayName = 'ItineraryItemCard';
