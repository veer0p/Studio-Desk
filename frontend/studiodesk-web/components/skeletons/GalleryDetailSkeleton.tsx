import { Skeleton } from "@/components/ui/skeleton"

export default function GalleryDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto animate-pulse">
      {/* Gallery Detail Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1 w-full md:w-auto">
          <div className="flex items-center gap-3">
             <Skeleton className="h-9 w-64" />
             <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex gap-4">
             <Skeleton className="h-4 w-32" />
             <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>

      {/* Face Clusters Skeleton */}
      <div className="bg-card border border-border/40 rounded-md p-6 space-y-4">
         <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-20" />
         </div>
         <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
               <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-16 w-16 rounded-full border-2 border-border/20" />
                  <Skeleton className="h-3 w-12" />
               </div>
            ))}
         </div>
      </div>

      {/* Photo Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 mt-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-sm" />
        ))}
      </div>
    </div>
  )
}
