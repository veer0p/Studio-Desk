"use client"

import { IndianRupee, Clock, ChevronRight, FileText } from "lucide-react"
import useSWR from "swr"
import { fetchProposalsList, ProposalRecord } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

const formatAmount = (amount: number) => `Rs ${Number(amount ?? 0).toLocaleString("en-IN")}`

export function ProposalList() {
  const { data, isLoading, error } = useSWR("/api/v1/proposals", fetchProposalsList)
  const proposals = data?.list || []

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Failed to load proposals</p>
        <p className="text-sm">{error.message || "Please try again later."}</p>
      </div>
    )
  }

  if (proposals.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
        <FileText className="w-12 h-12 mb-4 opacity-30" />
        <p className="font-medium text-foreground mb-1">No proposals yet</p>
        <p className="text-sm">Proposals sent to clients will appear here.</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-4">
      {proposals.map((proposal: ProposalRecord) => (
        <div key={proposal.id} className="group bg-background border border-border/60 p-4 rounded-md flex items-center justify-between hover:border-foreground/20 transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center border border-border/40">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight">{proposal.clientName}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">{proposal.id}</span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {proposal.date}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground block">Amount</span>
              <span className="font-mono text-[13px] font-bold tracking-widest uppercase">{formatAmount(proposal.amount)}</span>
            </div>

            <div className="min-w-[80px] text-center">
              <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm border ${
                proposal.status?.toLowerCase() === "signed" ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" :
                proposal.status?.toLowerCase() === "sent" ? "bg-blue-500/5 text-blue-600 border-blue-500/20" :
                "bg-muted/50 text-muted-foreground border-border/40"
              }`}>
                {proposal.status}
              </span>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>
      ))}
    </div>
  )
}
