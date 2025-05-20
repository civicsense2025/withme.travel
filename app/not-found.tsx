import Link from 'next/link';
import { ArrowRight, Compass, Map, Users2, Plane, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  // Main navigation links
  const mainLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/trips', label: 'Trips', icon: Plane },
    { href: '/groups', label: 'Groups', icon: Users2 },
    { href: '/destinations', label: 'Destinations', icon: Compass },
    { href: '/itineraries', label: 'Itineraries', icon: Map },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      {/* Fun emoji and message */}
      <div className="mb-8">
        <div className="text-7xl mb-4 animate-bounce">🧭</div>
        <h1 className="text-4xl font-bold mb-2">Whoops! Lost in Transit</h1>
        <p className="text-xl text-muted-foreground mb-6">
          The page you're looking for seems to have wandered off on its own adventure.
        </p>
      </div>
      {/* Navigation options */}
      <div className="mb-12 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Where would you like to go?</h2>
        <div className="grid gap-3">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="no-underline">
                <Button variant="outline" className="w-full justify-start h-12 text-base">
                  <Icon className="mr-2 h-5 w-5" />
                  {link.label}
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Helpful message */}
      <p className="text-sm text-muted-foreground max-w-md">
        If you think this is an error or need any help planning your next adventure, feel free to{' '}
        <Link href="/support" className="underline underline-offset-4 hover:text-primary">
          contact our support team
        </Link>
        .
      </p>
    </div>
  );
}
