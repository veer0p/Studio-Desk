"use client"

import { BookingSummary } from "@/lib/api"
import { LeadCard } from "./LeadCard"

const STAGES = [
  { id: "Inquiry", label: "Inquiry" },
  { id: "Proposal Sent", label: "Proposal Sent" },
  { id: "Negotiation", label: "Negotiation" },
  { id: "Won", label: "Qualified" },
]

export function LeadsKanban({ labs = [] }: { labs: BookingSummary[] }) {
  return (
    <div className="h-full w-full overflow-x-auto custom-scrollbar p-6">
      <div className="flex gap-6 h-full min-w-max pb-4">
        {STAGES.map((stage) => {
          const stageLeads = labs.filter(l => l.stage === stage.id || (stage.id === "Inquiry" && (l.stage === "Inquiry" || !l.stage)))
          
          return (
            <div key={stage.id} className="w-72 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[11px] font-mono font-bold tracking-widest uppercase text-foreground">{stage.label}</h3>
                  <span className="text-[9px] font-mono bg-muted/40 px-1.5 py-0.5 rounded-sm text-muted-foreground">{stageLeads.length}</span>
                </div>
                <div className="h-[2px] w-8 bg-muted/60" />
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar-thin">
                {stageLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
                
                {stageLeads.length === 0 && (
                  <div className="border border-dashed border-border/40 rounded-md p-6 text-center">
                    <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">No leads here</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
