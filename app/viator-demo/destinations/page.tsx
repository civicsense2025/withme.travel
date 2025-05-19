'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Container } from '@/components/container';
import { ExternalLink, Search } from 'lucide-react';

// Define the shape of a Viator destination
interface ViatorDestination {
  destinationId: string | number;
  destinationName: string;
  destinationType?: string;
  parentId?: string | number;
  parentName?: string;
  lookupId?: string;
  destinationUrlName?: string;
  defaultCurrencyCode?: string;
  [key: string]: any; // For any other properties that might be returned
}

export default function ViatorDestinationsPage() {
  const [destinations, setDestinations] = useState<ViatorDestination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('destinations');

  useEffect(() => {
    const fetchDestinations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/viator/taxonomy/destinations');

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setDestinations(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        console.error('Error fetching destinations:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Filter destinations based on search term
  const filteredDestinations = searchTerm
    ? destinations.filter(
        (dest) =>
          dest.destinationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.destinationId?.toString().includes(searchTerm)
      )
    : destinations;

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-3xl font-bold">Viator Destination Mapping Tool</h1>
      <p className="mb-8 text-muted-foreground">
        Use this tool to explore Viator destinations and find the correct destination IDs for your
        integration. Viator uses numeric destination IDs that need to be mapped to your internal
        destination data.
      </p>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="integration">Integration Help</TabsTrigger>
        </TabsList>

        <TabsContent value="destinations">
          <Card>
            <CardHeader>
              <CardTitle>Viator Destinations</CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by destination name or ID..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-96 items-center justify-center">
                  <div className="text-center">
                    <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <p>Loading destinations...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  <p>Error: {error}</p>
                  <Button onClick={() => window.location.reload()} className="mt-4">
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="max-h-[70vh] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Parent Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDestinations.length > 0 ? (
                        filteredDestinations.map((dest) => (
                          <TableRow key={dest.destinationId}>
                            <TableCell className="font-medium">{dest.destinationId}</TableCell>
                            <TableCell>{dest.destinationName}</TableCell>
                            <TableCell>{dest.parentName || '-'}</TableCell>
                            <TableCell>{dest.destinationType}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(
                                    `https://www.viator.com/${dest.destinationName.replace(/\s+/g, '-')}/d${dest.destinationId}-ttd?pid=P00250046&mcid=42383&medium=link&campaign=wtm`,
                                    '_blank'
                                  )
                                }
                              >
                                <ExternalLink size={14} className="mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No destinations found matching your search.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">How to Map Your Destinations to Viator IDs</h3>

              <p>
                Viator uses numeric destination IDs (e.g., 737 for London) rather than UUIDs or city
                names directly. To integrate with Viator, you need to map your internal destination
                identifiers to Viator's destination IDs.
              </p>

              <h4 className="text-md font-medium mt-4">
                Option 1: Manual Mapping (Recommended for Few Destinations)
              </h4>
              <p>Create a mapping object in your codebase:</p>
              <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-x-auto">
                {`const VIATOR_DESTINATION_MAP = {
  'London': '737',
  'New York': '687',
  'Paris': '479',
  // Add more cities as needed
};

// Usage
const viatorDestId = VIATOR_DESTINATION_MAP[cityName] || null;`}
              </pre>

              <h4 className="text-md font-medium mt-4">
                Option 2: Database Mapping (Recommended for Many Destinations)
              </h4>
              <p>
                Store the mapping in your database by adding a <code>viator_destination_id</code>{' '}
                column to your destinations table. Use this page to find the appropriate IDs and
                update your database accordingly.
              </p>

              <h4 className="text-md font-medium mt-4">Option 3: API Lookup</h4>
              <p>
                Fetch the mapping from Viator's <code>/taxonomy/destinations</code> endpoint and
                cache it in your application. This approach is more dynamic but requires additional
                API calls.
              </p>

              <div className="mt-6 rounded-md bg-blue-50 p-4 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200">
                <h4 className="font-medium">Important Notes</h4>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Always use Viator's numeric destination IDs, not your internal UUIDs</li>
                  <li>
                    The destination ID is used in the POST to <code>/search/products</code>
                  </li>
                  <li>
                    The same ID is used in Viator URLs:{' '}
                    <code>https://www.viator.com/London/d737-ttd</code>
                  </li>
                  <li>Cache the destination data and refresh it weekly as recommended by Viator</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
