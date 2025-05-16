/**
 * GroupCard Component
 * 
 * Displays a card containing group information including name,
 * number of members, and active plans.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES
// ============================================================================

export interface GroupCardProps {
  /** Group's unique identifier */
  id: string;
  /** Group name */
  name: string;
  /** Group description */
  description?: string;
  /** Number of active plans */
  activePlansCount?: number;
  /** Group members data */
  members?: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
  /** Max number of members to display */
  maxDisplayedMembers?: number;
  /** Handler for clicking on the card */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * GroupCard displays group information in a card format
 */
export function GroupCard({
  id,
  name,
  description,
  activePlansCount = 0,
  members = [],
  maxDisplayedMembers = 3,
  onClick,
  className = '',
}: GroupCardProps) {
  // Limit displayed members
  const displayedMembers = members.slice(0, maxDisplayedMembers);
  const remainingCount = members.length > maxDisplayedMembers 
    ? members.length - maxDisplayedMembers 
    : 0;

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      
      <CardContent className="pb-0">
        <p className="text-sm">
          {activePlansCount} active {activePlansCount === 1 ? 'plan' : 'plans'}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-4">
        <div className="flex -space-x-2">
          {displayedMembers.map(member => (
            <Avatar key={member.id} className="border-2 border-background h-8 w-8">
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback>
                {member.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          
          {remainingCount > 0 && (
            <Avatar className="border-2 border-background bg-muted h-8 w-8">
              <AvatarFallback>+{remainingCount}</AvatarFallback>
            </Avatar>
          )}
        </div>
        
        <Button variant="ghost" size="sm">View</Button>
      </CardFooter>
    </Card>
  );
} 