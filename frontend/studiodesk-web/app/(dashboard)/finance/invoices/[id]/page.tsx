"use client"

import useSWR from "swr"
import { fetchInvoiceDetail } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, FileText, Calendar, IndianRupee, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <InvoiceDetailContent params={params} />
}

async function InvoiceDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <InvoiceDetailView id={id} />
}

function InvoiceDetailView({ id }: { id: string }) {
  const { data, isLoading, error } = useSWR(`/api/v1/invoices/${id}`, () => fetchInvoiceDetail(id))

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Failed to load invoice</p>
        <p className="text-sm">{error?.message || "Please try again later."}</p>
      </div>
    )
  }

  const statusColor =
    data.status?.toLowerCase() === "paid" ? "text-emerald-600" :
    data.status?.toLowerCase() === "overdue" ? "text-red-600" :
    "text-amber-600"

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/finance" className="p-2 hover:bg-muted rounded-md transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3">
          <FileText className={`w-5 h-5 ${statusColor}`} />
          <h1 className="text-xl font-bold tracking-tight">Invoice #{data.id}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {data.issueDate || "N/A"}
          </span>
          <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm border ${
            data.status?.toLowerCase() === "paid" ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" :
            data.status?.toLowerCase() === "overdue" ? "bg-red-500/5 text-red-600 border-red-500/20" :
            "bg-amber-500/5 text-amber-600 border-amber-500/20"
          }`}>
            {data.status}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left - Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Line Items */}
          {data.lineItems && data.lineItems.length > 0 && (
            <div className="bg-card border border-border/60 rounded-md p-5">
              <h3 className="text-sm font-bold tracking-tight mb-4">Line Items</h3>
              <div className="space-y-3">
                {data.lineItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-border/40 pb-2 last:border-0">
                    <span className="text-muted-foreground">{item.description}</span>
                    <span className="font-mono text-sm font-semibold">₹{item.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {data.payments && data.payments.length > 0 && (
            <div className="bg-card border border-border/60 rounded-md p-5">
              <h3 className="text-sm font-bold tracking-tight mb-4">Payments Received</h3>
              <div className="space-y-3">
                {data.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center text-sm border-b border-border/40 pb-2 last:border-0">
                    <div>
                      <p className="text-xs text-muted-foreground">{payment.date}</p>
                      <p className="text-xs capitalize">{payment.method}</p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-emerald-600">₹{payment.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!data.lineItems && !data.payments && (
            <div className="bg-card border border-border/60 rounded-md p-8 text-center text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No line items or payments recorded for this invoice.</p>
            </div>
          )}
        </div>

        {/* Right - Summary */}
        <div className="space-y-4">
          <div className="bg-card border border-border/60 rounded-md p-5 space-y-4">
            <h3 className="text-sm font-bold tracking-tight">Summary</h3>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Client</span>
                <span className="text-xs font-medium">{data.clientName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="font-mono text-sm font-bold flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  {(data.amount ?? 0).toLocaleString("en-IN")}
                </span>
              </div>

              {data.balance && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <span className={`font-mono text-sm font-bold flex items-center gap-1 ${
                    data.balance > 0 ? "text-red-600" : "text-emerald-600"
                  }`}>
                    {data.balance > 0 ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    ₹{data.balance.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-border/40">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="text-xs font-medium capitalize">{data.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
