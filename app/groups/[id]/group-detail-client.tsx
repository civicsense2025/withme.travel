'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Group, GroupMember, GroupTrip } from '@/types/groups';
import { 
  Users, User, MapPin, Calendar, Plus, Settings, Edit, 
  TrashIcon, UserPlus, Share2, MessageSquare, Lightbulb, 
  ChevronRight, Sparkles, Mail, Smartphone, Instagram, 
  LogIn, ArrowRight, Pencil, User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import InviteLinkBox from '../components/InviteLinkBox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Container } from '@/components/container';

interface GroupDetailClientProps {
  group: Group;
  membership: GroupMember | null;
  recentTrips: GroupTrip[];
  isAuthenticated: boolean;
  guestToken?: string | null;
}

export default function GroupDetailClient({
  group,
  membership,
  recentTrips,
  isAuthenticated,
  guestToken,
}: GroupDetailClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteOptions, setShowInviteOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(/Mobi|Android/i.test(window.navigator.userAgent));
    }
  }, []);
  
  useEffect(() => {
    async function fetchPlans() {
      setPlansLoading(true);
      setPlansError(null);
      try {
        const res = await fetch(`/api/groups/${group.id}/plans`);
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setPlans([]);
            return;
          }
          throw new Error('Failed to fetch plans');
        }
        const data = await res.json();
        setPlans(data.plans || []);
      } catch (err: any) {
        console.error('Error fetching plans:', err);
        setPlansError('Unable to load plans at this time');
      } finally {
        setPlansLoading(false);
      }
    }
    fetchPlans();
  }, [group.id]);
  
  // Compose the full member list: active members, creator, guest
  let fullMembers = group.group_members?.filter((member) => member.status === 'active') || [];
  // Add creator if not already in members
  if (
    (group.created_by_profile as NonNullable<typeof group.created_by_profile>)?.id &&
    !fullMembers.some((m) => m.user_id === group.created_by_profile?.id)
  ) {
    fullMembers = [
      ...fullMembers,
      {
        group_id: group.id,
        user_id: group.created_by_profile!.id,
        role: 'owner',
        status: 'active',
        joined_at: group.created_at,
        updated_at: group.updated_at,
        user: {
          id: group.created_by_profile!.id,
          full_name: group.created_by_profile!.full_name || 'Group Creator',
          avatar_url: group.created_by_profile!.avatar_url || '',
          username: group.created_by_profile!.username || '',
        },
      },
    ];
  }
  // Add guest as a member if guestToken is present
  if (guestToken) {
    fullMembers = [
      ...fullMembers,
      {
        group_id: group.id,
        user_id: `guest:${guestToken}`,
        role: 'guest',
        status: 'active',
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: `guest:${guestToken}`,
          full_name: 'You (Guest)',
          avatar_url: '',
          username: '',
        },
      },
    ];
  }

  // Remove duplicates by user_id
  const uniqueMembers = Array.from(
    new Map(fullMembers.map((m) => [m.user_id, m])).values()
  );
  
  // Check if current user is an admin or owner
  const isAdminOrOwner = membership ? (membership.role === 'owner' || membership.role === 'admin') : false;
  
  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'n/a';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Handle leaving the group
  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/groups/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: group.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to leave group');
      }
      
      // Redirect to groups listing
      router.push('/groups');
      router.refresh();
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Defensive: Only show invite if group.id is present
  const showInvite = typeof group?.id === 'string' && group.id.length > 0;
  
  // Text message handling
  const handleSendSMS = () => {
    const message = encodeURIComponent(`Join our group on WithMe.Travel: ${window.location.origin}/groups/${group.id}/join`);
    window.location.href = `sms:?body=${message}`;
  };

  // WhatsApp handling
  const handleSendWhatsApp = () => {
    const message = encodeURIComponent(`Join our group on WithMe.Travel: ${window.location.origin}/groups/${group.id}/join`);
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener');
  };

  // Email handling
  const getMailtoLink = () => {
    const message = `Join our group on WithMe.Travel: ${window.location.origin}/groups/${group.id}/join`;
    return `mailto:?subject=Join our group on WithMe.Travel&body=${encodeURIComponent(message)}`;
  };

  // Instagram handling
  const handleSendInstagram = () => {
    const isMobile = typeof window !== 'undefined' && /Mobi|Android/i.test(window.navigator.userAgent);
    if (isMobile) {
      window.location.href = 'instagram://direct-inbox';
    } else {
      alert('Open this page on your phone to DM on Instagram, or copy the invite link below.');
    }
  };

  // Copy invite link to clipboard
  const copyInviteLink = async () => {
    const url = typeof window !== 'undefined' ? 
      `${window.location.origin}/groups/${group.id}/join` : 
      `https://withme.travel/groups/${group.id}/join`;
    
    try {
      await navigator.clipboard.writeText(url);
      alert('Invite link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link. Please try again.');
    }
  };

  // Handle the "Go to Ideas" action without requiring authentication
  const goToIdeas = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Instead of a redirect that would trigger authentication,
    // we'll navigate directly to a non-authenticated version of the ideas page
    router.push(`/groups/${group.id}/ideas-preview`);
  };

  return (
    <Container size="wide" className="py-8 mb-20">
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="relative border-4 border-purple-300 shadow-lg animate-pulse-glow">
          <DialogHeader>
            <DialogTitle>Invite friends to this group</DialogTitle>
          </DialogHeader>
          <TooltipProvider>
            <div className="flex flex-wrap gap-4 mb-4 justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-purple-100 shadow-md hover:bg-purple-200 transition-all flex items-center justify-center" onClick={handleSendSMS} aria-label="Invite via SMS">
                    <Smartphone className="w-6 h-6 text-purple-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Invite via SMS</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-blue-100 shadow-md hover:bg-blue-200 transition-all flex items-center justify-center" onClick={handleSendWhatsApp} aria-label="Invite via WhatsApp">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Invite via WhatsApp</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={getMailtoLink()} className="w-10 h-10 rounded-full bg-green-100 shadow-md hover:bg-green-200 transition-all flex items-center justify-center" aria-label="Invite via Email">
                    <Mail className="w-6 h-6 text-green-600" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Invite via Email</TooltipContent>
              </Tooltip>
              {isMobile && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-yellow-100 shadow-md hover:bg-yellow-200 transition-all flex items-center justify-center" onClick={handleSendInstagram} aria-label="Invite via Instagram DM">
                      <Instagram className="w-6 h-6 text-yellow-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Invite via Instagram DM</TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
          <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2" onClick={copyInviteLink}>
            <Share2 className="h-5 w-5 mr-1" />
            Copy Invite Link
          </Button>
          {isMobile && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Instagram does not allow prefilled messages. You'll need to paste the invite link manually after opening Instagram.
            </p>
          )}
          <Button variant="ghost" className="mt-4 w-full" onClick={() => setShowInviteDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-6">
          <div
            className="relative rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-200 bg-gradient-to-br from-white/90 to-slate-50/80 backdrop-blur-md p-8 group cursor-pointer border border-slate-100"
            tabIndex={0}
            aria-label={`Group details for ${group.name}`}
            style={{ minHeight: 260 }}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-5xl drop-shadow-sm">{group.emoji || '👥'}</div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-slate-900 mb-1">{group.name}</div>
                {group.description && (
                  <p className="text-muted-foreground text-base mb-2">{group.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3 text-base text-muted-foreground mb-2">
              <Users className="h-5 w-5" />
              <span>{uniqueMembers.length} members</span>
            </div>
            <div className="flex items-center space-x-3 text-base text-muted-foreground mb-2">
              <Calendar className="h-5 w-5" />
              <span>Created {formatDate(group.created_at)}</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-2">
              <span className="rounded bg-muted px-2 py-0.5 font-medium">
                {group.visibility}
              </span>
            </div>
            <div className="flex flex-col gap-2 mt-6">
              {isAdminOrOwner && (
                <Link href={`/groups/${group.id}/settings`} className="w-full">
                  <Button variant="outline" className="w-full rounded-xl">
                    <Settings className="h-4 w-4 mr-2" />
                    Group Settings
                  </Button>
                </Link>
              )}
              {membership && (
                <Button 
                  variant="outline" 
                  className="w-full text-red-500 hover:text-red-500 rounded-xl"
                  onClick={handleLeaveGroup}
                  disabled={isLoading}
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Leave Group
                </Button>
              )}
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  Members
                </CardTitle>
                {showInvite && (
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-2">
              {uniqueMembers.slice(0, 5).map((member) => (
                <div key={member.user_id} className="flex items-center justify-between hover:bg-muted/20 p-1 rounded-md transition-colors">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={member.user?.avatar_url || ''} />
                      <AvatarFallback>
                        {member.user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {member.user?.full_name || 'Unknown User'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {uniqueMembers.length > 5 && (
                <Link href={`/groups/${group.id}/members`}>
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    View All Members
                  </Button>
                </Link>
              )}
              {uniqueMembers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Going solo? Invite your travel crew and start plotting your adventure together.
                </div>
              )}
              {group.created_by_profile ? (
                <li key={group.created_by_profile?.id} className="flex items-center gap-2">
                  <span className="avatar-circle">
                    {group.created_by_profile?.full_name?.charAt(0) || <UserIcon className="h-6 w-6 text-gray-400" />}
                  </span>
                  <div>
                    <div className="font-medium">{group.created_by_profile?.full_name || 'Unknown User'}</div>
                  </div>
                </li>
              ) : null}
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trips">Trips</TabsTrigger>
              <TabsTrigger value="plans">Plans</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-10">
              {/* Plans Board Callout */}
              <div className="block mb-8">
                <Link href={`/groups/${group.id}/plans`}>
                  <div className="rounded-lg p-6 mb-4 relative overflow-hidden group transition-all hover:shadow-md cursor-pointer">
                    {/* Gradient background with blur */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="absolute inset-0 backdrop-blur-[1px] group-hover:backdrop-blur-[2px] transition-all"></div>
                    <div className="relative z-10 flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold flex items-center">
                          <Pencil className="h-5 w-5 mr-2 text-blue-500" />
                          Group Planning Boards
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-md">
                          Organize trip ideas into planning boards with collaborative lists.
                        </p>
                      </div>
                      <Button className="group-hover:translate-x-1 transition-transform" size="sm">
                        View Plans
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </div>
              {/* New: Unified empty state for Recent Activity */}
              {(recentTrips.length === 0 && plans.length === 0) ? (
                <div className="flex flex-col sm:flex-row gap-8 justify-center items-center w-full">
                  {/* Add Trip Shortcut */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Add a Trip"
                    onClick={() => router.push(`/groups/${group.id}/trips/add`)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/groups/${group.id}/trips/add`); }}
                    className="flex flex-col items-center justify-center w-full max-w-xs min-h-[180px] border-2 border-dashed border-slate-300 bg-white/70 rounded-2xl shadow-sm hover:border-primary hover:bg-white/90 hover:shadow-lg transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 p-8"
                  >
                    <Plus className="h-10 w-10 text-slate-300 mb-3" />
                    <span className="text-lg font-semibold text-slate-400">Add a Trip</span>
                  </div>
                  {/* Add Plan Shortcut */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Add a Plan"
                    onClick={() => router.push(`/groups/${group.id}/plans`)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/groups/${group.id}/plans`); }}
                    className="flex flex-col items-center justify-center w-full max-w-xs min-h-[180px] border-2 border-dashed border-slate-300 bg-white/70 rounded-2xl shadow-sm hover:border-primary hover:bg-white/90 hover:shadow-lg transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 p-8"
                  >
                    <Lightbulb className="h-10 w-10 text-slate-300 mb-3" />
                    <span className="text-lg font-semibold text-slate-400">Add a Plan</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-10">
                  {/* Recent Trips */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recent Trips</h3>
                    {recentTrips.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {recentTrips.map((groupTrip) => (
                          <Card key={groupTrip.trip_id} className="rounded-xl shadow-md">
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-lg">{groupTrip.trip?.name}</CardTitle>
                              {groupTrip.trip?.destination_id && (
                                <CardDescription className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {groupTrip.trip.destination?.name || 'Unknown Location'}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardFooter className="p-4 pt-2">
                              <div className="flex justify-between w-full items-center">
                                <div className="text-xs text-muted-foreground">
                                  Added {formatDate(groupTrip.added_at)}
                                </div>
                                <Link href={`/trips/${groupTrip.trip_id}`}>
                                  <Button size="sm">View Trip</Button>
                                </Link>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {/* Recent Plans */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recent Plans</h3>
                    {plans.length > 0 ? (
                      <ul className="space-y-4">
                        {plans.slice(0, 3).map((plan) => (
                          <li key={plan.id}>
                            <Link href={`/groups/${group.id}/plans/${plan.slug}`} className="text-primary underline text-lg font-semibold">
                              {plan.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="trips">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Group Trips</h2>
                  <Link href={`/groups/${group.id}/trips/add`}>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Trip
                    </Button>
                  </Link>
                </div>
                
                {recentTrips.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {recentTrips.map((groupTrip) => (
                      <Card key={groupTrip.trip_id}>
                        <CardHeader>
                          <CardTitle>{groupTrip.trip?.name}</CardTitle>
                          {groupTrip.trip?.destination_id && (
                            <CardDescription className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {groupTrip.trip.destination?.name || 'Unknown Location'}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            {groupTrip.trip?.start_date && groupTrip.trip?.end_date ? (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(groupTrip.trip.start_date)} - {formatDate(groupTrip.trip.end_date)}
                              </div>
                            ) : (
                              <div>No dates set</div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Link href={`/trips/${groupTrip.trip_id}`} className="w-full">
                            <Button className="w-full">View Trip</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground mb-4">
                      No trips have been added to this group yet
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="plans">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Group Plans</h2>
                {membership ? (
                  <Button variant="outline" size="sm" onClick={() => setShowAddPlan(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Plan
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => router.push(`/signup?redirectTo=/groups/${group.id}`)}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign up to add plans
                  </Button>
                )}
              </div>
              {plansLoading ? (
                <div>Loading plans...</div>
              ) : plansError ? (
                <div className="text-muted-foreground text-center py-4 border rounded-md bg-muted/20">
                  {plansError}
                </div>
              ) : plans.length > 0 ? (
                <ul className="space-y-2">
                  {plans.map((plan) => (
                    <li key={plan.id}>
                      <Link href={`/groups/${group.id}/plans/${plan.slug}`} className="text-primary underline">
                        {plan.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted-foreground text-center py-4">
                  No plans yet! Start your first group plan to organize ideas, tasks, and more.
                </div>
              )}
              {membership && (
                <Dialog open={showAddPlan} onOpenChange={setShowAddPlan}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add a New Plan</DialogTitle>
                    </DialogHeader>
                    {/* Plan creation form goes here */}
                    <Button variant="ghost" className="mt-4 w-full" onClick={() => setShowAddPlan(false)}>Close</Button>
                  </DialogContent>
                </Dialog>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Apple-fied Floating bottom bar for non-authenticated users */}
      {!membership && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-3xl animate-fade-in">
          <div className="rounded-2xl shadow-2xl border border-slate-200 bg-white/80 backdrop-blur-xl overflow-hidden relative flex items-center justify-between px-8 py-6 gap-6">
            {/* Pastel gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-100 via-indigo-100 to-blue-100 opacity-70 pointer-events-none" />
            <div className="relative z-10 flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Keep Your Group Plans on Track</h3>
              <p className="text-base text-slate-700 opacity-90">Sign up now to secure your trip details and invite your friends to plan unforgettable adventures together.</p>
            </div>
            <Link href={`/signup?redirectTo=/groups/${group.id}`} className="relative z-10">
              <Button className="rounded-full px-8 py-3 text-base font-semibold bg-gradient-to-r from-violet-400 to-indigo-400 shadow-lg hover:from-violet-500 hover:to-indigo-500 transition-all duration-150" size="lg">
                Sign Up <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
}
