'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Plus,
  ArrowRight,
  Calendar,
  DollarSign,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export interface GroupIdea {
  id: string;
  group_id: string;
  title: string;
  description?: string;
  created_at: string;
  created_by?: string;
  type: 'destination' | 'date' | 'activity' | 'budget' | 'other';
  votes_up?: number;
  votes_down?: number;
  meta?: Record<string, any>;
}

export interface IdeasPreviewClientProps {
  groupId: string;
  groupName: string;
  groupEmoji?: string;
  initialIdeas: GroupIdea[];
}

export default function IdeasPreviewClient({
  groupId,
  groupName,
  groupEmoji,
  initialIdeas,
}: IdeasPreviewClientProps) {
  const [activeTab, setActiveTab] = useState('all');

  // Filter ideas by type
  const filteredIdeas =
    activeTab === 'all' ? initialIdeas : initialIdeas.filter((idea) => idea.type === activeTab);

  // Helper to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get icon for idea type
  const getIdeaTypeIcon = (type: string) => {
    switch (type) {
      case 'destination':
        return <MapPin className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'budget':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <div className="text-3xl mr-2">{groupEmoji || '💡'}</div>
        <h1 className="text-2xl font-bold">{groupName} Ideas Preview</h1>
      </div>
      <div className="mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Join to Add Ideas</CardTitle>
            <CardDescription>Sign up or log in to contribute to this group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button size="lg" asChild className="flex-1">
                <Link href={`/signup?redirectTo=/groups/${groupId}`}>Sign Up to Plan</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="flex-1">
                <Link href={`/login?redirectTo=/groups/${groupId}`}>Login to Join</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="destination">Places</TabsTrigger>
          <TabsTrigger value="date">Dates</TabsTrigger>
          <TabsTrigger value="activity">Activities</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>
      </Tabs>
      {filteredIdeas.length > 0 ? (
        <div className="space-y-4">
          {filteredIdeas.map((idea) => (
            <Card key={idea.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{idea.type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(idea.created_at)}
                  </span>
                </div>
                <CardTitle className="text-lg">{idea.title}</CardTitle>
                {idea.description && <CardDescription>{idea.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>{idea.votes_up || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    <span>{idea.votes_down || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-center">
            <p>No ideas have been added to this group yet.</p>
          </CardContent>
        </Card>
      )}
      <div className="mt-6">
        <Link href={`/groups/${groupId}`} legacyBehavior>
          <Button variant="outline">Back to Group</Button>
        </Link>
      </div>
    </div>
  );
}
