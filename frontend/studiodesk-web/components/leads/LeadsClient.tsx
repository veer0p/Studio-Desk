"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BookingSummary } from "@/lib/api"
import { LeadsShell } from "@/components/leads/LeadsShell"
import { LeadsKanban } from "@/components/leads/LeadsKanban"
import { LeadsList } from "@/components/leads/LeadsList"
import useSWR from "swr"
import { fetchBookingsList } from "@/lib/api"

export default function LeadsClient({ search, view }: { search: string, view: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") || ""
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  // Fetching all bookings that are in the lead stages
  const { data, isLoading } = useSWR(
    `/api/v1/bookings?stage=Inquiry,Proposal%20Sent,Negotiation&search=${searchQuery}`,
    fetchBookingsList
  )

  const leads = data?.list || []
  const isListView = view === "list"

  return (
    <LeadsShell 
      count={leads.length} 
      searchQuery={searchQuery}
      onSearchChange={(val) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current)
        debounceTimer.current = setTimeout(() => {
          const params = new URLSearchParams(searchParams.toString())
          if (val) {
            params.set("search", val)
          } else {
            params.delete("search")
          }
          router.replace(`/leads?${params.toString()}`)
        }, 300)
      }}
      filterOpen={filterOpen}
      onFilterOpenChange={setFilterOpen}
      overdueCount={0}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
            <div className="text-[10px] font-mono tracking-widest uppercase animate-pulse">Loading leads...</div>
        </div>
      ) : (
        isListView ? <LeadsList /> : <LeadsKanban labs={leads} />
      )}
    </LeadsShell>
  )
}
