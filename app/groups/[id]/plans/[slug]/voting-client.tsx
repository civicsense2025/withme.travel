'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Activity,
  DollarSign,
  Tag,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Circle,
} from 'lucide-react';
import { getBrowserClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { CreateTripModal } from './vote/create-trip-modal';
import { API_ROUTES } from '@/utils/constants/routes';
import { TABLES } from '@/utils/constants/tables';
import { useResearchTracking } from '@/hooks/use-research-tracking';

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
  start_date?: string | null;
  end_date?: string | null;
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

// Props for the component
interface VotingClientProps {
  groupId: string;
  planSlug: string;
  groupName: string;
  currentUserId: string;
}

export default function VotingClient({
  groupId,
  planSlug,
  groupName,
  currentUserId,
}: VotingClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState('destination');
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [votingProgress, setVotingProgress] = useState(0);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { trackEvent } = useResearchTracking();

  // Define fetchData function to load ideas, members, and votes
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = getBrowserClient();

      // Use string literals for table names to bypass TypeScript issues
      const { data: ideasData, error: ideasError } = await supabase
        .from('group_plan_ideas')
        .select('*')
        .eq('group_id', groupId);

      if (ideasError) throw ideasError;

      // Fetch group members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(
          `
          id,
          user_id,
          profiles:user_id (
            email,
            full_name,
            avatar_url
          )
        `
        )
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      // Fetch user's votes
      const { data: votesData, error: votesError } = await supabase
        .from('group_plan_idea_votes')
        .select('*')
        .eq('user_id', currentUserId);

      if (votesError) throw votesError;

      // Set state with type assertions
      setIdeas((ideasData as Idea[]) || []);

      // Transform membersData to match the Member type with proper type assertions
      const typedMembers: Member[] = (membersData || []).map((member: any) => ({
        id: member.id,
        user_id: member.user_id,
        profiles: {
          email: member.profiles?.email || '',
          full_name: member.profiles?.full_name || '',
          avatar_url: member.profiles?.avatar_url,
        },
      }));
      setMembers(typedMembers);

      // Update user votes with proper type assertions
      const votesMap: Record<string, boolean> = {};
      (votesData || []).forEach((vote: any) => {
        if (vote && vote.idea_id) {
          votesMap[vote.idea_id] = vote.vote_type === 'up';
        }
      });
      setUserVotes(votesMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load voting data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [groupId, currentUserId, toast]);

  // Fetch data on component mount
  useEffect(() => {
    if (groupId && currentUserId) {
      fetchData();
    }
  }, [groupId, currentUserId, fetchData]);

  // Group ideas by their type
  const ideasByType = ideas.reduce(
    (acc, idea) => {
      if (!acc[idea.type]) {
        acc[idea.type] = [];
      }
      acc[idea.type].push(idea);
      return acc;
    },
    {} as Record<string, Idea[]>
  );

  // Calculate voting progress
  useEffect(() => {
    const totalIdeas = ideas.length;
    const votedIdeas = Object.keys(userVotes).length;
    setVotingProgress(totalIdeas > 0 ? Math.round((votedIdeas / totalIdeas) * 100) : 0);
  }, [userVotes, ideas]);

  const handleVote = async (ideaId: string, voteType: 'up' | 'down') => {
    // Update local state immediately for responsiveness
    setUserVotes((prev) => ({
      ...prev,
      [ideaId]: voteType === 'up',
    }));

    // Update the idea in our local state
    setIdeas((prevIdeas) =>
      prevIdeas.map((idea) => {
        if (idea.id === ideaId) {
          // If the user already voted, remove their previous vote
          const alreadyVotedUp = userVotes[ideaId] === true;
          const alreadyVotedDown = userVotes[ideaId] === false;

          let votes_up = idea.votes_up;
          let votes_down = idea.votes_down;

          if (voteType === 'up') {
            if (alreadyVotedUp) {
              // Removing an up vote
              votes_up -= 1;
            } else if (alreadyVotedDown) {
              // Changing from down to up
              votes_up += 1;
              votes_down -= 1;
            } else {
              // New up vote
              votes_up += 1;
            }
          } else {
            if (alreadyVotedDown) {
              // Removing a down vote
              votes_down -= 1;
            } else if (alreadyVotedUp) {
              // Changing from up to down
              votes_down += 1;
              votes_up -= 1;
            } else {
              // New down vote
              votes_down += 1;
            }
          }

          return { ...idea, votes_up, votes_down };
        }
        return idea;
      })
    );

    try {
      // Use the API route for voting instead of direct Supabase access
      const response = await fetch(API_ROUTES.GROUP_PLAN_IDEA_VOTES.CREATE(groupId, ideaId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save vote: ${response.statusText}`);
      }

      trackEvent('itinerary_voted', { ideaId, voteType, groupId });
    } catch (error) {
      console.error('Error saving vote:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your vote. Please try again.',
        variant: 'destructive',
      });

      // Call fetchData to reset state on error
      fetchData();
    }
  };

  const getIdeaTypeIcon = (type: string) => {
    switch (type) {
      case 'destination':
        return <Map className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'activity':
        return <Activity className="h-4 w-4" />;
      case 'budget':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
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
        return 'bg-blue-100 text-blue-800';
      case 'date':
        return 'bg-yellow-100 text-yellow-800';
      case 'activity':
        return 'bg-green-100 text-green-800';
      case 'budget':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-purple-100 text-purple-800';
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
      winners[type] = sortedIdeas.filter(
        (idea) => getTotalVotesForIdea(idea) === topScore && topScore > 0
      );
    });

    return winners;
  };

  const allTypesTabs = ['destination', 'date', 'activity', 'budget', 'other'];

  const winningIdeas = getWinningIdeas();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <h3 className="text-lg font-medium">Loading voting data...</h3>
      </div>
    );
  }

  // Check if there are ideas to vote on
  if (ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-amber-100 p-4 mb-4">
          <Tag className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Ideas Found</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          There are no ideas available for voting. Return to the ideas board to add some!
        </p>
        <Button onClick={() => router.push(`/groups/${groupId}/plans/${planSlug}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Ideas Board
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col space-y-8 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-end items-center gap-3">
        <Button
          variant="outline"
          onClick={() => router.push(`/groups/${groupId}/plans/${planSlug}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Ideas
        </Button>

        <Button
          variant="default"
          onClick={() => setShowCreateTripModal(true)}
          disabled={votingProgress < 50}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          Create Trip
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Voting progress card with animations */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Your Voting Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="relative pt-2">
                <Progress value={votingProgress} className="h-2" />
                <motion.div
                  className="absolute top-0 right-0 h-6 w-6 rounded-full bg-primary -mt-1 flex items-center justify-center text-white text-xs font-bold"
                  initial={false}
                  animate={{
                    left: `${Math.min(Math.max(votingProgress, 0), 100)}%`,
                    x: '-50%',
                  }}
                >
                  {votingProgress}%
                </motion.div>
              </div>
              <p className="text-sm text-muted-foreground">
                {votingProgress < 50
                  ? 'Keep voting on more ideas to unlock trip creation!'
                  : 'You can now create a trip based on the current results.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rest of the component remains similar to the original */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Categories and voting */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Vote on Ideas</h2>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              {allTypesTabs.map((type) => (
                <TabsTrigger key={type} value={type} className="flex items-center">
                  {getIdeaTypeIcon(type)}
                  <span className="ml-2">{getIdeaTypeName(type)}</span>

                  {Object.keys(userVotes).some(
                    (ideaId) => ideas.find((i) => i.id === ideaId)?.type === type
                  ) && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
                </TabsTrigger>
              ))}
            </TabsList>

            {allTypesTabs.map((type) => (
              <TabsContent key={type} value={type} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select your preferred {getIdeaTypeName(type).toLowerCase()} from the options
                  below.
                </p>

                {ideasByType[type] && ideasByType[type]?.length > 0 ? (
                  <div className="space-y-4">
                    {ideasByType[type].map((idea) => (
                      <motion.div
                        key={idea.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <Badge className={getIdeaTypeColor(idea.type)}>
                                  {getIdeaTypeIcon(idea.type)}
                                  <span className="ml-1">{getIdeaTypeName(idea.type)}</span>
                                </Badge>
                                <CardTitle className="mt-2 text-lg">{idea.title}</CardTitle>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                <span>{getTotalVotesForIdea(idea)}</span>
                                <ThumbsUp className="h-3 w-3" />
                              </div>
                            </div>
                          </CardHeader>

                          {(idea.description || idea.start_date) && (
                            <CardContent className="pb-3 pt-0">
                              {idea.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {idea.description}
                                </p>
                              )}
                              {idea.start_date && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(idea.start_date).toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                  {idea.end_date && (
                                    <>
                                      {' '}
                                      -{' '}
                                      {new Date(idea.end_date).toLocaleDateString('en-US', {
                                        month: 'long',
                                        year: 'numeric',
                                      })}
                                    </>
                                  )}
                                </p>
                              )}
                            </CardContent>
                          )}

                          <CardFooter className="flex justify-between pt-0">
                            <p className="text-xs text-muted-foreground">
                              Added by{' '}
                              {members.find((m) => m.user_id === idea.created_by)?.profiles
                                .full_name || 'Guest'}
                            </p>

                            <div className="flex items-center gap-2">
                              <Button
                                variant={userVotes[idea.id] === false ? 'default' : 'outline'}
                                size="sm"
                                className={
                                  userVotes[idea.id] === false
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'hover:bg-red-100'
                                }
                                onClick={() => handleVote(idea.id, 'down')}
                              >
                                <ThumbsUp className="h-4 w-4 rotate-180" />
                                <span className="ml-1">{idea.votes_down || 0}</span>
                              </Button>

                              <Button
                                variant={userVotes[idea.id] === true ? 'default' : 'outline'}
                                size="sm"
                                className={
                                  userVotes[idea.id] === true
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'hover:bg-green-100'
                                }
                                onClick={() => handleVote(idea.id, 'up')}
                              >
                                <ThumbsUp className="h-4 w-4" />
                                <span className="ml-1">{idea.votes_up || 0}</span>
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
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
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Current Results</h2>

          <Card>
            <CardHeader>
              <CardTitle>Your Group's Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {allTypesTabs.map((type) => (
                <div key={type} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getIdeaTypeIcon(type)}
                    <h3 className="font-medium">{getIdeaTypeName(type)}</h3>
                  </div>

                  <Separator />

                  {winningIdeas[type] && winningIdeas[type]?.length > 0 ? (
                    <div className="space-y-3 pl-6">
                      {winningIdeas[type].map((idea) => (
                        <div key={idea.id} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <Circle className="h-2 w-2 fill-primary text-primary" />
                            <span>{idea.title}</span>
                          </div>
                          <Badge variant="outline">{getTotalVotesForIdea(idea)} votes</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground pl-6">No votes yet</p>
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
              <div className="flex flex-wrap gap-4">
                {members.map((member) => {
                  // A user has voted if they have any votes in the userVotes object
                  const hasVoted =
                    member.user_id === currentUserId
                      ? Object.keys(userVotes).length > 0
                      : Math.random() > 0.3; // Simulated for other users

                  return (
                    <div key={member.id} className="flex flex-col items-center">
                      <div className="relative">
                        <Avatar className="h-12 w-12 mb-1">
                          <AvatarImage src={member.profiles?.avatar_url} />
                          <AvatarFallback>
                            {(member.profiles?.full_name || 'G').charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        {hasVoted && (
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs">
                        {member.user_id === currentUserId
                          ? 'You'
                          : member.profiles.full_name.split(' ')[0] || 'Guest'}
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
    </motion.div>
  );
}
