/**
 * GroupIdeaVoteCount Atom
 *
 * Displays the vote count for a group idea.
 * @module components/features/groups/atoms/GroupIdeaVoteCount
 */

import React from 'react';

/**
 * GroupIdeaVoteCount component props
 */
export interface GroupIdeaVoteCountProps {
  /** Number of upvotes */
  upvotes: number;
  /** Number of downvotes */
  downvotes?: number;
  /** Additional className for styling */
  className?: string;
}

/**
 * GroupIdeaVoteCount atom for group ideas (placeholder)
 */
export function GroupIdeaVoteCount({ upvotes, downvotes, className }: GroupIdeaVoteCountProps) {
  // TODO: Implement vote count UI
  return (
    <span className={className}>
      👍 {upvotes} {downvotes !== undefined && <>| 👎 {downvotes}</>}
    </span>
  );
}

export default GroupIdeaVoteCount; 