'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ThumbsUp,
  Map,
  Calendar,
  Clipboard,
  DollarSign,
  Tag,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Circle,
} from 'lucide-react';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { CreateTripModal } from './create-trip-modal';
import { TABLES } from '@/utils/constants/database';
import { useVotes } from '@/hooks/use-votes';

// Define the types for our data
type Idea = {
  id: string;
  title: string;
  description?: string;
  type: 'destination' | 'date' | 'activity' | 'budget' | 'other';
  votes_up: number;
  votes_down: number;
  created_by?: string;
  created_at: string;
};

type Member = {
  id: string;
  user_id: string;
  profiles: {
    email: string;
    full_name: string;
    avatar_url?: string;
  };
};

type VoteType = 'up' | 'down';
type Votes = Record<string, VoteType>;

// Props for the component
interface VotingClientProps {
  groupId: string;
  groupName: string;
  initialIdeas: Idea[];
  members: Member[];
  currentUserId: string;
}

export default function VotingClient({
  groupId,
  groupName,
  initialIdeas,
  members,
  currentUserId,
}: VotingClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [activeTab, setActiveTab] = useState<string>('destination');
  const [userVotes, setUserVotes] = useState<Votes>({});
  const [votingProgress, setVotingProgress] = useState(0);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [hasShownMilestone, setHasShownMilestone] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [newVotingState, setNewVotingState] = useState<Votes>({});

  // Use the voting hook
  const { isVoting, error: voteError, voteOnGroupIdea } = useVotes();

  // Group ideas by their type
  const ideasByType = useMemo(() => {
    const grouped: Record<string, Idea[]> = {
      destination: [],
      date: [],
      activity: [],
      budget: [],
      other: [],
    };

    initialIdeas.forEach((idea) => {
      if (grouped[idea.type]) {
        grouped[idea.type].push(idea);
      } else {
        grouped.other.push(idea);
      }
    });

    return grouped;
  }, [initialIdeas]);

  // Calculate voting progress
  const votingProgressMemo = useMemo(() => {
    // Count unique types that have ideas
    const typesWithIdeas = Object.entries(ideasByType).filter(
      ([_, ideas]) => ideas.length > 0
    ).length;

    if (typesWithIdeas === 0) return 100;

    // Count types that have been voted on
    const votedTypes = new Set();
    Object.keys(userVotes).forEach((ideaId) => {
      const idea = initialIdeas.find((i) => i.id === ideaId);
      if (idea) votedTypes.add(idea.type);
    });

    return Math.round((votedTypes.size / typesWithIdeas) * 100);
  }, [ideasByType, userVotes, initialIdeas]);

  // Check if we've already displayed the milestone for this vote
  useEffect(() => {
    const key = `research_milestone_vote_${groupId}`;
    const hasShown = localStorage.getItem(key) === 'true';
    setHasShownMilestone(hasShown);

    // If voting is 100% complete and we haven't shown the milestone yet, mark it as shown
    if (votingProgressMemo === 100 && !hasShown) {
      localStorage.setItem(key, 'true');
      setHasShownMilestone(true);
    }
  }, [groupId, votingProgressMemo]);

  // Fetch user's existing votes
  useEffect(() => {
    async function fetchUserVotes() {
      try {
        const supabase = getBrowserClient();
        const { data, error } = await supabase
          .from(TABLES.GROUP_PLAN_IDEA_VOTES)
          .select('idea_id, vote_type')
          .eq('user_id', currentUserId);

        if (error) throw error;

        const votes: Votes = {};
        data.forEach((vote) => {
          votes[vote.idea_id] = vote.vote_type as VoteType;
        });

        setUserVotes(votes);
      } catch (error) {
        console.error('Error fetching votes:', error);
      }
    }

    if (currentUserId) {
      fetchUserVotes();
    }
  }, [currentUserId]);

  const handleVote = async (ideaId: string, voteType: 'up' | 'down') => {
    try {
      // Check if user is changing their vote
      const isChangingVote = userVotes[ideaId] && userVotes[ideaId] !== voteType;
      // Check if user is removing their vote
      const isRemovingVote = userVotes[ideaId] === voteType;

      // Update local state first for immediate feedback
      const updatedIdeas = ideas.map((idea) => {
        if (idea.id !== ideaId) return idea;

        const updatedIdea = { ...idea };

        // If changing vote (e.g., from up to down)
        if (isChangingVote) {
          // Decrement previous vote type
          if (userVotes[ideaId] === 'up') updatedIdea.votes_up = Math.max(0, idea.votes_up - 1);
          if (userVotes[ideaId] === 'down')
            updatedIdea.votes_down = Math.max(0, idea.votes_down - 1);

          // Increment new vote type
          if (voteType === 'up') updatedIdea.votes_up += 1;
          if (voteType === 'down') updatedIdea.votes_down += 1;
        }
        // If removing vote (clicking same button again)
        else if (isRemovingVote) {
          if (voteType === 'up') updatedIdea.votes_up = Math.max(0, idea.votes_up - 1);
          if (voteType === 'down') updatedIdea.votes_down = Math.max(0, idea.votes_down - 1);
        }
        // If new vote
        else {
          if (voteType === 'up') updatedIdea.votes_up += 1;
          if (voteType === 'down') updatedIdea.votes_down += 1;
        }

        return updatedIdea;
      });

      setIdeas(updatedIdeas);

      // Update user votes
      const newUserVotes = { ...userVotes };
      if (isRemovingVote) {
        delete newUserVotes[ideaId];
      } else {
        newUserVotes[ideaId] = voteType;
      }
      setUserVotes(newUserVotes);

      // Use the votes hook to update the vote on the server
      await voteOnGroupIdea(groupId, ideaId, voteType);

      if (voteError) {
        throw voteError;
      }
    } catch (error) {
      console.error('Error saving vote:', error);
      toast({
        variant: 'destructive',
        children: (
          <>
            <div className="font-bold">Error</div>
            <div>Failed to save your vote. Please try again.</div>
          </>
        ),
      });

      // Revert to initial ideas and refetch votes on error
      setIdeas(initialIdeas);

      async function revertAndRefetch() {
        try {
          const supabase = getBrowserClient();
          const { data, error } = await supabase
            .from(TABLES.GROUP_PLAN_IDEA_VOTES)
            .select('idea_id, vote_type')
            .eq('user_id', currentUserId);

          if (error) throw error;

          const votes: Votes = {};
          data.forEach((vote) => {
            votes[vote.idea_id] = vote.vote_type as VoteType;
          });

          setUserVotes(votes);
        } catch (error) {
          console.error('Error refetching votes:', error);
        }
      }

      revertAndRefetch();
    }
  };

  const getIdeaTypeIcon = (type: string) => {
    switch (type) {
      case 'destination':
        return <Map className="hU4 wU4" />;
      case 'date':
        return <Calendar className="hU4 wU4" />;
      case 'activity':
        return <Clipboard className="hU4 wU4" />;
      case 'budget':
        return <DollarSign className="hU4 wU4" />;
      default:
        return <Tag className="hU4 wU4" />;
    }
  };

  const getIdeaTypeName = (type: string) => {
    switch (type) {
      case 'destination':
        return 'Destination';
      case 'date':
        return 'Date';
      case 'activity':
        return 'Activity';
      case 'budget':
        return 'Budget';
      default:
        return 'Other';
    }
  };

  const getIdeaTypeColor = (type: string) => {
    switch (type) {
      case 'destination':
        return 'bg-blueU100 text-blueU800';
      case 'date':
        return 'bg-purpleU100 text-purpleU800';
      case 'activity':
        return 'bg-greenU100 text-greenU800';
      case 'budget':
        return 'bg-yellowU100 text-yellowU800';
      default:
        return 'bg-grayU100 text-grayU800';
    }
  };

  const getTotalVotesForIdea = (idea: Idea) => {
    return idea.votes_up - idea.votes_down;
  };

  const getWinningIdeas = () => {
    // Group by type and get the top-voted idea(s) in each group
    const winners: Record<string, Idea[]> = {};

    Object.entries(ideasByType).forEach(([type, typeIdeas]) => {
      if (typeIdeas.length === 0) return;

      // Sort by net votes (up minus down)
      const sortedIdeas = [...typeIdeas].sort(
        (a, b) => getTotalVotesForIdea(b) - getTotalVotesForIdea(a)
      );

      // Get top idea
      const topIdea = sortedIdeas[0];
      const topScore = getTotalVotesForIdea(topIdea);

      // Get all ideas with the same top score (could be ties)
      winners[type] = sortedIdeas.filter((idea) => getTotalVotesForIdea(idea) === topScore);
    });

    return winners;
  };

  const allTypesTabs = ['destination', 'date', 'activity', 'budget', 'other'];

  const winningIdeas = getWinningIdeas();

  return (
    <div className="flex flex-col space-yU8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="textU2xl font-bold">{groupName} - Vote on Ideas</h1>
          <p className="text-muted-foreground">Choose your favorite ideas for this trip</p>
        </div>

        <div className="flex items-center gapU3">
          <Button variant="outline" onClick={() => router.push(`/groups/${groupId}/ideas`)}>
            <ArrowLeft className="hU4 wU4 mrU2" />
            Back to Ideas
          </Button>

          <Button
            variant="default"
            onClick={() => setShowCreateTripModal(true)}
            disabled={votingProgressMemo < 100}
          >
            Create Trip
            <ArrowRight className="hU4 wU4 mlU2" />
          </Button>
        </div>
      </div>

      {/* Voting progress */}
      <Card>
        <CardHeader className="pbU2">
          <CardTitle className="text-lg">Your Voting Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-yU3">
            <Progress value={votingProgressMemo} />
            <p className="text-sm text-muted-foreground">{votingProgressMemo}% complete</p>
          </div>
        </CardContent>
      </Card>

      {/* Main voting interface */}
      <div className="grid grid-colsU1 lg:grid-colsU2 gapU8">
        {/* Left column - Categories and voting */}
        <div className="space-yU6">
          <h2 className="text-xl font-bold">Vote on Ideas</h2>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              {allTypesTabs.map((type) => (
                <TabsTrigger key={type} value={type} className="flex items-center">
                  {getIdeaTypeIcon(type)}
                  <span className="mlU2">{getIdeaTypeName(type)}</span>

                  {Object.keys(userVotes).some(
                    (ideaId) => ideas.find((i) => i.id === ideaId)?.type === type
                  ) && <CheckCircle className="hU3 wU3 mlU1 text-greenU500" />}
                </TabsTrigger>
              ))}
            </TabsList>

            {allTypesTabs.map((type) => (
              <TabsContent key={type} value={type} className="space-yU4">
                <p className="text-sm text-muted-foreground">
                  Select your preferred {getIdeaTypeName(type).toLowerCase()} from the options
                  below.
                </p>

                {ideasByType[type] && ideasByType[type].length > 0 ? (
                  <div className="space-yU4">
                    {ideasByType[type].map((idea) => (
                      <Card key={idea.id} className="overflow-hidden">
                        <CardHeader className="pbU2">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge className={getIdeaTypeColor(idea.type)}>
                                {getIdeaTypeIcon(idea.type)}
                                <span className="mlU1">{getIdeaTypeName(idea.type)}</span>
                              </Badge>
                              <CardTitle className="mtU2 text-lg">{idea.title}</CardTitle>
                            </div>
                            <div className="flex items-center gapU1 text-muted-foreground text-sm">
                              <span>{getTotalVotesForIdea(idea)}</span>
                              <ThumbsUp className="hU3 wU3" />
                            </div>
                          </div>
                        </CardHeader>

                        {idea.description && (
                          <CardContent className="pbU3 ptU0">
                            <p className="text-sm text-muted-foreground">{idea.description}</p>
                          </CardContent>
                        )}

                        <CardFooter className="flex justify-between ptU0">
                          <p className="text-xs text-muted-foreground">
                            Added by{' '}
                            {members.find((m) => m.user_id === idea.created_by)?.profiles
                              .full_name || 'Anonymous'}
                          </p>

                          <div className="flex items-center gapU2">
                            <Button
                              variant={userVotes[idea.id] === 'down' ? 'default' : 'outline'}
                              size="sm"
                              className={
                                userVotes[idea.id] === 'down'
                                  ? 'bg-redU600 hover:bg-redU700'
                                  : 'hover:bg-redU100'
                              }
                              onClick={() => handleVote(idea.id, 'down')}
                            >
                              <ThumbsUp className="hU4 wU4 rotateU180" />
                              <span className="mlU1">{idea.votes_down}</span>
                            </Button>

                            <Button
                              variant={userVotes[idea.id] === 'up' ? 'default' : 'outline'}
                              size="sm"
                              className={
                                userVotes[idea.id] === 'up'
                                  ? 'bg-greenU600 hover:bg-greenU700'
                                  : 'hover:bg-greenU100'
                              }
                              onClick={() => handleVote(idea.id, 'up')}
                            >
                              <ThumbsUp className="hU4 wU4" />
                              <span className="mlU1">{idea.votes_up}</span>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center pyU8">
                    <p className="text-muted-foreground">
                      No {getIdeaTypeName(type).toLowerCase()} ideas available for voting
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Right column - Results */}
        <div className="space-yU6">
          <h2 className="text-xl font-bold">Current Results</h2>

          <Card>
            <CardHeader>
              <CardTitle>Your Group's Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-yU6">
              {allTypesTabs.map((type) => (
                <div key={type} className="space-yU3">
                  <div className="flex items-center gapU2">
                    {getIdeaTypeIcon(type)}
                    <h3 className="font-medium">{getIdeaTypeName(type)}</h3>
                  </div>

                  <Separator />

                  {winningIdeas[type] && winningIdeas[type].length > 0 ? (
                    <div className="space-yU3 plU6">
                      {winningIdeas[type].map((idea) => (
                        <div key={idea.id} className="flex items-center justify-between pyU1">
                          <div className="flex items-center gapU2">
                            <Circle className="hU2 wU2 fill-primary text-primary" />
                            <span>{idea.title}</span>
                          </div>
                          <Badge variant="outline">{getTotalVotesForIdea(idea)} votes</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground plU6">No votes yet</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Who's Voted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gapU4">
                {members.map((member) => {
                  const hasVoted = Math.random() > 0.3; // Simulated voting status

                  return (
                    <div key={member.id} className="flex flex-col items-center">
                      <Avatar className="hU12 wU12 mbU1 relative">
                        <AvatarImage src={member.profiles.avatar_url} />
                        <AvatarFallback>
                          {member.profiles.full_name.charAt(0) || 'U'}
                        </AvatarFallback>

                        {hasVoted && (
                          <div className="absolute -bottomU1 -rightU1 bg-white rounded-full">
                            <CheckCircle className="hU5 wU5 text-greenU500" />
                          </div>
                        )}
                      </Avatar>
                      <span className="text-xs">
                        {member.user_id === currentUserId
                          ? 'You'
                          : member.profiles.full_name.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trip creation modal */}
      <AnimatePresence>
        {showCreateTripModal && (
          <CreateTripModal
            onClose={() => setShowCreateTripModal(false)}
            groupId={groupId}
            groupName={groupName}
            selectedIdeas={Object.values(winningIdeas).flat()}
            members={members}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
