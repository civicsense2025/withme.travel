'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ThumbsUp, ThumbsDown, MessageCircle, Calendar, MapPin, DollarSign, HelpCircle, Clipboard, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { GROUP_PLAN_IDEA_TYPE, VOTE_TYPE } from '@/utils/constants/status';

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
          setUpvotes(prev => Math.max(0, prev - 1));
        } else {
          setDownvotes(prev => Math.max(0, prev - 1));
        }
      } else {
        // Change vote or add new vote
        if (currentVote === 'up' && voteType === 'down') {
          setUpvotes(prev => Math.max(0, prev - 1));
          setDownvotes(prev => prev + 1);
        } else if (currentVote === 'down' && voteType === 'up') {
          setUpvotes(prev => prev + 1);
          setDownvotes(prev => Math.max(0, prev - 1));
        } else if (voteType === 'up') {
          setUpvotes(prev => prev + 1);
        } else {
          setDownvotes(prev => prev + 1);
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

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-2">
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
      
      <CardContent className="flex-grow">
        {idea.description ? (
          <p className={truncateDescription ? "line-clamp-3 text-sm" : "text-sm"}>
            {idea.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description provided</p>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "h-8 px-2",
                    currentVote === 'up' && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
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
                    "h-8 px-2",
                    currentVote === 'down' && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
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
        </div>
        
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Discuss this idea</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
} 