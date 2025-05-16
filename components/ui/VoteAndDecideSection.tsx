/**
 * VoteAndDecideSection Component
 * 
 * A section showcasing voting and decision-making features for group travel planning.
 * This component demonstrates how users can vote on different options and reach decisions.
 */

'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Check, Users, Calendar, MapPin } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { Text } from './Text';
import { Heading } from './Heading';

// Define mock data for vote items
interface VoteOption {
  id: string;
  title: string;
  description: string;
  category: 'destination' | 'date' | 'activity';
  upvotes: number;
  downvotes: number;
  userVoted?: 'up' | 'down' | null;
  voters: {
    id: string;
    name: string;
    avatar?: string;
    vote: 'up' | 'down';
  }[];
  isDecided?: boolean;
}

const mockVoteOptions: VoteOption[] = [
  {
    id: 'v1',
    title: 'Barcelona',
    description: 'Vibrant coastal city with amazing architecture and food',
    category: 'destination',
    upvotes: 4,
    downvotes: 1,
    voters: [
      { id: 'u1', name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=alex', vote: 'up' },
      { id: 'u2', name: 'Taylor', avatar: 'https://i.pravatar.cc/150?u=taylor', vote: 'up' },
      { id: 'u3', name: 'Jordan', avatar: 'https://i.pravatar.cc/150?u=jordan', vote: 'up' },
      { id: 'u4', name: 'Morgan', avatar: 'https://i.pravatar.cc/150?u=morgan', vote: 'up' },
      { id: 'u5', name: 'Casey', avatar: 'https://i.pravatar.cc/150?u=casey', vote: 'down' },
    ],
    isDecided: true,
  },
  {
    id: 'v2',
    title: 'July 15-22',
    description: 'Perfect weather with fewer crowds than peak season',
    category: 'date',
    upvotes: 3,
    downvotes: 2,
    voters: [
      { id: 'u1', name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=alex', vote: 'up' },
      { id: 'u2', name: 'Taylor', avatar: 'https://i.pravatar.cc/150?u=taylor', vote: 'up' },
      { id: 'u3', name: 'Jordan', avatar: 'https://i.pravatar.cc/150?u=jordan', vote: 'up' },
      { id: 'u4', name: 'Morgan', avatar: 'https://i.pravatar.cc/150?u=morgan', vote: 'down' },
      { id: 'u5', name: 'Casey', avatar: 'https://i.pravatar.cc/150?u=casey', vote: 'down' },
    ],
    isDecided: true,
  },
  {
    id: 'v3',
    title: 'Sagrada Familia Tour',
    description: 'Guided tour of Gaudi\'s masterpiece cathedral',
    category: 'activity',
    upvotes: 3,
    downvotes: 0,
    voters: [
      { id: 'u1', name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=alex', vote: 'up' },
      { id: 'u3', name: 'Jordan', avatar: 'https://i.pravatar.cc/150?u=jordan', vote: 'up' },
      { id: 'u5', name: 'Casey', avatar: 'https://i.pravatar.cc/150?u=casey', vote: 'up' },
    ],
  },
  {
    id: 'v4',
    title: 'Tapas Food Tour',
    description: 'Explore the city\'s culinary scene with a local guide',
    category: 'activity',
    upvotes: 5,
    downvotes: 0,
    voters: [
      { id: 'u1', name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=alex', vote: 'up' },
      { id: 'u2', name: 'Taylor', avatar: 'https://i.pravatar.cc/150?u=taylor', vote: 'up' },
      { id: 'u3', name: 'Jordan', avatar: 'https://i.pravatar.cc/150?u=jordan', vote: 'up' },
      { id: 'u4', name: 'Morgan', avatar: 'https://i.pravatar.cc/150?u=morgan', vote: 'up' },
      { id: 'u5', name: 'Casey', avatar: 'https://i.pravatar.cc/150?u=casey', vote: 'up' },
    ],
    isDecided: true,
  },
];

// Vote option component
function VoteOptionCard({ option, onVote, onDecide }: { 
  option: VoteOption; 
  onVote: (id: string, vote: 'up' | 'down') => void;
  onDecide: (id: string) => void;
}) {
  const getCategoryIcon = () => {
    switch (option.category) {
      case 'destination':
        return <MapPin className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'activity':
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getCategoryColor = () => {
    switch (option.category) {
      case 'destination':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'date':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'activity':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      default:
        return '';
    }
  };

  return (
    <Card className={`mb-4 ${option.isDecided ? 'border-green-500 dark:border-green-400' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{option.title}</CardTitle>
            <CardDescription>{option.description}</CardDescription>
          </div>
          {option.isDecided && (
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800">
              <Check className="mr-1 h-3 w-3" /> Decided
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-3">
          <Badge variant="outline" className={`${getCategoryColor()}`}>
            <span className="flex items-center">
              {getCategoryIcon()}
              <span className="ml-1 capitalize">{option.category}</span>
            </span>
          </Badge>
          <div className="ml-auto flex -space-x-2">
            {option.voters.slice(0, 3).map((voter) => (
              <Avatar key={voter.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={voter.avatar} alt={voter.name} />
                <AvatarFallback>{voter.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {option.voters.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                +{option.voters.length - 3}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 justify-between">
        <div className="flex gap-2">
          <Button
            variant={option.userVoted === 'up' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onVote(option.id, 'up')}
            className="px-2"
          >
            <ChevronUp className="h-4 w-4 mr-1" />
            <span>{option.upvotes}</span>
          </Button>
          <Button
            variant={option.userVoted === 'down' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onVote(option.id, 'down')}
            className="px-2"
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            <span>{option.downvotes}</span>
          </Button>
        </div>
        {!option.isDecided && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDecide(option.id)}
            className="text-xs"
          >
            Mark as decided
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function VoteAndDecideSection() {
  const [voteOptions, setVoteOptions] = useState<VoteOption[]>(mockVoteOptions);
  
  // Handle voting
  const handleVote = (id: string, vote: 'up' | 'down') => {
    setVoteOptions(prev => 
      prev.map(option => {
        if (option.id === id) {
          // If user already voted the same way, remove the vote
          if (option.userVoted === vote) {
            return {
              ...option,
              upvotes: vote === 'up' ? option.upvotes - 1 : option.upvotes,
              downvotes: vote === 'down' ? option.downvotes - 1 : option.downvotes,
              userVoted: null
            };
          }
          
          // If user voted the opposite way, switch the vote
          if (option.userVoted) {
            return {
              ...option,
              upvotes: vote === 'up' ? option.upvotes + 1 : option.upvotes - 1,
              downvotes: vote === 'down' ? option.downvotes + 1 : option.downvotes - 1,
              userVoted: vote
            };
          }
          
          // If user hasn't voted yet, add the vote
          return {
            ...option,
            upvotes: vote === 'up' ? option.upvotes + 1 : option.upvotes,
            downvotes: vote === 'down' ? option.downvotes + 1 : option.downvotes,
            userVoted: vote
          };
        }
        return option;
      })
    );
  };
  
  // Handle deciding on an option
  const handleDecide = (id: string) => {
    setVoteOptions(prev =>
      prev.map(option => {
        if (option.id === id) {
          return {
            ...option,
            isDecided: true
          };
        }
        // If this is in the same category, mark other options as not decided
        if (option.category === prev.find(o => o.id === id)?.category) {
          return {
            ...option,
            isDecided: option.id === id
          };
        }
        return option;
      })
    );
  };

  // Filter options into categories
  const decidedOptions = voteOptions.filter(option => option.isDecided);
  const undecidedOptions = voteOptions.filter(option => !option.isDecided);
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <Heading level={2} size="large" className="mb-2">
          Vote & Decide Together
        </Heading>
        <Text variant="body">
          Collaborate with your travel group to make decisions on destinations, dates, and activities.
        </Text>
      </div>
      
      {decidedOptions.length > 0 && (
        <div className="mb-8">
          <Heading level={3} size="small" className="mb-4">
            Decided Options
          </Heading>
          <div>
            {decidedOptions.map(option => (
              <VoteOptionCard 
                key={option.id} 
                option={option} 
                onVote={handleVote}
                onDecide={handleDecide}
              />
            ))}
          </div>
        </div>
      )}
      
      <div>
        <Heading level={3} size="small" className="mb-4">
          Options to Vote On
        </Heading>
        {undecidedOptions.length > 0 ? (
          <div>
            {undecidedOptions.map(option => (
              <VoteOptionCard 
                key={option.id} 
                option={option} 
                onVote={handleVote}
                onDecide={handleDecide}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Text variant="body" className="text-center text-muted-foreground">
                All options have been decided! Add more options to vote on.
              </Text>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <Button>
          Add New Option
        </Button>
      </div>
    </div>
  );
}
