'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  MessageCircle, 
  MoreHorizontal,
  Tag,
  User
} from 'lucide-react';
import { VoteButton, VoteType } from '../ui/vote-button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';

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
  id: string;
  title: string;
  description?: string;
  type: GroupPlanIdeaType;
  imageUrl?: string;
  createdBy: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  voteCount: number;
  currentVote?: VoteType;
  commentCount: number;
  tags?: string[];
  metadata?: {
    location?: string;
    date?: string;
    time?: string;
    cost?: string;
    url?: string;
  };
  isPinned?: boolean;
  isHighlighted?: boolean;
  className?: string;
  onVote?: (id: string, vote: VoteType) => void;
  onComment?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
}

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
    destination: 'bg-amber-50 border-amber-100',
    date: 'bg-purple-50 border-purple-100',
    activity: 'bg-emerald-50 border-emerald-100',
    budget: 'bg-cyan-50 border-cyan-100',
    question: 'bg-blue-50 border-blue-100',
    note: 'bg-slate-50 border-slate-100',
    place: 'bg-indigo-50 border-indigo-100',
    other: 'bg-gray-50 border-gray-100',
  };

  // Icon for each idea type
  const typeIcons = {
    destination: <MapPin className="h-4 w-4 text-amber-600" />,
    date: <Calendar className="h-4 w-4 text-purple-600" />,
    activity: <Tag className="h-4 w-4 text-emerald-600" />,
    budget: <Clock className="h-4 w-4 text-cyan-600" />,
    question: <MessageCircle className="h-4 w-4 text-blue-600" />,
    note: <Tag className="h-4 w-4 text-slate-600" />,
    place: <MapPin className="h-4 w-4 text-indigo-600" />,
    other: <Tag className="h-4 w-4 text-gray-600" />,
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
                  {createdBy.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2 text-xs text-muted-foreground">
                {createdBy.name} · {formatDate(createdAt)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleComment}
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                {commentCount > 0 ? commentCount : 'Comment'}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onPin?.(id)}>
                    {isPinned ? 'Unpin idea' : 'Pin idea'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(id)}>
                    Edit idea
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600" 
                    onClick={() => onDelete?.(id)}
                  >
                    Delete idea
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}

export default GroupPlanIdea; 