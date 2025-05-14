'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import IdeasWhiteboard from './ideas-whiteboard';
import { useIdeasPresenceContext } from './context/ideas-presence-context';
import { useAuth } from '@/components/auth-provider';
import { Card } from '@/components/ui/card';
import { useLayoutMode } from '@/app/context/layout-mode-context';

interface IdeasClientProps {
  groupId: string;
  initialIdeas: any[];
  groupName: string;
  isAuthenticated: boolean;
}

export default function IdeasClient({
  groupId,
  initialIdeas,
  groupName,
  isAuthenticated,
}: IdeasClientProps) {
  const { setFullscreen } = useLayoutMode();
  const params = useParams();

  // Enable fullscreen mode when component mounts, disable when unmounts
  useEffect(() => {
    console.log('Ideas client mounting, enabling fullscreen mode');
    setFullscreen(true);

    return () => {
      console.log('Ideas client unmounting, disabling fullscreen mode');
      setFullscreen(false);
    };
  }, [setFullscreen]);

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
      <div className="relative flex-grow w-full h-full">
        <Card className="relative h-full w-full border-none shadow-none overflow-hidden bg-transparent">
          {/* Main whiteboard component */}
          <IdeasWhiteboard
            groupId={groupId}
            groupName={groupName}
            isAuthenticated={isAuthenticated}
            planSlug={params?.slug as string}
            planId={params?.slug as string}
          />
        </Card>
      </div>
    </div>
  );
}
