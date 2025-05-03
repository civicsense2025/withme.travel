'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/page-header';

// Sample country data
const FEATURED_COUNTRIES = [
  {
    slug: 'france',
    name: 'France',
    description:
      'Discover a land of cultural treasures, from iconic Parisian landmarks to sun-drenched Mediterranean coasts and rustic countryside.',
    coverImage: '/images/destinations/paris-eiffel-tower.jpg',
    accentColor: 'travel-blue',
  },
  {
    slug: 'japan',
    name: 'Japan',
    description:
      'Experience the perfect blend of ancient traditions and cutting-edge modernity across a stunning archipelago of diverse landscapes.',
    coverImage: '/images/destinations/kyoto-bamboo-forest.jpg',
    accentColor: 'travel-red',
  },
  {
    slug: 'italy',
    name: 'Italy',
    description:
      'Explore the birthplace of the Renaissance, home to world-class cuisine, stunning architecture, and breathtaking coastal scenery.',
    coverImage: '/images/destinations/rome-colosseum.jpg',
    accentColor: 'travel-green',
  },
  {
    slug: 'australia',
    name: 'Australia',
    description:
      'Journey through diverse landscapes from vibrant cities to the outback, with unique wildlife and stunning natural wonders.',
    coverImage: '/images/destinations/sydney-opera-house.jpg',
    accentColor: 'travel-yellow',
  },
  {
    slug: 'united-states',
    name: 'United States',
    description:
      'Discover an incredibly diverse nation spanning bustling metropolises, breathtaking national parks, and everything in between.',
    coverImage: '/images/destinations/los-angeles-united-states.jpg',
    accentColor: 'travel-purple',
  },
  {
    slug: 'thailand',
    name: 'Thailand',
    description:
      'Experience vibrant city life, serene temples, and paradise-like beaches in the heart of Southeast Asia.',
    coverImage: '/images/destinations/bangkok-grand-palace.jpg',
    accentColor: 'travel-mint',
  },
];

// Animation variants for containers
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

// Animation variants for items
const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function CountriesPage() {
  return (
    <div className="container py-10">
      <PageHeader
        heading="Explore Countries"
        description="Discover destinations and travel experiences by country"
      />

      {/* Breadcrumbs */}
      <div className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>{' '}
        /{' '}
        <Link href="/continents" className="hover:text-foreground">
          Continents
        </Link>{' '}
        / <span className="text-foreground">Countries</span>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {FEATURED_COUNTRIES.map((country) => (
          <motion.div
            key={country.slug}
            variants={itemVariants}
            transition={{ duration: 0.5 }}
            whileHover={{
              scale: 1.03,
              transition: { duration: 0.2 },
            }}
          >
            <Link href={`/countries/${country.slug}`} className="block h-full">
              <div className="relative rounded-xl overflow-hidden h-64 group">
                <div
                  className={`absolute inset-0 bg-${country.accentColor} mix-blend-multiply opacity-60 group-hover:opacity-70 transition-opacity z-10`}
                />
                <Image
                  src={country.coverImage}
                  alt={country.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end text-white">
                  <h2 className="text-3xl font-bold mb-2">{country.name}</h2>
                  <p className="text-white/90">{country.description}</p>
                  <div className="mt-4 inline-flex items-center text-sm font-medium">
                    Explore destinations <span className="ml-2">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
