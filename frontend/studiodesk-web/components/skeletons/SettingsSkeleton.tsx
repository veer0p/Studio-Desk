import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1200px] mx-auto animate-pulse">
      {/* Settings Header Skeleton */}
      <div className="space-y-1 mb-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation Skeleton (Sidebar) */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
             <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>

        {/* Settings Content Area Skeleton */}
        <div className="flex-1 space-y-8">
          <div className="bg-card border border-border/40 rounded-md p-6 space-y-6">
             <div className="space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-60" />
             </div>

             <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="flex flex-col gap-2">
                       <Skeleton className="h-4 w-24" />
                       <Skeleton className="h-10 w-full rounded-md" />
                   </div>
                ))}
             </div>

             <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
