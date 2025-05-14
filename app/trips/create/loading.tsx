import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Decorative shape for loading state
const LoadingShape = ({ className = '' }: { className?: string }) => {
  return (
    <div
      className={`absolute ${className} rounded-full animate-pulse bg-travel-purple/20 border border-travel-purple/30`}
    />
  );
};

export default function Loading() {
  return (
    <div className="container max-w-5xl pt-8 pb-20 relative overflow-hidden">
      {/* Decorative shapes */}
      <LoadingShape className="-top-4 -right-8 w-6 h-6" />
      <LoadingShape className="top-40 -left-10 w-8 h-8" />
      <LoadingShape className="bottom-20 right-10 w-5 h-5" />

      <div className="mb-6">
        <div className="h-8 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse mb-2"></div>
        <div className="h-4 w-80 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
      </div>

      {/* Mobile stepper placeholder */}
      <div className="lg:hidden mb-6 flex space-x-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full ${i === 0 ? 'bg-travel-purple/30' : 'bg-zinc-100 dark:bg-zinc-800'} animate-pulse`}
          ></div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="w-full lg:w-3/4 border-2 border-black dark:border-zinc-800 rounded-2xl bg-white dark:bg-black">
          <CardHeader>
            <CardTitle className="lowercase flex items-center gap-2 h-5 w-40 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse"></CardTitle>
          </CardHeader>

          <CardContent className="flex items-center justify-center p-12">
            <div className="w-16 h-16 rounded-full bg-travel-purple/10 flex items-center justify-center">
              <Spinner size="xl" className="text-travel-purple" />
            </div>
          </CardContent>
        </Card>

        <div className="w-full lg:w-1/4 space-y-4">
          <div className="border-2 border-black dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-black">
            <div className="h-5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse"></div>
              <div className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse"></div>
              <div className="h-4 w-5/6 bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
