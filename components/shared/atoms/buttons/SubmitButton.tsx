import React from 'react';
import { Button } from '@/components/ui/button';

export interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

/**
 * SubmitButton - A button component used for form submission
 * 
 * This is a shared atom that can be used across different features
 */
const SubmitButton = ({
  children,
  isLoading = false,
  loadingText = 'Submitting...',
  className = '',
  disabled,
  ...props
}: SubmitButtonProps) => {
  return (
    <Button
      type="submit"
      className={className}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? loadingText : children}
    </Button>
  );
};

export { SubmitButton }; 