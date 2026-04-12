"use client"

import useSWR from "swr"
import { fetchLeadDetail, BookingSummary } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Phone, Mail, Calendar, MapPin, IndianRupee } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import DetailLayout from "@/components/layout/DetailLayout"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ROUTES } from "@/lib/constants/routes"

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  if (!id) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  return <LeadDetailView id={id} />
}

function LeadDetailView({ id }: { id: string }) {
  const router = useRouter()
  const { data, isLoading, error } = useSWR(`/api/v1/bookings/${id}`, () => fetchLeadDetail(id))

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
        <p className="font-medium text-foreground mb-1">Failed to load lead</p>
        <p className="text-sm mb-4">{error?.message || "Please try again later."}</p>
        <button
          onClick={() => router.push(ROUTES.LEADS)}
          className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
        >
          Back to leads
        </button>
      </div>
    )
  }

  return (
    <DetailLayout
      backLink={ROUTES.LEADS}
      backLabel="Back to leads"
      title={data.clientName}
      statusBadge={<StatusBadge variant={data.stage?.toLowerCase().replace(/\s+/g, "-")} />}
      sidebar={
        <div className="bg-card border border-border/60 rounded-md p-4 md:p-5 space-y-4">
          <h3 className="text-sm font-bold tracking-tight">Contact Info</h3>
          <div className="space-y-3 pt-2">
            {data.clientPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm">{data.clientPhone}</span>
              </div>
            )}
            {data.clientEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm">{data.clientEmail}</span>
              </div>
            )}
            {data.amount && (
              <div className="flex justify-between items-center pt-2 border-t border-border/40">
                <span className="text-xs text-muted-foreground">Est. Amount</span>
                <span className="font-mono text-sm font-bold">₹{data.amount.toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="bg-card border border-border/60 rounded-md p-4 md:p-5 space-y-4">
        <h3 className="text-sm font-bold tracking-tight">Booking Details</h3>
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Event Date</p>
              <p className="text-sm font-medium">{data.date || "Not set"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Venue</p>
              <p className="text-sm font-medium">{data.venue || "Not set"}</p>
            </div>
          </div>
          {data.packageInfo?.name && (
            <div className="flex items-start gap-3">
              <IndianRupee className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Package</p>
                <p className="text-sm font-medium">{data.packageInfo.name}</p>
              </div>
            </div>
          )}
          {data.notes && (
            <div className="pt-2 border-t border-border/40">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm leading-relaxed">{data.notes}</p>
            </div>
          )}
        </div>
      </div>
    </DetailLayout>
  )
}
