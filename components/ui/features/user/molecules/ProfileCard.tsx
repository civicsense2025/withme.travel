/**
 * ProfileCard Component
 * 
 * Displays a user profile card with basic information and actions.
 */

'use client';

import React from 'react';
import { User as LucideUser, Mail, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

/**
 * User profile entity
 */
export interface UserProfile {
  /** Unique user identifier */
  id: string;
  /** User's display name */
  name: string;
  /** User's email address */
  email?: string;
  /** User's avatar image URL */
  avatar_url?: string;
  /** User biography/about text */
  bio?: string;
  /** User's location */
  location?: string;
  /** User's website URL */
  website?: string;
  /** When the user joined */
  created_at?: string;
  /** User's role in the system */
  role?: string;
  /** User's travel preferences/interests */
  interests?: string[];
  /** Whether the user is verified */
  is_verified?: boolean;
}

/**
 * Props for ProfileCard component
 */
export interface ProfileCardProps {
  /** User profile to display */
  profile: UserProfile;
  /** Optional link for the card */
  href?: string;
  /** Whether to show follow button */
  showFollowButton?: boolean;
  /** Whether the user is following this profile */
  isFollowing?: boolean;
  /** Callback when follow button is clicked */
  onFollowToggle?: (profileId: string, following: boolean) => Promise<void>;
  /** Callback when card is clicked (not used when href is provided) */
  onClick?: (profile: UserProfile) => void;
  /** Additional CSS class name */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ProfileCard displays a user's profile information in a card format
 */
export function ProfileCard({
  profile,
  href,
  showFollowButton = false,
  isFollowing = false,
  onFollowToggle,
  onClick,
  className = '',
}: ProfileCardProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date string for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long',
    }).format(date);
  };

  // Handle card click
  const handleCardClick = () => {
    if (onClick && !href) {
      onClick(profile);
    }
  };

  // Handle follow toggle
  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault(); // Prevent navigation if card is a link

    if (onFollowToggle) {
      await onFollowToggle(profile.id, !isFollowing);
    }
  };

  // Card content
  const cardContent = (
    <Card 
      className={cn('overflow-hidden', 
        'hover:shadow-md transition-shadow duration-200',
        (!href && onClick) && 'cursor-pointer',
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border border-border">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.name} />
              <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{profile.name}</CardTitle>
              {profile.role && (
                <CardDescription className="text-xs">{profile.role}</CardDescription>
              )}
            </div>
          </div>

          {profile.is_verified && (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{profile.bio}</p>
        )}

        <div className="space-y-1.5">
          {profile.email && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
              <span className="truncate">{profile.email}</span>
            </div>
          )}

          {profile.location && (
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.created_at && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
              <span>Joined {formatDate(profile.created_at)}</span>
            </div>
          )}
        </div>

        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {profile.interests.slice(0, 3).map((interest, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
            {profile.interests.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{profile.interests.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        {profile.website && (
          <Button size="sm" variant="ghost" asChild className="text-xs h-8">
            <a href={profile.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Website
            </a>
          </Button>
        )}

        {showFollowButton && (
          <Button 
            size="sm" 
            variant={isFollowing ? "outline" : "default"}
            className="ml-auto text-xs h-8"
            onClick={handleFollowClick}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  // Wrap with Link if href provided
  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
} 