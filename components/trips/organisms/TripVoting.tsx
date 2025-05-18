/**
 * Trip Voting
 * 
 * Displays a voting interface for group decisions with options, voting mechanism and results
 * 
 * @module trips/organisms
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Clock, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

interface VoteOption {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  votes: number;
  hasVoted?: boolean;
}

export interface TripVotingProps {
  tripId: string;
  pollId: string;
  title: string;
  description?: string;
  options: VoteOption[];
  isActive: boolean;
  showResults?: boolean;
  expiresAt: Date | null;
  className?: string;
  onVote?: (optionId: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TripVoting({
  tripId,
  pollId,
  title,
  description,
  options,
  isActive,
  showResults = false,
  expiresAt,
  className,
  onVote,
}: TripVotingProps) {
  // Calculate total votes for percentage calculation
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);
  
  // Check if voting has expired
  const hasExpired = expiresAt ? new Date() > expiresAt : false;
  
  // Format the expiry date
  const formattedExpiryDate = expiresAt ? format(expiresAt, 'PPP') : null;

  // Determine if we should show results
  const shouldShowResults = showResults || !isActive || hasExpired;

  // Handle vote action
  const handleVote = (optionId: string) => {
    if (isActive && !hasExpired && onVote) {
      onVote(optionId);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center">
            {hasExpired ? (
              <Badge variant="outline" className="gap-1">
                <AlertCircle className="h-3 w-3" /> Expired
              </Badge>
            ) : isActive ? (
              <Badge variant="default" className="gap-1">
                <Clock className="h-3 w-3" /> Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Check className="h-3 w-3" /> Completed
              </Badge>
            )}
          </div>
        </div>
        {formattedExpiryDate && (
          <p className="text-sm text-muted-foreground mt-1">
            {hasExpired ? 'Ended' : 'Ends'} on {formattedExpiryDate}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {options.map((option) => (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{option.title}</div>
                  {option.description && (
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  )}
                </div>
                
                {shouldShowResults ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{option.votes}</span>
                    {option.hasVoted && <ThumbsUp className="h-3 w-3 text-primary" />}
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleVote(option.id)}
                    disabled={!isActive || hasExpired}
                    className="ml-4"
                  >
                    Vote
                  </Button>
                )}
              </div>
              
              {shouldShowResults && (
                <Progress 
                  value={totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0} 
                  className={cn(
                    "h-2", 
                    option.hasVoted ? "bg-primary/20" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
          
          {shouldShowResults && (
            <div className="text-sm text-muted-foreground text-right pt-2">
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} total
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TripVoting; 