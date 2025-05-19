'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  icon?: React.ReactNode;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className,
  headerClassName,
  contentClassName,
  icon,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('border rounded-md', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between px-4 py-2 text-left font-medium',
          'hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          isOpen ? 'rounded-t-md' : 'rounded-md',
          headerClassName
        )}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      {isOpen && (
        <div className={cn('p-4 pt-2', contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
} 