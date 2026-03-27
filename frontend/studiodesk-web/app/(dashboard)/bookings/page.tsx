import { Suspense } from "react"
import BookingsShell from "@/components/bookings/BookingsShell"
import KanbanBoard from "@/components/bookings/kanban/KanbanBoard"
import BookingsList from "@/components/bookings/list/BookingsList"
import BookingSlideOver from "@/components/bookings/slideover/BookingSlideOver"

export const metadata = {
  title: "Bookings | StudioDesk",
  description: "Manage your studio bookings and pipeline",
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string, id?: string }>
}) {
  const { view, id } = await searchParams
  const isListView = view === "list"

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Initializing Board Engine...</div>}>
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
    </Suspense>
  )
}