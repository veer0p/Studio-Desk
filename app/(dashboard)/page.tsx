import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getMemberByUserId } from "@/lib/supabase/queries";
import { getStudio } from "@/lib/cache";

import { 
  StatCardsWrapper,
} from "@/components/dashboard/StatCardsWrapper";
import { 
  ActivityFeedWrapper 
} from "@/components/dashboard/ActivityFeedWrapper";
import { 
  UpcomingShootsWrapper 
} from "@/components/dashboard/UpcomingShootsWrapper";
import { 
  StatCardsSkeleton, 
  ActivityFeedSkeleton, 
  UpcomingShootsSkeleton,
} from "@/components/dashboard/DashboardSkeletons";
import { Button } from "@/components/ui/button";
import { Plus, Camera, ArrowUpRight, TrendingUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const member = await getMemberByUserId(supabase, user.id);
  if (!member) return null;
  
  const studio = await getStudio(member.studio_id);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Home Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening in {studio?.name} today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hidden sm:flex" asChild>
            <Link href="/dashboard/galleries">
              <Camera className="w-4 h-4 mr-2" /> Upload Photos
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/leads?action=new">
              <Plus className="w-4 h-4 mr-2" /> New Lead
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid wrapped in Suspense */}
      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCardsWrapper studioId={member.studio_id} />
      </Suspense>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          <Suspense fallback={<ActivityFeedSkeleton />}>
            <ActivityFeedWrapper studioId={member.studio_id} />
          </Suspense>
          
          {/* Recent Bookings Quick Look - Note: Could be its own wrapper too */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Summary View</h3>
              <Button variant="ghost" size="sm" className="text-accent" asChild>
                <Link href="/dashboard/analytics">
                  View Analytics <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground text-center py-12 border-2 border-dashed border-slate-50 rounded-xl">
              Quick insights and team performance metrics are being processed.
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Shoots & Quick Actions */}
        <div className="space-y-8">
          <Suspense fallback={<UpcomingShootsSkeleton />}>
            <UpcomingShootsWrapper studioId={member.studio_id} />
          </Suspense>
          
          {/* Conversion Insight */}
          <div className="bg-primary text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <TrendingUp className="w-32 h-32" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Conversion Rate</p>
            <h3 className="text-4xl font-bold">24%</h3>
            <p className="text-xs text-white/80 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Higher than last month
            </p>
            <Button className="w-full mt-6 bg-white text-primary hover:bg-white/90 border-0" asChild>
              <Link href="/dashboard/analytics">Go to Analytics</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

