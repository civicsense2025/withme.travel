import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContinentStatsClientWrapper } from './client-wrapper';
import { createServerComponentClient } from '@/utils/supabase/server';

interface ContinentPageProps {
  params: {
    name: string;
  };
}

export default async function ContinentPage({ params }: ContinentPageProps) {
  const { name } = params;
  const continentName = decodeURIComponent(name);

  // Fetch continent data from Supabase
  const supabase = await createServerComponentClient();
  const { data: destinations, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('continent', continentName);

  if (error) {
    console.error('Error fetching continent data:', error);
    notFound();
  }

  if (!destinations || destinations.length === 0) {
    notFound();
  }

  // Get unique countries in this continent, filtering out nulls
  const countries = [
    ...new Set(destinations.map((dest) => dest.country).filter(Boolean) as string[]),
  ];

  try {
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

        <h1 className="textU3xl font-bold mbU4">{continentName}</h1>

        <div className="grid grid-colsU1 gapU8">
          <Suspense fallback={<p>Loading continent information...</p>}>
            <ContinentStatsClientWrapper
              continent={continentName}
              countriesCount={countries.length}
              destinationsCount={destinations.length}
            />
          </Suspense>

          <div>
            <h2 className="textU2xl font-semibold mbU4">Countries in {continentName}</h2>
            <div className="grid grid-colsU1 md:grid-colsU2 lg:grid-colsU3 gapU4">
              {countries.map((country) => (
                <Link
                  key={country}
                  href={`/countries/${encodeURIComponent(country)}`}
                  className="pU4 border rounded-lg hover:bg-muted transition-colors"
                >
                  <h3 className="font-medium">{country}</h3>
                  <p className="text-sm text-muted-foreground">
                    {destinations.filter((d) => d.country === country).length} destinations
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`Error fetching continent ${name}:`, error);
    const errorMessage = error instanceof Error ? error.message : '-nknown error occurred';
    return (
      <div>
        <h1>Error</h1>
        <p>Failed to load continent data: {errorMessage}</p>
      </div>
    );
  }
}
