'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, Map, Calendar, Clipboard, DollarSign, Tag, CheckCircle, ArrowRight, ArrowLeft, Circle } from 'lucide-react';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { CreateTripModal } from './create-trip-modal';

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
  currentUserId
}: VotingClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [activeTab, setActiveTab] = useState('destination');
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [votingProgress, setVotingProgress] = useState(0);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  
  // Group ideas by their type
  const ideasByType = ideas.reduce((acc, idea) => {
    if (!acc[idea.type]) {
      acc[idea.type] = [];
    }
    acc[idea.type].push(idea);
    return acc;
  }, {} as Record<string, Idea[]>);
  
  // Calculate voting progress
  useEffect(() => {
    const totalIdeas = ideas.length;
    const votedIdeas = Object.keys(userVotes).length;
    setVotingProgress(totalIdeas > 0 ? Math.round((votedIdeas / totalIdeas) * 100) : 0);
  }, [userVotes, ideas]);
  
  const handleVote = async (ideaId: string, voteType: 'up' | 'down') => {
    // Update local state immediately for responsiveness
    setUserVotes(prev => ({
      ...prev,
      [ideaId]: voteType === 'up'
    }));
    
    // Update the idea in our local state
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => {
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
    
    // In a real app, you would save this to your database
    try {
      const supabase = getBrowserClient();
      
      // Update vote count on the server
      const { error } = await supabase
        .from('group_ideas')
        .update({ 
          votes_up: ideas.find(i => i.id === ideaId)?.votes_up,
          votes_down: ideas.find(i => i.id === ideaId)?.votes_down
        })
        .eq('id', ideaId);
      
      if (error) throw error;
      
      // Record the user's vote
      const { error: voteError } = await supabase
        .from('idea_votes')
        .upsert({ 
          idea_id: ideaId,
          user_id: currentUserId,
          vote_type: voteType
        });
      
      if (voteError) throw voteError;
      
    } catch (error) {
      console.error('Error saving vote:', error);
      toast({
        title: "Error",
        description: "Failed to save your vote. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getIdeaTypeIcon = (type: string) => {
    switch (type) {
      case 'destination':
        return <Map className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'activity':
        return <Clipboard className="h-4 w-4" />;
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
        return 'bg-purple-100 text-purple-800';
      case 'activity':
        return 'bg-green-100 text-green-800';
      case 'budget':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      const sortedIdeas = [...typeIdeas].sort((a, b) => 
        (getTotalVotesForIdea(b) - getTotalVotesForIdea(a))
      );
      
      // Get top idea
      const topIdea = sortedIdeas[0];
      const topScore = getTotalVotesForIdea(topIdea);
      
      // Get all ideas with the same top score (could be ties)
      winners[type] = sortedIdeas.filter(idea => 
        getTotalVotesForIdea(idea) === topScore
      );
    });
    
    return winners;
  };
  
  const allTypesTabs = ['destination', 'date', 'activity', 'budget', 'other'];
  
  const winningIdeas = getWinningIdeas();
  
  return (
    <div className="flex flex-col space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{groupName} - Vote on Ideas</h1>
          <p className="text-muted-foreground">Choose your favorite ideas for this trip</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/groups/${groupId}/ideas`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ideas
          </Button>
          
          <Button 
            variant="default" 
            onClick={() => setShowCreateTripModal(true)}
            disabled={votingProgress < 100}
          >
            Create Trip
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
      
      {/* Voting progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Your Voting Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={votingProgress} />
            <p className="text-sm text-muted-foreground">{votingProgress}% complete</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Main voting interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Categories and voting */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Vote on Ideas</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              {allTypesTabs.map(type => (
                <TabsTrigger 
                  key={type} 
                  value={type}
                  className="flex items-center"
                >
                  {getIdeaTypeIcon(type)}
                  <span className="ml-2">{getIdeaTypeName(type)}</span>
                  
                  {Object.keys(userVotes).some(ideaId => 
                    ideas.find(i => i.id === ideaId)?.type === type
                  ) && (
                    <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {allTypesTabs.map(type => (
              <TabsContent key={type} value={type} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select your preferred {getIdeaTypeName(type).toLowerCase()} from the options below.
                </p>
                
                {ideasByType[type] && ideasByType[type].length > 0 ? (
                  <div className="space-y-4">
                    {ideasByType[type].map(idea => (
                      <Card key={idea.id} className="overflow-hidden">
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
                        
                        {idea.description && (
                          <CardContent className="pb-3 pt-0">
                            <p className="text-sm text-muted-foreground">{idea.description}</p>
                          </CardContent>
                        )}
                        
                        <CardFooter className="flex justify-between pt-0">
                          <p className="text-xs text-muted-foreground">
                            Added by {members.find(m => m.user_id === idea.created_by)?.profiles.full_name || 'Anonymous'}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant={userVotes[idea.id] === false ? "default" : "outline"}
                              size="sm"
                              className={userVotes[idea.id] === false ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-100"}
                              onClick={() => handleVote(idea.id, 'down')}
                            >
                              <ThumbsUp className="h-4 w-4 rotate-180" />
                              <span className="ml-1">{idea.votes_down}</span>
                            </Button>
                            
                            <Button
                              variant={userVotes[idea.id] === true ? "default" : "outline"}
                              size="sm"
                              className={userVotes[idea.id] === true ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-100"}
                              onClick={() => handleVote(idea.id, 'up')}
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span className="ml-1">{idea.votes_up}</span>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No {getIdeaTypeName(type).toLowerCase()} ideas available for voting</p>
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
              {allTypesTabs.map(type => (
                <div key={type} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getIdeaTypeIcon(type)}
                    <h3 className="font-medium">{getIdeaTypeName(type)}</h3>
                  </div>
                  
                  <Separator />
                  
                  {winningIdeas[type] && winningIdeas[type].length > 0 ? (
                    <div className="space-y-3 pl-6">
                      {winningIdeas[type].map((idea) => (
                        <div 
                          key={idea.id} 
                          className="flex items-center justify-between py-1"
                        >
                          <div className="flex items-center gap-2">
                            <Circle className="h-2 w-2 fill-primary text-primary" />
                            <span>{idea.title}</span>
                          </div>
                          <Badge variant="outline">
                            {getTotalVotesForIdea(idea)} votes
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground pl-6">
                      No votes yet
                    </p>
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
                {members.map(member => {
                  const hasVoted = Math.random() > 0.3; // Simulated voting status
                  
                  return (
                    <div key={member.id} className="flex flex-col items-center">
                      <Avatar className="h-12 w-12 mb-1 relative">
                        <AvatarImage src={member.profiles.avatar_url} />
                        <AvatarFallback>
                          {member.profiles.full_name.charAt(0) || 'U'}
                        </AvatarFallback>
                        
                        {hasVoted && (
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                      </Avatar>
                      <span className="text-xs">
                        {member.user_id === currentUserId 
                          ? 'You' 
                          : member.profiles.full_name.split(' ')[0]
                        }
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