"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { 
  CalendarPlus, 
  CheckCircle2, 
  IndianRupee, 
  FileSignature, 
  Image as ImageIcon, 
  Eye, 
  UserPlus,
  Activity
} from "lucide-react"

const getActivityIcon = (type: string) => {
  switch(type) {
    case "booking_created": return <CalendarPlus className="w-4 h-4 text-blue-500" />
    case "booking_confirmed": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    case "payment_received": return <IndianRupee className="w-4 h-4 text-amber-500" />
    case "contract_signed": return <FileSignature className="w-4 h-4 text-indigo-500" />
    case "gallery_delivered": return <ImageIcon className="w-4 h-4 text-teal-500" />
    case "proposal_viewed": return <Eye className="w-4 h-4 text-purple-500" />
    case "team_member_added": return <UserPlus className="w-4 h-4 text-sky-500" />
    default: return <Activity className="w-4 h-4 text-slate-500" />
  }
}

export default function RecentActivity() {
  const { data, isLoading } = useSWR("/api/v1/dashboard/activity", fetcher, { dedupingInterval: 60000 })

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>

      <div className="bg-card border border-border/60 rounded-xl overflow-hidden p-4">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="flex flex-col gap-1 w-full">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.activities?.length > 0 ? (
          <div className="flex flex-col gap-4">
            {data.activities.map((activity: any) => (
              <div key={activity.id} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex flex-col flex-1 gap-0.5">
                  <div className="text-sm">
                    {activity.prefix && <span className="text-muted-foreground mr-1">{activity.prefix}</span>}
                    {activity.link ? (
                      <Link href={activity.link} className="font-medium hover:text-primary transition-colors hover:underline">
                        {activity.text}
                      </Link>
                    ) : (
                      <span className="font-medium">{activity.text}</span>
                    )}
                    {activity.suffix && <span className="text-muted-foreground ml-1">{activity.suffix}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.timeAgo}
                  </div>
                </div>
              </div>
            ))}
            
            <Link href="/activity" className="text-sm font-medium text-primary hover:underline text-center pt-2 mt-2 border-t border-border/40">
              View all activity &rarr;
            </Link>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No recent activity.
          </div>
        )}
      </div>
    </div>
  )
}
