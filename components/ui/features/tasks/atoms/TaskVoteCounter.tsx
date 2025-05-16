/**
 * TaskVoteCounter for displaying and handling vote actions
 */

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskVotes } from '../types';

// ============================================================================
// PROPS DEFINITION
// ============================================================================

export interface TaskVoteCounterProps {
  /** Vote information */
  votes: TaskVotes;
  /** Direction of the vote counter */
  direction: 'up' | 'down';
  /** Callback when the vote button is clicked */
  onVote?: (direction: 'up' | 'down') => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Component for displaying and handling votes on tasks
 */
export function TaskVoteCounter({
  votes,
  direction,
  onVote,
  disabled = false,
  className = '',
}: TaskVoteCounterProps) {
  const isActive = votes.userVote === direction;
  const count = direction === 'up' ? votes.up : votes.down;
  const voters = direction === 'up' ? votes.upVoters : votes.downVoters;
  
  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onVote) {
      onVote(direction);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'p-1 h-auto',
              direction === 'up' && isActive && 'text-blue-500',
              direction === 'down' && isActive && 'text-red-500',
              className
            )}
            onClick={handleVote}
            disabled={disabled}
            aria-label={`${direction === 'up' ? 'Upvote' : 'Downvote'} (${count} votes)`}
          >
            {direction === 'up' ? (
              <ThumbsUp size={16} />
            ) : (
              <ThumbsDown size={16} />
            )}
            <span className="ml-1">{count}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{direction === 'up' ? 'Upvote' : 'Downvote'} this task</p>
          {voters.length > 0 && (
            <div className="mt-1 text-xs">
              {direction === 'up' ? 'Upvoted' : 'Downvoted'} by: {voters.map(v => v.name || v.username).join(', ')}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 