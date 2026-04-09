"use client"

import useSWR from "swr"
import { fetchProposalDetail } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, FileText, Clock, IndianRupee, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProposalDetailContent params={params} />
}

async function ProposalDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <ProposalDetailView id={id} />
  )
}

function ProposalDetailView({ id }: { id: string }) {
  const { data, isLoading, error } = useSWR(`/api/v1/proposals/${id}`, () => fetchProposalDetail(id))

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
        <p className="font-medium text-foreground mb-1">Failed to load proposal</p>
        <p className="text-sm">{error?.message || "Please try again later."}</p>
      </div>
    )
  }

  const statusColor = 
    data.status?.toLowerCase() === "signed" ? "text-emerald-600" :
    data.status?.toLowerCase() === "sent" ? "text-blue-600" :
    "text-muted-foreground"

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/proposals" className="p-2 hover:bg-muted rounded-md transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3">
          <FileText className={`w-5 h-5 ${statusColor}`} />
          <h1 className="text-xl font-bold tracking-tight">{data.clientName}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {data.date}
          </span>
          <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm border ${
            data.status?.toLowerCase() === "signed" ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" :
            data.status?.toLowerCase() === "sent" ? "bg-blue-500/5 text-blue-600 border-blue-500/20" :
            "bg-muted/50 text-muted-foreground border-border/40"
          }`}>
            {data.status}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left - Details */}
        <div className="md:col-span-2 space-y-6">
          {data.description && (
            <div className="bg-card border border-border/60 rounded-md p-5">
              <h3 className="text-sm font-bold tracking-tight mb-3">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
            </div>
          )}

          {data.items && data.items.length > 0 && (
            <div className="bg-card border border-border/60 rounded-md p-5">
              <h3 className="text-sm font-bold tracking-tight mb-4">Line Items</h3>
              <div className="space-y-3">
                {data.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-border/40 pb-2 last:border-0">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-mono text-sm font-semibold">₹{item.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.terms && (
            <div className="bg-card border border-border/60 rounded-md p-5">
              <h3 className="text-sm font-bold tracking-tight mb-3">Terms & Conditions</h3>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{data.terms}</p>
            </div>
          )}

          {!data.description && !data.items && !data.terms && (
            <div className="bg-card border border-border/60 rounded-md p-8 text-center text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No additional details available for this proposal.</p>
            </div>
          )}
        </div>

        {/* Right - Summary */}
        <div className="space-y-4">
          <div className="bg-card border border-border/60 rounded-md p-5 space-y-4">
            <h3 className="text-sm font-bold tracking-tight">Summary</h3>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Amount</span>
                <span className="font-mono text-sm font-bold flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  {(data.amount ?? 0).toLocaleString("en-IN")}
                </span>
              </div>

              {data.packageName && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Package</span>
                  <span className="text-xs font-medium">{data.packageName}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="text-xs font-medium flex items-center gap-1">
                  {data.status?.toLowerCase() === "signed" ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-muted-foreground" />}
                  {data.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
