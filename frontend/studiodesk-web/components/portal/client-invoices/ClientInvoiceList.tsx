// components/portal/client-invoices/ClientInvoiceList.tsx
"use client"

import Link from "next/link"
import { Calendar, Download, AlertCircle, CheckCircle2 } from "lucide-react"

export function ClientInvoiceList({ studioSlug }: { studioSlug: string }) {
  
  const invoices = [
    {
      id: "INV-2026-047",
      title: "Wedding Advance Retainer",
      date: "12 Apr 2026",
      amount: "₹2,25,000",
      status: "Unpaid",
      color: "red"
    },
    {
      id: "INV-2026-012",
      title: "Pre-Wedding Shoot Full Payment",
      date: "05 Mar 2026",
      amount: "₹85,000",
      status: "Paid",
      color: "emerald"
    }
  ]

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoices & Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">Review pending payments and download financial receipts securely.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {invoices.map(inv => {
          const isPaid = inv.status === 'Paid'
          return (
            <Link href={`/portal/${studioSlug}/invoices/${inv.id}`} key={inv.id} className="block transition-transform hover:-translate-y-0.5">
              <div className="w-full bg-card border border-border/60 hover:border-[hsl(var(--portal-primary))/40] rounded-xl p-5 shadow-sm group relative overflow-hidden">
                
                {/* Visual Status Indicator Line */}
                <div className={`absolute top-0 bottom-0 left-0 w-1 ${isPaid ? 'bg-emerald-500' : 'bg-red-500'}`} />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">{inv.id}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest ${isPaid ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {inv.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-[hsl(var(--portal-primary))] transition-colors">{inv.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Issued: {inv.date}</span>
                    </div>
                  </div>

                  <div className="pr-2 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-border/40 pt-4 sm:pt-0">
                     <p className="text-xl font-mono font-bold tracking-tight text-foreground">{inv.amount}</p>
                     <div className="mt-1 flex items-center gap-2">
                       {isPaid ? (
                         <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 hover:text-foreground">
                           <Download className="w-3.5 h-3.5" /> Receipt
                         </span>
                       ) : (
                         <span className="text-sm font-bold text-[hsl(var(--portal-primary))] hover:underline">
                           Pay Now →
                         </span>
                       )}
                     </div>
                  </div>
                </div>

              </div>
            </Link>
          )
        })}
      </div>

    </div>
  )
}
