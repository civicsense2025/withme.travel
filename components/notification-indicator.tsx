'use client';

import { useState } from 'react';
import { useNotificationCount } from '@/contexts/notification-count-context';
import { Bell } from 'lucide-react';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

// Lazy load notification content to avoid loading it until needed
const NotificationPopoverContent = dynamic(
  () => import('./notification-popover-content'),
  {
    loading: () => <NotificationLoadingPlaceholder />,
    ssr: false,
  }
);

function NotificationLoadingPlaceholder() {
  return (
    <div className="w-[380px] p-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/50">
        <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
        <div className="h-5 w-16 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
              <div className="h-3 w-1/2 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotificationIndicator() {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotificationCount();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 h-8 w-8"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      {/* Only load content when popover is open */}
      {open && <NotificationPopoverContent onOpen={setOpen} />}
    </Popover>
  );
}
