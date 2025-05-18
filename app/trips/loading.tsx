export default function TripsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="mb-8 text-center">
        <div className="h-10 w-36 bg-zinc-100 dark:bg-zinc-800 rounded-md mx-auto mb-2"></div>
        <div className="h-5 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-md mx-auto"></div>
      </div>

      {/* Tabs skeleton */}
      <div className="mb-8">
        <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-md flex space-x-1 p-1 w-full max-w-xs mx-auto mb-6">
          <div className="h-8 flex-1 bg-white dark:bg-zinc-900 rounded"></div>
          <div className="h-8 flex-1 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          <div className="h-8 flex-1 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
        </div>

        {/* Trip search skeleton */}
        <div className="flex flex-wrap gap-4 items-center mb-8 justify-center">
          <div className="relative w-full max-w-md mx-auto">
            <div className="h-9 w-full bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
          </div>
          <div className="w-full max-w-md">
            <div className="grid grid-cols-3 w-full h-10 gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-md p-1">
              <div className="col-span-1 bg-white dark:bg-zinc-900 rounded h-8"></div>
              <div className="col-span-1 bg-zinc-200 dark:bg-zinc-700 rounded h-8"></div>
              <div className="col-span-1 bg-zinc-200 dark:bg-zinc-700 rounded h-8"></div>
            </div>
          </div>
        </div>

        {/* Trip cards skeleton */}
        <div className="space-y-8">
          <div>
            <div className="h-6 w-36 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-4"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-pulse"
                >
                  <div className="flex flex-col md:flex-row md:h-40">
                    <div className="h-32 md:h-auto md:w-1/3 bg-zinc-100 dark:bg-zinc-800"></div>
                    <div className="p-4 flex-grow relative md:w-2/3 bg-white dark:bg-black">
                      <div className="h-5 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-2"></div>
                      <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-3"></div>
                      <div className="flex space-x-3">
                        <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
                        <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular destinations skeleton */}
      <div className="border-t pt-8">
        <div className="text-center mb-6">
          <div className="h-7 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-md mx-auto mb-2"></div>
          <div className="h-4 w-64 bg-zinc-100 dark:bg-zinc-800 rounded-md mx-auto"></div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse flex flex-col items-center justify-center"
            >
              <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 mb-2"></div>
              <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
