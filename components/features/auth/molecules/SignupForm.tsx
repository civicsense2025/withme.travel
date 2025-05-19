import React, { useState } from 'react';
import { InputField } from '../atoms/InputField';
import { PasswordField } from '../atoms/PasswordField';
import { AuthError } from '../atoms/AuthError';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface SignupFormProps {
  /** Function called on form submission with form data */
  onSubmit: (data: {
    email: string;
    password: string;
    name: string;
    acceptTerms: boolean;
  }) => Promise<void>;
  /** Whether the form is currently submitting */
  isLoading?: boolean;
  /** Error message to display */
  error?: string;
  /** Success message to display */
  success?: string;
  /** Optional redirect URL for "Login" link */
  loginUrl?: string;
}

export function SignupForm({
  onSubmit,
  isLoading = false,
  error,
  success,
  loginUrl = '/login',
}: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    terms?: string;
  }>({});

  const validateForm = () => {
    const errors: typeof formErrors = {};
    
    if (!email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email address';
    
    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    
    if (!name) errors.name = 'Name is required';
    
    if (!acceptTerms) errors.terms = 'You must accept the terms and conditions';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await onSubmit({ email, password, name, acceptTerms });
    } catch (err) {
      // Error handling is managed by the parent through the error prop
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <AuthError message={error} />}
      
      {success && (
        <div className="bg-green-50 text-green-800 px-4 py-3 rounded-md">
          {success}
        </div>
      )}
      
      <InputField
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        disabled={isLoading}
        error={formErrors.name}
        required
      />
      
      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        disabled={isLoading}
        error={formErrors.email}
        required
      />
      
      <PasswordField
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Create a password"
        disabled={isLoading}
        error={formErrors.password}
        required
      />
      
      <div className="flex items-start gap-2">
        <Checkbox
          id="terms"
          checked={acceptTerms}
          onCheckedChange={(checked) => setAcceptTerms(!!checked)}
          disabled={isLoading}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="terms"
            className={formErrors.terms ? 'text-destructive' : ''}
          >
            I agree to the terms of service and privacy policy
          </Label>
          {formErrors.terms && (
            <p className="text-sm text-destructive font-medium">{formErrors.terms}</p>
          )}
        </div>
      </div>
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
      
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <a href={loginUrl} className="text-primary hover:underline">
          Log in
        </a>
      </div>
    </form>
  );
}