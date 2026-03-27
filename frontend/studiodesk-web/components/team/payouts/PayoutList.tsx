"use client"

import { Download, Filter, Search, ChevronDown, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreatePayoutDialog } from "./CreatePayoutDialog"
import { RoleBadge } from "@/components/team/shared/RoleBadge"

const mockPayouts = [
  {
    id: "po-001", memberPath: "Vikram Singh", role: "Videographer", date: "24 Mar 2026",
    gross: 45000, tds: 4500, net: 40500, method: "UPI", ref: "vikram@okicici", shoots: 3,
    initials: "VS", colorHash: "#3b82f6"
  },
  {
    id: "po-002", memberPath: "Karan Desai", role: "Drone Operator", date: "15 Mar 2026",
    gross: 12000, tds: 120, net: 11880, method: "Bank Transfer", ref: "HDFC IMPS xyz987", shoots: 1,
    initials: "KD", colorHash: "#f59e0b"
  }
]

export function PayoutList() {
  const formatINR = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val)

  return (
    <div className="p-6 md:p-8 h-full flex flex-col w-full max-w-[1600px] mx-auto overflow-hidden">
      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Payout Ledger</h2>
          <p className="text-sm text-muted-foreground mt-1">Review finalized TDS deductions and net transfers natively.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <Button variant="outline" className="bg-background shrink-0"><Filter className="w-4 h-4 mr-2" /> Quarter 1</Button>
          <Button variant="outline" className="bg-background shrink-0"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
          <CreatePayoutDialog />
        </div>
      </div>

      {/* Analytics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 shrink-0">
        <div className="bg-card border border-border/60 p-5 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-widest mb-1">Total Paid (Q1)</p>
          <p className="text-2xl font-bold">{formatINR(340000)}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-xl shadow-sm">
          <p className="text-xs text-amber-700 uppercase font-semibold tracking-widest mb-1">Pending Fees</p>
          <p className="text-2xl font-bold text-amber-600">{formatINR(65500)}</p>
        </div>
        <div className="bg-card border border-border/60 p-5 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-widest mb-1">TDS Withheld</p>
          <p className="text-2xl font-bold">{formatINR(32000)}</p>
        </div>
        <div className="bg-card border border-border/60 p-5 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-widest mb-1">Active Staff</p>
          <p className="text-2xl font-bold">14</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="flex-1 bg-card border border-border/60 rounded-xl overflow-auto shadow-sm min-h-0 relative">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0 z-10 font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4 rounded-tl-xl border-b border-border/40">Date</th>
              <th className="px-6 py-4 border-b border-border/40">Contractor</th>
              <th className="px-6 py-4 border-b border-border/40 text-right">Gross Add</th>
              <th className="px-6 py-4 border-b border-border/40 text-right">TDS (194C)</th>
              <th className="px-6 py-4 border-b border-border/40 text-right">Net Value</th>
              <th className="px-6 py-4 border-b border-border/40">Method</th>
            </tr>
          </thead>
          <tbody>
            {mockPayouts.map((row) => (
              <tr key={row.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors last:border-0 group">
                <td className="px-6 py-4 font-medium">{row.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[9px]" style={{ backgroundColor: row.colorHash }}>
                      {row.initials}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{row.memberPath}</p>
                      <RoleBadge role={row.role} className="mt-1" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right tabular-nums">{formatINR(row.gross)}</td>
                <td className="px-6 py-4 text-right tabular-nums font-mono text-amber-600">- {formatINR(row.tds)}</td>
                <td className="px-6 py-4 text-right font-bold tracking-tight text-emerald-600">{formatINR(row.net)}</td>
                <td className="px-6 py-4 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                    {row.method === "UPI" && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                    {row.method}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 block mt-0.5 max-w-[120px] truncate">{row.ref}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Footnotes */}
        <div className="sticky bottom-0 bg-card p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground font-medium z-10 shadow-[0_-10px_10px_-10px_rgba(0,0,0,0.05)]">
          <span>Showing latest 50 records. TDS calculated securely minimizing floating overlaps.</span>
          <span className="flex items-center gap-2 font-bold tracking-wider uppercase">Page 1 of 4 <ChevronDown className="w-3 h-3 cursor-pointer" /></span>
        </div>
      </div>

    </div>
  )
}
