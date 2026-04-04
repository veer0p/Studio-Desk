import { Skeleton } from "@/components/ui/skeleton"

export default function GallerySkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto animate-pulse">
      {/* Gallery Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Storage Stats Skeleton */}
      <div className="bg-card border border-border/40 rounded-md p-4 mb-2">
         <div className="flex justify-between items-center mb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
         </div>
         <Skeleton className="h-2 w-full rounded-full" />
         <div className="flex gap-4 mt-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
         </div>
      </div>

      {/* Gallery Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="group relative bg-card border border-border/40 rounded-md overflow-hidden aspect-[4/5] flex flex-col">
            <Skeleton className="flex-1 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex justify-between items-center">
                 <Skeleton className="h-3 w-1/3" />
                 <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
