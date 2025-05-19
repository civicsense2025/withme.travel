/**
 * InterestTag Molecule
 *
 * Displays a selectable interest tag for onboarding.
 * @module components/features/onboarding/molecules/InterestTag
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import type { Tag as BaseTag } from '@/types/tags';

// Extended Tag type with additional properties needed for this component
interface TagExtended extends BaseTag {
  emoji?: string;
  description?: string;
  slug: string;
}

/**
 * InterestTag component props
 */
export interface InterestTagProps {
  /** Tag label */
  tag: TagExtended;
  /** Interest level value */
  value: number;
  /** Whether the tag is suggested */
  isSuggested?: boolean;
  /** Change handler */
  onChange: (value: number[]) => void;
  /** Additional className for styling */
  className?: string;
}

/**
 * A component to display and select interest level for a specific tag
 */
export function InterestTag({ tag, value, isSuggested = false, onChange, className }: InterestTagProps) {
  // Simple slider implementation until we can connect to the proper UI component
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange([parseInt(e.target.value, 10)]);
  };

  return (
    <Card
      className={`p-4 space-y-4 group hover:shadow-md transition-shadow ${
        isSuggested ? 'border-accent/20' : ''
      } ${className || ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium flex items-center gap-2">
            {tag.emoji && (
              <span className="group-hover:scale-110 transition-transform">
                {tag.emoji}
              </span>
            )}
            {tag.name}
            {isSuggested && (
              <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                Suggested
              </span>
            )}
          </h3>
          {tag.description && (
            <p className="text-xs text-muted-foreground mt-1">{tag.description}</p>
          )}
        </div>
        <span className="text-sm font-medium">{value || 0}%</span>
      </div>
      
      {/* Simple HTML slider instead of custom Slider component */}
      <input 
        type="range" 
        min="0" 
        max="100" 
        step="10" 
        value={value || 0}
        onChange={handleSliderChange}
        className="w-full"
      />
    </Card>
  );
}

export default InterestTag; 