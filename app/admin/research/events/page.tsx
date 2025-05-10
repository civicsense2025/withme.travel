'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES } from '@/utils/constants/database';
import { BarChart2, ArrowLeft, Search, Download, ExternalLink, Info, BellRing } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RESEARCH_EVENTS } from '@/utils/research';

// Define categories for events to organize them
const EVENT_CATEGORIES = {
  SESSION: 'Session & Navigation',
  USER_ACTION: 'User Actions',
  GROUP: 'Group & Social',
  TRIPS: 'Trips & Itineraries',
  RESEARCH: 'Research & Milestones',
  SYSTEM: 'System & Errors'
};

// Map events to categories for better organization
const EVENT_CATEGORY_MAP: Record<string, string> = {
  // Session events
  research_session_start: EVENT_CATEGORIES.SESSION,
  research_session_end: EVENT_CATEGORIES.SESSION,
  page_navigation: EVENT_CATEGORIES.SESSION,
  
  // Trip events
  create_trip: EVENT_CATEGORIES.TRIPS,
  edit_trip: EVENT_CATEGORIES.TRIPS,
  delete_trip: EVENT_CATEGORIES.TRIPS,
  add_trip_member: EVENT_CATEGORIES.TRIPS,
  remove_trip_member: EVENT_CATEGORIES.TRIPS,
  view_destination: EVENT_CATEGORIES.TRIPS,
  search_destination: EVENT_CATEGORIES.TRIPS,
  add_itinerary_item: EVENT_CATEGORIES.TRIPS,
  edit_itinerary_item: EVENT_CATEGORIES.TRIPS,
  delete_itinerary_item: EVENT_CATEGORIES.TRIPS,
  vote_itinerary_item: EVENT_CATEGORIES.TRIPS,
  add_budget_item: EVENT_CATEGORIES.TRIPS,
  edit_budget_item: EVENT_CATEGORIES.TRIPS,
  delete_budget_item: EVENT_CATEGORIES.TRIPS,
  
  // Group events
  create_group: EVENT_CATEGORIES.GROUP,
  join_group: EVENT_CATEGORIES.GROUP,
  leave_group: EVENT_CATEGORIES.GROUP,
  add_group_member: EVENT_CATEGORIES.GROUP,
  remove_group_member: EVENT_CATEGORIES.GROUP,
  create_group_plan_idea: EVENT_CATEGORIES.GROUP,
  edit_group_plan_idea: EVENT_CATEGORIES.GROUP,
  delete_group_plan_idea: EVENT_CATEGORIES.GROUP,
  vote_group_plan_idea: EVENT_CATEGORIES.GROUP,
  
  // Research events
  survey_shown: EVENT_CATEGORIES.RESEARCH,
  survey_completed: EVENT_CATEGORIES.RESEARCH,
  survey_skipped: EVENT_CATEGORIES.RESEARCH,
  survey_submission_error: EVENT_CATEGORIES.RESEARCH,
  complete_onboarding: EVENT_CATEGORIES.RESEARCH,
  itinerary_milestone_3_items: EVENT_CATEGORIES.RESEARCH,
  group_formation_complete: EVENT_CATEGORIES.RESEARCH,
  vote_process_used: EVENT_CATEGORIES.RESEARCH,
  trip_from_template_created: EVENT_CATEGORIES.RESEARCH,
  
  // Error events
  api_error: EVENT_CATEGORIES.SYSTEM,
  client_error: EVENT_CATEGORIES.SYSTEM,
};

// Event descriptions for tooltips and explanations
const EVENT_DESCRIPTIONS: Record<string, string> = {
  research_session_start: 'Fired when a research participant begins a session',
  research_session_end: 'Fired when a research participant ends a session',
  page_navigation: 'User navigated to a new page within the app',
  
  create_trip: 'User created a new trip',
  edit_trip: 'User edited trip details',
  delete_trip: 'User deleted a trip',
  add_trip_member: 'User added a member to a trip',
  remove_trip_member: 'User removed a member from a trip',
  
  view_destination: 'User viewed a destination profile',
  search_destination: 'User searched for a destination',
  
  add_itinerary_item: 'User added an item to an itinerary',
  edit_itinerary_item: 'User edited an itinerary item',
  delete_itinerary_item: 'User deleted an itinerary item',
  vote_itinerary_item: 'User voted on an itinerary item',
  
  add_budget_item: 'User added a budget item',
  edit_budget_item: 'User edited a budget item',
  delete_budget_item: 'User deleted a budget item',
  
  create_group: 'User created a new group',
  join_group: 'User joined a group',
  leave_group: 'User left a group',
  add_group_member: 'User added a member to a group',
  remove_group_member: 'User removed a member from a group',
  
  create_group_plan_idea: 'User created a new group plan idea',
  edit_group_plan_idea: 'User edited a group plan idea',
  delete_group_plan_idea: 'User deleted a group plan idea',
  vote_group_plan_idea: 'User voted on a group plan idea',
  
  survey_shown: 'A survey was displayed to a user',
  survey_completed: 'User completed a survey',
  survey_skipped: 'User skipped a survey',
  survey_submission_error: 'An error occurred while submitting a survey',
  
  complete_onboarding: 'User completed the onboarding flow',
  itinerary_milestone_3_items: 'User added 3+ items to an itinerary (milestone)',
  group_formation_complete: 'Group formation completed with multiple members',
  vote_process_used: 'User engaged with the voting process',
  trip_from_template_created: 'User created a trip from a template',
  
  api_error: 'An API error occurred',
  client_error: 'A client-side error occurred',
};

