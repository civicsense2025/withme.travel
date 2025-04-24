import { Skeleton } from "@/components/ui/skeleton";
export default function ItineraryLoading() {
    return (<div className="container py-10">
      <Skeleton className="h-6 w-[150px] mb-6"/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-[400px] w-full rounded-lg mb-6"/>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Skeleton className="h-10 w-[300px]"/>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-[100px]"/>
              <Skeleton className="h-10 w-[150px]"/>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <Skeleton className="h-6 w-[120px]"/>
            <Skeleton className="h-6 w-[100px]"/>
            <Skeleton className="h-6 w-[140px]"/>
            <Skeleton className="h-6 w-[160px]"/>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <Skeleton className="h-6 w-[80px]"/>
            <Skeleton className="h-6 w-[100px]"/>
            <Skeleton className="h-6 w-[90px]"/>
          </div>

          <div className="space-y-4 mb-10">
            <Skeleton className="h-6 w-full"/>
            <Skeleton className="h-6 w-[90%]"/>
            <Skeleton className="h-6 w-[80%]"/>
            <Skeleton className="h-6 w-full"/>
            <Skeleton className="h-6 w-[85%]"/>
          </div>

          <div className="mb-4">
            <Skeleton className="h-10 w-[400px]"/>
          </div>

          <div className="space-y-8">
            {Array(3)
            .fill(null)
            .map((_, i) => (<div key={i} className="border rounded-lg p-6">
                  <Skeleton className="h-8 w-[200px] mb-4"/>
                  <div className="space-y-6">
                    {Array(4)
                .fill(null)
                .map((_, j) => (<div key={j} className="flex gap-4">
                          <Skeleton className="w-16 h-6 flex-shrink-0"/>
                          <div className="w-full">
                            <Skeleton className="h-6 w-[250px] mb-2"/>
                            <Skeleton className="h-4 w-full mb-1"/>
                            <Skeleton className="h-4 w-[80%]"/>
                          </div>
                        </div>))}
                  </div>
                </div>))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <Skeleton className="h-8 w-[200px] mb-2"/>
              <Skeleton className="h-4 w-full mb-4"/>
              <Skeleton className="h-4 w-[90%] mb-6"/>
              <Skeleton className="h-10 w-full"/>
            </div>

            <div className="border rounded-lg p-6">
              <Skeleton className="h-8 w-[150px] mb-4"/>
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full"/>
                <div>
                  <Skeleton className="h-5 w-[150px] mb-1"/>
                  <Skeleton className="h-4 w-[100px]"/>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <Skeleton className="h-8 w-[180px] mb-4"/>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-16 w-16 rounded"/>
                  <div>
                    <Skeleton className="h-5 w-[150px] mb-1"/>
                    <Skeleton className="h-4 w-[80px]"/>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-16 w-16 rounded"/>
                  <div>
                    <Skeleton className="h-5 w-[170px] mb-1"/>
                    <Skeleton className="h-4 w-[80px]"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
