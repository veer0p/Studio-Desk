"use client"

import { IndianRupee, Clock, ChevronRight, FileText } from "lucide-react"

const mockProposals = [
  { id: "P-001", client: "Rohan & Priya", date: "22 Mar 2026", amount: 240000, status: "Sent" },
  { id: "P-002", client: "Neha Sharma", date: "24 Mar 2026", amount: 45000, status: "Draft" },
  { id: "P-003", client: "Amit Goel", date: "25 Mar 2026", amount: 120000, status: "Signed" },
]

export function ProposalList() {
  return (
    <div className="p-6 md:p-8 space-y-4">
      {mockProposals.map((proposal) => (
        <div key={proposal.id} className="group bg-background border border-border/60 p-4 rounded-md flex items-center justify-between hover:border-foreground/20 transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center border border-border/40">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight">{proposal.client}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">{proposal.id}</span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {proposal.date}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-right">
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground block">Amount</span>
              <span className="font-mono text-[13px] font-bold tracking-widest uppercase">₹{proposal.amount.toLocaleString("en-IN")}</span>
            </div>
            
            <div className="min-w-[80px] text-center">
              <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm border ${
                proposal.status === "Signed" ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" : 
                proposal.status === "Sent" ? "bg-blue-500/5 text-blue-600 border-blue-500/20" : 
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
