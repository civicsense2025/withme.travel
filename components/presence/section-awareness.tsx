'use client';

import React, { useEffect, useState } from 'react';
import { TripSection } from '@/types/presence';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { PresenceIndicator } from './presence-indicator';
import { UserPresence } from '@/types/presence';
import { Badge } from '@/components/ui/badge';

interface SectionAwarenessProps {
  sections: TripSection[];
  currentSection: string;
  onSectionChange?: (section: string) => void;
  activeUsers?: UserPresence[];
  className?: string;
}

export function SectionAwareness({
  sections,
  currentSection,
  onSectionChange,
  activeUsers = [],
  className,
}: SectionAwarenessProps) {
  const [usersBySection, setUsersBySection] = useState<Record<string, UserPresence[]>>({});

  useEffect(() => {
    // Group users by section they're in
    const sectionMap: Record<string, UserPresence[]> = {};

    sections.forEach((section) => {
      // Find users in this section based on page_path
      const usersInSection = activeUsers.filter((user) => user.page_path?.includes(section.path));

      sectionMap[section.id] = usersInSection;
    });

    setUsersBySection(sectionMap);
  }, [sections, activeUsers]);

  return (
    <Tabs
      value={currentSection}
      onValueChange={onSectionChange}
      className={cn('w-full', className)}
    >
      <TabsList className="w-full justify-start gap-0.5 overflow-x-auto">
        {sections.map((section) => {
          const usersInSection = usersBySection[section.id] || [];
          const hasUsers = usersInSection.length > 0;

          return (
            <TabsTrigger key={section.id} value={section.id} className="relative px-4 py-1.5">
              {section.name}

              {hasUsers && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 min-w-5 px-1 absolute -top-1 -right-1"
                >
                  {usersInSection.length}
                </Badge>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

interface CurrentlyActiveProps {
  sections: TripSection[];
  className?: string;
  activeUsers?: UserPresence[];
}

export function CurrentlyActive({ sections, className, activeUsers = [] }: CurrentlyActiveProps) {
  const [usersBySection, setUsersBySection] = useState<Record<string, UserPresence[]>>({});

  useEffect(() => {
    // Group users by section
    const sectionMap: Record<string, UserPresence[]> = {};

    sections.forEach((section) => {
      const usersInSection = activeUsers.filter((user) => user.page_path?.includes(section.path));

      if (usersInSection.length > 0) {
        sectionMap[section.id] = usersInSection;
      }
    });

    setUsersBySection(sectionMap);
  }, [sections, activeUsers]);

  // If no users in any section, don't render anything
  if (Object.keys(usersBySection).length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold">Currently Active</h3>

      <div className="space-y-2">
        {sections.map((section) => {
          const usersInSection = usersBySection[section.id] || [];

          if (usersInSection.length === 0) return null;

          return (
            <div key={section.id} className="flex flex-col gap-1">
              <div className="text-xs text-muted-foreground">{section.name}</div>
              <PresenceIndicator users={usersInSection} maxAvatars={5} size="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
