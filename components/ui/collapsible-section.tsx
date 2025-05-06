'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  /**
   * If true, hides the toggle icon on desktop (md+ screens), showing it only on mobile.
   */
  hideToggleOnDesktop?: boolean;
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  icon,
  headerAction,
  children,
  className,
  hideToggleOnDesktop = false,
  ...props
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div 
      className={cn(
        "collapsible-section border border-border/30 rounded-2xl bg-background p-0 md:p-0 mb-4",
        isOpen ? "shadow-sm" : "shadow-none",
        className
      )}
      {...props}
    >
      <div 
        className="collapsible-section-header px-4 py-4 flex items-center justify-between cursor-pointer select-none mb-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <h3 className="font-medium">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {headerAction && (
            <span 
              onClick={(e) => e.stopPropagation()} 
              className="mr-2"
            >
              {headerAction}
            </span>
          )}
          <span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
        </div>
      </div>
      
      <div 
        className={cn(
          "collapsible-section-content",
          isOpen ? "h-auto opacity-100" : "h-0 opacity-0 overflow-hidden"
        )}
      >
        {children}
      </div>
    </div>
  );
} 