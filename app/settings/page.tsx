'use client';

import type React from 'react';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, User, Tag, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
// import { CursorSettings } from '@/components/presence/cursor-settings';
import { PageHeader } from '@/components/page-header';
import { getRoleDisplayName, type UserRole } from '@/types/users';
import { Switch } from '@/components/ui/switch';
import { ReferralLinkManager } from '@/components/features/user/referral-link-manager';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<{
    name: string;
    bio: string;
    location: string;
    avatar_url: string;
    role: string;
    travel_personality?: string;
    travel_squad?: string;
    interests: string[];
    avatarFile?: File;
    onboarding_completed: boolean;
  }>({
    name: '',
    bio: '',
    location: '',
    avatar_url: '',
    role: '',
    interests: [],
    onboarding_completed: false,
  });

  const [newInterest, setNewInterest] = useState('');

  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState<any>(null);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const [prefsError, setPrefsError] = useState<string | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add debounce ref
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetchedPrefs = useRef<boolean>(false);

  // Add onboarding banner state
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(() => {
    // Show if onboarding_completed is false (from profileData)
    return (profileData as any).onboarding_completed === false;
  });

  // Update banner visibility if profileData changes
  useEffect(() => {
    setShowOnboardingBanner((profileData as any).onboarding_completed === false);
  }, [profileData]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login?redirect=/settings');
    }
  }, [user, isAuthLoading, router]);

  // Replace the fetchUserData function with a useCallback version
  const fetchUserData = useCallback(async () => {
    console.log('[SettingsPage] Fetching user data');
    setIsLoadingUserData(true);
    setError(null);

    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      console.log('[SettingsPage] User data received:', JSON.stringify(data));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user data');
      }

      // Update profile data state
      setProfileData({
        name: data.name || '',
        bio: data.bio || '',
        location: data.location || '',
        avatar_url: data.avatar_url || '',
        role: data.role || '',
        travel_personality: data.travel_personality || undefined,
        travel_squad: data.travel_squad || undefined,
        interests: Array.isArray(data.interests) ? data.interests : [],
        onboarding_completed: data.onboarding_completed || false,
      });

      console.log('[SettingsPage] Profile data state updated');
    } catch (error: any) {
      console.error('[SettingsPage] Error fetching user data:', error);
      setError(error.message || 'Failed to fetch user data');
      toast({
        title: 'Error',
        description: 'Failed to load your profile data',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUserData(false);
    }
  }, [toast]);

  // Replace the fetchPreferences implementation with a debounced version
  const fetchPreferences = useCallback(async () => {
    // Don't fetch if we've already fetched once
    if (hasFetchedPrefs.current) {
      return;
    }

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Set timeout for 1 second
    fetchTimeoutRef.current = setTimeout(async () => {
      setIsLoadingPrefs(true);
      setPrefsError(null);
      try {
        const res = await fetch('/api/notifications/preferences');

        // Handle rate limiting
        if (res.status === 429) {
          console.log('Rate limit hit, will retry later');
          setPrefsError('Too many requests. Please try again later.');
          return;
        }

        const json = await res.json();
        if (res.ok && json.preferences) {
          setNotificationPrefs(json.preferences);
          hasFetchedPrefs.current = true;
        } else {
          setPrefsError(json.error || 'Failed to load notification preferences');
        }
      } catch (e: any) {
        setPrefsError(e.message || 'Failed to load notification preferences');
      } finally {
        setIsLoadingPrefs(false);
      }
    }, 1000);
  }, []);

  // Modify the user data fetch too
  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchPreferences();
    }
  }, [user, fetchUserData, fetchPreferences]);

  // Clean up the fetchTimeoutRef on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterest.trim()) return;

    if (!profileData.interests.includes(newInterest.trim())) {
      setProfileData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
    }

    setNewInterest('');
  };

  const handleRemoveInterest = (interest: string) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  // Handle file upload for avatar
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 4MB',
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    if (!file.type.match(/image\/(jpeg|png|gif)/)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a JPG, PNG, or GIF image',
        variant: 'destructive',
      });
      return;
    }

    // Create a blob URL for preview
    const objectUrl = URL.createObjectURL(file);
    setProfileData((prev) => ({
      ...prev,
      avatar_url: objectUrl,
      avatarFile: file, // Store the file for later upload
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Modify handleSaveProfile to handle file upload
  const handleSaveProfile = async () => {
    try {
      console.log('[SettingsPage] Saving profile, current state:', JSON.stringify(profileData));
      setIsSaving(true);

      // Handle file upload if needed
      let finalAvatarUrl = profileData.avatar_url;
      if (profileData.avatarFile) {
        console.log('[SettingsPage] Uploading avatar file');
        try {
          // Code for file upload...
          // ...
          console.log('[SettingsPage] Avatar upload complete, URL:', finalAvatarUrl);
        } catch (uploadError) {
          console.error('[SettingsPage] Avatar upload failed:', uploadError);
          toast({
            title: 'Error uploading image',
            description: 'Please try again or use a different image.',
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }
      }

      // Prepare the profile data to send
      const profileToSave = {
        ...profileData,
        avatar_url: finalAvatarUrl,
      };
      delete profileToSave.avatarFile; // Remove the file object before sending

      console.log(
        '[SettingsPage] Sending profile update request with data:',
        JSON.stringify(profileToSave)
      );

      // Send the update request
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileToSave),
      });

      const responseData = await response.json();
      console.log(
        '[SettingsPage] Profile update response:',
        response.status,
        JSON.stringify(responseData)
      );

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update profile');
      }

      // Handle success
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });

      // Refresh profile data
      fetchUserData();
    } catch (error: any) {
      console.error('[SettingsPage] Profile update error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating your profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggle change
  const handleToggle = (key: string) => (value: boolean) => {
    setNotificationPrefs((prev: any) => ({ ...prev, [key]: value }));
  };

  // Save notification preferences
  const handleSavePrefs = async () => {
    setIsSavingPrefs(true);
    setPrefsError(null);
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: notificationPrefs }),
      });
      const json = await res.json();

      if (res.status === 429) {
        toast({
          title: 'Rate limit exceeded',
          description: 'Please wait a moment before trying again',
          variant: 'destructive',
        });
        setPrefsError('Too many requests. Please wait a moment before trying again.');
        return;
      }

      if (!res.ok) {
        throw new Error(json.error || 'Failed to update notification preferences');
      }

      setNotificationPrefs(json.preferences);
      toast({ title: 'Notification preferences updated' });
    } catch (e: any) {
      setPrefsError(e.message || 'Failed to update notification preferences');
      toast({
        title: 'Error',
        description: e.message || 'Failed to update notification preferences',
        variant: 'destructive',
      });
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Don't render anything while checking auth
  if (isAuthLoading) {
    return null;
  }

  // Handle case where user is definitely not logged in after loading check
  if (!user) {
    return <p>Please log in to view settings.</p>;
  }

  return (
    <div className="container max-w-screen-md py-6">
      <PageHeader title="Settings" description="Manage your account settings and preferences" />

      {/* Onboarding Banner */}
      {showOnboardingBanner && (
        <div className="mb-6 bg-yellow-50 border border-yellow-300 text-yellow-900 rounded-lg px-4 py-3 flex items-center justify-between">
          <span>
            <b>Finish setting up your account!</b> Complete onboarding to unlock all features.
          </span>
          <div className="flex gap-2 ml-4">
            <Button size="sm" variant="secondary" onClick={() => router.push('/onboarding')}>
              Complete Onboarding
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Dismiss"
              onClick={() => setShowOnboardingBanner(false)}
            >
              ×
            </Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Form Column */}
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingUserData ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profileData.avatar_url || ''} alt={profileData.name} />
                        <AvatarFallback>
                          <User className="h-10 w-10 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAvatarUpload}
                          accept="image/jpeg, image/png, image/gif"
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={triggerFileInput}
                          className="mt-2"
                        >
                          Upload Image
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG or GIF, max 4MB
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        placeholder="Your name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        placeholder="Tell us a bit about yourself"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={profileData.location}
                        onChange={handleProfileChange}
                        placeholder="Where are you based?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="travel_personality">Travel Personality</Label>
                      <Select
                        value={profileData.travel_personality || 'none'}
                        onValueChange={(value) =>
                          setProfileData((prev) => ({
                            ...prev,
                            travel_personality: value === 'none' ? undefined : value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue>Select your travel personality</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None selected</SelectItem>
                          <SelectItem value="planner">The Planner</SelectItem>
                          <SelectItem value="adventurer">The Adventurer</SelectItem>
                          <SelectItem value="foodie">The Foodie</SelectItem>
                          <SelectItem value="sightseer">The Sightseer</SelectItem>
                          <SelectItem value="relaxer">The Relaxer</SelectItem>
                          <SelectItem value="culture">The Culture Buff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="travel_squad">Travel Squad</Label>
                      <Select
                        value={profileData.travel_squad || 'none'}
                        onValueChange={(value) =>
                          setProfileData((prev) => ({
                            ...prev,
                            travel_squad: value === 'none' ? undefined : value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue>Select who you travel with</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None selected</SelectItem>
                          <SelectItem value="friends">Friends</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="solo">Solo</SelectItem>
                          <SelectItem value="coworkers">Coworkers</SelectItem>
                          <SelectItem value="mixed">Mixed Crew</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interests">Interests</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {profileData.interests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="px-2 py-1">
                            {interest}
                            <button
                              type="button"
                              onClick={() => handleRemoveInterest(interest)}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                              aria-label={`Remove ${interest}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <form onSubmit={handleAddInterest} className="flex gap-2">
                        <Input
                          id="new-interest"
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          placeholder="Add an interest"
                        />
                        <Button type="submit" variant="outline" size="sm">
                          Add
                        </Button>
                      </form>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoadingUserData || isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            {/* Profile Preview Column */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Preview</CardTitle>
                <CardDescription>How others will see your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center border rounded-lg p-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={profileData.avatar_url || ''} alt={profileData.name} />
                    <AvatarFallback>
                      <User className="h-12 w-12 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{profileData.name || user.email}</h3>
                  {profileData.location && (
                    <p className="text-sm text-muted-foreground mb-2">{profileData.location}</p>
                  )}
                  {profileData.role && (
                    <div className="my-2">
                      <Badge variant="outline">
                        {getRoleDisplayName(profileData.role as UserRole)}
                      </Badge>
                    </div>
                  )}
                  {profileData.bio && (
                    <div className="mt-4 text-sm">
                      <p>{profileData.bio}</p>
                    </div>
                  )}
                  {profileData.interests.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Interests</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {profileData.interests.map((interest) => (
                          <Badge key={interest} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profileData.travel_personality && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Travel Personality</p>
                      <Badge variant="outline" className="bg-accent-purple/10 text-accent-purple">
                        {getTravelPersonalityDisplay(profileData.travel_personality)}
                      </Badge>
                    </div>
                  )}
                  {profileData.travel_squad && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Travel Squad</p>
                      <Badge variant="outline" className="bg-accent-blue/10 text-accent-blue">
                        {getTravelSquadDisplay(profileData.travel_squad)}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you would like to be notified</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPrefs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : prefsError ? (
                <Alert variant="destructive">
                  <AlertDescription>{prefsError}</AlertDescription>
                </Alert>
              ) : notificationPrefs ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="template_likes">Template Likes</Label>
                    <Switch
                      id="template_likes"
                      checked={!!notificationPrefs.template_likes}
                      onCheckedChange={handleToggle('template_likes')}
                      disabled={isSavingPrefs}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="template_comments">Template Comments</Label>
                    <Switch
                      id="template_comments"
                      checked={!!notificationPrefs.template_comments}
                      onCheckedChange={handleToggle('template_comments')}
                      disabled={isSavingPrefs}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="admin_alerts">Admin Alerts</Label>
                    <Switch
                      id="admin_alerts"
                      checked={!!notificationPrefs.admin_alerts}
                      onCheckedChange={() => {}}
                      disabled
                    />
                    <span className="text-xs text-muted-foreground ml-2">
                      Always enabled for transparency
                    </span>
                  </div>
                  <Button onClick={handleSavePrefs} disabled={isSavingPrefs} className="mt-4">
                    {isSavingPrefs ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Notification Preferences
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <div className="space-y-6">
            <ReferralLinkManager />

            <Card>
              <CardHeader>
                <CardTitle>Your Referral Stats</CardTitle>
                <CardDescription>Track your referral status and rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total referrals</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rewards earned</span>
                    <Badge variant="outline" className="bg-accent-purple/10 text-accent-purple">
                      None yet
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getTravelPersonalityDisplay(personality: string): string {
  const personalities: Record<string, string> = {
    planner: 'The Planner',
    adventurer: 'The Adventurer',
    foodie: 'The Foodie',
    sightseer: 'The Sightseer',
    relaxer: 'The Relaxer',
    culture: 'The Culture Buff',
  };
  return personalities[personality] || personality;
}

function getTravelSquadDisplay(squad: string): string {
  const squads: Record<string, string> = {
    friends: 'Friends',
    family: 'Family',
    partner: 'Partner',
    solo: 'Solo',
    coworkers: 'Coworkers',
    mixed: 'Mixed Crew',
  };
  return squads[squad] || squad;
}
