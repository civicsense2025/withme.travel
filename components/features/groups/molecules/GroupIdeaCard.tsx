/**
 * GroupIdeaCard Component
 * 
 * Displays a group idea in a card format with optional actions,
 * comments, and reactions.
 * 
 * @module components/groups
 */

'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Pencil, 
  X, 
  MessageCircle, 
  Smile, 
  MoreVertical, 
  ThumbsUp, 
  ThumbsDown, 
  Link as LinkIcon,
  Calendar
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import type { GroupIdea } from '@/types/group-ideas';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

// Extended GroupIdea interface to include additional fields that might be needed
interface ExtendedGroupIdea extends GroupIdea {
  comment_count?: number;
  link?: string | null; 
  start_date?: string | null;
  end_date?: string | null;
}

interface GroupIdeaCardProps {
  /** The group idea to display */
  idea: ExtendedGroupIdea;
  /** Function called when the delete button is clicked */
  onDelete?: () => void;
  /** Function called when the edit button is clicked */
  onEdit?: () => void;
  /** Whether the card is currently selected */
  selected?: boolean;
  /** Function called when the card is selected */
  onSelect?: () => void;
  /** The user ID of the current user */
  userId?: string;
  /** Whether the user is authenticated */
  isAuthenticated?: boolean;
  /** The group ID */
  groupId?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show edit/delete actions */
  showActions?: boolean;
  /** Function to handle voting up */
  onVoteUp?: () => void;
  /** Function to handle voting down */
  onVoteDown?: () => void;
  /** Whether this is a compact view */
  compact?: boolean;
  /** Whether this card is draggable */
  draggable?: boolean;
}

// ============================================================================
// COLOR SCHEMES
// ============================================================================

