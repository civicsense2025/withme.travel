/**
 * TaskTag displays a tag for categorizing tasks
 */

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// PROPS DEFINITION
// ============================================================================

export interface TaskTagProps {
  /** The tag text */
  text: string;
  /** Whether the tag is removable */
  removable?: boolean;
  /** Callback for when the tag is removed */
  onRemove?: (text: string) => void;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Component for displaying task tags
 */
export function TaskTag({
  text,
  removable = false,
  onRemove,
  className = '',
}: TaskTagProps) {
  const handleRemove = () => {
    if (onRemove) {
      onRemove(text);
    }
  };
  
  return (
    <div 
      className={cn(
        "bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full text-sm flex items-center",
        className
      )}
    >
      {text}
      {removable && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 ml-1 rounded-full"
          onClick={handleRemove}
          aria-label={`Remove ${text} tag`}
        >
          <X size={10} />
        </Button>
      )}
    </div>
  );
} 