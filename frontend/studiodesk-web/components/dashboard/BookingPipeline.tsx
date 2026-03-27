"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const PIPELINE_STAGES = [
  "Inquiry",
  "Proposal Sent",
  "Confirmed",
  "In Progress",
  "Delivered"
]

const eventColors: Record<string, string> = {
  Wedding: "bg-indigo-500",
  Engagement: "bg-rose-500",
  Corporate: "bg-blue-500",
  Birthday: "bg-amber-500",
  "Product Shoot": "bg-teal-500",
  Other: "bg-slate-500",
}

export default function BookingPipeline() {
  const { data, isLoading } = useSWR("/api/v1/dashboard/pipeline", fetcher, { dedupingInterval: 60000 })

  const isPipelineEmpty = !isLoading && (!data || !data.stages || PIPELINE_STAGES.every(stage => !data.stages[stage] || data.stages[stage].length === 0))

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight">Pipeline</h2>
        <Link href="/bookings" className="text-sm font-medium text-primary hover:underline">
          View all &rarr;
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="min-w-[220px] bg-muted/30 rounded-lg p-3 space-y-3">
              <Skeleton className="w-24 h-5" />
              <Skeleton className="w-full h-20" />
              <Skeleton className="w-full h-20" />
            </div>
          ))}
        </div>
      ) : isPipelineEmpty ? (
        <div className="w-full py-12 px-4 rounded-xl border border-border/60 bg-muted/5 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 rotate-3">
            <div className="w-8 h-8 rounded bg-primary/20 -rotate-6" />
          </div>
          <h3 className="text-lg font-medium mb-1">Your pipeline is empty</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Create your first booking to get started and track it from inquiry to delivery.
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {PIPELINE_STAGES.map(stage => {
            const stageItems = data.stages[stage] || []
            const visibleItems = stageItems.slice(0, 3)
            const remaining = stageItems.length - 3

            return (
              <div key={stage} className="min-w-[220px] flex-1 flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-medium text-muted-foreground">{stage}</h3>
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded-full">{stageItems.length}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  {visibleItems.map((item: any) => (
                    <Link 
                      href={`/bookings/${item.id}`} 
                      key={item.id}
                      className="group bg-card border border-border/60 hover:border-border transition-colors rounded-lg p-3 relative overflow-hidden"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${eventColors[item.eventType] || eventColors.Other}`} />
                      <div className="pl-1">
                        <div className="font-medium text-sm line-clamp-1">{item.clientName}</div>
                        <div className="text-xs text-muted-foreground mt-1 flex justify-between items-center">
                          <span>{item.date}</span>
                          <span className="font-mono font-medium">{item.amount}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {remaining > 0 && (
                    <Link href={`/bookings?stage=${encodeURIComponent(stage)}`} className="text-xs text-center text-muted-foreground hover:text-foreground py-2 mt-1 transition-colors">
                      + {remaining} more
                    </Link>
                  )}
                  {visibleItems.length === 0 && (
                    <div className="h-16 rounded-lg border border-dashed border-border/40 flex items-center justify-center text-xs text-muted-foreground/50">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
