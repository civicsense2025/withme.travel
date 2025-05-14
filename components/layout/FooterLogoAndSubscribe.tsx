import { useState } from 'react';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function FooterLogoAndSubscribe() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      <Logo />
      <p className="text-sm text-muted-foreground max-w-md">
        Plan trips with friends without the chaos. Make group travel fun again.
      </p>
      <div className="pt-4">
        <h3 className="text-sm font-medium mb-2">Get travel inspiration</h3>
        <form
          onSubmit={handleSubscribe}
          className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 max-w-md"
        >
          <div className="flex-grow">
            <Input
              type="email"
              placeholder="your@email.com"
              className="rounded-full w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribed}
            />
          </div>
          <Button type="submit" className="rounded-full" disabled={subscribed}>
            {subscribed ? (
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Subscribed
              </motion.span>
            ) : (
              <>
                Subscribe <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          We respect your privacy and will never share your email.
        </p>
      </div>
    </div>
  );
}
