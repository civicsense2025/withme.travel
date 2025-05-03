'use client';
import { PAGE_ROUTES } from '@/utils/constants/routes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Plane,
  BeanIcon as Beach,
  MountainIcon as Mountains,
  Coffee,
  Building,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function EmptyTrips() {
  const router = useRouter();
  
  const quickStartDestinations = [
    {
      name: 'beach getaway',
      icon: <Beach className="h-5 w-5" />,
      destination: 'Bali, Indonesia',
      description: 'sun, sand, and surf',
    },
    {
      name: 'city adventure',
      icon: <Building className="h-5 w-5" />,
      destination: 'New York City, USA',
      description: 'explore the big apple',
    },
    {
      name: 'mountain escape',
      icon: <Mountains className="h-5 w-5" />,
      destination: 'Banff, Canada',
      description: 'breathtaking mountain views',
    },
    {
      name: 'coffee & culture',
      icon: <Coffee className="h-5 w-5" />,
      destination: 'Paris, France',
      description: 'cafés, art, and history',
    },
  ];

  const handleQuickStart = (destination: string) => {
    router.push(`${PAGE_ROUTES.CREATE_TRIP}?destination=${encodeURIComponent(destination)}`);
  };

  return (
    <div className="mt-12">
      <Card className="gradient-bg-1 border-0">
        <CardContent className="p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="bg-background/80 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plane className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                let's plan your <span className="gradient-text">first adventure</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                no trips yet! choose a quick start option or create your own from scratch
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {quickStartDestinations.map((dest) => (
                <Button
                  key={dest.name}
                  variant="outline"
                  className="h-auto p-4 flex items-start gap-3 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  onClick={() => handleQuickStart(dest.destination)}
                >
                  <div className="bg-gradient-1 p-2 rounded-full">{dest.icon}</div>
                  <div className="text-left">
                    <p className="font-medium">{dest.name}</p>
                    <p className="text-xs text-muted-foreground">{dest.description}</p>
                  </div>
                </Button>
              ))}
            </div>

            <div className="flex justify-center">
              <Link href={PAGE_ROUTES.CREATE_TRIP}>
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  create custom trip
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
