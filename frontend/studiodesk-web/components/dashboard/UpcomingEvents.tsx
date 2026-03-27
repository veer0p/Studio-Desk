"use client"

import useSWR from "swr"
import { fetchDashboardOverview } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

const eventColors: Record<string, string> = {
  Wedding: "bg-foreground",
  "Pre Wedding": "bg-muted-foreground",
  Engagement: "bg-muted-foreground",
  Corporate: "bg-foreground",
  Birthday: "bg-muted-foreground",
  "Product Shoot": "bg-foreground",
  Other: "bg-muted-foreground",
}

export default function UpcomingEvents() {
  const { data, isLoading } = useSWR("/api/v1/dashboard/overview", fetchDashboardOverview, {
    dedupingInterval: 60000,
  })

  const groupedEvents = Array.isArray(data?.upcoming_week?.days)
    ? data.upcoming_week.days.filter((day: any) => Number(day.shoot_count ?? 0) > 0)
    : []

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">Next 7 Days</h2>

      <div className="bg-card border border-border/60 rounded-md overflow-hidden p-4">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-24 h-4 mt-4" />
            <Skeleton className="w-full h-12" />
          </div>
        ) : groupedEvents.length > 0 ? (
          <div className="flex flex-col gap-6">
            {groupedEvents.map((day: any) => (
              <div key={day.date} className="flex flex-col gap-3">
                <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  {day.is_today ? "Today" : `${day.day_label} ${day.date_label}`}
                </div>
                <div className="flex flex-col gap-2">
                  {(day.bookings || []).map((event: any) => (
                    <Link
                      href={`/bookings/${event.id}`}
                      key={event.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md border border-border/40 hover:border-foreground/20 hover:bg-muted/5 transition-colors gap-2 shadow-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-sm ${eventColors[event.event_type] || eventColors.Other}`} />
                        <div>
                          <div className="font-medium text-sm text-foreground group-hover:text-foreground transition-colors">
                            {event.client_name}
                          </div>
                          <div className="text-xs text-muted-foreground">{event.event_type}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{event.title}</div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <Link href="/bookings" className="text-xs font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground text-center pt-2">
              View all bookings
            </Link>
          </div>
        ) : (
          <div className="py-8 text-center text-[11px] font-mono uppercase tracking-widest text-muted-foreground flex flex-col items-center justify-center">
            <div className="w-10 h-10 mb-3 rounded-md border border-border/40 bg-muted/5 flex items-center justify-center">
              7D
            </div>
            Nothing scheduled
          </div>
        )}
      </div>
    </div>
  )
}
