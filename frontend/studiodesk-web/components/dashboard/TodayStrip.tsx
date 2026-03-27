"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, Plus } from "lucide-react"
import Link from "next/link"

const eventColors: Record<string, string> = {
  Wedding: "bg-indigo-500",
  Engagement: "bg-rose-500",
  Corporate: "bg-blue-500",
  Birthday: "bg-amber-500",
  "Product Shoot": "bg-teal-500",
  Other: "bg-slate-500",
}

export default function TodayStrip() {
  const { data, isLoading } = useSWR("/api/v1/dashboard/today", fetcher, { dedupingInterval: 60000 })

  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  })

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Today</h2>
          <p className="text-sm text-muted-foreground font-mono">{todayDate}</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          <Skeleton className="min-w-[260px] h-[120px] rounded-xl" />
          <Skeleton className="min-w-[260px] h-[120px] rounded-xl" />
        </div>
      ) : data?.shoots?.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {data.shoots.map((shoot: any) => (
            <Link 
              href={`/bookings/${shoot.id}`} 
              key={shoot.id}
              className="group min-w-[260px] flex bg-card border border-border/60 hover:border-border transition-colors rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer relative"
            >
              <div className={`w-[3px] h-full ${eventColors[shoot.eventType] || eventColors.Other}`} />
              <div className="p-4 flex flex-col flex-1 gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm line-clamp-1 pr-2">{shoot.clientName}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{shoot.time}</span>
                </div>
                <div className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {shoot.venue}
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <div className="flex -space-x-2">
                    {shoot.team.slice(0, 3).map((member: any, i: number) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium overflow-hidden">
                        {member.avatar ? (
                          <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                    ))}
                    {shoot.team.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-background border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground z-10">
                        +{shoot.team.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {shoot.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-dashed border-border/60 flex items-center justify-center text-sm text-muted-foreground bg-muted/10">
          No shoots today. Enjoy the day.
        </div>
      )}
    </div>
  )
}
