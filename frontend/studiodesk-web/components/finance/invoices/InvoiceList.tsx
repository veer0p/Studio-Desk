"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InvoiceRow } from "./InvoiceRow"
import { InvoiceDetail } from "./InvoiceDetail"
import { CreateInvoiceDialog } from "./CreateInvoiceDialog"

export function InvoiceList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")

  // Stub data - will eventually use SWR mapping to lib/api.ts
  const invoices = [
    {
      id: "INV-2026-001",
      invoiceNumber: "INV-2026-001",
      clientName: "Rohan & Priya",
      clientCity: "Mumbai",
      bookingName: "Wedding Coverage",
      bookingId: "b-001",
      issueDate: "12 Oct 2025",
      dueDate: "27 Oct 2025",
      amount: 240000,
      paidAmount: 100000,
      balance: 140000,
      status: "Partial",
      daysToDue: 5
    },
    {
      id: "INV-2026-002",
      invoiceNumber: "INV-2026-002",
      clientName: "Neha Sharma",
      clientCity: "Delhi",
      bookingName: "Pre-wedding Shoot",
      bookingId: "b-002",
      issueDate: "15 Oct 2025",
      dueDate: "16 Oct 2025",
      amount: 45000,
      paidAmount: 0,
      balance: 45000,
      status: "Overdue",
      daysToDue: -2
    },
    {
      id: "INV-2026-003",
      invoiceNumber: "INV-2026-003",
      clientName: "Amit Patel",
      clientCity: "Ahmedabad",
      bookingName: "Corporate Event",
      issueDate: "18 Oct 2025",
      dueDate: "02 Nov 2025",
      amount: 120000,
      paidAmount: 120000,
      balance: 0,
      status: "Paid"
    },
    {
      id: "INV-2026-004",
      invoiceNumber: "INV-2026-004",
      clientName: "XYZ Corp",
      clientCity: "Bangalore",
      bookingName: "Product Launch",
      issueDate: "20 Oct 2025",
      dueDate: "25 Oct 2025",
      amount: 85000,
      paidAmount: 0,
      balance: 85000,
      status: "Sent",
      daysToDue: 2
    }
  ]

  // If URL has id, it implies slide-over is open
  const openInvoiceId = searchParams.get("id")

  const handleRowClick = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("id", id)
    router.push(`/finance?${params.toString()}`)
  }

  const handleCloseDetail = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("id")
    router.replace(`/finance?${params.toString()}`)
  }

  return (
    <div className="flex h-full relative">
      <div className={`flex flex-col flex-1 transition-all duration-300 ${openInvoiceId ? 'mr-[560px] hidden xl:flex' : ''}`}>
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">Invoices</h2>
            <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-semibold text-muted-foreground">{invoices.length} total</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search invoice #, client..." 
                className="pl-9 w-[200px] lg:w-[260px] bg-background border-border/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button variant="outline" size="sm" className="bg-background border-border/60 h-10">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>

            <CreateInvoiceDialog>
              <Button size="sm" className="h-10 shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </CreateInvoiceDialog>
          </div>
        </div>

        {/* Table Render */}
        <div className="flex-1 bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50 border-b border-border/40 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 min-w-[120px]">Invoice #</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3 min-w-[110px]">Issue Date</th>
                  <th className="px-4 py-3 min-w-[110px]">Due Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <InvoiceRow key={inv.id} invoice={inv} onRowClick={handleRowClick} />
                ))}
              </tbody>
            </table>
          </div>
          {invoices.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <span className="text-4xl mb-4 opacity-50">🧾</span>
              <p className="font-medium text-foreground mb-1">No invoices found</p>
              <p className="text-sm">Create an invoice from scratch or linked to a booking.</p>
            </div>
          )}
        </div>
      </div>

      {openInvoiceId && (
        <div className="absolute top-0 right-0 w-full xl:w-[560px] h-full shadow-2xl bg-background border-l border-border/60 overflow-hidden transform transition-transform z-20">
          <InvoiceDetail invoiceId={openInvoiceId} onClose={handleCloseDetail} />
        </div>
      )}
    </div>
  )
}
