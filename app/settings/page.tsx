'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
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

export default function SettingsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: '',
    avatar_url: '',
    role: '',
  });

  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');

  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState<any>(null);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const [prefsError, setPrefsError] = useState<string | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login?redirect=/settings');
    }
  }, [user, isAuthLoading, router]);

  // Fetch user data
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          setIsLoadingUserData(true);
          setError(null);

          const response = await fetch('/api/user/profile');

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const data = await response.json();

          setProfileData({
            name: data.name || '',
            bio: data.bio || '',
            location: data.location || '',
            avatar_url: data.avatar_url || '',
            role: data.role || '',
          });

          // Handle interests as an array
          setInterests(Array.isArray(data.interests) ? data.interests : []);
        } catch (err: any) {
          console.error('Error fetching user data:', err);
          setError(err.message || 'Failed to load user data');
          toast({
            title: 'Error',
            description: 'Failed to load your profile data',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingUserData(false);
        }
      };

      fetchUserData();
    }
  }, [user, toast]);

  // Fetch notification preferences
  useEffect(() => {
    async function fetchPrefs() {
      setIsLoadingPrefs(true);
      setPrefsError(null);
      try {
        const res = await fetch('/api/notifications/preferences');
        const json = await res.json();
        if (res.ok && json.preferences) {
          setNotificationPrefs(json.preferences);
        } else {
          setPrefsError(json.error || 'Failed to load notification preferences');
        }
      } catch (e: any) {
        setPrefsError(e.message || 'Failed to load notification preferences');
      } finally {
        setIsLoadingPrefs(false);
      }
    }
    fetchPrefs();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterest.trim()) return;

    if (!interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
    }

    setNewInterest('');
  };

  const handleRemoveInterest = (interest: string) => {
    return setInterests(interests.filter((i) => i !== interest));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          interests,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast({
        title: 'profile updated',
        description: 'your profile has been updated successfully',
      });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update profile',
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
      if (!res.ok) {
        throw new Error(json.error || 'Failed to update notification preferences');
      }
      setNotificationPrefs(json.preferences);
      toast({ title: 'Notification preferences updated' });
    } catch (e: any) {
      setPrefsError(e.message || 'Failed to update notification preferences');
      toast({ title: 'Error', description: e.message || 'Failed to update notification preferences', variant: 'destructive' });
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
      <PageHeader heading="Settings" description="Manage your account settings and preferences" />

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="lowercase">your profile</CardTitle>
              <CardDescription className="lowercase">
                update your personal information
              </CardDescription>
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
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profileData.avatar_url || ''} alt={profileData.name} />
                      <AvatarFallback>
                        <User className="h-8 w-8 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{profileData.name || user.email}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {profileData.role && (
                        <p className="text-xs mt-1 flex items-center gap-1.5">
                          <Badge variant="outline" className="px-2 py-0 h-5">
                            {getRoleDisplayName(profileData.role as UserRole)}
                          </Badge>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      placeholder="your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="tell us a bit about yourself"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      placeholder="where are you based?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">avatar url</Label>
                    <Input
                      id="avatar_url"
                      name="avatar_url"
                      value={profileData.avatar_url}
                      onChange={handleProfileChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      enter a URL to an image for your profile picture
                    </p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveProfile}
                disabled={isLoadingUserData || isSaving}
                className="gap-2 lowercase"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                save changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="lowercase">collaboration settings</CardTitle>
                <CardDescription className="lowercase">
                  configure your preferences for collaborative features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-md border border-dashed">
                  <h3 className="font-medium mb-2">Cursor Settings Temporarily Unavailable</h3>
                  <p className="text-sm text-muted-foreground">
                    Cursor customization settings are currently disabled but kept in the codebase
                    for future use.
                  </p>
                </div>
              </CardContent>
            </Card>
            {/* Other collaboration settings can go here */}
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
                    <span className="text-xs text-muted-foreground ml-2">Always enabled for transparency</span>
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
      </Tabs>
    </div>
  );
}
