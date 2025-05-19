'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/use-toast';
import { fadeIn, staggerContainer } from '@/utils/animation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // The formState variable was unused and causing a type error.
  // Form status is handled by isSubmitting, error, and success states.
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Simple email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    // Send request to API
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      // Show success message
      setSuccess(true);
      setEmail('');

      toast({
        title: 'Reset Email Sent',
        description: 'If an account exists with this email, you will receive reset instructions.',
      });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Failed to send reset email');

      toast({
        title: 'Request Failed',
        description: err.message || 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <motion.div
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeIn} className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Forgot Password</h1>
          <p className="text-muted-foreground">
            Enter your email address to receive a password reset link
          </p>
        </motion.div>

        {error && (
          <motion.div
            variants={fadeIn}
            className="bg-destructive/10 text-destructive p-3 rounded-md text-sm"
          >
            {error}
          </motion.div>
        )}

        {success ? (
          <motion.div
            variants={fadeIn}
            className="bg-green-100 text-green-800 p-4 rounded-md text-center space-y-4"
          >
            <p className="font-medium">Check your email</p>
            <p className="text-sm">
              We've sent password reset instructions to your email address. Please check your inbox
              and follow the link to reset your password.
            </p>
            <Button onClick={() => router.push('/login')} variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </motion.div>
        ) : (
          <motion.form variants={fadeIn} className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                'Sending Reset Email...'
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Email
                </>
              )}
            </Button>

            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                Back to login
              </Link>
            </div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
