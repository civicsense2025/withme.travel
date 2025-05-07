import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/container';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Debug Dashboard | withme.travel',
  description: 'Debug tools and system information for withme.travel',
};

export default function DebugPage() {
  return (
    <Container size="full">
      <div className="space-y-4 mb-10">
        <Skeleton className="h-12 w-[300px]" />
        <Skeleton className="h-6 w-[500px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </Container>
  );
}
