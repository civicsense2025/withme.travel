'use client';

import React from 'react';
import { MapPin, Calendar, Clock, Users, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { VoteButton, VoteType } from '../ui/vote-button';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export interface GroupPlanActivityProps {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  date?: string;
  time?: string;
  duration?: string;
  tags?: string[];
  voteCount?: number;
  currentVote?: VoteType;
  createdBy?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  participants?: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
  }>;
  status?: 'suggested' | 'confirmed' | 'rejected';
  isExpanded?: boolean;
  isInteractive?: boolean;
  className?: string;
  onVote?: (id: string, vote: VoteType) => void;
  onExpand?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function GroupPlanActivity({
  id,
  title,
  description,
  imageUrl,
  location,
  date,
  time,
  duration,
  tags = [],
  voteCount = 0,
  currentVote = 'none',
  createdBy,
  participants = [],
  status = 'suggested',
  isExpanded = false,
  isInteractive = true,
  className,
  onVote,
  onExpand,
  onEdit,
  onDelete,
}: GroupPlanActivityProps) {
  const handleVote = (vote: VoteType) => {
    onVote?.(id, vote);
  };

  const handleExpand = () => {
    onExpand?.(id);
  };

  // Status badge color
  const statusColor = {
    suggested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-200',
        isExpanded ? 'shadow-md' : 'shadow-sm hover:shadow-md',
        className
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        {imageUrl && (
          <div
            className={cn(
              'relative bg-muted',
              isExpanded ? 'h-48 md:w-1/3 md:h-auto' : 'h-32 md:w-1/4 md:h-auto'
            )}
          >
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <Badge 
              className={cn(
                'absolute top-2 left-2 border',
                statusColor[status]
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        )}

        {/* Content Section */}
        <CardContent className={cn(
          'flex-1 p-4',
          !imageUrl && 'w-full'
        )}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
              
              {/* Creator info */}
              {createdBy && (
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  <span>Suggested by</span>
                  <Avatar className="h-5 w-5 ml-1 mr-1">
                    <AvatarImage src={createdBy.avatarUrl} alt={createdBy.name} />
                    <AvatarFallback>{createdBy.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{createdBy.name}</span>
                </div>
              )}
            </div>

            {/* Vote Button */}
            <VoteButton 
              value={currentVote}
              count={voteCount}
              onChange={handleVote}
              size="sm"
              disabled={!isInteractive}
            />
          </div>

          {/* Activity Details */}
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {location && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}
            
            {date && (
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span>{date}</span>
              </div>
            )}
            
            {time && (
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span>{time}{duration && ` (${duration})`}</span>
              </div>
            )}
            
            {participants.length > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Users className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Description - Shown when expanded or if there is no image */}
          {description && (isExpanded || !imageUrl) && (
            <p className={cn(
              "mt-2 text-sm text-muted-foreground",
              isExpanded ? "" : "line-clamp-2"
            )}>
              {description}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tags.map(tag => (
                <Badge key={tag} variant="outline" className="bg-muted/50 text-xs font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-3">
            {/* Participant Avatars */}
            {participants.length > 0 && (
              <div className="flex -space-x-2">
                {participants.slice(0, 3).map(participant => (
                  <Avatar key={participant.id} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={participant.avatarUrl} alt={participant.name} />
                    <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {participants.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                    +{participants.length - 3}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center ml-auto space-x-2">
              {isInteractive && isExpanded && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(id)}>
                      Edit activity
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive" 
                      onClick={() => onDelete?.(id)}
                    >
                      Delete activity
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {isInteractive && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleExpand}
                  className="text-xs"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export default GroupPlanActivity; 