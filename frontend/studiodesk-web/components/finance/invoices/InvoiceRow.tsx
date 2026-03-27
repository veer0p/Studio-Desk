"use client"

import { useRouter } from "next/navigation"
import { MoreHorizontal, FileText, Send, BellRing, Copy, Trash2, Edit2, Ban, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const formatINR = (amount: number) => {
  if (amount === 0) return "₹0"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, // In lists, removing paise is cleaner unless specified
  }).format(amount)
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'draft': return 'bg-slate-500/10 text-slate-600 border-slate-500/20'
    case 'sent': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    case 'viewed': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
    case 'partial': return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    case 'overdue': return 'bg-red-500/10 text-red-600 border-red-500/20'
    case 'cancelled': return 'bg-muted text-muted-foreground border-border/40 line-through'
    default: return 'bg-muted text-muted-foreground border-border/40'
  }
}

export function InvoiceRow({ invoice, onRowClick }: { invoice: any, onRowClick: (id: string) => void }) {
  const router = useRouter()

  const isOverdue = invoice.status.toLowerCase() === "overdue"
  const isCancelled = invoice.status.toLowerCase() === "cancelled"

  // If due within 3 days (mock logic for demo check)
  const isDueSoon = invoice.status.toLowerCase() !== "paid" && invoice.status.toLowerCase() !== "overdue" && invoice.daysToDue && invoice.daysToDue <= 3

  return (
    <tr 
      onClick={() => onRowClick(invoice.id)}
      className={`group hover:bg-muted/30 transition-colors cursor-pointer border-b border-border/40 last:border-0 ${isCancelled ? 'opacity-50' : ''}`}
    >
      <td className="px-4 py-3 whitespace-nowrap font-mono text-sm tracking-tight text-foreground font-medium">
        {invoice.invoiceNumber}
      </td>
      
      <td className="px-4 py-3 min-w-[160px]">
        <div className="flex flex-col">
          <span className="font-medium text-sm text-foreground">{invoice.clientName}</span>
          <span className="text-xs text-muted-foreground">{invoice.clientCity || "Location unknown"}</span>
        </div>
      </td>

      <td className="px-4 py-3">
        <span 
          onClick={(e) => {
            e.stopPropagation()
            if (invoice.bookingId) router.push(`/bookings?id=${invoice.bookingId}`)
          }}
          className="text-sm font-medium text-primary hover:underline cursor-pointer truncate max-w-[150px] inline-block"
        >
          {invoice.bookingName || "General Services"}
        </span>
      </td>

      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {invoice.issueDate}
      </td>

      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`text-sm font-medium ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-amber-500' : 'text-muted-foreground'}`}>
          {invoice.dueDate}
        </span>
        {isDueSoon && !isOverdue && <span className="ml-1.5 text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">Soon</span>}
      </td>

      <td className="px-4 py-3 text-right font-mono text-sm font-medium">
        {formatINR(invoice.amount)}
      </td>

      <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">
        {formatINR(invoice.paidAmount)}
      </td>

      <td className="px-4 py-3 text-right font-mono text-sm font-semibold">
        <span className={invoice.balance === 0 ? "text-emerald-500" : isOverdue ? "text-red-500" : "text-amber-500"}>
          {formatINR(invoice.balance)}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide uppercase w-fit text-center ${getStatusColor(invoice.status)}`}>
          {invoice.status}
        </div>
      </td>

      <td className="px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onRowClick(invoice.id)}>
              <FileText className="mr-2 h-4 w-4" /> View / Preview
            </DropdownMenuItem>
            {invoice.status.toLowerCase() === "draft" && (
              <DropdownMenuItem>
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Send className="mr-2 h-4 w-4 text-blue-500" /> Mark as Sent
            </DropdownMenuItem>
            {invoice.balance > 0 && invoice.status.toLowerCase() !== "cancelled" && (
              <DropdownMenuItem>
                <BellRing className="mr-2 h-4 w-4 text-amber-500" /> Send Reminder
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            
            {invoice.status.toLowerCase() !== "cancelled" && (
              <DropdownMenuItem className="text-muted-foreground focus:text-red-500">
                <Ban className="mr-2 h-4 w-4" /> Cancel Invoice
              </DropdownMenuItem>
            )}
            {invoice.status.toLowerCase() === "draft" && (
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}
