import { Skeleton } from "@/components/ui/skeleton"

export default function PortalBookingsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1200px] mx-auto animate-pulse">
      {/* Portal Header Skeleton */}
      <div className="space-y-1 mb-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Bookings List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border/40 rounded-md p-6 space-y-4">
             <div className="flex justify-between items-start">
               <div className="space-y-2">
                 <Skeleton className="h-6 w-48" />
                 <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                 </div>
               </div>
               <Skeleton className="h-6 w-24 rounded-full" />
             </div>
             
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-border/40">
                {[1, 2, 3, 4].map((j) => (
                   <div key={j} className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-32" />
                   </div>
                ))}
             </div>

             <div className="flex justify-end gap-3 pt-4">
                <Skeleton className="h-10 w-32 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
