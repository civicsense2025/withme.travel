export default function TripsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <header className="mb-12">
        <div className="h-9 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="h-5 w-56 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
            <div className="h-10 w-32 bg-travel-purple/10 dark:bg-travel-purple/20 rounded-full border-2 border-travel-purple/30"></div>
          </div>
        </div>
      </header>

      <section className="mb-12">
        <div className="h-7 w-40 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-6"></div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border-2 border-black dark:border-zinc-800 animate-pulse"
            >
              <div className="flex flex-col md:flex-row md:h-56">
                <div className="h-48 md:h-auto md:w-2/5 bg-zinc-100 dark:bg-zinc-800"></div>
                <div className="p-6 flex-grow relative md:w-3/5 bg-white dark:bg-black">
                  <div className="h-6 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-3"></div>
                  <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-5"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="h-5 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
                    <div className="h-5 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
                    <div className="h-5 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-md md:col-span-2"></div>
                  </div>
                  <div className="absolute bottom-6 right-6">
                    <div className="h-8 w-8 rounded-full bg-travel-purple/20 border border-travel-purple/30"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="h-7 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-6"></div>
        <div className="space-y-6">
          {[1].map((i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border-2 border-black dark:border-zinc-800 animate-pulse"
            >
              <div className="flex flex-col md:flex-row md:h-56">
                <div className="h-48 md:h-auto md:w-2/5 bg-zinc-100 dark:bg-zinc-800"></div>
                <div className="p-6 flex-grow relative md:w-3/5 bg-white dark:bg-black">
                  <div className="h-6 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-3"></div>
                  <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded-md mb-5"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="h-5 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
                    <div className="h-5 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
                    <div className="h-5 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-md md:col-span-2"></div>
                  </div>
                  <div className="absolute bottom-6 right-6">
                    <div className="h-8 w-8 rounded-full bg-travel-purple/20 border border-travel-purple/30"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
