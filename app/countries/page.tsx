'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/page-header';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/utils/supabase/client';
import { TABLES } from '@/utils/constants/database';

// Define types for country data
interface CountryData {
  name: string;
  image_url: string | null;
  slug: string;
  description: string;
  accentColor: string;
}

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
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const supabase = createBrowserClient();

        // Get unique countries with aggregated data
        const { data, error } = await supabase
          .from(TABLES.DESTINATIONS)
          .select('country, image_url')
          .order('country', { ascending: true })
          .not('country', 'is', null);

        if (error) throw error;

        // Group by country to get unique countries
        const countryMap: Record<string, Partial<CountryData>> = {};
        data?.forEach(item => {
          if (item.country && !countryMap[item.country]) {
            countryMap[item.country] = {
              name: item.country,
              image_url: item.image_url,
              slug: item.country.toLowerCase().replace(/\s+/g, '-')
            };
          }
        });

        // Convert to array and assign accent colors
        const accentColors = ['travel-blue', 'travel-red', 'travel-green', 'travel-yellow', 'travel-purple', 'travel-mint'];
        const countriesArray = Object.values(countryMap).map((country, index) => ({
          name: country.name || 'Unknown Country',
          image_url: country.image_url || '/destinations/default.jpg',
          slug: country.slug || 'unknown',
          description: `Explore the beautiful destinations of ${country.name || 'this country'}`,
          accentColor: accentColors[index % accentColors.length]
        }));

        setCountries(countriesArray.slice(0, 6)); // Limit to 6 countries for display
      } catch (err: any) {
        console.error('Error fetching countries:', err);
        setError(err.message || 'Failed to load countries');
      } finally {
        setLoading(false);
      }
    }

    fetchCountries();
  }, []);

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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl h-64 bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">Error loading countries: {error}</div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {countries.map((country) => (
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
                    src={country.image_url || `/destinations/${country.slug}.jpg`}
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
      )}
    </div>
  );
}