const cardColors = {
  activity: {
    accent: 'border-l-blue-400 dark:border-l-blue-500',
    bg: 'bg-blue-50/50 dark:bg-blue-950/20',
    hover: 'hover:bg-blue-50 dark:hover:bg-blue-950/40',
  },
  place: {
    accent: 'border-l-teal-400 dark:border-l-teal-500',
    bg: 'bg-teal-50/50 dark:bg-teal-950/20',
    hover: 'hover:bg-teal-50 dark:hover:bg-teal-950/40',
  },
  note: {
    accent: 'border-l-yellow-400 dark:border-l-yellow-500',
    bg: 'bg-yellow-50/50 dark:bg-yellow-950/20',
    hover: 'hover:bg-yellow-50 dark:hover:bg-yellow-950/40',
  },
  question: {
    accent: 'border-l-purple-400 dark:border-l-purple-500',
    bg: 'bg-purple-50/50 dark:bg-purple-950/20',
    hover: 'hover:bg-purple-50 dark:hover:bg-purple-950/40',
  },
  other: {
    accent: 'border-l-gray-400 dark:border-l-gray-500',
    bg: 'bg-gray-50/50 dark:bg-gray-950/20',
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-950/40',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Card component for displaying a group idea
 */
export function GroupIdeaCard({
  idea,
  onDelete,
  onEdit,
  selected = false,
  onSelect,
  userId = '',
  isAuthenticated = false,
  groupId = '',
  className = '',
  showActions = true,
  onVoteUp,
  onVoteDown,
  compact = false,
  draggable = false,
}: GroupIdeaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  // Get emoji for each idea type
  function getEmoji(type: string): string {
    switch (type) {
      case 'place':
        return '🏙️';
      case 'activity':
        return '🏄‍♂️';
      case 'note':
        return '📝';
      case 'question':
        return '❓';
      default:
        return '💭';
    }
  }

  // Get color scheme based on idea type
  const getCardStyles = (type: string) => {
    const colorSet = cardColors[type as keyof typeof cardColors] || cardColors.other;
    return {
      accent: colorSet.accent,
      bg: colorSet.bg,
      hover: colorSet.hover,
    };
  };

  // Get formatted time ago
  const getTimeAgo = () => {
    if (!idea.created_at) return '';
    return formatDate(new Date(idea.created_at));
  };

  // Get net vote count
  const getNetVotes = () => {
    const upVotes = idea.votes_up || 0;
    const downVotes = idea.votes_down || 0;
    return upVotes - downVotes;
  };

  // Get vote class based on the vote count
  const getVoteClass = () => {
    const netVotes = getNetVotes();
    if (netVotes > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (netVotes < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  // Render the comments section
  const CommentsSection = () => {
    const commentCount = idea.comment_count || 0;

    return (
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 dark:border-border/30">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
            <span className="text-xs">{commentCount}</span>
          </Button>

          {onVoteUp && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground"
              onClick={onVoteUp}
            >
              <ThumbsUp className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
            </Button>
          )}

          {onVoteDown && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground"
              onClick={onVoteDown}
            >
              <ThumbsDown className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
            </Button>
          )}
        </div>

        <div className={cn("text-xs font-medium", getVoteClass())}>
          {getNetVotes() !== 0 && (
            <span>{getNetVotes() > 0 ? '+' : ''}{getNetVotes()}</span>
          )}
        </div>
      </div>
    );
  };

  // Error fallback
  if (!idea) {
    return <div className="bg-red-100 text-red-600 p-2 rounded">Missing idea data</div>;
  }

  // Get type-based styles
  const cardStyle = getCardStyles(idea.type);

  // Main render
  return (
    <Card
      ref={cardRef}
      className={cn(
        'group-idea-card relative border border-border/50 dark:border-border/30',
        'rounded-xl p-3 shadow-sm backdrop-blur-sm',
        draggable && 'cursor-grab active:cursor-grabbing',
        cardStyle.bg,
        cardStyle.accent,
        cardStyle.hover,
        'border-l-4',
        selected && 'ring-2 ring-[hsl(var(--travel-blue))] dark:ring-[hsl(var(--travel-blue))/0.7]',
        isHovered ? 'shadow-md scale-[1.01]' : '',
        compact ? 'min-h-[80px]' : 'min-h-[100px]',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <CardContent className="p-0 pb-0 h-full flex flex-col">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className={cn('font-medium text-sm leading-snug break-words')}>
                {getEmoji(idea.type)} {idea.title}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{getTimeAgo()}</p>
          </div>

          {showActions && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors duration-200"
                  >
                    <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={4} className="min-w-[140px] p-1">
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>Edit</span>
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md text-destructive dark:text-red-400"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Idea Description */}
        {idea.description && !compact && (
          <div className="text-sm text-muted-foreground mt-1 mb-2 line-clamp-3">
            {idea.description}
          </div>
        )}

        {/* Idea Description for compact view - one line only */}
        {idea.description && compact && (
          <div className="text-sm text-muted-foreground mt-1 mb-2 line-clamp-1">
            {idea.description}
          </div>
        )}

        {/* Idea metadata */}
        {idea.link && (
          <div className="flex items-center text-xs text-muted-foreground mt-2 mb-1">
            <LinkIcon className="h-3 w-3 mr-1" strokeWidth={1.5} />
            <span className="truncate">{idea.link}</span>
          </div>
        )}

        {/* Date information if available */}
        {(idea.start_date || idea.end_date) && (
          <div className="flex items-center text-xs text-muted-foreground mt-2 mb-1">
            <Calendar className="h-3 w-3 mr-1" strokeWidth={1.5} />
            <span>
              {idea.start_date && new Date(idea.start_date).toLocaleDateString()} 
              {idea.end_date && idea.start_date && ' - '} 
              {idea.end_date && new Date(idea.end_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Comments section */}
        <div className="mt-auto">
          <CommentsSection />
        </div>
      </CardContent>
    </Card>
  );
}

// Default export for backward compatibility
export default GroupIdeaCard; 