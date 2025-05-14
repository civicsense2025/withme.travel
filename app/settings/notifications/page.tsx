// NOTIFICATIONS FEATURE DISABLED: All notification-related logic and UI are commented out for now. Uncomment and update when re-enabling notifications.
// import { useNotifications } from '@/contexts/notification-context';
// import type { NotificationPreferences } from '@/types/notifications';

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Phone, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// export default function NotificationSettingsPage() {
//   const { preferences, updatePreferences, isLoadingPreferences, preferencesError } =
//     useNotifications();
//   const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [debugInfo, setDebugInfo] = useState<string | null>(null);
//
//   useEffect(() => {
//     if (preferences) {
//       setLocalPreferences(preferences);
//     }
//   }, [preferences]);
//
//   if (isLoadingPreferences) {
//     return (
//       <div className="min-h-screen bg-background">
//         <main className="container max-w-4xl py-6">
//           <div className="flex items-center space-x-4">
//             <div className="w-7 h-7 rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground animate-spin"></div>
//             <p>Loading notification preferences...</p>
//           </div>
//         </main>
//       </div>
//     );
//   }
//
//   if (preferencesError) {
//     return (
//       <div className="min-h-screen bg-background">
//         <main className="container max-w-4xl py-6">
//           <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
//             <h2 className="text-xl font-semibold text-red-800 dark:text-red-400">
//               Error Loading Preferences
//             </h2>
//             <p className="text-red-700 dark:text-red-300 mt-2">{preferencesError}</p>
//             <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
//               Retry
//             </Button>
//           </div>
//         </main>
//       </div>
//     );
//   }
//
//   if (!localPreferences) {
//     return (
//       <div className="min-h-screen bg-background">
//         <main className="container max-w-4xl py-6">
//           <div className="flex items-center space-x-4">
//             <div className="w-7 h-7 rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground animate-spin"></div>
//             <p>Loading notification preferences...</p>
//           </div>
//         </main>
//       </div>
//     );
//   }
//
//   const handleChannelChange = (
//     channel: 'in_app_enabled' | 'email_enabled' | 'push_enabled',
//     value: boolean
//   ) => {
//     setLocalPreferences((prev) => {
//       if (!prev) return prev;
//       return { ...prev, [channel]: value };
//     });
//   };
//
//   const handleTypeChange = (
//     type:
//       | 'trip_updates'
//       | 'itinerary_changes'
//       | 'member_activity'
//       | 'comments'
//       | 'votes'
//       | 'focus_events',
//     value: boolean
//   ) => {
//     setLocalPreferences((prev) => {
//       if (!prev) return prev;
//       return { ...prev, [type]: value };
//     });
//   };
//
//   const saveChanges = async () => {
//     if (!localPreferences) return;
//
//     setSaving(true);
//     setDebugInfo(null);
//     try {
//       const result = await updatePreferences(localPreferences);
//       setDebugInfo(`Preferences updated successfully: ${JSON.stringify(result, null, 2)}`);
//     } catch (error) {
//       setDebugInfo(
//         `Error updating preferences: ${error instanceof Error ? error.message : String(error)}`
//       );
//     } finally {
//       setSaving(false);
//     }
//   };
//
//   const hasChanges = JSON.stringify(preferences) !== JSON.stringify(localPreferences);
//
//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container max-w-4xl py-6 space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold">Notification Settings</h1>
//             <p className="text-muted-foreground">
//               Customize how and when you receive notifications
//             </p>
//           </div>
//
//           <div className="flex gap-2">
//             <Button variant="outline" asChild>
//               <Link href="/notifications">View Notifications</Link>
//             </Button>
//             <Button onClick={saveChanges} disabled={!hasChanges || saving}>
//               {saving ? 'Saving...' : 'Save Changes'}
//             </Button>
//           </div>
//         </div>
//
//         {debugInfo && (
//           <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 font-mono text-sm overflow-auto max-h-40">
//             <pre>{debugInfo}</pre>
//           </div>
//         )}
//
//         <Tabs defaultValue="channels" className="w-full">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="channels">Notification Channels</TabsTrigger>
//             <TabsTrigger value="content">Content Types</TabsTrigger>
//           </TabsList>
//
//           <TabsContent value="channels" className="mt-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Notification Delivery</CardTitle>
//                 <CardDescription>Choose how you want to receive notifications</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="flex items-center justify-between py-4">
//                   <div className="flex items-center space-x-4">
//                     <Bell className="h-5 w-5 text-primary" />
//                     <div>
//                       <Label htmlFor="in-app" className="text-base">
//                         In-App Notifications
//                       </Label>
//                       <p className="text-sm text-muted-foreground">
//                         Notifications shown in the app while you're using WithMe.Travel
//                       </p>
//                     </div>
//                   </div>
//                   <Switch
//                     id="in-app"
//                     checked={localPreferences.in_app_enabled}
//                     onCheckedChange={(checked) => handleChannelChange('in_app_enabled', checked)}
//                   />
//                 </div>
//
//                 <Separator />
//
//                 <div className="flex items-center justify-between py-4">
//                   <div className="flex items-center space-x-4">
//                     <Mail className="h-5 w-5 text-primary" />
//                     <div>
//                       <Label htmlFor="email" className="text-base">
//                         Email Notifications
//                       </Label>
//                       <p className="text-sm text-muted-foreground">
//                         Important updates sent to your email address
//                       </p>
//                     </div>
//                   </div>
//                   <Switch
//                     id="email"
//                     checked={localPreferences.email_enabled}
//                     onCheckedChange={(checked) => handleChannelChange('email_enabled', checked)}
//                   />
//                 </div>
//
//                 <Separator />
//
//                 <div className="flex items-center justify-between py-4">
//                   <div className="flex items-center space-x-4">
//                     <Phone className="h-5 w-5 text-primary" />
//                     <div>
//                       <Label htmlFor="push" className="text-base">
//                         Push Notifications
//                       </Label>
//                       <p className="text-sm text-muted-foreground">
//                         Notifications sent to your device when you're not using the app
//                       </p>
//                     </div>
//                   </div>
//                   <Switch
//                     id="push"
//                     checked={localPreferences.push_enabled}
//                     onCheckedChange={(checked) => handleChannelChange('push_enabled', checked)}
//                   />
//                 </div>
//
//                 <div className="bg-muted/50 p-4 rounded-lg flex items-start space-x-3 mt-4">
//                   <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-muted-foreground">
//                     High priority notifications about trip invitations, security alerts, and
//                     upcoming trips will always be delivered via email, regardless of your
//                     preferences.
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//
//           <TabsContent value="content" className="mt-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Notification Content Types</CardTitle>
//                 <CardDescription>
//                   Choose what types of updates you want to be notified about
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="flex items-center justify-between py-4">
//                   <div>
//                     <Label htmlFor="trip-updates" className="text-base">
//                       Trip Updates
//                     </Label>
//                     <p className="text-sm text-muted-foreground">
//                       Changes to trip dates, destinations, or other details
//                     </p>
//                   </div>
//                   <Switch
//                     id="trip-updates"
//                     checked={localPreferences.trip_updates}
//                     onCheckedChange={(checked) => handleTypeChange('trip_updates', checked)}
//                   />
//                 </div>
//
//                 <Separator />
//
//                 <div className="flex items-center justify-between py-4">
//                   <div>
//                     <Label htmlFor="itinerary-changes" className="text-base">
//                       Itinerary Changes
//                     </Label>
//                     <p className="text-sm text-muted-foreground">
//                       Updates to your trip's schedule, activities, or reservations
//                     </p>
//                   </div>
//                   <Switch
//                     id="itinerary-changes"
//                     checked={localPreferences.itinerary_changes}
//                     onCheckedChange={(checked) => handleTypeChange('itinerary_changes', checked)}
//                   />
//                 </div>
//
//                 <Separator />
//
//                 <div className="flex items-center justify-between py-4">
//                   <div>
//                     <Label htmlFor="member-activity" className="text-base">
//                       Member Activity
//                     </Label>
//                     <p className="text-sm text-muted-foreground">
//                       When people join, leave, or change roles in your trips
//                     </p>
//                   </div>
//                   <Switch
//                     id="member-activity"
//                     checked={localPreferences.member_activity}
//                     onCheckedChange={(checked) => handleTypeChange('member_activity', checked)}
//                   />
//                 </div>
//
//                 <Separator />
//
//                 <div className="flex items-center justify-between py-4">
//                   <div>
//                     <Label htmlFor="comments" className="text-base">
//                       Comments
//                     </Label>
//                     <p className="text-sm text-muted-foreground">
//                       Comments on trips, activities, and places
//                     </p>
//                   </div>
//                   <Switch
//                     id="comments"
//                     checked={localPreferences.comments}
//                     onCheckedChange={(checked) => handleTypeChange('comments', checked)}
//                   />
//                 </div>
//
//                 <Separator />
//
//                 <div className="flex items-center justify-between py-4">
//                   <div>
//                     <Label htmlFor="votes" className="text-base">
//                       Votes
//                     </Label>
//                     <p className="text-sm text-muted-foreground">
//                       Voting activities and results for group decisions
//                     </p>
//                   </div>
//                   <Switch
//                     id="votes"
//                     checked={localPreferences.votes}
//                     onCheckedChange={(checked) => handleTypeChange('votes', checked)}
//                   />
//                 </div>
//
//                 <Separator />
//
//                 <div className="flex items-center justify-between py-4">
//                   <div>
//                     <Label htmlFor="focus-events" className="text-base">
//                       Focus Sessions
//                     </Label>
//                     <p className="text-sm text-muted-foreground">
//                       When group members start collaborative planning sessions
//                     </p>
//                   </div>
//                   <Switch
//                     id="focus-events"
//                     checked={localPreferences.focus_events}
//                     onCheckedChange={(checked) => handleTypeChange('focus_events', checked)}
//                   />
//                 </div>
//
//                 <div className="bg-muted/50 p-4 rounded-lg flex items-start space-x-3 mt-4">
//                   <AlertTriangle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-muted-foreground">
//                     Even if you disable certain notification types, you'll still receive direct
//                     mentions (@username) and high-priority notifications related to trip invitations
//                     and security.
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </main>
//     </div>
//   );
// }

// Placeholder export while notifications are disabled
export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <main className="container max-w-2xl py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Notification Settings</h1>
        <p className="text-muted-foreground text-lg">
          Notification features are currently disabled. This page will return when notifications are
          re-enabled.
        </p>
      </main>
    </div>
  );
}
