/**
 * VoteAndDecideSection Component
 * 
 * A section showcasing voting and decision-making features for group travel planning.
 * This component demonstrates how users can vote on different options and reach decisions.
 */

'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Check, Users, Calendar, MapPin, Heart } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

// Define choice types for better type safety
type ChoiceType = 'destination' | 'date' | 'activity';

interface Choice {
  id: string;
  type: ChoiceType;
  title: string;
  description: string;
  votes: { up: number; down: number };
  decided: boolean;
  voters: {
    id: string;
    name: string;
    avatar: string;
    vote: 'up' | 'down';
  }[];
}

// Heart animation component for upvote action
const HeartAnimation = ({ x, y }: { x: number; y: number }) => {
  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      initial={{ x, y, scale: 0, opacity: 0.8 }}
      animate={{
        y: y - 80,
        scale: [0, 1.2, 1],
        opacity: [0.8, 1, 0]
      }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      style={{ x, y }}
    >
      <Heart className="text-red-500 fill-red-500" size={20} />
    </motion.div>
  );
};

export function VoteAndDecideSection() {
  // Sample data - in a real app this would come from an API
  const [choices, setChoices] = useState<Choice[]>([
    // Destinations
    {
      id: '1',
      type: 'destination',
      title: 'Paris, France',
      description: 'The city of love and lights, perfect for romantic getaways.',
      votes: { up: 8, down: 2 },
      decided: true,
      voters: [
        { id: '1', name: 'Alex', avatar: '/avatars/01.png', vote: 'up' },
        { id: '2', name: 'Casey', avatar: '/avatars/02.png', vote: 'up' },
        { id: '3', name: 'Taylor', avatar: '/avatars/03.png', vote: 'down' },
      ],
    },
    {
      id: '2',
      type: 'destination',
      title: 'Tokyo, Japan',
      description: 'Experience the blend of traditional culture and modern technology.',
      votes: { up: 6, down: 3 },
      decided: false,
      voters: [
        { id: '1', name: 'Alex', avatar: '/avatars/01.png', vote: 'up' },
        { id: '2', name: 'Casey', avatar: '/avatars/02.png', vote: 'down' },
      ],
    },
    {
      id: '3',
      type: 'destination',
      title: 'Bali, Indonesia',
      description: 'Tropical paradise with beautiful beaches and spiritual retreats.',
      votes: { up: 4, down: 5 },
      decided: false,
      voters: [
        { id: '3', name: 'Taylor', avatar: '/avatars/03.png', vote: 'down' },
      ],
    },
    // Dates
    {
      id: '4',
      type: 'date',
      title: 'July 15-22, 2023',
      description: 'Summer vacation period with good weather expected.',
      votes: { up: 7, down: 1 },
      decided: true,
      voters: [
        { id: '1', name: 'Alex', avatar: '/avatars/01.png', vote: 'up' },
        { id: '2', name: 'Casey', avatar: '/avatars/02.png', vote: 'up' },
      ],
    },
    {
      id: '5',
      type: 'date',
      title: 'August 5-12, 2023',
      description: 'Peak summer season, might be more crowded and expensive.',
      votes: { up: 3, down: 6 },
      decided: false,
      voters: [
        { id: '3', name: 'Taylor', avatar: '/avatars/03.png', vote: 'down' },
      ],
    },
    // Activities
    {
      id: '6',
      type: 'activity',
      title: 'Wine Tasting Tour',
      description: 'Visit local vineyards and sample regional wines with a guide.',
      votes: { up: 9, down: 0 },
      decided: true,
      voters: [
        { id: '1', name: 'Alex', avatar: '/avatars/01.png', vote: 'up' },
        { id: '2', name: 'Casey', avatar: '/avatars/02.png', vote: 'up' },
        { id: '3', name: 'Taylor', avatar: '/avatars/03.png', vote: 'up' },
      ],
    },
    {
      id: '7',
      type: 'activity',
      title: 'Mountain Hiking',
      description: 'Full-day moderate hike with amazing views, 8km total.',
      votes: { up: 5, down: 4 },
      decided: false,
      voters: [
        { id: '1', name: 'Alex', avatar: '/avatars/01.png', vote: 'up' },
        { id: '3', name: 'Taylor', avatar: '/avatars/03.png', vote: 'down' },
      ],
    },
  ]);

  // State for heart animations
  const [hearts, setHearts] = useState<{ id: string; x: number; y: number }[]>([]);
  
  // Current active type to display
  const [activeType, setActiveType] = useState<ChoiceType>('destination');

  // Handler for voting
  const handleVote = (id: string, voteType: 'up' | 'down', event?: React.MouseEvent) => {
    // Create heart animation for upvotes
    if (voteType === 'up' && event) {
      const rect = (event.target as Element).getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      const heartId = `heart-${Date.now()}`;
      setHearts(prev => [...prev, { id: heartId, x, y }]);
      
      // Remove heart after animation
      setTimeout(() => {
        setHearts(prev => prev.filter(heart => heart.id !== heartId));
      }, 1000);
    }

    // Update votes in state
    setChoices(prev => 
      prev.map(choice => {
        if (choice.id === id) {
          // Simulate toggling a user's vote
          const userVoted = choice.voters.find(voter => voter.id === '1')?.vote;
          let newVotes = { ...choice.votes };
          
          if (userVoted === voteType) {
            // User is removing their vote
            newVotes = {
              ...newVotes,
              [voteType]: newVotes[voteType] - 1
            };
            return {
              ...choice,
              votes: newVotes,
              voters: choice.voters.filter(voter => voter.id !== '1')
            };
          } else if (userVoted) {
            // User is changing their vote
            newVotes = {
              ...newVotes,
              [userVoted]: newVotes[userVoted] - 1,
              [voteType]: newVotes[voteType] + 1
            };
            return {
              ...choice,
              votes: newVotes,
              voters: choice.voters.map(voter => 
                voter.id === '1' ? { ...voter, vote: voteType } : voter
              )
            };
          } else {
            // User is voting for the first time
            newVotes = {
              ...newVotes,
              [voteType]: newVotes[voteType] + 1
            };
            return {
              ...choice,
              votes: newVotes,
              voters: [...choice.voters, { id: '1', name: 'You', avatar: '/avatars/04.png', vote: voteType }]
            };
          }
        }
        return choice;
      })
    );
  };

  // Handler for marking a choice as decided
  const handleDecide = (id: string) => {
    setChoices(prev => 
      prev.map(choice => {
        if (choice.id === id) {
          return { ...choice, decided: true };
        } else if (choice.type === prev.find(c => c.id === id)?.type) {
          // Only one option of each type can be decided
          return { ...choice, decided: false };
        }
        return choice;
      })
    );
  };

  const getTypeIcon = (type: ChoiceType) => {
    switch(type) {
      case 'destination': return <MapPin className="h-5 w-5" />;
      case 'date': return <Calendar className="h-5 w-5" />;
      case 'activity': return <Users className="h-5 w-5" />;
    }
  };

  // Filter choices by type and decision status
  const getChoicesByType = (type: ChoiceType, decided: boolean) => {
    return choices.filter(choice => choice.type === type && choice.decided === decided);
  };

  // Get choices to display based on active type
  const choicesToDisplay = getChoicesByType(activeType, false);

  return (
    <div className="w-full bg-card rounded-lg relative overflow-hidden">
      {/* Heart animations */}
      {hearts.map(heart => (
        <HeartAnimation key={heart.id} x={heart.x} y={heart.y} />
      ))}
      
      <div className="p-4">
        <h2 className="text-2xl font-bold text-center mb-2">Vote & Decide</h2>
        
        <p className="text-center mb-6 text-muted-foreground">
          Collaborate with your group to vote on destinations, dates, and activities.
          Majority wins, but the group admin can make the final decision.
        </p>
      
        {/* Decisions already made */}
        <Accordion type="single" collapsible className="mb-6">
          <AccordionItem value="decisions">
            <AccordionTrigger className="bg-green-50 dark:bg-green-950/30 rounded-md px-4 py-2 border border-green-100 dark:border-green-900">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600 dark:text-green-500" />
                <span className="text-green-700 dark:text-green-500 font-medium">
                  Decisions Made
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                {choices.filter(choice => choice.decided).map(choice => (
                  <Card key={choice.id} className="border-green-100 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-700">
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(choice.type)}
                            <span className="capitalize">{choice.type}</span>
                          </div>
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
                          <span className="text-xs text-green-700 dark:text-green-500">Decided</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl">{choice.title}</CardTitle>
                      <CardDescription>{choice.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between pt-2">
                      <div className="flex items-center space-x-1">
                        <ChevronUp className="h-4 w-4 text-green-600 dark:text-green-500" />
                        <span className="text-xs text-green-700 dark:text-green-500">{choice.votes.up} upvotes</span>
                      </div>
                      <div className="flex -space-x-2">
                        {choice.voters.slice(0, 3).map(voter => (
                          <Avatar key={voter.id} className="border-2 border-white dark:border-gray-900 h-6 w-6">
                            <AvatarImage src={voter.avatar} alt={voter.name} />
                            <AvatarFallback>{voter.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {choice.voters.length > 3 && (
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-900">
                            +{choice.voters.length - 3}
                          </div>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Type selector buttons */}
        <div className="flex space-x-2 mb-4">
          <Button 
            variant={activeType === 'destination' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveType('destination')}
            className="flex items-center space-x-1"
          >
            <MapPin className="h-4 w-4" />
            <span>Destinations</span>
          </Button>
          <Button 
            variant={activeType === 'date' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveType('date')}
            className="flex items-center space-x-1"
          >
            <Calendar className="h-4 w-4" />
            <span>Dates</span>
          </Button>
          <Button 
            variant={activeType === 'activity' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveType('activity')}
            className="flex items-center space-x-1"
          >
            <Users className="h-4 w-4" />
            <span>Activities</span>
          </Button>
        </div>
        
        {/* Display choices for the active type */}
        <div className="space-y-4">
          {choicesToDisplay.map(choice => (
            <VoteCard 
              key={choice.id} 
              choice={choice} 
              onVote={handleVote} 
              onDecide={handleDecide} 
            />
          ))}
          {choicesToDisplay.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No {activeType}s to vote on. Add some suggestions!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// VoteCard component for cleaner code structure
function VoteCard({ 
  choice, 
  onVote, 
  onDecide 
}: { 
  choice: Choice; 
  onVote: (id: string, voteType: 'up' | 'down', event?: React.MouseEvent) => void; 
  onDecide: (id: string) => void;
}) {
  const getTypeIcon = (type: ChoiceType) => {
    switch(type) {
      case 'destination': return <MapPin className="h-5 w-5" />;
      case 'date': return <Calendar className="h-5 w-5" />;
      case 'activity': return <Users className="h-5 w-5" />;
    }
  };

  // Calculate net votes
  const netVotes = choice.votes.up - choice.votes.down;
  const userVote = choice.voters.find(voter => voter.id === '1')?.vote;

  return (
    <Card className="border-gray-200 dark:border-gray-800 relative">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <div className="flex items-center space-x-1">
              {getTypeIcon(choice.type)}
              <span className="capitalize">{choice.type}</span>
            </div>
          </Badge>
          {choice.votes.up > choice.votes.down && choice.votes.up - choice.votes.down > 2 && (
            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              Popular Choice
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl mt-2">{choice.title}</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {choice.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-0">
        <div className="flex justify-start">
          <div className="flex -space-x-2">
            {choice.voters.slice(0, 4).map(voter => (
              <Avatar key={voter.id} className={`border-2 ${
                voter.vote === 'up' 
                  ? 'border-green-100 dark:border-green-900' 
                  : 'border-red-100 dark:border-red-900'
              } h-6 w-6`}>
                <AvatarImage src={voter.avatar} alt={voter.name} />
                <AvatarFallback>{voter.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {choice.voters.length > 4 && (
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-900">
                +{choice.voters.length - 4}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-center">
            <button
              className={`p-1 rounded-full transition-colors ${
                userVote === 'up'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500'
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:hover:text-green-500'
              }`}
              onClick={(e) => onVote(choice.id, 'up', e)}
              aria-label="Upvote"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
            <span
              className={`text-xs font-medium ${
                netVotes > 0 
                  ? 'text-green-600 dark:text-green-500' 
                  : netVotes < 0 
                    ? 'text-red-600 dark:text-red-500' 
                    : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {netVotes > 0 ? `+${netVotes}` : netVotes}
            </span>
            <button
              className={`p-1 rounded-full transition-colors ${
                userVote === 'down'
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500'
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-500'
              }`}
              onClick={(e) => onVote(choice.id, 'down')}
              aria-label="Downvote"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {choice.votes.up} upvotes
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {choice.votes.down} downvotes
            </span>
          </div>
        </div>
        <Button onClick={() => onDecide(choice.id)} size="sm" className="h-9">
          Make Decision
        </Button>
      </CardFooter>
    </Card>
  );
}
