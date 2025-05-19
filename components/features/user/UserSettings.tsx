'use client';

/**
 * User Settings Component
 * 
 * A comprehensive settings panel for user account management
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Lock, Mail, Bell, User, Globe, UserX, LogOut, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/lib/hooks/use-toast';
import { UserProfile, UserSettingsProps, AccountSettings, NotificationSettings } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Comprehensive settings panel for user account management
 */
export function UserSettings({
  profile,
  onProfileUpdate,
  onAccountUpdate,
  onNotificationsUpdate,
  onChangePassword,
  onDeleteAccount,
  defaultTab = 'profile',
}: UserSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Profile state
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    name: profile.name,
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
  });
  
  // Account settings state
  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    email: profile.email || '',
    username: profile.id,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    tripUpdates: true,
    friendActivity: true,
    marketing: false,
    newFeatures: true,
  });
  
  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
  
  // Loading states
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isAccountSaving, setIsAccountSaving] = useState(false);
  const [isNotificationsSaving, setIsNotificationsSaving] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [isAccountDeleting, setIsAccountDeleting] = useState(false);
  
  // Profile form handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onProfileUpdate) return;
    
    setIsProfileSaving(true);
    try {
      await onProfileUpdate(profileData);
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProfileSaving(false);
    }
  };
  
  // Account settings handlers
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAccountSettings((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAccountUpdate) return;
    
    setIsAccountSaving(true);
    try {
      await onAccountUpdate(accountSettings);
      toast({
        title: 'Account updated',
        description: 'Your account settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update account settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAccountSaving(false);
    }
  };
  
  // Notification settings handlers
  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  
  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onNotificationsUpdate) return;
    
    setIsNotificationsSaving(true);
    try {
      await onNotificationsUpdate(notificationSettings);
      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been updated.',
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update notification preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsNotificationsSaving(false);
    }
  };
  
  // Security handlers
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onChangePassword) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Your new password and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Your password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsPasswordChanging(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully.',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Change failed',
        description: 'Failed to change your password. Please check your current password and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPasswordChanging(false);
    }
  };
  
  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onDeleteAccount) return;
    
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    setIsAccountDeleting(true);
    try {
      await onDeleteAccount(deleteAccountPassword);
      toast({
        title: 'Account deleted',
        description: 'Your account has been deleted. Redirecting to home page...',
      });
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Deletion failed',
        description: 'Failed to delete your account. Please check your password and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAccountDeleting(false);
    }
  };
  
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="mb-6 grid grid-cols-4 w-full max-w-3xl mx-auto">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="account" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Account</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">Security</span>
        </TabsTrigger>
      </TabsList>
      
      {/* Profile Tab */}
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileSubmit}>
            <CardContent className="space-y-4">
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
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  placeholder="Tell us about yourself"
                  className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={profileData.location}
                  onChange={handleProfileChange}
                  placeholder="City, Country"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={profileData.website}
                  onChange={handleProfileChange}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isProfileSaving}>
                {isProfileSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      
      {/* Account Tab */}
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <form onSubmit={handleAccountSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={accountSettings.email}
                  onChange={handleAccountChange}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={accountSettings.username}
                  onChange={handleAccountChange}
                  placeholder="username"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    name="language"
                    value={accountSettings.language}
                    onChange={handleAccountChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={accountSettings.timezone}
                    onChange={handleAccountChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="America/New_York">Eastern Time (US & Canada)</option>
                    <option value="America/Chicago">Central Time (US & Canada)</option>
                    <option value="America/Denver">Mountain Time (US & Canada)</option>
                    <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isAccountSaving}>
                {isAccountSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      
      {/* Notifications Tab */}
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how and when we notify you</CardDescription>
          </CardHeader>
          <form onSubmit={handleNotificationsSubmit}>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={() => handleNotificationChange('emailNotifications')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Trip Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified about changes to your trips
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.tripUpdates}
                  onCheckedChange={() => handleNotificationChange('tripUpdates')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Friend Activity</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified when friends create trips or add you to their trips
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.friendActivity}
                  onCheckedChange={() => handleNotificationChange('friendActivity')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Marketing Emails</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive offers, promotions, and newsletter
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.marketing}
                  onCheckedChange={() => handleNotificationChange('marketing')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">New Features</h3>
                  <p className="text-sm text-muted-foreground">
                    Get updates about new features and improvements
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.newFeatures}
                  onCheckedChange={() => handleNotificationChange('newFeatures')}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isNotificationsSaving}>
                {isNotificationsSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      
      {/* Security Tab */}
      <TabsContent value="security">
        <div className="space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isPasswordChanging}>
                  {isPasswordChanging ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          {/* Sign Out of All Devices */}
          <Card>
            <CardHeader>
              <CardTitle>Sign Out of All Devices</CardTitle>
              <CardDescription>
                This will sign you out of all devices where you're currently logged in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out Everywhere
              </Button>
            </CardContent>
          </Card>
          
          {/* Delete Account */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleDeleteAccountSubmit}>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
                  <p>
                    Warning: This action cannot be undone. Your account, trips, and all
                    other data will be permanently deleted.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    value={deleteAccountPassword}
                    onChange={(e) => setDeleteAccountPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isAccountDeleting}
                >
                  {isAccountDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Delete Account
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
} 