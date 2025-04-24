import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
export function SkeletonCard() {
    return (<Card className="overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none"/>
      <CardHeader className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2"/>
        <Skeleton className="h-4 w-full"/>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <Skeleton className="h-4 w-2/3"/>
        <Skeleton className="h-4 w-3/4"/>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Skeleton className="h-4 w-1/4"/>
        <Skeleton className="h-5 w-16"/>
      </CardFooter>
    </Card>);
}
