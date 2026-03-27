"use client"

import { ShieldCheck, Calendar, ChevronRight } from "lucide-react"

const mockContracts = [
  { id: "C-101", client: "Rohan & Priya", date: "22 Mar 2026", type: "Wedding Contract", status: "Signed" },
  { id: "C-102", client: "Amit Goel", date: "25 Mar 2026", type: "Standard Services", status: "Pending" },
]

export function ContractList() {
  return (
    <div className="p-6 md:p-8 space-y-4">
      {mockContracts.map((contract) => (
        <div key={contract.id} className="group bg-background border border-border/60 p-4 rounded-md flex items-center justify-between hover:border-foreground/20 transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center border border-border/40">
              <ShieldCheck className={`w-5 h-5 ${contract.status === "Signed" ? "text-emerald-500" : "text-muted-foreground"}`} />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight">{contract.client}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">{contract.id}</span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">{contract.type}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-right">
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground block">Date</span>
              <span className="font-mono text-[11px] font-bold tracking-widest uppercase">{contract.date}</span>
            </div>
            
            <div className="min-w-[80px] text-center">
              <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm border ${
                contract.status === "Signed" ? "bg-foreground text-background border-foreground" : "bg-muted/50 text-muted-foreground border-border/40"
              }`}>
                {contract.status}
              </span>
            </div>
            
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>
      ))}
    </div>
  )
}
