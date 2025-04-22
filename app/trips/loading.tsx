import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12">
          <Skeleton className="h-16 w-16 rounded-full mb-6" />
          <Skeleton className="h-6 w-64 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <Skeleton className="h-10 w-48" />
        </CardContent>
      </Card>
    </div>
  )
}
