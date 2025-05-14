import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        'travel-purple': 'bg-travel-purple/10 border-travel-purple text-travel-purple-foreground',
        'travel-blue': 'bg-travel-blue/10 border-travel-blue text-travel-blue-foreground',
        'travel-pink': 'bg-travel-pink/10 border-travel-pink text-travel-pink-foreground',
        'travel-yellow': 'bg-travel-yellow/10 border-travel-yellow text-travel-yellow-foreground',
        'travel-mint': 'bg-travel-mint/10 border-travel-mint text-travel-mint-foreground',
        'travel-peach': 'bg-travel-peach/10 border-travel-peach text-travel-peach-foreground',
        success: 'bg-emerald-50 border-emerald-400 text-emerald-900',
        warning: 'bg-amber-50 border-amber-400 text-amber-900',
        info: 'bg-blue-50 border-blue-400 text-blue-900',
        error: 'bg-red-50 border-red-400 text-red-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Whether the alert content is important enough to use assertive announcements */
  isImportant?: boolean;
  /** ID of the title element for ARIA labeling */
  titleId?: string;
  /** ID of the description element for ARIA descriptions */
  descriptionId?: string;
}

/**
 * Accessible Alert component with design system variants.
 * Uses appropriate ARIA roles and live regions based on content importance.
 *
 * @example
 * <Alert variant="success">
 *   <AlertTitle>Success!</AlertTitle>
 *   <AlertDescription>Your changes have been saved.</AlertDescription>
 * </Alert>
 *
 * @example
 * <Alert
 *   variant="error"
 *   isImportant={true}
 *   titleId="payment-error-title"
 *   descriptionId="payment-error-desc"
 * >
 *   <AlertTitle id="payment-error-title">Payment failed</AlertTitle>
 *   <AlertDescription id="payment-error-desc">
 *     Your payment could not be processed. Please try again.
 *   </AlertDescription>
 * </Alert>
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, isImportant, titleId, descriptionId, ...props }, ref) => {
    // Determine appropriate ARIA role and live region attributes
    const ariaAttributes = React.useMemo(() => {
      // For error and warning variants, use alert role which is implicitly assertive
      if (variant === 'error' || variant === 'warning' || variant === 'destructive') {
        return { role: 'alert' };
      }

      // For other variants, use a status role with appropriate live region
      return {
        role: 'status',
        'aria-live': isImportant ? 'assertive' : 'polite',
      };
    }, [variant, isImportant]);

    return (
      <div
        ref={ref}
        className={cn(alertVariants({ variant }), className)}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        {...(ariaAttributes as React.AriaAttributes)}
        {...props}
      />
    );
  }
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
