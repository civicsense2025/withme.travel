import { useState, useRef } from 'react';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal, CheckCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

export function FooterLogoAndSubscribe() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const isValidEmail = email && email.includes('@') && email.includes('.');
  const footerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(footerRef, { margin: '-10% 0px -10% 0px', amount: 0.2 });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidEmail) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <div className="space-y-6" ref={footerRef}>
      <Logo />
      <p className="text-sm text-muted-foreground max-w-md">
        Join thousands of travelers who've ditched chaotic group chats for seamless, collaborative trip planning.
      </p>
      <div className="pt-2">
        <form
          onSubmit={handleSubscribe}
          className="max-w-md relative"
        >
          <Input
            type="email"
            placeholder={email ? '' : 'Get travel inspiration & planning tips'}
            className={`rounded-full w-full h-8 text-sm pl-4 pr-9 transition-shadow duration-300 ${inView ? 'ring-2 ring-blue-400/60 ring-offset-2 animate-[pulse-glow_2s_ease-in-out_infinite]' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribed}
            aria-label="Email for subscription"
            autoComplete="email"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {subscribed ? (
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-green-500"
              >
                <CheckCircle className="h-4 w-4" />
              </motion.span>
            ) : (
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost" 
                className={`h-6 w-6 p-0 ${isValidEmail ? 'text-blue-500 hover:text-blue-600' : 'text-gray-300'}`} 
                disabled={!isValidEmail}
                title="Subscribe"
              >
                <SendHorizonal className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
        <p className="text-xs text-muted-foreground mt-1.5">
          We respect your privacy and will never share your email.
        </p>
      </div>
    </div>
  );
}
