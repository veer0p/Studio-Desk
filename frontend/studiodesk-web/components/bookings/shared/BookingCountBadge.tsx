"use client"

import useSWR from "swr"
import { fetchBookingsList } from "@/lib/api"

export default function BookingCountBadge() {
  const { data } = useSWR("/api/v1/bookings?limit=1", fetchBookingsList, {
    dedupingInterval: 60000,
    revalidateOnFocus: false,
  })

  const count = data?.count ?? 0

  return (
    <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded-sm text-muted-foreground hidden sm:inline-block">
      {count} booking{count !== 1 ? "s" : ""}
    </span>
  )
}
