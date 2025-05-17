import React from 'react';
import { cn } from '@/lib/utils';

export interface SurveyContainerProps {
  children: React.ReactNode;
  className?: string;
  onComplete?: () => void;
  onDismiss?: () => void;
}

export const SurveyContainer: React.FC<SurveyContainerProps> = ({
  children,
  className,
  onComplete,
  onDismiss,
}) => {
  return (
    <div className={cn('survey-container', className)}>
      <div className="survey-content">{children}</div>
      <div className="survey-actions">
        <button
          className="survey-button survey-button-complete"
          onClick={onComplete}
        >
          Complete
        </button>
        <button 
          className="survey-button survey-button-dismiss"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}; 