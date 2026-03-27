"use client"

import { BookingSummary } from "@/lib/api"
import { LeadsShell } from "@/components/leads/LeadsShell"
import { LeadsKanban } from "@/components/leads/LeadsKanban"
import useSWR from "swr"
import { fetchBookingsList } from "@/lib/api"

export default function LeadsClient({ search, view }: { search: string, view: string }) {
  // Fetching all bookings that are in the lead stages
  const { data, isLoading } = useSWR(
    `/api/v1/bookings?stage=Inquiry,Proposal%20Sent,Negotiation&search=${search}`,
    fetchBookingsList
  )

  const leads = data?.list || []

  return (
    <LeadsShell count={leads.length}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
            <div className="text-[10px] font-mono tracking-widest uppercase animate-pulse">Loading leads...</div>
        </div>
      ) : (
        <LeadsKanban labs={leads} />
      )}
    </LeadsShell>
  )
}
