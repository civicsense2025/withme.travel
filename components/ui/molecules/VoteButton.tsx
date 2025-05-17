
import React from 'react';
import { cn } from '@/lib/utils';

export interface VoteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  count?: number;
  voted?: boolean;
}

export const VoteButton = React.forwardRef<HTMLButtonElement, VoteButtonProps>(
  ({ className, count = 0, voted = false, ...props }, ref) => {
    return (
      <button
        className={cn('vote-button', voted && 'voted', className)}
        ref={ref}
        {...props}
      >
        <span className="vote-icon">↑</span>
        <span className="vote-count">{count}</span>
      </button>
    );
  }
);

VoteButton.displayName = 'VoteButton';
