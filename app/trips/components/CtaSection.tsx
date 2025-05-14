import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CtaSection: React.FC = () => (
  <section className="bg-primary/5 py-16 px-4">
    <div className="max-w-3xl mx-auto text-center mt-24 mb-24">
      <h2 className="text-5xl md:text-4xl font-bold mb-4">
        Ready to plan your next adventure?
      </h2>
      <p className="text-muted-foreground mb-8">
        Start creating memorable trips with friends and family today. It's free to get started!
      </p>
      <Link href="/trips/create">
        <Button size="lg" className="rounded-full px-8">
          Create Your First Trip
        </Button>
      </Link>
    </div>
  </section>
);

export default CtaSection; 