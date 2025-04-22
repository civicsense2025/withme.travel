import { Skeleton } from "@/components/ui/skeleton"

export default function ItinerariesLoading() {
  return (
    <div className="container py-10">
      <div className="space-y-2 mb-8">
        <Skeleton className="h-12 w-[300px]" />
        <Skeleton className="h-6 w-[500px]" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-8 mb-6">
        <Skeleton className="h-10 w-[300px]" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      <div className="mb-8">
        <Skeleton className="h-10 w-[500px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(null)
          .map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="pt-4 border-t mt-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="mt-12 text-center">
        <Skeleton className="h-8 w-[300px] mx-auto" />
        <Skeleton className="h-4 w-[500px] mx-auto mt-4" />
        <Skeleton className="h-10 w-[200px] mx-auto mt-6" />
      </div>
    </div>
  )
}
