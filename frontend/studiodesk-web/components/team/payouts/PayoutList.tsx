"use client"

import useSWR from "swr"
import { fetchPayoutsList, PayoutRecord } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Wallet, Download } from "lucide-react"

const formatINR = (amt: number) => {
  if (amt >= 100000) return `Rs ${(amt / 100000).toFixed(1)}L`
  if (amt >= 1000) return `Rs ${(amt / 1000).toFixed(0)}K`
  return `Rs ${amt}`
}

export function PayoutList() {
  const { data, isLoading, error } = useSWR("/api/v1/payouts", fetchPayoutsList)
  const payouts = data?.list || []
  const totalPaid = data?.totalPaid ?? 0
  const totalPending = data?.totalPending ?? 0

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-3" />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Failed to load payouts</p>
        <p className="text-sm">{error.message || "Please try again later."}</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/60 rounded-md p-4">
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Total Paid (Q1)</span>
          <div className="text-xl font-mono font-bold tracking-widest mt-1">{formatINR(totalPaid)}</div>
        </div>
        <div className="bg-card border border-border/60 rounded-md p-4">
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Pending Payouts</span>
          <div className="text-xl font-mono font-bold tracking-widest mt-1">{formatINR(totalPending)}</div>
        </div>
        <div className="bg-card border border-border/60 rounded-md p-4">
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Records</span>
          <div className="text-xl font-mono font-bold tracking-widest mt-1">{payouts.length}</div>
        </div>
      </div>

      {/* Payout Table */}
      <div className="bg-card border border-border/60 rounded-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="text-sm font-semibold">Payout Registry</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-[10px] font-mono tracking-widest uppercase"
            onClick={() => {
              // Generate CSV content
              const headers = ["Date", "Member", "Amount", "Status"]
              const rows = payouts.map((p: PayoutRecord) => [
                p.date || "",
                p.memberName || "",
                p.amount?.toString() || "0",
                p.status || ""
              ])
              
              const csvContent = [
                headers.join(","),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
              ].join("\n")
              
              // Download CSV
              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
              const link = document.createElement("a")
              const url = URL.createObjectURL(blob)
              link.setAttribute("href", url)
              link.setAttribute("download", `payouts_${new Date().toISOString().split("T")[0]}.csv`)
              link.style.visibility = "hidden"
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
          >
            <Download className="w-3 h-3 mr-2" /> CSV
          </Button>
        </div>

        {payouts.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
            <Wallet className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium text-foreground mb-1">No payouts recorded</p>
            <p className="text-sm">Payouts to team members will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Booking Ref</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {payouts.map((p: PayoutRecord) => (
                <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{p.date}</td>
                  <td className="px-4 py-3 font-medium">{p.memberName}</td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground">{p.bookingRef || "—"}</td>
                  <td className="px-4 py-3 text-right font-mono text-[11px] font-semibold">{formatINR(p.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm border ${
                      p.status?.toLowerCase() === "paid"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
