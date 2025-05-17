'use client';

import { ButtonProps } from '@/components/ui/button';
import {
  FeedbackFormWrapper,
  TRIPS_FEEDBACK_FORM,
} from '@/app/components/feedback/FeedbackFormWrapper';
import { MessageSquare } from 'lucide-react';

interface TripsFeedbackButtonProps extends ButtonProps {
  children?: React.ReactNode;
}

export function TripsFeedbackButton({ children, className, ...props }: TripsFeedbackButtonProps) {
  return (
    <FeedbackFormWrapper
      formTemplate={TRIPS_FEEDBACK_FORM}
      buttonClassName={className}
      {...props}
    >
      {children || (
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          Feedback
        </div>
      )}
    </FeedbackFormWrapper>
  );
}
