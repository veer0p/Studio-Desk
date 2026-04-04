import { Skeleton } from "@/components/ui/skeleton"

export default function PortalInvoicesSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1200px] mx-auto animate-pulse">
      {/* Portal Header Skeleton */}
      <div className="space-y-1 mb-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>

      {/* Invoices List Skeleton */}
      <div className="bg-card border border-border/40 rounded-md overflow-hidden">
        <div className="p-4 border-b border-border/40 bg-muted/20 flex gap-4">
           <Skeleton className="h-4 w-1/4" />
           <Skeleton className="h-4 w-1/4" />
           <Skeleton className="h-4 w-1/4" />
           <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="p-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-border/40 p-4 flex gap-4 items-center">
              <div className="w-1/4 space-y-1">
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <div className="w-1/4 flex gap-2 justify-end">
                 <Skeleton className="h-6 w-20 rounded-full" />
                 <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary/Action Skeleton */}
      <div className="flex justify-end p-6 bg-card border border-border/40 rounded-md mt-4">
         <div className="w-full max-w-xs space-y-4">
            <div className="flex justify-between items-center">
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
               <Skeleton className="h-6 w-28" />
               <Skeleton className="h-7 w-40" />
            </div>
            <Skeleton className="h-12 w-full rounded-md" />
         </div>
      </div>
    </div>
  )
}
