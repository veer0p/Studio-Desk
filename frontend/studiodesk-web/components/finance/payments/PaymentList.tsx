"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, MoreHorizontal, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PaymentMethodBadge } from "../shared/PaymentMethodBadge"
import { AddPaymentDialog } from "./AddPaymentDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const formatINR = (amt: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt)

export function PaymentList() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const payments = [
    {
      id: "pay-1",
      date: "12 Oct 2025",
      clientName: "Rohan & Priya",
      bookingName: "Wedding Coverage",
      invoiceRef: "INV-2026-001",
      amount: 100000,
      method: "Bank Transfer",
      reference: "IMPS1234901",
      recordedBy: "Ankit (Admin)"
    },
    {
      id: "pay-2",
      date: "10 Oct 2025",
      clientName: "Amit Patel",
      bookingName: "Corporate Event",
      invoiceRef: "INV-2026-003",
      amount: 120000,
      method: "Cheque",
      reference: "CHQ-009182",
      recordedBy: "Priya (Manager)"
    },
    {
      id: "pay-3",
      date: "05 Oct 2025",
      clientName: "Neha Sharma",
      bookingName: "Pre-wedding Shoot",
      invoiceRef: "",
      amount: 15000,
      method: "UPI",
      reference: "TXN991203",
      recordedBy: "Ankit (Admin)"
    }
  ]

  const totalPayments = payments.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Payments Received</h2>
          <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-semibold text-muted-foreground">{payments.length} mapped</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search reference, client..." 
              className="pl-9 w-[200px] lg:w-[260px] bg-background border-border/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button variant="outline" size="sm" className="bg-background border-border/60 h-10">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>

          <AddPaymentDialog>
            <Button size="sm" className="h-10 shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </AddPaymentDialog>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border/40 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3 min-w-[110px]">Date</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Recorded By</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{pay.date}</td>
                  <td className="px-4 py-3 text-sm font-medium">{pay.clientName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[150px]">{pay.bookingName}</td>
                  <td className="px-4 py-3 text-sm">
                    {pay.invoiceRef ? (
                      <span 
                        onClick={() => router.push(`/finance?tab=invoices&id=${pay.invoiceRef}`)}
                        className="font-mono text-primary hover:underline cursor-pointer"
                      >
                        {pay.invoiceRef}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Unlinked</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-600">{formatINR(pay.amount)}</td>
                  <td className="px-4 py-3">
                    <PaymentMethodBadge method={pay.method} />
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{pay.reference || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{pay.recordedBy}</td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit mapping
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete payment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400">
        <span className="text-sm font-medium">Total logged payments this period</span>
        <span className="font-mono font-bold text-lg">{formatINR(totalPayments)}</span>
      </div>

    </div>
  )
}
