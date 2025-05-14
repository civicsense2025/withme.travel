import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef, useEffect, useState } from 'react';
import { visuallyHidden } from './visually-hidden';

export interface LiveRegionProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The message to announce to screen readers
   */
  message: string;
  /**
   * ARIA politeness level
   * @default "polite"
   */
  politeness?: 'polite' | 'assertive';
  /**
   * How long the message should remain in the DOM (ms)
   * @default 1000
   */
  clearAfter?: number;
  /**
   * Whether the region should be visually hidden
   * @default true
   */
  visuallyHidden?: boolean;
}

/**
 * LiveRegion announces content to screen readers without disrupting the visual experience.
 * Use for status updates, confirmations, and other non-critical information.
 */
const LiveRegion = forwardRef<HTMLDivElement, LiveRegionProps>(
  (
    {
      message,
      politeness = 'polite',
      clearAfter = 1000,
      visuallyHidden: isHidden = true,
      className,
      ...props
    },
    ref
  ) => {
    const [announcement, setAnnouncement] = useState(message);

    // When message changes, update announcement
    useEffect(() => {
      if (!message) return;

      setAnnouncement(message);

      // Clear announcement after specified time
      if (clearAfter > 0) {
        const timeoutId = setTimeout(() => {
          setAnnouncement('');
        }, clearAfter);

        return () => clearTimeout(timeoutId);
      }
    }, [message, clearAfter]);

    return (
      <div
        ref={ref}
        aria-live={politeness}
        aria-atomic="true"
        className={cn(isHidden && visuallyHidden, className)}
        {...props}
      >
        {announcement}
      </div>
    );
  }
);

LiveRegion.displayName = 'LiveRegion';

export { LiveRegion };
