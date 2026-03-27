"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Download, Receipt } from "lucide-react"

const formatAmount = (amt: number) => {
  if (!amt) return "₹0"
  if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`
  if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`
  return `₹${amt}`
}

export function ClientFinance({ client }: { client: any }) {
  const totalInvoiced = client.totalInvoiced || 0
  const totalPaid = client.totalPaid || 0
  const outstanding = Math.max(0, totalInvoiced - totalPaid)

  return (
    <div className="space-y-6 pb-10">
      
      {/* Finance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-none bg-muted/5 rounded-md">
          <CardContent className="p-6 flex flex-col justify-center">
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">Total Invoiced</span>
            <span className="text-sm font-mono tracking-widest uppercase text-foreground">{formatAmount(totalInvoiced)}</span>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-none bg-muted/5 rounded-md">
          <CardContent className="p-6 flex flex-col justify-center">
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">Total Paid</span>
            <span className="text-sm font-mono tracking-widest uppercase text-foreground">{formatAmount(totalPaid)}</span>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-none bg-muted/5 rounded-md">
          <CardContent className="p-6 flex flex-col justify-center">
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">Outstanding Balance</span>
            <span className={`text-sm font-mono tracking-widest uppercase ${outstanding > 0 ? "text-foreground" : "text-muted-foreground/50"}`}>
              {formatAmount(outstanding)}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Invoices List */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Recent Invoices</h3>
          
          <div className="rounded-md border border-border/60 bg-card overflow-hidden text-sm">
            {client.invoices && client.invoices.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/5 text-[10px] font-mono tracking-widest uppercase text-muted-foreground border-b border-border/40">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                    <th className="px-4 py-3 text-right font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {client.invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-mono text-[11px] uppercase tracking-widest">{inv.number}</div>
                        <div className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-0.5">{inv.date}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-right">{formatAmount(inv.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-mono tracking-widest uppercase border ${
                          inv.status === "Paid" ? "bg-muted/50 text-foreground border-border/60" :
                          inv.status === "Sent" ? "bg-muted/30 text-muted-foreground border-border/40" :
                          "bg-foreground text-background border-foreground"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-muted-foreground hover:text-foreground">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <Receipt className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <span className="text-sm text-muted-foreground">No invoices generated yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Payments List */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Payment History</h3>
          
          <div className="rounded-md border border-border/60 bg-card overflow-hidden text-sm">
            {client.payments && client.payments.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/5 text-[10px] font-mono tracking-widest uppercase text-muted-foreground border-b border-border/40">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {client.payments.map((pay: any) => (
                    <tr key={pay.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-[11px] font-mono tracking-widest uppercase text-muted-foreground">{pay.date}</td>
                      <td className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-right">{formatAmount(pay.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono uppercase tracking-widest">{pay.method}</span>
                          {pay.reference && <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground isolate px-1.5 rounded-sm bg-muted border border-border/40">Ref: {pay.reference}</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <span className="text-sm text-muted-foreground">No recorded payments</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
