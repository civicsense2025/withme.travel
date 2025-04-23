import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Simple decorative shape for loading state
const LoadingShape = ({ className = "" }: { className?: string }) => {
  return <div className={`absolute ${className} rounded-full animate-pulse bg-gray-200 dark:bg-gray-700`} />
}

export default function Loading() {
  return (
    <div className="container max-w-5xl pt-8 pb-20 relative overflow-hidden">
      {/* Decorative shapes */}
      <LoadingShape className="-top-4 -right-8 w-6 h-6" />
      <LoadingShape className="top-40 -left-10 w-8 h-8" />
      <LoadingShape className="bottom-20 right-10 w-5 h-5" />

      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-2"></div>
        <div className="h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
      </div>

      {/* Mobile stepper placeholder */}
      <div className="lg:hidden mb-6 flex space-x-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="w-full lg:w-3/4">
          <CardHeader>
            <CardTitle className="lowercase flex items-center gap-2 h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></CardTitle>
          </CardHeader>
          
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
