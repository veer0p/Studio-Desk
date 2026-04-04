import { Skeleton } from "@/components/ui/skeleton"

export default function PortalHomeSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1200px] mx-auto animate-pulse">
      {/* Portal Hero/Welcome Skeleton */}
      <div className="bg-primary/5 border border-primary/20 rounded-md p-8 md:p-12 mb-4">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-8" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-sm" />
        </div>
      </div>

      {/* Portal Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border/40 rounded-md p-6 space-y-3">
             <Skeleton className="h-4 w-24" />
             <Skeleton className="h-8 w-1/2" />
          </div>
        ))}
      </div>

      {/* Recent Activity/Next Step Skeleton */}
      <div className="bg-card border border-border/40 rounded-md p-6 space-y-4">
        <Skeleton className="h-6 w-48 mb-2" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
             <div key={i} className="flex gap-4 p-4 border border-border/40 rounded-md bg-muted/20">
                <Skeleton className="h-12 w-12 rounded-sm shrink-0" />
                <div className="flex-1 space-y-2">
                   <Skeleton className="h-5 w-40" />
                   <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-9 w-24 rounded-md self-center" />
             </div>
          ))}
        </div>
      </div>
    </div>
  )
}
