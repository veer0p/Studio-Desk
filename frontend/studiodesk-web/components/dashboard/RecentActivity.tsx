"use client"

import useSWR from "swr"
import { fetchBookingsList } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Activity, CalendarPlus, RefreshCcw } from "lucide-react"

function relativeTime(value?: string | null) {
  if (!value) return "Just now"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Just now"

  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

export default function RecentActivity() {
  const { data, isLoading } = useSWR("/api/v1/bookings?sortBy=updatedAt&order=desc&pageSize=6", fetchBookingsList, {
    dedupingInterval: 60000,
  })

  const activities = Array.isArray(data?.list)
    ? data.list.map((booking: any) => {
        const createdAt = new Date(String(booking.createdAt ?? 0)).getTime()
        const updatedAt = new Date(String(booking.updatedAt ?? booking.createdAt ?? 0)).getTime()
        const isFreshCreate = Math.abs(updatedAt - createdAt) < 60000

        return {
          id: booking.id,
          icon: isFreshCreate ? CalendarPlus : RefreshCcw,
          iconClass: isFreshCreate ? "text-foreground" : "text-muted-foreground",
          text: booking.clientName,
          suffix: isFreshCreate ? `was added for ${booking.date}` : `is now in ${booking.stage}`,
          timeAgo: relativeTime(booking.updatedAt ?? booking.createdAt),
        }
      })
    : []

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>

      <div className="bg-card border border-border/60 rounded-md overflow-hidden p-4">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-sm shrink-0" />
                <div className="flex flex-col gap-1 w-full">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-sm bg-muted/10 border border-border/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className={`w-3.5 h-3.5 ${activity.iconClass}`} />
                  </div>
                  <div className="flex flex-col flex-1 gap-0.5">
                    <div className="text-sm">
                      <Link href={`/bookings/${activity.id}`} className="font-medium hover:text-foreground transition-colors hover:underline">
                        {activity.text}
                      </Link>
                      <span className="text-muted-foreground ml-1">{activity.suffix}</span>
                    </div>
                    <div className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-0.5">{activity.timeAgo}</div>
                  </div>
                </div>
              )
            })}

            <Link href="/bookings" className="text-[11px] font-mono tracking-widest uppercase text-center text-muted-foreground hover:text-foreground pt-4 mt-2 border-t border-border/40 transition-colors">
              View all bookings
            </Link>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Activity className="w-6 h-6 mx-auto mb-2 opacity-40" />
            No recent activity.
          </div>
        )}
      </div>
    </div>
  )
}
