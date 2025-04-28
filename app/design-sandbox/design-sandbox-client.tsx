'use client';

import React from 'react';
import { FocusSession } from '@/components/presence/focus-session';
import { PresenceProvider } from '@/components/presence/presence-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FocusSessionProvider } from '@/contexts/focus-session-context';
import FocusSessionExample from '@/components/trips/components/FocusSessionExample';

export default function DesignSandboxClient() {
  return (
    <div className="container py-10 space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Design Sandbox</CardTitle>
          <CardDescription>
            A playground to test and demonstrate UI components
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Collaborative Presence Demo</h2>
            <p className="text-muted-foreground mb-6">
              This demonstrates real-time collaboration features with cursor tracking, 
              user presence, and editing indicators. Open this page in multiple browsers 
              to see the full effect.
            </p>
            
            <div className="grid gap-6">
              {/* We create separate PresenceProvider instances for each session */}
              <PresenceProvider tripId="sandbox-demo-trip" trackCursor={true}>
                <FocusSession 
                  sessionId="collaborative-notes"
                  title="Collaborative Notes"
                  description="Work together on shared notes"
                />
              </PresenceProvider>
              
              <PresenceProvider tripId="sandbox-demo-trip" trackCursor={true}>
                <FocusSession 
                  sessionId="brainstorming-session"
                  title="Brainstorming Session"
                  description="Add ideas for our next trip"
                />
              </PresenceProvider>
            </div>
          </section>
          
          <Separator />
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Focus Session Example</h2>
            <p className="text-muted-foreground mb-6">
              This demonstrates the FocusSessionExample component which uses the AvatarGroup component.
              It enables real-time collaboration on a specific section of a trip.
            </p>
            
            <div className="max-w-md mx-auto">
              <FocusSessionProvider tripId="sandbox-demo-trip">
                <FocusSessionExample sectionPath="itinerary" />
              </FocusSessionProvider>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
} 