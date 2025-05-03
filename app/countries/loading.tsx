import { Skeleton } from '@/components/ui/skeleton';

export default function CountriesLoading() {
  return (
    <div className="container py-10">
      <div className="space-y-4 mb-10">
        <Skeleton className="h-12 w-[300px]" />
        <Skeleton className="h-6 w-[500px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
} 