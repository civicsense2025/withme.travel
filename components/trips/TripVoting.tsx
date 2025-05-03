'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Clock, LucideProps, ThumbsUp, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/lib/hooks/use-auth';

export interface VoteOption {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  votes: number;
  hasVoted?: boolean;
  voters?: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
}

interface TripVotingProps {
  tripId: string;
  pollId?: string;
  title: string;
  description?: string;
  options: VoteOption[];
  isActive: boolean;
  showResults?: boolean;
  expiresAt: Date | null;
  onVote?: (optionId: string) => void;
}

export function TripVoting({
  tripId,
  pollId,
  title,
  description,
  options,
  isActive,
  showResults = false,
  expiresAt,
  onVote,
}: TripVotingProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(
    options.find((option) => option.hasVoted)?.id || null
  );
  const [localOptions, setLocalOptions] = useState<VoteOption[]>(options);

  const totalVotes = localOptions.reduce((sum, option) => sum + option.votes, 0);

  const handleVote = async (optionId: string) => {
    if (!user) {
      toast({
        title: 'Not signed in',
        description: 'You need to be signed in to vote',
        variant: 'destructive',
      });
      return;
    }

    if (!isActive) {
      toast({
        description: 'This vote has ended',
        variant: 'destructive',
      });
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Find currently voted option if any
      const previousVotedOption = localOptions.find((opt) => opt.hasVoted);

      // Optimistically update UI
      setLocalOptions((prev) =>
        prev.map((opt) => ({
          ...opt,
          votes:
            opt.id === optionId
              ? opt.votes + (previousVotedOption ? 0 : 1)
              : opt.id === previousVotedOption?.id
                ? opt.votes - 1
                : opt.votes,
          hasVoted: opt.id === optionId,
        }))
      );

      setSelectedOption(optionId);

      // Call API to register vote
      const response = await fetch(`/api/trips/${tripId}/vote/${pollId}/cast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register vote');
      }

      if (onVote) {
        onVote(optionId);
      }

      toast({
        description: 'Your vote has been registered',
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: 'Failed to register your vote. Please try again.',
        variant: 'destructive',
      });

      // Revert optimistic update
      setLocalOptions(options);
      setSelectedOption(options.find((option) => option.hasVoted)?.id || null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeRemaining = () => {
    if (!expiresAt) return null;

    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return 'Voting ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes} minutes remaining`;
    }
  };

  const displayResults = showResults || !isActive;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {expiresAt && (
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Clock className="h-4 w-4 mr-1" />
            {getTimeRemaining()}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {localOptions.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

            return (
              <div
                key={option.id}
                className={cn(
                  'relative rounded-lg border p-4 transition-all',
                  option.hasVoted && 'border-primary bg-primary/5',
                  !isActive && 'opacity-80'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium">{option.title}</h4>
                      {option.hasVoted && <CheckCircle className="h-4 w-4 ml-2 text-primary" />}
                    </div>

                    {option.description && (
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    )}

                    {displayResults && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                          </span>
                          <span className="font-medium">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )}
                  </div>

                  {option.imageUrl && (
                    <div className="ml-4 h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={option.imageUrl}
                        alt={option.title}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {isActive && !displayResults && (
                  <Button
                    variant={option.hasVoted ? 'secondary' : 'outline'}
                    className="mt-3 w-full"
                    onClick={() => handleVote(option.id)}
                    disabled={isSubmitting}
                  >
                    {option.hasVoted ? 'Voted' : 'Vote'}
                  </Button>
                )}

                {option.voters && option.voters.length > 0 && displayResults && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Voted by:</p>
                    <div className="flex -space-x-2 overflow-hidden">
                      {option.voters.map((voter) => (
                        <Avatar key={voter.id} className="h-6 w-6 border-2 border-background">
                          {voter.avatarUrl ? (
                            <AvatarImage src={voter.avatarUrl} alt={voter.name} />
                          ) : (
                            <AvatarFallback>
                              {voter.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} total
        </div>

        {!isActive && (
          <div className="text-sm font-medium">
            {localOptions.reduce(
              (winner, option) => (option.votes > winner.votes ? option : winner),
              { votes: -1, title: '' }
            ).title &&
              `Winner: ${
                localOptions.reduce(
                  (winner, option) => (option.votes > winner.votes ? option : winner),
                  { votes: -1, title: '' }
                ).title
              }`}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