export default function EventsAdmin() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = getBrowserClient();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Check admin permissions and load events
  useEffect(() => {
    async function checkPermissions() {
      try {
        setIsLoading(true);
        
        // Check user login
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Check admin role
        const { data: profile, error: profileError } = await supabase
          .from(TABLES.PROFILES)
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (profileError || profile?.role !== 'admin') {
          router.push('/');
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to access this page.',
            variant: 'destructive',
          });
          return;
        }
        
        setIsAdmin(true);
        
        // Load events
        await loadEvents();
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkPermissions();
  }, [supabase, router, toast]);
  
  const loadEvents = async () => {
    try {
      const response = await fetch('/api/admin/research/events', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const eventData = await response.json();
      setEvents(eventData || []);
      
      // Get event counts from the database
      // This simulates counts for now - in a real implementation
      // you'd fetch actual event frequency from the database
      const mockCounts: Record<string, number> = {};
      eventData.forEach((event: string) => {
        mockCounts[event] = Math.floor(Math.random() * 500);
      });
      
      setEventCounts(mockCounts);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event data.',
        variant: 'destructive',
      });
    }
  };
  
  // Filter events based on search query and selected category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      EVENT_CATEGORY_MAP[event] === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Count events in each category
  const categoryCounts = Object.values(EVENT_CATEGORIES).reduce((acc, category) => {
    acc[category] = events.filter(event => EVENT_CATEGORY_MAP[event] === category).length;
    return acc;
  }, {} as Record<string, number>);
  
  // Get list of constant events from RESEARCH_EVENTS
  const constantEvents = [
    RESEARCH_EVENTS.SESSION_START,
    RESEARCH_EVENTS.SESSION_END,
    RESEARCH_EVENTS.PAGE_NAVIGATION,
    RESEARCH_EVENTS.CREATE_TRIP,
    RESEARCH_EVENTS.EDIT_TRIP,
    RESEARCH_EVENTS.DELETE_TRIP,
    RESEARCH_EVENTS.ADD_TRIP_MEMBER,
    RESEARCH_EVENTS.REMOVE_TRIP_MEMBER,
    RESEARCH_EVENTS.VIEW_DESTINATION,
    RESEARCH_EVENTS.SEARCH_DESTINATION,
    RESEARCH_EVENTS.ADD_ITINERARY_ITEM,
    RESEARCH_EVENTS.EDIT_ITINERARY_ITEM,
    RESEARCH_EVENTS.DELETE_ITINERARY_ITEM,
    RESEARCH_EVENTS.VOTE_ITINERARY_ITEM,
    RESEARCH_EVENTS.ADD_BUDGET_ITEM,
    RESEARCH_EVENTS.EDIT_BUDGET_ITEM,
    RESEARCH_EVENTS.DELETE_BUDGET_ITEM,
    RESEARCH_EVENTS.CREATE_GROUP,
    RESEARCH_EVENTS.JOIN_GROUP,
    RESEARCH_EVENTS.LEAVE_GROUP,
    RESEARCH_EVENTS.ADD_GROUP_MEMBER,
    RESEARCH_EVENTS.REMOVE_GROUP_MEMBER,
    RESEARCH_EVENTS.CREATE_GROUP_PLAN_IDEA,
    RESEARCH_EVENTS.EDIT_GROUP_PLAN_IDEA,
    RESEARCH_EVENTS.DELETE_GROUP_PLAN_IDEA,
    RESEARCH_EVENTS.VOTE_GROUP_PLAN_IDEA,
    RESEARCH_EVENTS.SURVEY_SHOWN,
    RESEARCH_EVENTS.SURVEY_COMPLETED,
    RESEARCH_EVENTS.SURVEY_SKIPPED,
    RESEARCH_EVENTS.SURVEY_SUBMISSION_ERROR,
    RESEARCH_EVENTS.API_ERROR,
    RESEARCH_EVENTS.CLIENT_ERROR,
    RESEARCH_EVENTS.OPEN_MAP,
    RESEARCH_EVENTS.USE_FILTER,
    RESEARCH_EVENTS.SHARE_LINK,
    RESEARCH_EVENTS.EXPORT_CALENDAR,
    RESEARCH_EVENTS.CUSTOM_EVENT,
    RESEARCH_EVENTS.IDENTIFY_USER,
    RESEARCH_EVENTS.METADATA_UPDATE,
    RESEARCH_EVENTS.COMPLETE_ONBOARDING,
    RESEARCH_EVENTS.ITINERARY_MILESTONE_3_ITEMS,
    RESEARCH_EVENTS.GROUP_FORMATION_COMPLETE,
    RESEARCH_EVENTS.VOTE_PROCESS_USED,
    RESEARCH_EVENTS.TRIP_FROM_TEMPLATE_CREATED
  ];
  
  // Helper function to check if an event is a constant event
  const isConstantEvent = (eventName: string): boolean => {
    return constantEvents.includes(eventName as any);  // Type assertion to avoid linter errors
  };
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" onClick={() => router.push('/admin/research')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Research Dashboard
        </Button>
        
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/research/triggers">
              <BellRing className="mr-2 h-4 w-4" />
              Manage Triggers
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Event Tracking</h1>
        <div className="flex items-center space-x-2 w-1/3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
      
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>About Event Tracking</AlertTitle>
        <AlertDescription>
          These events are tracked across the platform and can be used to trigger surveys, create 
          user segments, and analyze user behavior. You can use these event names in research 
          triggers to show surveys at specific moments in the user journey.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            All Events ({events.length})
          </TabsTrigger>
          {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
            <TabsTrigger key={key} value={category}>
              {category} ({categoryCounts[category] || 0})
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Tracking Events</CardTitle>
              <CardDescription>
                Complete list of events tracked across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Frequency</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No matching events found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((event) => (
                      <TableRow key={event}>
                        <TableCell className="font-mono text-sm">
                          {event}
                          {isConstantEvent(event) && (
                            <Badge variant="outline" className="ml-2">Constant</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {EVENT_CATEGORY_MAP[event] || 'Uncategorized'}
                          </Badge>
                        </TableCell>
                        <TableCell>{EVENT_DESCRIPTIONS[event] || 'No description available'}</TableCell>
                        <TableCell className="text-right">{eventCounts[event] || 0}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/research/triggers?event=${encodeURIComponent(event)}`}>
                              Create Trigger
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} of {events.length} events
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Events
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
          <TabsContent key={key} value={category} className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{category} Events</CardTitle>
                <CardDescription>
                  Events related to {category.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Frequency</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No matching events found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEvents.map((event) => (
                        <TableRow key={event}>
                          <TableCell className="font-mono text-sm">
                            {event}
                            {isConstantEvent(event) && (
                              <Badge variant="outline" className="ml-2">Constant</Badge>
                            )}
                          </TableCell>
                          <TableCell>{EVENT_DESCRIPTIONS[event] || 'No description available'}</TableCell>
                          <TableCell className="text-right">{eventCounts[event] || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/research/triggers?event=${encodeURIComponent(event)}`}>
                                Create Trigger
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Using Events with Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Events can be used to trigger surveys and other research activities. When setting up a 
              trigger, you'll select an event name from this list to determine when the trigger should fire.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Select an event that represents a key moment in your user's journey</li>
              <li>Set an appropriate delay to ensure the user isn't interrupted too early</li>
              <li>Limit the maximum number of times a trigger can fire for each user</li>
              <li>Associate the trigger with a specific survey or research activity</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/research/triggers">
                Set Up Triggers
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Custom Event Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              While we track many events automatically, you can also track custom events for your 
              specific research needs. To track a custom event, you'll need to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Define the event name in your code</li>
              <li>Call the track function with the event name and any additional data</li>
              <li>The event will appear in this list after it's been tracked at least once</li>
            </ul>
            <div className="bg-muted p-3 rounded-md mt-4">
              <pre className="font-mono text-xs whitespace-pre-wrap">
{`// Example custom event tracking
trackResearchEvent({
  participant_id: participantId,
  event_name: 'custom_feature_interaction',
  metadata: {
    feature: 'map_view',
    action: 'filter_applied'
  }
});`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 