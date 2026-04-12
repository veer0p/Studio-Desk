"use client"

import useSWR from "swr"
import { fetchProposalDetail } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, IndianRupee, CheckCircle, XCircle, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import DetailLayout from "@/components/layout/DetailLayout"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ROUTES } from "@/lib/constants/routes"

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProposalDetailContent params={params} />
}

async function ProposalDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProposalDetailView id={id} />
}

function ProposalDetailView({ id }: { id: string }) {
  const router = useRouter()
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
      <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Failed to load proposal</p>
        <p className="text-sm mb-4">{error?.message || "Please try again later."}</p>
        <button
          onClick={() => router.push(ROUTES.PROPOSALS)}
          className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
        >
          Back to proposals
        </button>
      </div>
    )
  }

  return (
    <DetailLayout
      backLink={ROUTES.PROPOSALS}
      backLabel="Back to proposals"
      title={data.clientName}
      statusBadge={<StatusBadge variant={data.status?.toLowerCase()} />}
      subtitle={
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" /> {data.date}
        </span>
      }
      sidebar={
        <div className="bg-card border border-border/60 rounded-md p-4 md:p-5 space-y-4">
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
      }
    >
      {data.description && (
        <div className="bg-card border border-border/60 rounded-md p-4 md:p-5">
          <h3 className="text-sm font-bold tracking-tight mb-3">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
        </div>
      )}

      {data.items && data.items.length > 0 && (
        <div className="bg-card border border-border/60 rounded-md p-4 md:p-5">
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
        <div className="bg-card border border-border/60 rounded-md p-4 md:p-5">
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
    </DetailLayout>
  )
}
