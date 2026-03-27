"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

const eventColors: Record<string, string> = {
  Wedding: "bg-indigo-500",
  Engagement: "bg-rose-500",
  Corporate: "bg-blue-500",
  Birthday: "bg-amber-500",
  "Product Shoot": "bg-teal-500",
  Other: "bg-slate-500",
}

export default function UpcomingEvents() {
  const { data, isLoading } = useSWR("/api/v1/dashboard/upcoming", fetcher, { dedupingInterval: 60000 })

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">Next 7 Days</h2>

      <div className="bg-card border border-border/60 rounded-xl overflow-hidden p-4">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-24 h-4 mt-4" />
            <Skeleton className="w-full h-12" />
          </div>
        ) : data?.groupedEvents && Object.keys(data.groupedEvents).length > 0 ? (
          <div className="flex flex-col gap-6">
            {Object.entries(data.groupedEvents).map(([date, events]: [string, any]) => (
              <div key={date} className="flex flex-col gap-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {date}
                </div>
                <div className="flex flex-col gap-2">
                  {events.map((event: any) => (
                    <Link
                      href={`/bookings/${event.id}`}
                      key={event.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border/40 hover:border-border hover:bg-muted/10 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${eventColors[event.eventType] || eventColors.Other}`} />
                        <div>
                          <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                            {event.clientName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {event.eventType}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end text-sm">
                        <div className="text-foreground">{event.time}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{event.venue}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            
            <Link href="/calendar" className="text-sm font-medium text-primary hover:underline text-center pt-2">
              View full calendar &rarr;
            </Link>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center">
            <div className="w-10 h-10 mb-2 rounded-full bg-muted/20 flex items-center justify-center">
              📅
            </div>
            Nothing scheduled in the next 7 days
          </div>
        )}
      </div>
    </div>
  )
}
