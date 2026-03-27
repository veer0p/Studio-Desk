"use client"

import { BookingSummary } from "@/lib/api"
import { Calendar, MapPin, ChevronRight, MessageSquare } from "lucide-react"

export function LeadCard({ lead }: { lead: BookingSummary }) {
  return (
    <div className="group bg-background border border-border/60 p-4 rounded-md shadow-sm hover:shadow-md hover:border-foreground/20 transition-all cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-sm font-bold tracking-tight group-hover:underline">{lead.clientName}</h4>
          <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-0.5">{lead.eventType}</p>
        </div>
        <div className="w-2 h-2 rounded-sm bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono uppercase tracking-widest">
          <Calendar className="w-3 h-3" />
          <span>{lead.date}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{lead.venue}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] font-bold tracking-widest">₹{lead.amount}</span>
        </div>
        <div className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </div>
  )
}
