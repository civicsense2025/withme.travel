'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Group, GroupMember, GroupTrip } from '@/types/groups';
import { 
  Users, User, MapPin, Calendar, Plus, Settings, Edit, 
  TrashIcon, UserPlus, Share2, MessageSquare, Lightbulb, 
  ChevronRight, Sparkles, Mail, Smartphone, Instagram, 
  LogIn, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import InviteLinkBox from '../components/InviteLinkBox';

interface GroupDetailClientProps {
  group: Group;
  membership: GroupMember | null;
  recentTrips: GroupTrip[];
}

export default function GroupDetailClient({
  group,
  membership,
  recentTrips,
}: GroupDetailClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteOptions, setShowInviteOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(/Mobi|Android/i.test(window.navigator.userAgent));
    }
  }, []);
  
  // Filter active members
  const activeMembers = group.group_members?.filter(
    (member) => member.status === 'active'
  ) || [];
  
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
    <div className="container max-w-6xl py-8 mb-20">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{group.emoji || '👥'}</div>
                <div>
                  <CardTitle className="text-xl">{group.name}</CardTitle>
                  <CardDescription>{group.visibility}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              {group.description && (
                <p className="text-muted-foreground mb-4">{group.description}</p>
              )}
              <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-2">
                <Users className="h-4 w-4" />
                <span>{activeMembers.length} members</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(group.created_at)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2 pt-3">
              {isAdminOrOwner && (
                <Link href={`/groups/${group.id}/settings`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Group Settings
                  </Button>
                </Link>
              )}
              {membership && (
                <Button 
                  variant="outline" 
                  className="w-full text-red-500 hover:text-red-500"
                  onClick={handleLeaveGroup}
                  disabled={isLoading}
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Leave Group
                </Button>
              )}
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Members
                </CardTitle>
                {showInvite && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary"
                    onClick={() => setShowInviteOptions(!showInviteOptions)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                )}
              </div>
            </CardHeader>
            
            {/* Invite options section - toggled by the Invite button */}
            {showInviteOptions && showInvite && (
              <CardContent className="pb-0 pt-0 border-b border-muted mb-3">
                <div className="bg-muted/30 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Share2 className="h-4 w-4 mr-1 text-primary" />
                    Invite friends to this group
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1 px-2 py-1 text-xs"
                      onClick={handleSendSMS}
                    >
                      <Smartphone className="h-3 w-3" />
                      <span>Text</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1 px-2 py-1 text-xs"
                      onClick={handleSendWhatsApp}
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>WhatsApp</span>
                    </Button>
                    <a
                      href={getMailtoLink()}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded border-input bg-background hover:bg-muted transition-colors"
                      style={{ fontSize: '0.75rem', height: '2rem' }}
                    >
                      <Mail className="h-3 w-3" />
                      <span>Email</span>
                    </a>
                    {/* Instagram button: only show on mobile */}
                    {isMobile && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 px-2 py-1 text-xs"
                        onClick={handleSendInstagram}
                      >
                        <Instagram className="h-3 w-3" />
                        <span>Instagram</span>
                      </Button>
                    )}
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    onClick={copyInviteLink}
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Copy Invite Link
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Instagram does not allow prefilled messages. You'll need to paste the invite link manually after opening Instagram.
                  </p>
                </div>
              </CardContent>
            )}
            
            <CardContent className="space-y-2">
              {activeMembers.slice(0, 5).map((member) => (
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
                      <p className="text-xs text-muted-foreground flex items-center">
                        {member.role === 'owner' && <Sparkles className="h-3 w-3 mr-1 text-amber-500" />}
                        {member.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {activeMembers.length > 5 && (
                <Link href={`/groups/${group.id}/members`}>
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    View All Members
                  </Button>
                </Link>
              )}
              {activeMembers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Going solo? Invite your travel crew and start plotting your adventure together.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trips">Trips</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Ideas Board Callout with Gradient */}
              <div className="block">
                <div className="rounded-lg p-6 mb-4 relative overflow-hidden group transition-all hover:shadow-md cursor-pointer" onClick={goToIdeas}>
                  {/* Gradient background with blur */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="absolute inset-0 backdrop-blur-[1px] group-hover:backdrop-blur-[2px] transition-all"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                        Group Ideas Board
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-md">
                        Suggest destinations, vote on dates, and plan activities together.
                      </p>
                    </div>
                    <Button className="group-hover:translate-x-1 transition-transform" size="sm" onClick={goToIdeas}>
                      Go to Ideas
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Recent Trips</h3>
                {recentTrips.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recentTrips.map((groupTrip) => (
                      <Card key={groupTrip.trip_id}>
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
                ) : (
                  <div className="text-center py-8 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground mb-4">
                      Ready for takeoff! Add your first trip and turn those group chat dreams into actual plans.
                    </p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">About This Group</h3>
                  {isAdminOrOwner && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/groups/${group.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {group.description || 'No description provided.'}
                </p>
              </div>
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
          </Tabs>
        </div>
      </div>
      
      {/* Floating bottom bar for non-authenticated users */}
      {!membership && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 shadow-lg z-50">
          <div className="container max-w-6xl flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-base font-medium">Keep Your Group Plans on Track</h3>
              <p className="text-sm opacity-90">Sign up now to secure your trip details and invite your friends to plan unforgettable adventures together.</p>
            </div>
            <Link href={`/signup?redirectTo=/groups/${group.id}`}>
              <Button variant="secondary" size="sm" className="whitespace-nowrap">
                Sign Up <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
