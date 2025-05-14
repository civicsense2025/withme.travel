import { Skeleton } from '@/components/ui/skeleton';

export default function ItinerariesLoading() {
  return (
    <div className="container py-10">
      <div className="space-y-2 mb-8">
        <Skeleton className="h-12 w-[300px] bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
        <Skeleton className="h-6 w-[500px] bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-8 mb-6">
        <Skeleton className="h-10 w-[300px] bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-[180px] bg-zinc-100 dark:bg-zinc-800 rounded-full" />
          <Skeleton className="h-10 w-[180px] bg-travel-purple/10 dark:bg-travel-purple/20 rounded-full border-2 border-travel-purple/30" />
          <Skeleton className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        </div>
      </div>

      <div className="mb-8">
        <Skeleton className="h-10 w-[500px] bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className="border-2 border-black dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-black"
            >
              <Skeleton className="h-48 w-full bg-zinc-100 dark:bg-zinc-800" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-[200px] bg-zinc-100 dark:bg-zinc-800 rounded-md" />
                <Skeleton className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-md" />
                <Skeleton className="h-4 w-[80%] bg-zinc-100 dark:bg-zinc-800 rounded-md" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                  <Skeleton className="h-6 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                  <Skeleton className="h-6 w-16 bg-travel-purple/10 dark:bg-travel-purple/20 rounded-full border border-travel-purple/30" />
                </div>
                <div className="pt-4 border-t mt-4 border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-[120px] bg-zinc-100 dark:bg-zinc-800 rounded-md" />
                    <Skeleton className="h-4 w-[120px] bg-zinc-100 dark:bg-zinc-800 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="mt-12 text-center">
        <Skeleton className="h-8 w-[300px] mx-auto bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
        <Skeleton className="h-4 w-[500px] mx-auto mt-4 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
        <Skeleton className="h-10 w-[200px] mx-auto mt-6 bg-travel-purple/10 dark:bg-travel-purple/20 rounded-full border-2 border-travel-purple/30" />
      </div>
    </div>
  );
}
