'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle2 } from 'lucide-react';

const HERO_HEADLINE = '✈️ Join us in reimagining group travel';
const HERO_SUBHEAD = "Get early access to withme.travel and help shape how friends plan adventures together. Be part of our community building the future of trip planning.";
const BENEFITS = [
  '🔍 First look at new features before anyone else',
  '🗺️ Shape our roadmap with your real travel insights',
  '🤝 Connect with fellow adventure planners',
  '✨ Enjoy a free lifetime plan as an alpha tester'
];
const PRIVACY_SUMMARY =
  "We respect your privacy. Your info is only used for the user testing program. Opt out anytime.";

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
        router.push(`/user-testing/survey?surveyId=${data.surveyId}&email=${encodeURIComponent(form.email)}&name=${encodeURIComponent(form.name)}`);
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
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-background to-muted relative overflow-hidden font-sans">
      {/* Animated background shapes (use theme colors) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-60 animate-float" />
        <div className="absolute bottom-[-100px] right-[-60px] w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50 animate-float-slow" />
      </div>
      <Card className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border-0 p-0">
        <CardContent className="p-8 md:p-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-3 bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent tracking-tight">
            {HERO_HEADLINE}
          </h1>
          <p className="text-lg text-center text-muted-foreground mb-6">{HERO_SUBHEAD}</p>
          {success ? (
            <div className="flex flex-col items-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">You're in!</h2>
              <p className="text-center text-gray-700 mb-2">Thanks for joining our research program. We'll be in touch soon with next steps!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full max-w-xs mx-auto flex flex-col gap-4 mb-6">
              <Input
                name="name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                required
                className="rounded-xl bg-white/80 border border-gray-300 focus:ring-2 focus:ring-primary"
                autoComplete="name"
              />
              <Input
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                required
                className="rounded-xl bg-white/80 border border-gray-300 focus:ring-2 focus:ring-primary"
                autoComplete="email"
              />
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <Button
                type="submit"
                size="lg"
                className="rounded-full bg-primary text-white font-bold text-lg py-3 mt-2 shadow-lg hover:scale-105 transition-transform"
                disabled={loading}
              >
                {loading ? 'Signing you up…' : 'Join the Alpha Program'}
              </Button>
            </form>
          )}
          <ul className="mb-6 w-full max-w-xs mx-auto text-muted-foreground text-base space-y-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-xs text-gray-500 text-center max-w-xs mx-auto">
            <span className="font-semibold">Privacy & Consent:</span> {PRIVACY_SUMMARY}
          </div>
        </CardContent>
      </Card>
      <footer className="mt-10 mb-4 text-xs text-gray-400 text-center w-full">
        Powered by <span className="font-semibold text-primary">withme.travel</span>
      </footer>
      <style jsx global>{`
        .animate-float {
          animation: float 8s ease-in-out infinite alternate;
        }
        .animate-float-slow {
          animation: float 14s ease-in-out infinite alternate;
        }
        @keyframes float {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-20px) scale(1.04); }
        }
      `}</style>
    </main>
  );
} 