'use client';
// Comment out the missing import until it's available
// import { FocusSession } from '@/components/presence/focus-session';
import { PresenceProvider } from '@/components/presence/presence-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FocusSessionProvider } from '@/contexts/focus-session-context';
import { Todo } from '@/components/Todo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Grid2X2,
  Box,
  LayoutGrid,
  SquareStack,
  MapPin,
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShareTripButton } from '@/components/trips/ShareTripButton';
import { DestinationCard } from '@/components/destination-card';
import { CityBubbles } from '@/components/city-bubbles';
import { EmptyTrips } from '@/components/empty-trips';
import { TripCard } from '@/components/trip-card';
import { ActivityTimeline } from '@/components/trips/activity-timeline';
import { TripVoting } from '@/components/trips/TripVoting';
import { PlaylistEmbed } from '@/components/trips/PlaylistEmbed';
import { LikeButton } from '@/components/like-button';
import { LocationSearch } from '@/components/location-search';
import { PageHeader } from '@/components/page-header';

import { TRIP_ROLES, ITEM_STATUSES, type ItemStatus, PERMISSION_STATUSES } from '@/utils/constants/status';
import { TripWithMemberInfo } from '@/utils/types';

import React from 'react';
// NOTE: These imports are intentionally disabled to prevent build errors while keeping the modules in the codebase
// ;

// import FocusSessionExample from '@/components/trips/components/FocusSessionExample';
import Image from 'next/image';

// Import custom components
// NOTE: These imports are intentionally disabled to prevent build errors
// import TripPresenceIndicator from '@/components/trips/trip-presence-indicator';
import TravelTracker from '@/components/TravelTracker';
type TravelTrackerComponent = typeof TravelTracker;

// Example todo items - same as in the todo-example page
const todoItems = [
  {
    id: '1',
    title: 'Plan itinerary for trip to Japan',
    description:
      'Research attractions, accommodations, and transportation options for a 7-day trip to Tokyo and Kyoto.',
    status: PERMISSION_STATUSES.PENDING as unknown as ItemStatus,
    dueDate: '2023-11-15',
    priority: 'high' as const,
    votes: {
      up: 4,
      down: 1,
      upVoters: [
        { id: 'user1', name: 'Alex Johnson', avatar_url: null, username: 'alexj' },
        { id: 'user2', name: 'Maria Garcia', avatar_url: null, username: 'mariagarcia' },
        { id: 'user3', name: 'John Smith', avatar_url: null, username: 'johnsmith' },
        { id: 'user4', name: 'Sarah Lee', avatar_url: null, username: 'sarahlee' },
      ],
      downVoters: [{ id: 'user5', name: 'David Wilson', avatar_url: null, username: 'dwilson' }],
      userVote: 'up' as const,
    },
  },
  {
    id: '2',
    title: 'Book flights for winter vacation',
    description: 'Compare airline prices and select seats for the trip to Europe in December.',
    status: PERMISSION_STATUSES.APPROVED as unknown as ItemStatus,
    dueDate: '2023-10-01',
    priority: 'medium' as const,
    votes: {
      up: 3,
      down: 0,
      upVoters: [
        { id: 'user1', name: 'Alex Johnson', avatar_url: null, username: 'alexj' },
        { id: 'user3', name: 'John Smith', avatar_url: null, username: 'johnsmith' },
        { id: 'user4', name: 'Sarah Lee', avatar_url: null, username: 'sarahlee' },
      ],
      downVoters: [],
      userVote: null,
    },
  },
  {
    id: '3',
    title: 'Research restaurants for Barcelona trip',
    description: 'Find popular local restaurants and make reservations for our stay in Barcelona.',
    status: PERMISSION_STATUSES.PENDING as unknown as ItemStatus,
    dueDate: '2023-11-20',
    priority: 'low' as const,
    votes: {
      up: 2,
      down: 1,
      upVoters: [
        { id: 'user2', name: 'Maria Garcia', avatar_url: null, username: 'mariagarcia' },
        { id: 'user4', name: 'Sarah Lee', avatar_url: null, username: 'sarahlee' },
      ],
      downVoters: [{ id: 'user5', name: 'David Wilson', avatar_url: null, username: 'dwilson' }],
      userVote: 'down' as const,
    },
  },
];

