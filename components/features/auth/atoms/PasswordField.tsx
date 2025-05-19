import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * PasswordField - A password input with toggle visibility functionality
 * 
 * This component is specific to the auth feature
 */
const PasswordField = ({
  label,
  error,
  id,
  className = '',
  ...props
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || 'password-field';

  return (
    <div className="w-full space-y-1">
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className={`pr-10 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOffIcon className="h-4 w-4" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
          <span className="sr-only">
            {showPassword ? 'Hide password' : 'Show password'}
          </span>
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default PasswordField; 