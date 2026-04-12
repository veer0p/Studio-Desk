"use client"

import { useSearchParams, useRouter } from "next/navigation"
import BookingsShell from "@/components/bookings/BookingsShell"
import KanbanBoard from "@/components/bookings/kanban/KanbanBoard"
import BookingsList from "@/components/bookings/list/BookingsList"
import BookingSlideOver from "@/components/bookings/slideover/BookingSlideOver"

export default function BookingsClient() {
  const searchParams = useSearchParams()
  const isListView = searchParams.get("view") === "list"
  const id = searchParams.get("id") || undefined

  return (
    <div className="flex w-full h-full overflow-hidden">
      <div className="flex-1 min-w-0 h-full">
        <BookingsShell>
          {isListView ? <BookingsList /> : <KanbanBoard />}
        </BookingsShell>
      </div>

      {/* Desktop Slide-Over (Hidden on mobile) */}
      {id && (
        <div className="hidden lg:block w-[520px] shrink-0 border-l border-border/40 bg-background h-full animate-in slide-in-from-right-8 duration-200">
          <BookingSlideOver bookingId={id} />
        </div>
      )}
    </div>
  )
}
