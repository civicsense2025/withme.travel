export default function TripsLoading() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3 animate-pulse">
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 