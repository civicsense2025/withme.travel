import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountryStatsClientWrapper } from './client-wrapper';
import { createServerComponentClient } from '@/utils/supabase/server';

interface CountryPageProps {
  params: {
    name: string;
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { name } = params;
  const countryName = decodeURIComponent(name);

  // Fetch country data from Supabase
  const supabase = await createServerComponentClient();
  const { data: destinations, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('country', countryName);

  if (error) {
    console.error('Error fetching country data:', error);
    notFound();
  }

  if (!destinations || destinations.length === 0) {
    notFound();
  }

  return (
    <div className="container pyU6 max-wU6xl mx-auto">
      <div className="flex items-center mbU6">
        <Link href="/destinations">
          <Button variant="ghost" size="sm" className="gapU1">
            <ArrowLeft className="hU4 wU4" />
            Back to destinations
          </Button>
        </Link>
      </div>
      <h1 className="textU3xl font-bold mbU4">{countryName}</h1>
      <div className="grid grid-colsU1 gapU8">
        <Suspense fallback={<p>Loading country information...</p>}>
          <CountryStatsClientWrapper
            country={countryName}
            destinationsCount={destinations.length}
          />
        </Suspense>

        <div>
          <h2 className="textU2xl font-semibold mbU4">Destinations in {countryName}</h2>
          <div className="grid grid-colsU1 md:grid-colsU2 lg:grid-colsU3 gapU4">
            {destinations.map((destination) => (
              <Link
                key={destination.id ?? destination.city ?? Math.random()}
                href={`/destinations/${(destination.city ?? '').toLowerCase().replace(/\s+/g, '-')}`}
                className="pU4 border rounded-lg hover:bg-muted transition-colors"
              >
                <h3 className="font-medium">{destination.city ?? '-nknown City'}</h3>
                <p className="text-sm text-muted-foreground">
                  {destination.best_season && <>Best season: {destination.best_season}</>}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
