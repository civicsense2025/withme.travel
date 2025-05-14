'use client';

import { useState } from 'react';
import { Container } from '@/components/container';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Accordion,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LikeButton } from '@/components/like-button';

export default function DesignSandbox() {
  const [activeTab, setActiveTab] = useState('ui');

  return (
    <div className="min-h-screen bg-background">
      <Container as="header" size="xl" className="py-8">
        <h1 className="text-4xl font-bold mb-4">withme.travel Design System</h1>
        <p className="text-xl text-muted-foreground">Apple-inspired components showcase</p>
      </Container>

      <Container size="xl">
        <Tabs defaultValue="ui" className="mb-8">
          <TabsList>
            <TabsTrigger value="ui" onClick={() => setActiveTab('ui')} variant="default">
              UI Components
            </TabsTrigger>
            <TabsTrigger value="cards" onClick={() => setActiveTab('cards')} variant="default">
              Cards
            </TabsTrigger>
            <TabsTrigger value="forms" onClick={() => setActiveTab('forms')} variant="default">
              Forms & Inputs
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              onClick={() => setActiveTab('feedback')}
              variant="default"
            >
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ui" className="mt-6 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Buttons</h2>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="default" size="lg">
                  Large
                </Button>
                <Button variant="default" size="sm">
                  Small
                </Button>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Badges</h2>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Avatars</h2>
              <div className="flex flex-wrap gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Like Button</h2>
              <div className="flex flex-wrap gap-4 items-center">
                <LikeButton
                  itemId="123"
                  itemType="destination"
                  variant="default"
                  iconOnly={false}
                />
                <LikeButton
                  itemId="456"
                  itemType="destination"
                  initialLiked={true}
                  variant="ghost"
                  iconOnly={false}
                />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="cards" className="mt-6 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Standard Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>This is a default card with standard styling</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="default">Action</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Travel Purple</CardTitle>
                    <CardDescription>Themed card with color</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>This card uses the travel-purple theme variant</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="default">Action</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Travel Blue with Shadow</CardTitle>
                    <CardDescription>Themed card with rounded corners and shadow</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>This card uses travel-blue with extra shadow effect</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="default">Action</Button>
                  </CardFooter>
                </Card>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="forms" className="mt-6 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Text Inputs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input placeholder="Default Input" />
                  <Input placeholder="Another Input" />
                  <Input placeholder="Another Input" />
                  <Textarea placeholder="Default Textarea" />
                  <Textarea placeholder="Another Textarea" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <span>Default Switch</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <span>Another Switch</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox />
                    <span>Default Checkbox</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox />
                    <span>Another Checkbox</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Accordion</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Travel Information</AccordionTrigger>
                  <AccordionContent>
                    Access your trip details, itineraries, and travel documents in one convenient
                    location.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Booking Details</AccordionTrigger>
                  <AccordionContent>
                    View your accommodation, transportation, and activity reservations.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Travel Recommendations</AccordionTrigger>
                  <AccordionContent>
                    Discover personalized suggestions for activities, restaurants, and attractions.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          </TabsContent>

          <TabsContent value="feedback" className="mt-6 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Alerts</h2>
              <div className="space-y-4">
                <Alert>
                  <AlertTitle>Default Alert</AlertTitle>
                  <AlertDescription>This is a standard alert message.</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertTitle>Destructive Alert</AlertTitle>
                  <AlertDescription>
                    This is a destructive alert for important warnings.
                  </AlertDescription>
                </Alert>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </Container>

      <Container as="footer" size="xl" className="py-8 mt-16 border-t">
        <p className="text-center text-muted-foreground">
          withme.travel | Apple-Inspired Design System
        </p>
      </Container>
    </div>
  );
}
