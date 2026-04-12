"use client"

import useSWR from "swr"
import { fetchContractDetail } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, CheckCircle, XCircle, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import DetailLayout from "@/components/layout/DetailLayout"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ROUTES } from "@/lib/constants/routes"

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ContractDetailContent params={params} />
}

async function ContractDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ContractDetailView id={id} />
}

function ContractDetailView({ id }: { id: string }) {
  const router = useRouter()
  const { data, isLoading, error } = useSWR(`/api/v1/contracts/${id}`, () => fetchContractDetail(id))

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
        <p className="font-medium text-foreground mb-1">Failed to load contract</p>
        <p className="text-sm mb-4">{error?.message || "Please try again later."}</p>
        <button
          onClick={() => router.push(ROUTES.CONTRACTS)}
          className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
        >
          Back to contracts
        </button>
      </div>
    )
  }

  return (
    <DetailLayout
      backLink={ROUTES.CONTRACTS}
      backLabel="Back to contracts"
      title={data.clientName}
      statusBadge={<StatusBadge variant={data.status?.toLowerCase()} />}
      subtitle={
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {data.date}
        </span>
      }
      sidebar={
        <div className="bg-card border border-border/60 rounded-md p-4 md:p-5 space-y-4">
          <h3 className="text-sm font-bold tracking-tight">Summary</h3>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Type</span>
              <span className="text-xs font-medium">{data.type}</span>
            </div>
            {data.packageName && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Package</span>
                <span className="text-xs font-medium">{data.packageName}</span>
              </div>
            )}
            {data.amount && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Amount</span>
                <span className="font-mono text-sm font-bold">₹{data.amount.toLocaleString("en-IN")}</span>
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

      {data.clauses && data.clauses.length > 0 && (
        <div className="bg-card border border-border/60 rounded-md p-4 md:p-5">
          <h3 className="text-sm font-bold tracking-tight mb-4">Clauses</h3>
          <div className="space-y-4">
            {data.clauses.map((clause, idx) => (
              <div key={idx} className="border-b border-border/40 pb-3 last:border-0">
                <h4 className="text-xs font-semibold mb-1">{clause.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{clause.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.terms && (
        <div className="bg-card border border-border/60 rounded-md p-4 md:p-5">
          <h3 className="text-sm font-bold tracking-tight mb-3">Terms</h3>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{data.terms}</p>
        </div>
      )}

      {!data.description && !data.clauses && !data.terms && (
        <div className="bg-card border border-border/60 rounded-md p-8 text-center text-muted-foreground">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No additional details available for this contract.</p>
        </div>
      )}
    </DetailLayout>
  )
}
