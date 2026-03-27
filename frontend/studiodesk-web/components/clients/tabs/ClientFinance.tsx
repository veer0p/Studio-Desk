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
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 flex flex-col">
            <span className="text-sm font-medium text-muted-foreground mb-2">Total Invoiced</span>
            <span className="text-2xl font-semibold font-mono">{formatAmount(totalInvoiced)}</span>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 flex flex-col">
            <span className="text-sm font-medium text-muted-foreground mb-2">Total Paid</span>
            <span className="text-2xl font-semibold font-mono text-emerald-600">{formatAmount(totalPaid)}</span>
          </CardContent>
        </Card>
        <Card className={`border-border/60 shadow-sm ${outstanding > 0 ? "bg-amber-500/5 border-amber-500/20" : ""}`}>
          <CardContent className="p-6 flex flex-col">
            <span className="text-sm font-medium text-muted-foreground mb-2">Outstanding Balance</span>
            <span className={`text-2xl font-semibold font-mono ${outstanding > 0 ? "text-amber-600" : ""}`}>
              {formatAmount(outstanding)}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Invoices List */}
        <div className="flex flex-col space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Recent Invoices</h3>
          
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            {client.invoices && client.invoices.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs text-muted-foreground border-b border-border/40">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {client.invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium">{inv.number}</div>
                        <div className="text-xs text-muted-foreground">{inv.date}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">{formatAmount(inv.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-600" :
                          inv.status === "Sent" ? "bg-blue-500/10 text-blue-600" :
                          "bg-amber-500/10 text-amber-600"
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
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Payment History</h3>
          
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            {client.payments && client.payments.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs text-muted-foreground border-b border-border/40">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {client.payments.map((pay: any) => (
                    <tr key={pay.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{pay.date}</td>
                      <td className="px-4 py-3 font-mono font-medium text-emerald-600">{formatAmount(pay.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{pay.method}</span>
                          {pay.reference && <span className="text-[10px] text-muted-foreground isolate px-1.5 rounded bg-muted">Ref: {pay.reference}</span>}
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
