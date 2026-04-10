"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import useSWR from "swr"
import type { BookingListResult, BookingSummary } from "@/lib/api"
import { fetchBookingsList, updateBookingStage } from "@/lib/api"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"

import { KanbanColumn } from "./KanbanColumn"
import { KanbanCard } from "./KanbanCard"
import BookingsList from "@/components/bookings/list/BookingsList"

const PIPELINE_STAGES = [
  "Inquiry",
  "Proposal Sent",
  "Confirmed",
  "In Progress",
  "Delivered",
]

const MOBILE_BREAKPOINT = 768

export default function KanbanBoard() {
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const { data, isLoading, error, mutate } = useSWR<BookingListResult>(
    `/api/v1/bookings?view=kanban&${queryString}`,
    fetchBookingsList,
    { dedupingInterval: 60000 }
  )

  const [isMobile, setIsMobile] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeBooking, setActiveBooking] = useState<BookingSummary | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 16,
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const columns = useMemo(() => {
    const list = Array.isArray(data?.list) ? data.list : []
    return PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage] = list.filter((booking) => booking.stage === stage)
      return acc
    }, {} as Record<string, BookingSummary[]>)
  }, [data])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    setActiveBooking(active.data.current?.booking || null)
  }

  const handleDragOver = (event: DragOverEvent) => {}

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveBooking(null)

    if (!over) return

    const activeStage = active.data.current?.booking?.stage ?? active.data.current?.sortable?.containerId
    const overStage = over.data.current?.stage ?? over.data.current?.sortable?.containerId

    if (!activeStage || !overStage || activeStage === overStage) return

    const bookingId = active.id as string
    const newStage = overStage as string

    setUpdatingId(bookingId)

    try {
      await updateBookingStage(bookingId, newStage)
      toast.success(`Moved to ${newStage}`)
      // Small delay to let drag overlay dismiss before revalidation
      await new Promise((r) => setTimeout(r, 100))
      mutate()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid transition — check allowed stages"
      toast.error(msg)
    } finally {
      setUpdatingId(null)
    }
  }

  if (isLoading) {
    if (isMobile) {
      return (
        <div className="flex flex-col w-full h-full gap-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      )
    }
    return (
      <div className="hidden md:flex w-full h-full gap-4 p-4 overflow-x-auto custom-scrollbar">
        {PIPELINE_STAGES.map((i) => (
          <div key={i} className="min-w-[280px] w-[280px] h-full rounded-xl bg-muted/20 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-4 p-8">
        <p className="text-muted-foreground">Failed to load bookings</p>
        <button
          onClick={() => mutate()}
          className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:bg-foreground/90"
        >
          Retry
        </button>
      </div>
    )
  }

  const allEmpty = PIPELINE_STAGES.every((stage) => (columns[stage] || []).length === 0)

  if (allEmpty) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-4 p-8 text-center">
        <p className="text-lg font-medium text-foreground">No bookings yet</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Create your first booking to start tracking your pipeline.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile view - list */}
      <div className="md:hidden w-full h-full overflow-y-auto">
        <BookingsList />
      </div>

      {/* Desktop view - kanban */}
      <div className="hidden md:flex w-full h-full gap-4 p-4 overflow-x-auto custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {PIPELINE_STAGES.map((stage) => {
            const stageBookings = columns[stage] || []
            const totalValue = stageBookings.reduce((sum, b) => sum + b.amount, 0)

            return (
              <KanbanColumn
                key={stage}
                stage={stage}
                bookings={stageBookings}
                totalValue={totalValue}
                updatingId={updatingId}
              />
            )
          })}

          <DragOverlay>
            {activeId && activeBooking ? (
              <div className="opacity-90 scale-105 rotate-2 cursor-grabbing shadow-2xl z-[100]">
                <KanbanCard booking={activeBooking} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  )
}
