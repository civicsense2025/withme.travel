'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

import { PageHeader } from '@/components/page-header';

// Continent data - same as in the [continent] page
const CONTINENTS = [
  {
    slug: 'africa',
    name: 'Africa',
    description:
      'Explore the diverse landscapes and vibrant cultures across 54 countries, from the Sahara Desert to safari adventures in the savanna.',
    coverImage: '/images/continents/africa.jpg',
    accentColor: 'travel-yellow',
  },
  {
    slug: 'asia',
    name: 'Asia',
    description:
      "Discover the world's largest continent, home to ancient civilizations, bustling megacities, and breathtaking natural wonders.",
    coverImage: '/images/continents/asia.jpg',
    accentColor: 'travel-red',
  },
  {
    slug: 'europe',
    name: 'Europe',
    description:
      'Experience rich history, diverse cultures, and stunning landscapes across this compact continent of 44 countries.',
    coverImage: '/images/continents/europe.jpg',
    accentColor: 'travel-blue',
  },
  {
    slug: 'north-america',
    name: 'North America',
    description:
      'From arctic landscapes to tropical beaches, explore the diverse terrain and vibrant cities across 23 countries.',
    coverImage: '/images/continents/north-america.jpg',
    accentColor: 'travel-purple',
  },
  {
    slug: 'south-america',
    name: 'South America',
    description:
      'Venture through rainforests, mountain ranges, and historic ruins in this continent of extraordinary biodiversity.',
    coverImage: '/images/continents/south-america.jpg',
    accentColor: 'travel-green',
  },
  {
    slug: 'oceania',
    name: 'Oceania',
    description:
      'Discover island paradises, unique wildlife, and diverse indigenous cultures across Australia, New Zealand, and Pacific islands.',
    coverImage: '/images/continents/oceania.jpg',
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
  }
  };

// Animation variants for items
const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1 }
  };

export default function ContinentsPage() {
  return (
    <div className="container py-10">
      <PageHeader
        heading="Explore Continents"
        description="Discover destinations across the world organized by continent"
      />

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {CONTINENTS.map((continent) => (
          <motion.div
            key={continent.slug}
            variants={itemVariants}
            transition={{ duration: 0.5 }}
            whileHover={{
              scale: 1.03,
              transition: { duration: 0.2 },
            }}
          >
            <Link href={`/continents/${continent.slug}`} className="block h-full">
              <div className="relative rounded-xl overflow-hidden h-64 group">
                <div
                  className={`absolute inset-0 bg-${continent.accentColor} mix-blend-multiply opacity-60 group-hover:opacity-70 transition-opacity z-10`}
                />
                <Image
                  src={continent.coverImage}
                  alt={continent.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end text-white">
                  <h2 className="text-3xl font-bold mb-2">{continent.name}</h2>
                  <p className="text-white/90">{continent.description}</p>
                  <div className="mt-4 inline-flex items-center text-sm font-medium">
                    Explore destinations <span className="ml-2">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-16 bg-muted/30 p-8 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Plan Your Continental Adventure</h2>
        <p className="mb-6 text-muted-foreground">
          Each continent offers unique experiences, cultures, and landscapes. Explore our continent
          guides to discover insider tips, must-visit destinations, and practical travel information
          to help you plan your perfect trip.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Why Browse by Continent?</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Get comprehensive regional overviews</li>
              <li>• Discover lesser-known destinations</li>
              <li>• Compare climates and best times to visit</li>
              <li>• Understand cultural similarities and differences</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Tips for Multi-Country Travel</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Research visa requirements for each country</li>
              <li>• Consider regional travel passes where available</li>
              <li>• Plan around regional weather patterns</li>
              <li>• Learn about cross-border transportation options</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