// Sample data for components
const tripSample = {
  id: 'trip-123',
  name: 'Summer in Greece',
  description: 'Exploring Athens and the islands',
  start_date: '2023-08-10',
  end_date: '2023-08-20',
  cover_image_url: '/design-sandbox/athens.jpg',
  created_by: 'user-123',
  is_public: true,
  destination_name: 'Athens, Greece',
  role: 'admin',
  member_count: 3,
  slug: 'summer-in-greece',
  public_slug: 'summer-in-greece',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as TripWithMemberInfo;

const destinationSample = {
  id: 'dest-123',
  city: 'Athens',
  country: 'Greece',
  continent: 'Europe',
  description: 'Historic city with ancient ruins and vibrant culture.',
  byline: null,
  highlights: [],
  image_url: '/design-sandbox/athens.jpg',
  emoji: '🏛️',
  cuisine_rating: 4,
  nightlife_rating: 3,
  cultural_attractions: 5,
  outdoor_activities: 4,
  beach_quality: 2,
  avg_cost_per_day: 100,
  safety_rating: 4,
}

const popularCities = [
  { id: '1', name: 'Paris', country: 'France', count: 342 },
  { id: '2', name: 'Tokyo', country: 'Japan', count: 278 },
  { id: '3', name: 'Barcelona', country: 'Spain', count: 215 },
  { id: '4', name: 'New York', country: 'USA', count: 312 },
];

// Define TripRole type
type TripRole = keyof typeof TRIP_ROLES;

export default function DesignSandboxClient() {
  return (
    <div className="container py-10 space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Design Sandbox</CardTitle>
          <CardDescription>A playground to test and demonstrate UI components</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="styleguide" className="w-full">
            <div className="relative w-full overflow-auto">
              <TabsList className="inline-flex w-max border-b px-0 mb-2">
                <TabsTrigger value="styleguide">Style Guide</TabsTrigger>
                <TabsTrigger value="structure">Structure & Layout</TabsTrigger>
                <TabsTrigger value="todo">Todo Component</TabsTrigger>
                <TabsTrigger value="collaborative">Collaborative Features</TabsTrigger>
                <TabsTrigger value="focus">Focus Sessions</TabsTrigger>
                <TabsTrigger value="trip">Trip Components</TabsTrigger>
                <TabsTrigger value="custom">Custom Components</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="styleguide" className="space-y-12 mt-6">
              {/* Typography Section */}
              <section id="typography">
                <h2 className="text-2xl font-bold mb-4">Typography</h2>
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <h1 className="text-4xl font-extrabold mb-2">Heading 1</h1>
                      <h2 className="text-3xl font-bold mb-2">Heading 2</h2>
                      <h3 className="text-2xl font-semibold mb-2">Heading 3</h3>
                      <h4 className="text-xl font-semibold mb-2">Heading 4</h4>
                      <h5 className="text-lg font-medium mb-2">Heading 5</h5>
                      <h6 className="text-base font-medium mb-4">Heading 6</h6>

                      <p className="text-lg mb-2">Large paragraph text for important content.</p>
                      <p className="mb-2">Standard paragraph text for most content on the site.</p>
                      <p className="text-sm mb-2">Small text for less important information.</p>
                      <p className="text-xs">Extra small text for legal and footnotes.</p>
                    </div>

                    <div>
                      <p className="font-bold">Bold text for emphasis</p>
                      <p className="font-semibold">Semi-bold text for medium emphasis</p>
                      <p className="italic">Italic text for quotes or emphasis</p>
                      <p className="underline">Underlined text for links</p>
                      <p className="text-muted-foreground">Muted text for secondary content</p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Colors Section */}
              <section id="colors">
                <h2 className="text-2xl font-bold mb-4">Color System</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="p-6 bg-primary rounded-md text-primary-foreground font-medium">
                    Primary
                  </div>
                  <div className="p-6 bg-secondary rounded-md text-secondary-foreground font-medium">
                    Secondary
                  </div>
                  <div className="p-6 bg-accent rounded-md text-accent-foreground font-medium">
                    Accent
                  </div>
                  <div className="p-6 bg-muted rounded-md text-muted-foreground font-medium">
                    Muted
                  </div>
                  <div className="p-6 bg-destructive rounded-md text-destructive-foreground font-medium">
                    Destructive
                  </div>
                  <div className="p-6 bg-popover rounded-md text-popover-foreground font-medium">
                    Popover
                  </div>
                  <div className="p-6 bg-card rounded-md text-card-foreground font-medium border">
                    Card
                  </div>
                  <div className="p-6 bg-background rounded-md text-foreground font-medium border">
                    Background
                  </div>
                </div>
              </section>

              {/* Buttons Section */}
              <section id="buttons">
                <h2 className="text-2xl font-bold mb-4">Buttons</h2>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-3">Button Variants</h3>
                    <div className="flex flex-wrap gap-4 mb-6">
                      <Button variant="default">Default</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                    </div>

                    <h3 className="text-lg font-semibold mb-3">Button Sizes</h3>
                    <div className="flex flex-wrap gap-4 mb-6 items-center">
                      <Button size="lg">Large</Button>
                      <Button>Default</Button>
                      <Button size="sm">Small</Button>
                    </div>

                    <h3 className="text-lg font-semibold mb-3">Button States</h3>
                    <div className="flex flex-wrap gap-4 items-center">
                      <Button>Active</Button>
                      <Button disabled>Disabled</Button>
                      <Button
                        variant="outline"
                        className="hover:bg-primary hover:text-primary-foreground"
                      >
                        Hover (Outline)
                      </Button>
                      <Button className="animate-pulse">Animating</Button>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Form Elements Section */}
              <section id="form-elements">
                <h2 className="text-2xl font-bold mb-4">Form Elements</h2>
                <Card>
                  <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Input Fields</h3>
                      <div className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            type="email"
                            id="email"
                            placeholder="Email address"
                            className="max-w-sm"
                          />
                        </div>

                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            type="password"
                            id="password"
                            placeholder="Password"
                            className="max-w-sm"
                          />
                        </div>

                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="disabled">Disabled Input</Label>
                          <Input
                            type="text"
                            id="disabled"
                            disabled
                            placeholder="Disabled"
                            className="max-w-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Textarea</h3>
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="message">Message</Label>
                        <Textarea placeholder="Type your message here." id="message" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Checkbox & Radio</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="terms" />
                          <Label htmlFor="terms">Accept terms and conditions</Label>
                        </div>

                        <RadioGroup defaultValue="option-one">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="option-one" id="option-one" />
                            <Label htmlFor="option-one">Option One</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="option-two" id="option-two" />
                            <Label htmlFor="option-two">Option Two</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Switch & Slider</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="airplane-mode" />
                          <Label htmlFor="airplane-mode">Airplane Mode</Label>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="slider">Volume</Label>
                          <Slider
                            defaultValue={[50]}
                            max={100}
                            step={1}
                            id="slider"
                            className="max-w-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Select</h3>
                      <div className="space-y-4">
                        <Select>
                          <SelectTrigger className="max-w-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="ca">Canada</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="au">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Data Display Section */}
              <section id="data-display">
                <h2 className="text-2xl font-bold mb-4">Data Display Components</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Badges */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Badges</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                    </CardContent>
                  </Card>

                  {/* Avatars */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Avatars</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <Avatar className="bg-primary text-primary-foreground">
                        <AvatarFallback>TR</AvatarFallback>
                      </Avatar>
                    </CardContent>
                  </Card>

                  {/* Alerts */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Information</AlertTitle>
                        <AlertDescription>
                          This is an informational alert with default styling.
                        </AlertDescription>
                      </Alert>
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>This is a destructive alert for errors.</AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  {/* Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tables</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableCaption>A list of recent invoices</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>INV001</TableCell>
                            <TableCell>Paid</TableCell>
                            <TableCell className="text-right">$250.00</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>INV002</TableCell>
                            <TableCell>Pending</TableCell>
                            <TableCell className="text-right">$150.00</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Interactive Components */}
              <section id="interactive-components">
                <h2 className="text-2xl font-bold mb-4">Interactive Components</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Accordions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Accordion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>Is it accessible?</AccordionTrigger>
                          <AccordionContent>
                            Yes. It adheres to the WAI-ARIA design pattern.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger>Is it styled?</AccordionTrigger>
                          <AccordionContent>
                            Yes. It comes with default styles that match the other components.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>

                  {/* Dialog / Modal */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dialog (Modal)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Dialog>
                        <DialogTrigger>
                          <Button>Open Dialog</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Example Dialog</DialogTitle>
                            <DialogDescription>
                              This is a dialog component for modal interactions.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <p>
                              This is the dialog content where you can add any React components.
                            </p>
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline">
                              Cancel
                            </Button>
                            <Button type="button">Continue</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="structure" className="space-y-12 mt-6">
              {/* Grid Layout Section */}
              <section id="grid-layouts">
                <h2 className="text-2xl font-bold mb-4">Grid Layouts</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Grid</CardTitle>
                    <CardDescription>
                      Responsive grid layouts using Tailwind CSS grid classes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Basic 2-Column Grid</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="bg-muted p-4 rounded-md flex items-center justify-center"
                          >
                            <Grid2X2 className="mr-2 h-4 w-4" /> Grid Item {i}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Responsive Grid</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="bg-muted p-4 rounded-md flex items-center justify-center"
                          >
                            <Box className="mr-2 h-4 w-4" /> Item {i}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Grid with Column Spans</h3>
                      <div className="grid grid-cols-6 gap-4">
                        <div className="col-span-6 bg-primary/20 p-4 rounded-md">Span 6</div>
                        <div className="col-span-4 bg-primary/20 p-4 rounded-md">Span 4</div>
                        <div className="col-span-2 bg-primary/20 p-4 rounded-md">Span 2</div>
                        <div className="col-span-3 bg-primary/20 p-4 rounded-md">Span 3</div>
                        <div className="col-span-3 bg-primary/20 p-4 rounded-md">Span 3</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Flexbox Layout Section */}
              <section id="flexbox-layouts">
                <h2 className="text-2xl font-bold mb-4">Flexbox Layouts</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Flexbox Examples</CardTitle>
                    <CardDescription>Common flexbox patterns for layout</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Horizontal Flex Row</h3>
                      <div className="flex gap-4 flex-wrap">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-secondary/20 p-4 rounded-md flex-shrink-0">
                            Flex Item {i}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Flex with Alignment</h3>
                      <div className="flex justify-between items-center bg-accent/10 p-4 rounded-md h-24">
                        <div className="bg-accent/20 p-2 rounded-md">Left</div>
                        <div className="bg-accent/20 p-2 rounded-md">Center</div>
                        <div className="bg-accent/20 p-2 rounded-md">Right</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Flex Column</h3>
                      <div className="flex flex-col gap-2 bg-secondary/10 p-4 rounded-md">
                        <div className="bg-secondary/20 p-2 rounded-md">Item 1</div>
                        <div className="bg-secondary/20 p-2 rounded-md">Item 2</div>
                        <div className="bg-secondary/20 p-2 rounded-md">Item 3</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Container & Card Layouts */}
              <section id="container-layouts">
                <h2 className="text-2xl font-bold mb-4">Containers & Cards</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Container Examples</CardTitle>
                    <CardDescription>Common container and card layout patterns</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Max Width Containers</h3>
                      <div className="space-y-4">
                        <div className="max-w-sm mx-auto bg-muted p-4 rounded-md text-center">
                          max-w-sm
                        </div>
                        <div className="max-w-md mx-auto bg-muted p-4 rounded-md text-center">
                          max-w-md
                        </div>
                        <div className="max-w-lg mx-auto bg-muted p-4 rounded-md text-center">
                          max-w-lg
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Card Grid Layout</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <Card key={i}>
                            <CardHeader>
                              <CardTitle>Card {i}</CardTitle>
                              <CardDescription>Card description</CardDescription>
                            </CardHeader>
                            <CardContent>This is card content for card {i}.</CardContent>
                            <CardFooter>
                              <Button size="sm">Action</Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Two-Column Layout</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                          <Card>
                            <CardHeader>
                              <CardTitle>Sidebar</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="bg-muted p-2 rounded-md">Navigation Item 1</div>
                                <div className="bg-muted p-2 rounded-md">Navigation Item 2</div>
                                <div className="bg-muted p-2 rounded-md">Navigation Item 3</div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        <div className="md:col-span-2">
                          <Card>
                            <CardHeader>
                              <CardTitle>Main Content</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p>
                                This demonstrates a common two-column layout with a sidebar and main
                                content area.
                              </p>
                              <div className="mt-4 space-y-2">
                                <div className="h-12 bg-muted rounded-md"></div>
                                <div className="h-24 bg-muted rounded-md"></div>
                                <div className="h-12 bg-muted rounded-md"></div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Spacing & Dividers */}
              <section id="spacing-dividers">
                <h2 className="text-2xl font-bold mb-4">Spacing & Dividers</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Spacing Examples</CardTitle>
                    <CardDescription>Consistent spacing and divider usage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Margin Spacing</h3>
                      <div className="space-y-4">
                        <div className="bg-muted p-4 rounded-md">No margin</div>
                        <div className="bg-muted p-4 rounded-md mt-2">mt-2 (0.5rem top margin)</div>
                        <div className="bg-muted p-4 rounded-md mt-4">mt-4 (1rem top margin)</div>
                        <div className="bg-muted p-4 rounded-md mt-8">mt-8 (2rem top margin)</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Padding Spacing</h3>
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-muted rounded-md">p-0</div>
                        <div className="bg-muted p-2 rounded-md">p-2</div>
                        <div className="bg-muted p-4 rounded-md">p-4</div>
                        <div className="bg-muted p-6 rounded-md">p-6</div>
                        <div className="bg-muted p-8 rounded-md">p-8</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Separators & Dividers</h3>
                      <div className="space-y-4">
                        <div className="space-y-2 divide-y">
                          <div className="py-2">Item 1</div>
                          <div className="py-2">Item 2</div>
                          <div className="py-2">Item 3</div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex items-center gap-4 divide-x">
                          <div className="pr-4">Column 1</div>
                          <div className="px-4">Column 2</div>
                          <div className="pl-4">Column 3</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>

            <TabsContent value="todo" className="space-y-8 mt-6">
              <section>
                <h2 className="text-xl font-semibold mb-4">Todo Component with Voting</h2>
                <p className="text-muted-foreground mb-6">
                  A collaborative todo component with voting capabilities. Each item can receive
                  upvotes or downvotes, and administrators can change item status.
                </p>

                <div className="flex flex-col space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <Todo initialItems={todoItems} canEdit={true} />
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="collaborative" className="space-y-8 mt-6">
              <section>
                <h2 className="text-xl font-semibold mb-4">Collaborative Presence Demo</h2>
                <p className="text-muted-foreground mb-6">
                  This demonstrates real-time collaboration features with cursor tracking, user
                  presence, and editing indicators. Open this page in multiple browsers to see the
                  full effect.
                </p>

                <div className="grid gap-6">
                  {/* Presence features are temporarily disabled */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="bg-muted/50 p-4 rounded-md border border-dashed">
                        <h3 className="font-medium mb-2">Collaborative Features Disabled</h3>
                        <p className="text-sm text-muted-foreground">
                          Real-time collaboration features are currently disabled in this sandbox.
                          These features are kept in the codebase but not actively imported.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="focus" className="space-y-8 mt-6">
              <section>
                <h2 className="text-xl font-semibold mb-4">Focus Session Example</h2>
                <p className="text-muted-foreground mb-6">
                  This demonstrates the FocusSessionExample component which uses the AvatarGroup
                  component. It enables real-time collaboration on a specific section of a trip.
                </p>

                <div className="max-w-md mx-auto">
                  {/* Focus session features are temporarily disabled */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="bg-muted/50 p-4 rounded-md border border-dashed">
                        <h3 className="font-medium mb-2">Focus Sessions Disabled</h3>
                        <p className="text-sm text-muted-foreground">
                          Focus session features are currently disabled in this sandbox. These
                          features are kept in the codebase but not actively imported.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="trip" className="space-y-8 mt-6">
              <section>
                <h2 className="text-xl font-semibold mb-4">Trip Visuals</h2>
                <p className="text-muted-foreground mb-6">
                  Sample trip visuals and destination images to demonstrate how they appear in the
                  UI.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Athens, Greece</CardTitle>
                      <CardDescription>Popular European destination</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative w-full h-48 overflow-hidden rounded-md">
                        <Image
                          src="/design-sandbox/athens.jpg"
                          alt="Athens, Greece"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="custom" className="space-y-12 mt-6">
              <section id="page-header">
                <h2 className="text-2xl font-bold mb-4">Page Header</h2>
                <PageHeader heading="Sandbox Custom Components">
                  Showcasing custom built components
                </PageHeader>
              </section>

              <section id="like-button">
                <h2 className="text-2xl font-bold mb-4">Like Button</h2>
                <div className="flex gap-4 items-center">
                  <LikeButton itemId="dest-sample-1" itemType="destination" />
                  <LikeButton itemId="itin-sample-1" itemType="itinerary" />
                </div>
              </section>

              <section id="destination-components">
                <h2 className="text-2xl font-bold mb-4">Destination Components</h2>
                <p className="text-muted-foreground mb-6">
                  Components used for displaying destinations, cities, and locations
                </p>

                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Destination Card</CardTitle>
                      <CardDescription>Card displaying destination information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="max-w-sm">
                        <DestinationCard destination={destinationSample} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>City Bubbles</CardTitle>
                      <CardDescription>Interactive city selection bubbles</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CityBubbles />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Location Search</CardTitle>
                      <CardDescription>Search for locations and places</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="max-w-md">
                        <LocationSearch
                          placeholder="Search for a location"
                          onLocationSelect={() => {}}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Trip Components Section */}
              <section id="trip-components">
                <h2 className="text-2xl font-bold mb-4">Trip Components</h2>
                <p className="text-muted-foreground mb-6">
                  Components used for trip planning, management, and collaboration
                </p>

                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trip Card</CardTitle>
                      <CardDescription>Card displaying trip information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="max-w-sm">
                        <TripCard trip={tripSample} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Timeline</CardTitle>
                      <CardDescription>Timeline showing trip activity</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4">
                      <ActivityTimeline
                        tripId="demo-trip-id"
                        maxHeight="300px"
                        showRefreshButton={true}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Trip Voting</CardTitle>
                      <CardDescription>Collaborative voting on trip items</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TripVoting
                        tripId="demo-trip-id"
                        pollId="poll-123"
                        title="Where should we eat dinner?"
                        options={[
                          { id: 'option1', title: 'Italian Restaurant', votes: 5, hasVoted: true },
                          { id: 'option2', title: 'Seafood Place', votes: 2, hasVoted: false },
                          { id: 'option3', title: 'Local Cuisine', votes: 3, hasVoted: false },
                        ]}
                        isActive={true}
                        expiresAt={null}
                        onVote={(optionId) => console.log('Voted:', optionId)}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Playlist Embed</CardTitle>
                      <CardDescription>Embedded music playlist for trips</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PlaylistEmbed url="https://open.spotify.com/playlist/37i9dQZF1DXcBWXoZZLMAA" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Travel Tracker</CardTitle>
                      <CardDescription>Track visited destinations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TravelTracker />
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* UI and Interaction Components */}
              <section id="ui-interaction-components">
                <h2 className="text-2xl font-bold mb-4">UI & Interaction Components</h2>
                <p className="text-muted-foreground mb-6">
                  General UI components for interaction and display
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Page Header</CardTitle>
                      <CardDescription>Standard page header component</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PageHeader heading="Explore popular travel destinations">
                        Explore popular travel destinations
                      </PageHeader>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Like Button</CardTitle>
                      <CardDescription>Interactive like button component</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <LikeButton
                        itemId="item-123"
                        itemType="destination"
                        showCount={true}
                        count={5}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Trip Presence Indicator</CardTitle>
                      <CardDescription>Shows active users in a trip</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <div className="p-4 bg-muted/50 rounded-md border border-dashed w-full">
                        <h3 className="font-medium mb-2">Presence Features Disabled</h3>
                        <p className="text-sm text-muted-foreground">
                          Trip presence features are currently disabled in this sandbox. These
                          features are kept in the codebase but not actively imported.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Share Trip Button</CardTitle>
                      <CardDescription>Button for sharing trips</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <div className="p-4 bg-muted rounded-md inline-flex">
                        <ShareTripButton slug="demo-trip" privacySetting="shared_with_link" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Empty States and Placeholders */}
              <section id="empty-states">
                <h2 className="text-2xl font-bold mb-4">Empty States & Placeholders</h2>
                <p className="text-muted-foreground mb-6">
                  Components used when no content is available
                </p>

                <Card>
                  <CardHeader>
                    <CardTitle>Empty Trips</CardTitle>
                    <CardDescription>Displayed when no trips are available</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EmptyTrips />
                  </CardContent>
                </Card>
              </section>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
