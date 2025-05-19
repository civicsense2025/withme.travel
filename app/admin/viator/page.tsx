'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/container';
import { toast } from '@/hooks/use-toast';
import { ExternalLink, RefreshCw, Search, Check, X, MapPin } from 'lucide-react';
import { AdminLayout } from '@/components/features/admin/admin-layout';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES } from '@/utils/constants/tables';

interface Destination {
  id: string;
  city: string | null;
  country: string | null;
  viator_destination_id?: string | null;
}

interface ViatorDestination {
  destinationId: string | number;
  destinationName: string;
  destinationType?: string;
  parentId?: string | number;
  parentName?: string;
}

export default function ViatorAdminPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [viatorDestinations, setViatorDestinations] = useState<ViatorDestination[]>([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
  const [isLoadingViator, setIsLoadingViator] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('destinations');
  const [mappedCount, setMappedCount] = useState(0);
  const [unmappedCount, setUnmappedCount] = useState(0);

  const supabase = getBrowserClient();

  useEffect(() => {
    fetchDestinations();
    fetchViatorDestinations();
  }, []);

  useEffect(() => {
    // Calculate statistics
    if (destinations.length > 0) {
      const mapped = destinations.filter((d) => !!d.viator_destination_id).length;
      setMappedCount(mapped);
      setUnmappedCount(destinations.length - mapped);
    }
  }, [destinations]);

  async function fetchDestinations() {
    setIsLoadingDestinations(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.DESTINATIONS)
        .select('id, city, country, viator_destination_id')
        .order('city');

      if (error) throw error;
      setDestinations(
        (data || []).map((d) => ({
          ...d,
          city: d.city ?? '',
          country: d.country ?? '',
          viator_destination_id: d.viator_destination_id ?? '',
        }))
      );
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast({
        title: 'Error fetching destinations',
        description: 'Could not load destinations from the database.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDestinations(false);
    }
  }

  async function fetchViatorDestinations() {
    setIsLoadingViator(true);
    try {
      const response = await fetch('/api/viator/taxonomy/destinations');
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setViatorDestinations(data.data);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error fetching Viator destinations:', error);
      toast({
        title: 'Error fetching Viator destinations',
        description: 'Could not load destinations from Viator API.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingViator(false);
    }
  }

  async function updateDestination(destinationId: string, viatorId: string) {
    try {
      const { error } = await supabase
        .from(TABLES.DESTINATIONS)
        .update({ viator_destination_id: viatorId })
        .eq('id', destinationId);

      if (error) throw error;

      // Update local state
      setDestinations((prev) =>
        prev.map((d) => (d.id === destinationId ? { ...d, viator_destination_id: viatorId } : d))
      );

      toast({
        title: 'Destination updated',
        description: 'Viator ID has been successfully assigned.',
      });
    } catch (error) {
      console.error('Error updating destination:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update the destination.',
        variant: 'destructive',
      });
    }
  }

  async function updateAllDestinations() {
    setIsUpdating(true);
    try {
      // Create a map of Viator destination names to IDs
      const viatorMap = new Map<string, string>();
      viatorDestinations.forEach((dest) => {
        if (dest.destinationName && dest.destinationId) {
          viatorMap.set(dest.destinationName.toLowerCase(), dest.destinationId.toString());
        }
      });

      // For each destination without a Viator ID, try to find a match
      const updatePromises = destinations
        .filter((dest) => !dest.viator_destination_id)
        .map(async (dest) => {
          const cityLower = dest.city?.toLowerCase() || '';

          // Try exact match first
          let viatorId = viatorMap.get(cityLower);

          // If not found, try to find closest match
          if (!viatorId) {
            for (const [viatorName, id] of viatorMap.entries()) {
              if (cityLower.includes(viatorName) || viatorName.includes(cityLower)) {
                viatorId = id;
                console.log(`Found fuzzy match: "${dest.city}" -> "${viatorName}" (${id})`);
                break;
              }
            }
          }

          // Update if we found a match
          if (viatorId) {
            const { error } = await supabase
              .from(TABLES.DESTINATIONS)
              .update({ viator_destination_id: viatorId })
              .eq('id', dest.id);

            if (error) {
              console.error(`Error updating ${dest.city}:`, error);
              return false;
            }
            return true;
          }
          return false;
        });

      const results = await Promise.all(updatePromises);
      const updatedCount = results.filter(Boolean).length;

      // Refresh destinations
      await fetchDestinations();

      toast({
        title: 'Destinations updated',
        description: `Successfully mapped ${updatedCount} destinations with Viator IDs.`,
      });
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast({
        title: 'Update failed',
        description: 'An error occurred during the update process.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  }

  // Filter destinations based on search term
  const filteredDestinations = searchTerm
    ? destinations.filter(
        (dest) =>
          dest.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.viator_destination_id?.includes(searchTerm)
      )
    : destinations;

  // Filter Viator destinations based on search term
  const filteredViatorDestinations = searchTerm
    ? viatorDestinations.filter(
        (dest) =>
          dest.destinationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.destinationId?.toString().includes(searchTerm) ||
          dest.parentName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : viatorDestinations;

  return (
    <AdminLayout>
      <Container className="py-8">
        <h1 className="mb-6 text-3xl font-bold">Viator Destination Management</h1>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Destinations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{destinations.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Mapped Destinations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{mappedCount}</p>
              <p className="text-sm text-muted-foreground">
                {destinations.length > 0
                  ? Math.round((mappedCount / destinations.length) * 100)
                  : 0}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Unmapped Destinations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{unmappedCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Auto-Map Destinations</CardTitle>
            <CardDescription>
              Automatically map destinations in your database to Viator destination IDs based on
              city name matching.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This will attempt to find matching Viator destinations for all unmapped cities in your
              database. It uses exact matches when possible and falls back to fuzzy matching for
              similar names.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={updateAllDestinations}
              disabled={isUpdating || isLoadingViator || unmappedCount === 0}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Map {unmappedCount} Unmapped Destinations
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="destinations">Your Destinations</TabsTrigger>
            <TabsTrigger value="viator">Viator Destinations</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search destinations..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="destinations">
            <Card>
              <CardHeader>
                <CardTitle>Your Destinations</CardTitle>
                <CardDescription>
                  Your destinations database with mapped Viator destination IDs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDestinations ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <p>Loading destinations...</p>
                    </div>
                  </div>
                ) : filteredDestinations.length > 0 ? (
                  <div className="max-h-[70vh] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>City</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Viator ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDestinations.map((dest) => (
                          <TableRow key={dest.id}>
                            <TableCell className="font-medium">{dest.city}</TableCell>
                            <TableCell>{dest.country}</TableCell>
                            <TableCell>{dest.viator_destination_id || '-'}</TableCell>
                            <TableCell>
                              {dest.viator_destination_id ? (
                                <Badge className="bg-green-100 text-green-800">Mapped</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                  Unmapped
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {dest.viator_destination_id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    window.open(
                                      `https://www.viator.com/${dest.city?.replace(/\s+/g, '-')}/d${dest.viator_destination_id}-ttd?pid=P00250046&mcid=42383&medium=link&campaign=wtm`,
                                      '_blank'
                                    )
                                  }
                                >
                                  <ExternalLink size={14} className="mr-1" />
                                  View
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p>No destinations found matching your search.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="viator">
            <Card>
              <CardHeader>
                <CardTitle>Viator Destinations</CardTitle>
                <CardDescription>
                  All available destinations from Viator API. Use these IDs to map to your
                  destinations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingViator ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <p>Loading Viator destinations...</p>
                    </div>
                  </div>
                ) : filteredViatorDestinations.length > 0 ? (
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
                        {filteredViatorDestinations.map((dest) => (
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
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p>No Viator destinations found matching your search.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={fetchViatorDestinations}
                  disabled={isLoadingViator}
                >
                  {isLoadingViator ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Cache
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
    </AdminLayout>
  );
}
