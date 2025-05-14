'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const HERO_HEADLINE = '✈️ Join us in reimagining group travel';
const HERO_SUBHEAD =
  'Get early access to withme.travel and help shape how friends plan adventures together. Be part of our community building the future of trip planning.';
const BENEFITS = [
  { emoji: '🔍', text: 'First look at new features before anyone else' },
  { emoji: '🗺️', text: 'Shape our roadmap with your real travel insights' },
  { emoji: '🤝', text: 'Connect with fellow adventure planners' },
  { emoji: '✨', text: 'Enjoy a free lifetime plan as an alpha tester' },
];
const PRIVACY_SUMMARY =
  'We respect your privacy. Your info is only used for the user testing program. Opt out anytime.';

export default function UserTestingClient() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please enter your name and email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/user-testing-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to sign up. Please try again.');

      const data = await res.json();

      if (data.redirect) {
        // Redirect to survey with email and name params
        router.push(
          `/user-testing/survey?surveyId=${data.surveyId}&email=${encodeURIComponent(form.email)}&name=${encodeURIComponent(form.name)}`
        );
      } else {
        // Just show success message
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted dark:from-black dark:to-gray-950 relative overflow-hidden font-sans">
      {/* Simple navbar */}
      <header className="w-full py-4 px-4 md:px-8 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="font-bold text-xl text-gray-900 dark:text-white flex items-center"
          >
            withme.travel
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
              Return to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Animated background shapes (use theme colors) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl opacity-60 animate-float" />
        <div className="absolute bottom-[-120px] right-[-80px] w-[500px] h-[500px] bg-accent/20 dark:bg-accent/10 rounded-full blur-3xl opacity-50 animate-float-slow" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-lg mx-auto flex flex-col items-center py-16">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-5 text-gray-900 dark:text-white tracking-tight">
            {HERO_HEADLINE}
          </h1>
          <p className="text-md md:text-lg text-center text-muted-foreground dark:text-gray-300 mb-10 max-w-md">
            {HERO_SUBHEAD}
          </p>
          {success ? (
            <div className="flex flex-col items-center py-10 px-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-6">
                <span className="text-4xl" role="img" aria-label="Success">
                  ✅
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-center dark:text-white">You're in!</h2>
              <p className="text-center text-gray-700 dark:text-gray-300 mb-6 max-w-sm">
                Thanks for joining our research program. We'll be in touch soon with next steps!
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-sm mx-auto flex flex-col gap-6 mb-10"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Your name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="rounded-xl h-12 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-800 shadow-sm focus:ring-2 focus:ring-primary dark:focus:ring-primary dark:text-white"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="rounded-xl h-12 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-800 shadow-sm focus:ring-2 focus:ring-primary dark:focus:ring-primary dark:text-white"
                  autoComplete="email"
                />
              </div>
              {error && (
                <div className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-gray-900/80 p-3 rounded-lg border border-red-100 dark:border-red-900/50">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                size="lg"
                className="rounded-full bg-gradient-to-r from-purple-400 via-pink-300 to-yellow-300 text-white font-bold text-lg py-6 mt-2 shadow-md animate-subtle-glow hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-0"
                disabled={loading}
              >
                {loading ? 'Signing you up…' : 'Join the Alpha Program'}
              </Button>
            </form>
          )}
          <div className="w-full max-w-sm mx-auto">
            <h3 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">
              When you join, you'll get:
            </h3>
            <ul className="mb-8 w-full text-gray-700 dark:text-gray-300 text-base space-y-4">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit.text}
                  className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 rounded-xl"
                >
                  <span className="text-xl flex-shrink-0 mt-0.5" role="img" aria-hidden="true">
                    {benefit.emoji}
                  </span>
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 py-4 px-6 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 text-center max-w-sm mx-auto">
            <span className="font-semibold">Privacy & Consent:</span> {PRIVACY_SUMMARY}
          </div>
        </div>
      </div>
      <footer className="py-6 text-sm text-gray-500 dark:text-gray-400 text-center w-full border-t border-gray-100 dark:border-gray-800">
        Powered by{' '}
        <span className="font-semibold text-primary dark:text-primary-foreground">
          withme.travel
        </span>
      </footer>
      <style jsx global>{`
        .animate-float {
          animation: float 10s ease-in-out infinite alternate;
        }
        .animate-float-slow {
          animation: float 16s ease-in-out infinite alternate;
        }
        @keyframes float {
          0% {
            transform: translateY(0) scale(1);
          }
          100% {
            transform: translateY(-30px) scale(1.05);
          }
        }
        .animate-subtle-glow {
          box-shadow:
            0 0 12px 2px rgba(233, 216, 253, 0.4),
            0 0 20px 5px rgba(251, 191, 36, 0.2);
          animation: subtleGlowPulse 3s infinite alternate;
        }
        @keyframes subtleGlowPulse {
          0% {
            box-shadow:
              0 0 12px 2px rgba(233, 216, 253, 0.3),
              0 0 20px 5px rgba(251, 191, 36, 0.15);
          }
          100% {
            box-shadow:
              0 0 20px 4px rgba(233, 216, 253, 0.4),
              0 0 28px 8px rgba(251, 191, 36, 0.2);
          }
        }
      `}</style>
    </main>
  );
}
