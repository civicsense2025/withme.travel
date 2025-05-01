'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MousePointer } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CursorSettingsProps {
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Component for controlling cursor tracking settings
 * Provides toggle switches for enabling/disabling cursor tracking features
 */
export function CursorSettings({ className }: CursorSettingsProps) {
  const [showCursors, setShowCursors] = useLocalStorage<boolean>('withme-show-cursors', true);
  const [trackMyCursor, setTrackMyCursor] = useLocalStorage<boolean>(
    'withme-track-my-cursor',
    true
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MousePointer className="h-4 w-4" />
          Cursor Tracking
        </CardTitle>
        <CardDescription>
          Control how cursor positions are shared during collaboration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-cursors">Show other users' cursors</Label>
            <p className="text-xs text-muted-foreground">
              See where others are pointing and working
            </p>
          </div>
          <Switch id="show-cursors" checked={showCursors} onCheckedChange={setShowCursors} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="share-cursor">Share my cursor position</Label>
            <p className="text-xs text-muted-foreground">
              Allow others to see where your cursor is located
            </p>
          </div>
          <Switch id="share-cursor" checked={trackMyCursor} onCheckedChange={setTrackMyCursor} />
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Cursor tracking helps with collaborative planning by showing where each person is
          focusing. You can toggle these settings at any time.
        </p>
      </CardContent>
    </Card>
  );
}
