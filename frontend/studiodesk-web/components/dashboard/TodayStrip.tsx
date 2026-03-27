"use client"

import useSWR from "swr"
import { DashboardToday, fetchDashboardToday } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, Plus } from "lucide-react"
import Link from "next/link"

const eventColors: Record<string, string> = {
  Wedding: "bg-foreground",
  Engagement: "bg-muted-foreground",
  Corporate: "bg-foreground",
  Birthday: "bg-muted-foreground",
  "Product Shoot": "bg-foreground",
  Other: "bg-muted-foreground",
}

export default function TodayStrip() {
  const { data, isLoading } = useSWR<DashboardToday>("/api/v1/dashboard/today", fetchDashboardToday, { dedupingInterval: 60000 })
  const shoots = data?.shoots ?? []

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
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">{todayDate}</p>
        </div>
        <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
          <Skeleton className="min-w-[260px] h-[120px] rounded-md" />
          <Skeleton className="min-w-[260px] h-[120px] rounded-md" />
        </div>
      ) : shoots.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
          {shoots.map((shoot) => (
            <Link 
              href={`/bookings/${shoot.id}`} 
              key={shoot.id}
              className="group min-w-[260px] flex bg-card border border-border/60 hover:border-foreground/20 transition-colors rounded-md overflow-hidden shadow-none cursor-pointer relative"
            >
              <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-sm ${eventColors[shoot.eventType] || eventColors.Other}`} />
                    <span className="font-medium text-sm line-clamp-1">{shoot.clientName}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider whitespace-nowrap pt-0.5">{shoot.time}</span>
                </div>
                <div className="text-xs text-muted-foreground line-clamp-1 font-mono uppercase tracking-widest">
                  {shoot.venue}
                </div>
                <div className="flex justify-between items-center mt-auto pt-2 border-t border-border/20">
                  <div className="flex -space-x-1.5">
                    {shoot.team.slice(0, 3).map((member, i: number) => (
                      <div key={i} className="w-5 h-5 rounded-sm bg-muted border border-background flex items-center justify-center text-[9px] font-mono text-muted-foreground overflow-hidden">
                        {member.avatar ? (
                          <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover grayscale" />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                    ))}
                    {shoot.team.length > 3 && (
                      <div className="w-5 h-5 rounded-sm bg-background border border-background flex items-center justify-center text-[9px] font-mono text-muted-foreground z-10">
                        +{shoot.team.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded-sm border border-border/40 text-muted-foreground">
                      {shoot.status}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-md border border-border/60 flex items-center justify-center text-[11px] font-mono tracking-widest uppercase text-muted-foreground bg-muted/5">
          No shoots today
        </div>
      )}
    </div>
  )
}
