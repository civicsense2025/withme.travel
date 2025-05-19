'use client';

/**
 * User Profile Component
 * 
 * Displays a user's profile with editable or view-only modes
 */

import React, { useState } from 'react';
import { User as LucideUser, Mail, MapPin, Calendar, Edit2, Check, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { UserProfile as UserProfileType, UserProfileProps } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a user profile with optional editing capabilities
 */
export function UserProfile({
  profile,
  editable = false,
  showFullDetails = true,
  onProfileUpdate,
  className = '',
}: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfileType>>({});
  const { toast } = useToast();

  // Initialize edited profile when entering edit mode
  const handleEditClick = () => {
    setEditedProfile({
      name: profile.name,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
    });
    setIsEditing(true);
  };

  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save profile changes
  const handleSave = async () => {
    if (!onProfileUpdate) return;
    
    setIsSaving(true);
    try {
      await onProfileUpdate(editedProfile);
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  // Render the profile in view mode (non-editing)
  if (!isEditing) {
    return (
      <Card className={`${className} overflow-hidden`}>
        <CardHeader className="relative pb-0">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary/20 to-primary/10" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="w-20 h-20 border-4 border-background">
              <AvatarImage src={profile.avatar_url} alt={profile.name} />
              <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              {profile.role && (
                <Badge variant="outline" className="mt-1">
                  {profile.role}
                </Badge>
              )}
            </div>
            
            {editable && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4"
                onClick={handleEditClick}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {profile.bio && (
            <div className="mb-4">
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}
          
          <div className="space-y-2">
            {profile.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
            )}
            
            {profile.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.created_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
            )}
          </div>
          
          {showFullDetails && profile.interests && profile.interests.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {showFullDetails && profile.travel_personality && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-1">Travel Personality</h3>
              <p className="text-sm text-muted-foreground">{profile.travel_personality}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Render the profile in edit mode
  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={editedProfile.name || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={editedProfile.bio || ''}
            onChange={handleChange}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={editedProfile.location || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            value={editedProfile.website || ''}
            onChange={handleChange}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

export function UserProfileSkeleton({ showFullDetails = true }: { showFullDetails?: boolean }) {
  return (
    <Card>
      <CardHeader className="relative pb-0">
        <div className="absolute top-0 left-0 right-0 h-24 bg-muted/50" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          
          <div className="text-center sm:text-left">
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-6" />
        
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        {showFullDetails && (
          <div className="mt-6">
            <Skeleton className="h-5 w-24 mb-2" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-12 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Label component import (to avoid potential import error)
function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none">
      {children}
    </label>
  );
} 