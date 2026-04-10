"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InvoiceRow } from "./InvoiceRow"
import { InvoiceDetail } from "./InvoiceDetail"
import { CreateInvoiceDialog } from "./CreateInvoiceDialog"
import useSWR from "swr"
import { fetchInvoicesList } from "@/lib/api"

export function InvoiceList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)

  const { data: response, isLoading } = useSWR("/api/v1/invoices", fetchInvoicesList)
  const allInvoices = response?.list || []

  // Apply search filtering
  let invoices = allInvoices.filter(inv => 
    inv.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Apply status filter from URL
  const statusFilter = searchParams.get("status")
  if (statusFilter) {
    invoices = invoices.filter(inv => {
      const bal = inv.balance ?? 0
      if (statusFilter === "outstanding") return inv.status === "sent" && bal > 0
      if (statusFilter === "overdue") return inv.status === "overdue" || (bal > 0 && new Date(inv.dueDate) < new Date())
      if (statusFilter === "paid") return inv.status === "paid" || bal === 0
      if (statusFilter === "draft") return inv.status === "draft"
      return true
    })
  }

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
            <h2 className="text-xl font-bold tracking-tight">Invoices</h2>
            <span className="px-2 py-0.5 rounded-sm bg-muted text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{invoices.length} total</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoice #, client..."
                className="pl-9 w-full bg-background border-border/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-background border-border/60 h-10">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete("status")
                  router.push(`/finance?${params.toString()}`)
                }}>All Invoices</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set("tab", "invoices")
                  params.set("status", "draft")
                  router.push(`/finance?${params.toString()}`)
                }}>Draft</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set("tab", "invoices")
                  params.set("status", "outstanding")
                  router.push(`/finance?${params.toString()}`)
                }}>Outstanding</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set("tab", "invoices")
                  params.set("status", "overdue")
                  router.push(`/finance?${params.toString()}`)
                }}>Overdue</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set("tab", "invoices")
                  params.set("status", "paid")
                  router.push(`/finance?${params.toString()}`)
                }}>Paid</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <CreateInvoiceDialog>
              <Button size="sm" className="h-10 shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </CreateInvoiceDialog>
          </div>
        </div>

        {/* Table Render */}
        <div className="flex-1 bg-card border border-border/60 rounded-md overflow-hidden shadow-sm flex flex-col">
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
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse border-b border-border/40">
                      <td className="px-4 py-4" colSpan={10}>
                        <div className="h-4 bg-muted rounded-sm w-full" />
                      </td>
                    </tr>
                  ))
                ) : (
                  invoices.map((inv) => (
                    <InvoiceRow key={inv.id} invoice={inv} onRowClick={handleRowClick} />
                  ))
                )}
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
