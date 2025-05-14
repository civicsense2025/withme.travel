'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Group, GroupMember, GroupTrip } from '@/types/groups';
import {
  Users,
  User,
  MapPin,
  Calendar,
  Plus,
  Settings,
  Edit,
  TrashIcon,
  UserPlus,
  Share2,
  MessageSquare,
  Lightbulb,
  ChevronRight,
  Sparkles,
  Mail,
  Smartphone,
  Instagram,
  LogIn,
  ArrowRight,
  Pencil,
  User as UserIcon,
  MoreVertical,
  Loader2,
  PlusCircle,
  MoreHorizontal,
  Copy,
  Filter,
  Search,
  X,
  CalendarPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import InviteLinkBox from '../components/InviteLinkBox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Container } from '@/components/container';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { GroupSettingsModal } from '../components/group-settings-modal';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ENUMS } from '@/utils/constants/database';
import { useToast } from '@/components/ui/use-toast';
import { useResearchTracking } from '@/hooks/use-research-tracking';

interface GroupDetailClientProps {
  group: Group;
  membership: GroupMember | null;
  recentTrips: GroupTrip[];
  isAuthenticated: boolean;
  guestToken?: string | null;
}

const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-background">
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
};

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
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null);
  const [newIdeaOpen, setNewIdeaOpen] = useState(false);
  const [hasShownMilestone, setHasShownMilestone] = useState(false);
  interface IdeaData {
    title: string;
    description: string;
    type: string;
    plan_id: string | null;
  }
  const [newIdeaData, setNewIdeaData] = useState<IdeaData>({
    title: '',
    description: '',
    type: 'DESTINATION',
    plan_id: null,
  });
  const [newPlanData, setNewPlanData] = useState({
    name: '',
    description: '',
  });
  const { toast } = useToast();
  const { trackEvent } = useResearchTracking();

  // Compose the full member list: active members, creator, guest
  const fullMembers = useMemo(() => {
    let members = group.group_members?.filter((member) => member.status === 'active') || [];

    // Add creator if not already in members
    if (
      (group.created_by_profile as NonNullable<typeof group.created_by_profile>)?.id &&
      !members.some((m) => m.user_id === group.created_by_profile?.id)
    ) {
      members = [
        ...members,
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
      members = [
        ...members,
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
    return Array.from(new Map(members.map((m) => [m.user_id, m])).values());
  }, [group, guestToken]);

  // Check if we've already displayed the milestone for this group
  useEffect(() => {
    const key = `research_milestone_group_${group.id}`;
    const hasShown = localStorage.getItem(key) === 'true';
    setHasShownMilestone(hasShown);

    // If there are 2+ members and we haven't shown the milestone yet, mark it as shown
    if (fullMembers.length >= 2 && !hasShown) {
      localStorage.setItem(key, 'true');
      setHasShownMilestone(true);
    }
  }, [group.id, fullMembers.length]);

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
        setPlans(data.data || []);
      } catch (err: any) {
        console.error('Error fetching plans:', err);
        setPlansError('Unable to load plans at this time');
      } finally {
        setPlansLoading(false);
      }
    }
    fetchPlans();
  }, [group.id]);

  // Check if current user is an admin or owner
  const isAdminOrOwner = membership
    ? membership.role === 'owner' || membership.role === 'admin'
    : false;

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
    const message = encodeURIComponent(
      `Join our group on WithMe.Travel: ${window.location.origin}/groups/${group.id}/join`
    );
    window.location.href = `sms:?body=${message}`;
  };

  // WhatsApp handling
  const handleSendWhatsApp = () => {
    const message = encodeURIComponent(
      `Join our group on WithMe.Travel: ${window.location.origin}/groups/${group.id}/join`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener');
  };

  // Fix the window not defined error by creating a safer version of getMailtoLink
  const getMailtoLink = () => {
    // Use a base URL that works on server and client
    const baseUrl =
      typeof window !== 'undefined' ? window.location.origin : 'https://withme.travel';
    const message = `Join our group on WithMe.Travel: ${baseUrl}/groups/${group.id}/join`;
    return `mailto:?subject=Join our group on WithMe.Travel&body=${encodeURIComponent(message)}`;
  };

  // Instagram handling
  const handleSendInstagram = () => {
    const isMobile =
      typeof window !== 'undefined' && /Mobi|Android/i.test(window.navigator.userAgent);
    if (isMobile) {
      window.location.href = 'instagram://direct-inbox';
    } else {
      alert('Open this page on your phone to DM on Instagram, or copy the invite link below.');
    }
  };

  // Same for copyInviteLink
  const copyInviteLink = async () => {
    const baseUrl =
      typeof window !== 'undefined' ? window.location.origin : 'https://withme.travel';
    const url = `${baseUrl}/groups/${group.id}/join`;

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

  // Fetch ideas for this group
  useEffect(() => {
    async function fetchIdeas() {
      setIdeasLoading(true);
      setIdeasError(null);
      try {
        const res = await fetch(`/api/groups/${group.id}/ideas`);
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setIdeas([]);
            return;
          }
          throw new Error('Failed to fetch ideas');
        }
        const data = await res.json();
        setIdeas(data.data || []);
      } catch (err: any) {
        console.error('Error fetching ideas:', err);
        setIdeasError('Unable to load ideas at this time');
      } finally {
        setIdeasLoading(false);
      }
    }

    if (activeTab === 'ideas') {
      fetchIdeas();
    }
  }, [group.id, activeTab]);

  // Handle adding a new plan
  const handleAddPlan = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`/api/groups/${group.id}/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPlanData.name || `New Plan (${new Date().toLocaleDateString()})`,
          description: newPlanData.description || '',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create plan');
      }

      // Track successful plan creation
      try {
        await trackEvent('group_plan_created', {
          groupId: group.id, 
          planId: data.plan?.id || 'unknown',
          planName: newPlanData.name || `New Plan (${new Date().toLocaleDateString()})`,
          hasDescription: !!newPlanData.description,
          groupName: group.name,
          memberCount: fullMembers.length || 0,
          source: 'group-detail',
          route: `/groups/${group.id}`,
          component: 'GroupDetailClient'
        });
      } catch (trackingError) {
        // Don't let tracking failures affect user experience
        console.error('Failed to track group_plan_created event:', trackingError);
      }

      // Refresh plans list
      const plansRes = await fetch(`/api/groups/${group.id}/plans`);
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData.data || []);
      }

      // Reset form
      setNewPlanData({ name: '', description: '' });

      toast({
        title: 'Success',
        description: 'Plan created successfully',
      });

      // Navigate to the new plan using plan.id instead of slug
      if (data.plan && data.plan.id) {
        router.push(`/groups/${group.id}/plans/${data.plan.id}`);
      } else {
        // If for some reason we don't have the plan ID, just refresh the current page
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create plan. Please try again.',
        variant: 'destructive',
      });

      // Optional: Track failed plan creation for UX analysis
      try {
        await trackEvent('group_plan_creation_failed', {
          groupId: group.id,
          planName: newPlanData.name || `New Plan (${new Date().toLocaleDateString()})`,
          error: error instanceof Error ? error.message : 'Unknown error',
          source: 'group-detail',
          route: `/groups/${group.id}`,
          component: 'GroupDetailClient'
        });
      } catch (trackingError) {
        console.error('Failed to track group_plan_creation_failed event:', trackingError);
      }
    } finally {
      setIsLoading(false);
      setShowAddPlan(false);
    }
  };

  // Handle adding a new idea
  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const res = await fetch(`/api/groups/${group.id}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIdeaData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create idea');
      }

      // Refresh ideas
      const ideasRes = await fetch(`/api/groups/${group.id}/ideas`);
      if (ideasRes.ok) {
        const data = await ideasRes.json();
        setIdeas(data.data || []);
      }

      // Reset form
      setNewIdeaData({ title: '', description: '', type: 'DESTINATION', plan_id: null });
      setNewIdeaOpen(false);

      toast({
        title: 'Success',
        description: 'Idea added successfully',
      });
    } catch (error) {
      console.error('Error creating idea:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to add idea. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter ideas based on search query and filters
  const filteredIdeas = ideas.filter((idea) => {
    // Filter by search query
    if (
      searchQuery &&
      !idea.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !idea.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by plan
    if (selectedPlanFilter && idea.plan_id !== selectedPlanFilter) {
      return false;
    }

    // Filter by type
    if (selectedTypeFilter && idea.type !== selectedTypeFilter) {
      return false;
    }

    return true;
  });

  // Get unique values for filters
  const uniquePlans = [...new Set(ideas.map((idea) => idea.plan_id))].filter(Boolean);
  const uniqueTypes = [...new Set(ideas.map((idea) => idea.type))].filter(Boolean);

  // Get plan name by ID
  const getPlanName = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    return plan ? plan.name : 'Unknown Plan';
  };

  return (
    <Container size="wide">
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push('/groups')} className="mr-2">
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Back to Groups
            </Button>
          </div>
          {isAdminOrOwner && (
            <Button onClick={() => setEditGroupOpen(true)} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Group
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{group.name}</CardTitle>
                    <CardDescription>Created {formatDate(group.created_at)}</CardDescription>
                    <div>
                      <br />
                      <p className="text-muted-foreground">
                        {group.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setInviteDialogOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite People
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/trips/create?groupId=${group.id}`)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add trip
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('ideas')}>
                        <Lightbulb className="h-4 w-4 mr-2" />
                        View Ideas
                      </DropdownMenuItem>
                      {isAdminOrOwner && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setEditGroupOpen(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Group
                          </DropdownMenuItem>
                        </>
                      )}
                      {membership && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLeaveGroup} className="text-red-500">
                            <LogIn className="h-4 w-4 mr-2 rotate-180" />
                            Leave Group
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter></CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Members</CardTitle>
                  <Button onClick={() => setInviteDialogOpen(true)} variant="ghost" size="sm">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fullMembers.map((member) => (
                    <div key={member.user_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user?.avatar_url ?? ''} />
                          <AvatarFallback>
                            {member.user?.full_name?.[0] || member.user?.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {member.user?.full_name || member.user?.username || 'Unnamed User'}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ideas">Ideas</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div></div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Recent Trips</h2>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/trips/create?groupId=${group.id}`)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Trip
                    </Button>
                  </div>
                  <div>
                    {recentTrips && recentTrips.length > 0 ? (
                      <div className="space-y-4">
                        {recentTrips.map((gt) => (
                          <Link href={`/trips/${gt.trip?.id}`} key={gt.trip?.id}>
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="w-12 h-12 rounded-md overflow-hidden relative flex-shrink-0">
                                {gt.trip?.destination?.image_url ? (
                                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 relative">
                                    <img
                                      src={gt.trip.destination.image_url}
                                      alt={gt.trip.destination.name || 'Trip destination'}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                    <MapPin className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{gt.trip?.name}</h4>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                  {gt.trip?.start_date ? (
                                    <span className="truncate">
                                      {formatDate(gt.trip.start_date)}
                                      {gt.trip.end_date && ` - ${formatDate(gt.trip.end_date)}`}
                                    </span>
                                  ) : (
                                    <span>No dates set</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 border border-dashed rounded-lg">
                        <CalendarPlus className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">Plan a trip together</h3>
                        <p className="text-muted-foreground mb-4">
                          Create a trip to collaborate on destinations, dates, and activities with
                          your group.
                        </p>
                        <Button onClick={() => router.push(`/trips/create?groupId=${group.id}`)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Trip
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Recent Plans</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddPlan}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isLoading ? 'Creating...' : 'Add Plan'}
                    </Button>
                  </div>
                  <div>
                    {plansLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : plansError ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>{plansError}</p>
                      </div>
                    ) : plans && plans.length > 0 ? (
                      <div className="space-y-4">
                        {plans.map((plan) => (
                          <Link href={`/groups/${group.id}/plans/${plan.id}`} key={plan.id}>
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="w-12 h-12 rounded-md overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Lightbulb className="h-6 w-6 text-primary/70" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{plan.name}</h4>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">
                                    Created {formatDate(plan.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="No plans yet"
                        description="Create your first plan to organize ideas"
                        action={
                          <Button onClick={handleAddPlan} disabled={isLoading}>
                            <Plus className="h-4 w-4 mr-2" />
                            {isLoading ? 'Creating...' : 'Create Plan'}
                          </Button>
                        }
                      />
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ideas">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                    <h2 className="text-xl font-semibold">Group Ideas</h2>
                    <Button onClick={() => setNewIdeaOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Idea
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-auto flex-1">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search ideas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-full"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                          onClick={() => setSearchQuery('')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="w-full sm:w-auto">
                      <Select
                        value={selectedPlanFilter === null ? 'all_plans' : selectedPlanFilter}
                        onValueChange={(value) =>
                          setSelectedPlanFilter(value === 'all_plans' ? null : value)
                        }
                      >
                        <SelectTrigger className="min-w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all_plans">All plans</SelectItem>
                          <SelectItem value="null">Unassigned</SelectItem>
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full sm:w-auto">
                      <Select
                        value={selectedTypeFilter === null ? 'all_types' : selectedTypeFilter}
                        onValueChange={(value) =>
                          setSelectedTypeFilter(value === 'all_types' ? null : value)
                        }
                      >
                        <SelectTrigger className="min-w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all_types">All types</SelectItem>
                          <SelectItem value="DESTINATION">Destination</SelectItem>
                          <SelectItem value="DATE">Date</SelectItem>
                          <SelectItem value="ACTIVITY">Activity</SelectItem>
                          <SelectItem value="BUDGET">Budget</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(searchQuery || selectedPlanFilter || selectedTypeFilter) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {searchQuery && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          Search: {searchQuery}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 p-0"
                            onClick={() => setSearchQuery('')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}

                      {selectedPlanFilter && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          Plan:{' '}
                          {selectedPlanFilter === 'null'
                            ? 'Unassigned'
                            : getPlanName(selectedPlanFilter)}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 p-0"
                            onClick={() => setSelectedPlanFilter(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}

                      {selectedTypeFilter && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          Type:{' '}
                          {selectedTypeFilter.charAt(0) + selectedTypeFilter.slice(1).toLowerCase()}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 p-0"
                            onClick={() => setSelectedTypeFilter(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedPlanFilter(null);
                          setSelectedTypeFilter(null);
                        }}
                      >
                        Clear all
                      </Button>
                    </div>
                  )}

                  {ideasLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : ideasError ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>{ideasError}</p>
                    </div>
                  ) : filteredIdeas.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Votes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredIdeas.map((idea) => (
                            <TableRow key={idea.id}>
                              <TableCell className="font-medium">{idea.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {idea.type.charAt(0) + idea.type.slice(1).toLowerCase()}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {idea.plan_id ? (
                                  <Link href={`/groups/${group.id}/plans/${idea.plan_id}`}>
                                    <span className="text-primary hover:underline">
                                      {getPlanName(idea.plan_id)}
                                    </span>
                                  </Link>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Unassigned</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(idea.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                  >
                                    +{idea.votes_up || 0}
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                  >
                                    -{idea.votes_down || 0}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {idea.plan_id ? (
                                      <DropdownMenuItem asChild>
                                        <Link href={`/groups/${group.id}/plans/${idea.plan_id}`}>
                                          View in Plan
                                        </Link>
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem>Assign to Plan</DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <EmptyState
                      title="No ideas found"
                      description={
                        searchQuery || selectedPlanFilter || selectedTypeFilter
                          ? 'Try adjusting your filters'
                          : 'Add your first idea to get started'
                      }
                      action={
                        <Button onClick={() => setNewIdeaOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Idea
                        </Button>
                      }
                    />
                  )}
                </div>

                <Dialog open={newIdeaOpen} onOpenChange={setNewIdeaOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Idea</DialogTitle>
                      <DialogDescription>
                        Add a new idea to your group. You can assign it to a specific plan or keep
                        it unassigned.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddIdea} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newIdeaData.title}
                          onChange={(e) =>
                            setNewIdeaData({ ...newIdeaData, title: e.target.value })
                          }
                          placeholder="Enter idea title"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                          id="description"
                          value={newIdeaData.description}
                          onChange={(e) =>
                            setNewIdeaData({ ...newIdeaData, description: e.target.value })
                          }
                          placeholder="Describe your idea..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={newIdeaData.type}
                          onValueChange={(value) => setNewIdeaData({ ...newIdeaData, type: value })}
                        >
                          <SelectTrigger id="type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DESTINATION">Destination</SelectItem>
                            <SelectItem value="DATE">Date</SelectItem>
                            <SelectItem value="ACTIVITY">Activity</SelectItem>
                            <SelectItem value="BUDGET">Budget</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="plan">Plan (optional)</Label>
                        <Select
                          value={newIdeaData.plan_id === null ? 'none' : newIdeaData.plan_id}
                          onValueChange={(value) => {
                            const updatedData = {
                              ...newIdeaData,
                              plan_id: value === 'none' ? null : value,
                            };
                            setNewIdeaData(updatedData);
                          }}
                        >
                          <SelectTrigger id="plan">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No plan / Unassigned</SelectItem>
                            {plans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Idea'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="members">{/* ... existing members content ... */}</TabsContent>
            </Tabs>
          </div>
        </div>

        <GroupSettingsModal group={group} isOpen={editGroupOpen} onOpenChange={setEditGroupOpen} />
      </div>
    </Container>
  );
}
