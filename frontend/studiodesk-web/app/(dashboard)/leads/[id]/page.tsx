"use client"

import useSWR from "swr"
import { fetchLeadDetail, BookingSummary } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, IndianRupee } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

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
      <div className="p-8 text-center text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Failed to load lead</p>
        <p className="text-sm">{error?.message || "Please try again later."}</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/leads" className="p-2 hover:bg-muted rounded-md transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-bold tracking-tight">{data.clientName}</h1>
        </div>
        <div className="ml-auto">
          <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm border ${
            data.stage === "Inquiry" ? "bg-blue-500/5 text-blue-600 border-blue-500/20" :
            data.stage === "Proposal Sent" ? "bg-amber-500/5 text-amber-600 border-amber-500/20" :
            data.stage === "Negotiation" ? "bg-purple-500/5 text-purple-600 border-purple-500/20" :
            "bg-muted/50 text-muted-foreground border-border/40"
          }`}>
            {data.stage}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left - Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border/60 rounded-md p-5 space-y-4">
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
        </div>

        {/* Right - Contact Info */}
        <div className="space-y-4">
          <div className="bg-card border border-border/60 rounded-md p-5 space-y-4">
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
        </div>
      </div>
    </div>
  )
}
