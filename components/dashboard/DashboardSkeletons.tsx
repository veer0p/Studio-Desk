import { Skeleton } from "@/components/ui/skeleton";

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return <Skeleton className="h-[400px] rounded-2xl" />;
}

export function UpcomingShootsSkeleton() {
  return <Skeleton className="h-[400px] rounded-2xl" />;
}

export function DashboardHeaderSkeleton() {
  return <Skeleton className="h-20 w-full rounded-2xl" />;
}
