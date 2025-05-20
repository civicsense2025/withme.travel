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
  ArrowRight,
  Map,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';

export function EmptyTrips() {
  const router = useRouter();
  const { user } = useAuth();

  const quickStartDestinations = [
    {
      name: 'Beach Getaway',
      icon: <Beach className="h-5 w-5" />,
      description: 'Sun, sand, and surf adventures',
      color: 'bg-travel-blue/10 text-travel-blue hover:bg-travel-blue/20',
    },
    {
      name: 'City Adventure',
      icon: <Building className="h-5 w-5" />,
      description: 'Urban exploration and culture',
      color: 'bg-travel-purple/10 text-travel-purple hover:bg-travel-purple/20',
    },
    {
      name: 'Mountain Escape',
      icon: <Mountains className="h-5 w-5" />,
      description: 'Breathtaking views and hikes',
      color: 'bg-travel-mint/10 text-travel-mint hover:bg-travel-mint/20',
    },
    {
      name: 'Food & Culture',
      icon: <Coffee className="h-5 w-5" />,
      description: 'Cafés, cuisine, and local life',
      color: 'bg-travel-pink/10 text-travel-pink hover:bg-travel-pink/20',
    },
  ];

  const handleQuickStart = (destination: string) => {
    router.push(`${PAGE_ROUTES.CREATE_TRIP}?destination=${encodeURIComponent(destination)}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="my-8 px-4">
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white to-travel-blue/5 dark:from-gray-900/90 dark:to-travel-purple/10 backdrop-blur-sm">
        <CardContent className="p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-gradient-to-br from-travel-purple/20 to-travel-blue/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm shadow-inner">
                <Plane className="h-8 w-8 text-gradient-to-r from-travel-purple to-travel-blue" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-travel-purple to-travel-blue">
                Start Your Travel Journey
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                Create your first trip and start bringing your travel ideas to life with friends.
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 gap-4 mb-12"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {quickStartDestinations.map((dest, index) => (
                <motion.div key={dest.name} variants={item}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'h-auto w-full p-5 flex items-start gap-4 justify-start border rounded-xl transition-all hover:shadow-md',
                      dest.color
                    )}
                    onClick={() => handleQuickStart(dest.name)}
                  >
                    <div className="p-3 rounded-full flex-shrink-0 bg-background/70 backdrop-blur-sm shadow-sm">
                      {dest.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-base">{dest.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{dest.description}</p>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col md:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link href={PAGE_ROUTES.CREATE_TRIP}>
                <Button
                  size="lg"
                  className="rounded-xl gap-2 px-8 bg-gradient-to-r from-travel-purple to-travel-blue hover:from-travel-purple/90 hover:to-travel-blue/90 transition-all shadow-md hover:shadow-lg group"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Create Custom Trip</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/destinations">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl gap-2 px-8 border-travel-purple/20 hover:bg-travel-purple/5"
                >
                  <Map className="h-5 w-5" />
                  <span>Explore Destinations</span>
                </Button>
              </Link>
            </motion.div>

            {/* Only show the sign-in message if user is not logged in */}
            {!user && (
              <motion.div
                className="mt-10 text-center text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-travel-purple/70" />
                  <span>Sign in to save your trips and collaborate with friends</span>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
