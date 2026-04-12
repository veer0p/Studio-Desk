"use client"

import useSWR from "swr"
import { fetchBookingsList } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ROUTES, bookingDetailUrl } from "@/lib/constants/routes"

const PIPELINE_STAGES = ["Inquiry", "Proposal Sent", "Confirmed", "In Progress", "Delivered"]

const eventColors: Record<string, string> = {
  Wedding: "bg-foreground",
  Engagement: "bg-muted-foreground",
  Corporate: "bg-foreground",
  Birthday: "bg-muted-foreground",
  "Product Shoot": "bg-foreground",
  Other: "bg-muted-foreground",
}

const formatAmount = (amount: number) => {
  if (!amount) return "Rs 0"
  return amount >= 100000 ? `Rs ${(amount / 100000).toFixed(1)}L` : `Rs ${amount.toLocaleString("en-IN")}`
}

export default function BookingPipeline() {
  const { data, isLoading } = useSWR("/api/v1/bookings?limit=20", fetchBookingsList, {
    refreshInterval: 60000
  })

  const bookings = Array.isArray(data?.list) ? data.list : []

  const stages = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = bookings.filter((booking: any) => booking.stage === stage)
    return acc
  }, {} as Record<string, any[]>)

  const isPipelineEmpty = !isLoading && PIPELINE_STAGES.every((stage) => stages[stage].length === 0)

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-semibold tracking-tight">Pipeline</h2>
        <Link href={ROUTES.BOOKINGS} className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="hidden md:flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="min-w-[220px] w-[220px] bg-muted/30 rounded-md p-3 space-y-3">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-full h-16" />
              <Skeleton className="w-full h-16" />
            </div>
          ))}
        </div>
      ) : isPipelineEmpty ? (
        <div className="w-full py-12 px-4 rounded-md border border-border/60 bg-muted/5 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 border border-border/40 rounded-sm flex items-center justify-center mb-4 bg-card">
            <Plus className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium mb-1">Your pipeline is empty</h3>
          <p className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground mb-6 max-w-sm">
            Create your first booking to start tracking.
          </p>
          <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile: stacked list */}
          <div className="md:hidden flex flex-col gap-3">
            {PIPELINE_STAGES.filter((stage) => (stages[stage] || []).length > 0).slice(0, 3).map((stage) => {
              const stageItems = stages[stage] || []
              const item = stageItems[0]
              if (!item) return null
              return (
                <Link
                  href={bookingDetailUrl(item.id)}
                  key={item.id}
                  className="group bg-card border border-border/60 hover:border-foreground/20 transition-colors rounded-md p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-sm shrink-0 ${eventColors[item.eventType] || eventColors.Other}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">{stage}</span>
                      </div>
                      <div className="font-medium text-sm line-clamp-1">{item.clientName}</div>
                      <div className="text-xs text-muted-foreground">{item.date}</div>
                    </div>
                  </div>
                  <span className="font-mono text-sm text-foreground shrink-0">{formatAmount(Number(item.amount ?? 0))}</span>
                </Link>
              )
            })}
            {PIPELINE_STAGES.filter((stage) => (stages[stage] || []).length > 0).length > 3 && (
              <Link href={ROUTES.BOOKINGS} className="text-[11px] font-mono tracking-widest uppercase text-center text-muted-foreground hover:text-foreground py-2 transition-colors">
                View all bookings →
              </Link>
            )}
          </div>

          {/* Desktop: horizontal pipeline */}
          <div className="hidden md:flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {PIPELINE_STAGES.map((stage) => {
              const stageItems = stages[stage] || []
              const visibleItems = stageItems.slice(0, 3)
              const remaining = stageItems.length - visibleItems.length

              return (
                <div key={stage} className="min-w-[220px] w-[220px] flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">{stage}</h3>
                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded-sm text-muted-foreground border border-border/40">{stageItems.length}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {visibleItems.map((item: any) => (
                      <Link
                        href={bookingDetailUrl(item.id)}
                        key={item.id}
                        className="group bg-card border border-border/60 hover:border-foreground/20 transition-colors rounded-md p-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-1.5 h-1.5 rounded-sm ${eventColors[item.eventType] || eventColors.Other}`} />
                          <div className="font-medium text-sm line-clamp-1" title={item.clientName}>{item.clientName}</div>
                        </div>
                        <div className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground flex justify-between items-center gap-2">
                          <span className="truncate" title={item.date}>{item.date}</span>
                          <span className="font-mono text-foreground mix-blend-difference">{formatAmount(Number(item.amount ?? 0))}</span>
                        </div>
                      </Link>
                    ))}

                    {remaining > 0 ? (
                      <Link href={`${ROUTES.BOOKINGS}?stage=${encodeURIComponent(stage)}`} className="text-[10px] font-mono tracking-widest uppercase text-center text-muted-foreground hover:text-foreground py-2 mt-1 transition-colors border border-dashed border-border/40 rounded-md">
                        + {remaining} more
                      </Link>
                    ) : null}

                    {visibleItems.length === 0 ? (
                      <div className="h-16 rounded-md border border-dashed border-border/40 flex items-center justify-center text-[10px] font-mono tracking-widest uppercase text-muted-foreground/50">
                        Empty
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
