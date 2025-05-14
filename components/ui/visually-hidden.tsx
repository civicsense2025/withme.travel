import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export const visuallyHidden =
  'absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden clip-[rect(0,0,0,0)] whitespace-nowrap border-0';

const VisuallyHidden = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    return <span ref={ref} className={cn(visuallyHidden, className)} {...props} />;
  }
);

VisuallyHidden.displayName = 'VisuallyHidden';

export { VisuallyHidden };
