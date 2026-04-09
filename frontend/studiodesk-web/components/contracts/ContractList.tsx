"use client"

import { ShieldCheck, ChevronRight } from "lucide-react"
import useSWR from "swr"
import { fetchContractsList, ContractRecord } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export function ContractList() {
  const { data, isLoading, error } = useSWR("/api/v1/contracts", fetchContractsList)
  const contracts = data?.list || []

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
        <p className="font-medium text-foreground mb-1">Failed to load contracts</p>
        <p className="text-sm">{error.message || "Please try again later."}</p>
      </div>
    )
  }

  if (contracts.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
        <ShieldCheck className="w-12 h-12 mb-4 opacity-30" />
        <p className="font-medium text-foreground mb-1">No contracts yet</p>
        <p className="text-sm">Contracts created for bookings will appear here.</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-4">
      {contracts.map((contract: ContractRecord) => (
        <div key={contract.id} className="group bg-background border border-border/60 p-4 rounded-md flex items-center justify-between hover:border-foreground/20 transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center border border-border/40">
              <ShieldCheck className={`w-5 h-5 ${contract.status?.toLowerCase() === "signed" ? "text-emerald-500" : "text-muted-foreground"}`} />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight">{contract.clientName}</h4>
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
                contract.status?.toLowerCase() === "signed" ? "bg-foreground text-background border-foreground" : "bg-muted/50 text-muted-foreground border-border/40"
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
