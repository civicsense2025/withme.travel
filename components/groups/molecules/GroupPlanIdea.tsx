/**
 * GroupPlanIdea
 * 
 * A card component for displaying group plan ideas with voting and action capabilities.
 * 
 * @module groups/molecules
 */

import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  MessageCircle, 
  MoreHorizontal,
  Tag,
  User
} from 'lucide-react';
import { VoteButton, VoteType } from '@/components/ui/vote-button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export type GroupPlanIdeaType = 
  | 'destination' 
  | 'date' 
  | 'activity'
  | 'budget' 
  | 'question'
  | 'note'
  | 'place'
  | 'other';

export interface GroupPlanIdeaProps {
  /** Unique identifier */
  id: string;
  /** Idea title */
  title: string;
  /** Optional idea description */
  description?: string;
  /** Type of idea */
  type: GroupPlanIdeaType;
  /** Optional image URL */
  imageUrl?: string;
  /** Creator information */
  createdBy: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  /** Creation date */
  createdAt: string;
  /** Number of votes */
  voteCount: number;
  /** User's current vote, if any */
  currentVote?: VoteType;
  /** Number of comments */
  commentCount: number;
  /** Associated tags */
  tags?: string[];
  /** Additional metadata */
  metadata?: {
    location?: string;
    date?: string;
    time?: string;
    cost?: string;
    url?: string;
  };
  /** Whether the idea is pinned */
  isPinned?: boolean;
  /** Whether the idea is highlighted */
  isHighlighted?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Vote handler */
  onVote?: (id: string, vote: VoteType) => void;
  /** Comment handler */
  onComment?: (id: string) => void;
  /** Edit handler */
  onEdit?: (id: string) => void;
  /** Delete handler */
  onDelete?: (id: string) => void;
  /** Pin/unpin handler */
  onPin?: (id: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupPlanIdea({
  id,
  title,
  description,
  type,
  imageUrl,
  createdBy,
  createdAt,
  voteCount,
  currentVote = 'none',
  commentCount,
  tags = [],
  metadata = {},
  isPinned = false,
  isHighlighted = false,
  className,
  onVote,
  onComment,
  onEdit,
  onDelete,
  onPin,
}: GroupPlanIdeaProps) {
  const handleVote = (vote: VoteType) => {
    onVote?.(id, vote);
  };

  const handleComment = () => {
    onComment?.(id);
  };

  // Background color based on idea type
  const typeColors = {
    destination: 'bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30',
    date: 'bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/30',
    activity: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30',
    budget: 'bg-cyan-50 border-cyan-100 dark:bg-cyan-950/20 dark:border-cyan-900/30',
    question: 'bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30',
    note: 'bg-slate-50 border-slate-100 dark:bg-slate-950/20 dark:border-slate-900/30',
    place: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30',
    other: 'bg-gray-50 border-gray-100 dark:bg-gray-950/20 dark:border-gray-900/30',
  };

  // Icon for each idea type
  const typeIcons = {
    destination: <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    date: <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    activity: <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    budget: <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />,
    question: <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
    note: <Tag className="h-4 w-4 text-slate-600 dark:text-slate-400" />,
    place: <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
    other: <Tag className="h-4 w-4 text-gray-600 dark:text-gray-400" />,
  };

  // Format datetime
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <Card
      className={cn(
        'overflow-hidden border transition-all hover:shadow-md',
        typeColors[type],
        isHighlighted && 'ring-2 ring-primary/50',
        isPinned && 'border-primary/50',
        className
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section (if available) */}
        {imageUrl && (
          <div className="relative h-48 md:w-1/3 md:h-auto">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Content Section */}
        <div className={cn('flex-1 p-0')}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Title with Type Badge */}
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs font-normal flex items-center gap-1',
                      isPinned && 'border-primary'
                    )}
                  >
                    {typeIcons[type]}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>
                  
                  {isPinned && (
                    <Badge variant="outline" className="text-xs font-normal border-primary/70 text-primary">
                      Pinned
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold">{title}</h3>
                
                {/* Description */}
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
              
              {/* Vote Button */}
              <VoteButton 
                value={currentVote}
                count={voteCount}
                onChange={handleVote}
                size="sm"
              />
            </div>

            {/* Metadata Section */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {metadata.location && (
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{metadata.location}</span>
                </div>
              )}
              
              {metadata.date && (
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span>{metadata.date}</span>
                </div>
              )}
              
              {metadata.time && (
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span>{metadata.time}</span>
                </div>
              )}
              
              {metadata.cost && (
                <div className="flex items-center text-muted-foreground">
                  <Tag className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span>{metadata.cost}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="px-4 py-3 border-t flex items-center justify-between">
            {/* Creator Info */}
            <div className="flex items-center">
              <Avatar className="h-6 w-6">
                <AvatarImage src={createdBy.avatarUrl} alt={createdBy.name} />
                <AvatarFallback>
                  {createdBy.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <p className="text-xs font-medium">{createdBy.name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(createdAt)}</p>
              </div>
            </div>
            
            {/* Comment Button & Actions Menu */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs flex items-center gap-1 px-2 h-7"
                onClick={handleComment}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {commentCount > 0 && (
                  <span>{commentCount}</span>
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-1 h-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(id)}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onPin && (
                    <DropdownMenuItem onClick={() => onPin(id)}>
                      {isPinned ? 'Unpin' : 'Pin'}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(id)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
} 