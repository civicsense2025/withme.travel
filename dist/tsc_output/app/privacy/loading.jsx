import { Skeleton } from "@/components/ui/skeleton";
export default function PrivacyLoading() {
    return (<div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Skeleton className="h-9 w-24"/>
      </div>

      <Skeleton className="h-10 w-48 mb-6"/>
      <Skeleton className="h-5 w-36 mb-6"/>

      <div className="space-y-4">
        <Skeleton className="h-4 w-full"/>
        <Skeleton className="h-4 w-full"/>
        <Skeleton className="h-4 w-3/4"/>

        <Skeleton className="h-6 w-48 mt-8"/>
        <Skeleton className="h-4 w-full"/>
        <Skeleton className="h-4 w-full"/>
        <Skeleton className="h-4 w-2/3"/>

        <Skeleton className="h-6 w-48 mt-8"/>
        <Skeleton className="h-4 w-full"/>
        <Skeleton className="h-4 w-full"/>
        <Skeleton className="h-4 w-5/6"/>
      </div>
    </div>);
}
