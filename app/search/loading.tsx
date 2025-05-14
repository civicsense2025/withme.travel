import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SearchLoading() {
  return (
    <div className="container py-8">
      <Skeleton className="h-10 w-64 mb-2" />
      <Skeleton className="h-5 w-96 mb-6" />

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all" disabled>
            All
          </TabsTrigger>
          <TabsTrigger value="destinations" disabled>
            Destinations
          </TabsTrigger>
          <TabsTrigger value="trips" disabled>
            Trips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
