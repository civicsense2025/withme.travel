'use client';

/**
 * User Profile Card Component
 * 
 * Displays a compact user profile card for use in lists, grids, etc.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Mail, UserPlus, Check, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/lib/hooks/use-toast';
import { UserProfile, UserProfileCardProps } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a compact user profile card
 */
export function UserProfileCard({
  profile,
  href,
  showFollowButton = false,
  isFollowing = false,
  onFollowToggle,
  onClick,
  className = '',
}: UserProfileCardProps) {
  const [following, setFollowing] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Handle follow/unfollow
  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onFollowToggle) return;
    
    setIsLoading(true);
    try {
      await onFollowToggle(profile.id, !following);
      setFollowing(!following);
      
      toast({
        title: following ? 'Unfollowed' : 'Following',
        description: following 
          ? `You are no longer following ${profile.name}`
          : `You are now following ${profile.name}`,
      });
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast({
        title: 'Action failed',
        description: 'Unable to update follow status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle card click
  const handleCardClick = () => {
    if (onClick) {
      onClick(profile);
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Render the card
  const card = (
    <Card 
      className={`${className} overflow-hidden hover:shadow-md transition-shadow ${onClick || href ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url} alt={profile.name} />
            <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium truncate">{profile.name}</h3>
            {profile.location && (
              <p className="text-sm text-muted-foreground truncate">{profile.location}</p>
            )}
          </div>
          
          {showFollowButton && onFollowToggle && (
            <Button
              variant={following ? "secondary" : "default"}
              size="sm"
              onClick={handleFollowToggle}
              disabled={isLoading}
              className="ml-auto"
            >
              {following ? (
                <>
                  <UserCheck className="h-4 w-4 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
        
        {profile.bio && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{profile.bio}</p>
        )}
        
        {profile.interests && profile.interests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {profile.interests.slice(0, 3).map((interest) => (
              <Badge key={interest} variant="outline" className="text-xs">
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
    </Card>
  );
  
  // Wrap with link if href is provided
  if (href) {
    return (
      <Link href={href} className="block" legacyBehavior>
        {card}
      </Link>
    );
  }
  
  return card;
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

export function UserProfileCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          <Skeleton className="h-8 w-20 ml-auto" />
        </div>
        
        <div className="mt-3">
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="mt-3 flex gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
} 