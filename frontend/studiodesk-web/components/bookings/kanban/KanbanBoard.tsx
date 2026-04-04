"use client"

import { useState, useCallback, useMemo } from "react"
import useSWR from "swr"
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

const PIPELINE_STAGES = [
  "Inquiry",
  "Proposal Sent",
  "Confirmed",
  "In Progress",
  "Delivered",
]

export default function KanbanBoard() {
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const { data, isLoading, mutate } = useSWR(`/api/v1/bookings?view=kanban&${queryString}`, {
    dedupingInterval: 60000,
  })

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeBooking, setActiveBooking] = useState<any | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Use local state for smooth DnD, synced with SWR data
  // But since SWR caches, we can manipulate the cache directly optimistically
  // Fallback to empty mappings if loading
  const columns = useMemo(() => {
    const list = Array.isArray(data?.list) ? data.list : []
    return PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage] = list.filter((booking: any) => booking.stage === stage)
      return acc
    }, {} as Record<string, any[]>)
  }, [data])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    setActiveBooking(active.data.current?.booking || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: implement logic if cards can be reordered within the same column.
    // For Kanban, simply dropping into a different column is our main focus.
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    setActiveBooking(null)

    const { active, over } = event
    if (!over) return

    const activeStage = active.data.current?.booking?.stage || active.data.current?.sortable?.containerId
    const overStage = over.data.current?.stage || over.data.current?.sortable?.containerId

    if (!activeStage || !overStage || activeStage === overStage) return

    const bookingId = active.id as string

    // Optimistic Update
    const previousData = data
    mutate(
      (currentData: any) => {
        if (!currentData) return currentData
        const currentList = Array.isArray(currentData.list) ? [...currentData.list] : []
        
        // Find booking
        const index = currentList.findIndex((booking: any) => booking.id === bookingId)
        if (index === -1) {
          return currentData
        }

        const bookingToMove = { ...currentList[index], stage: overStage }
        currentList.splice(index, 1, bookingToMove)

        return { ...currentData, list: currentList }
      },
      false // do not revalidate yet
    )

    try {
      await updateBookingStage(bookingId, overStage as string)
      toast.success(`Moved to ${overStage}`)
      mutate() // Revalidate to sync with server
    } catch (error) {
      toast.error("Failed to update booking. Reverted.")
      mutate(previousData, true) // Rollback
    }
  }

  if (isLoading) {
    return (
      <div className="flex w-full h-full gap-4 p-4 overflow-x-auto custom-scrollbar">
        {PIPELINE_STAGES.map((i) => (
          <div key={i} className="min-w-[280px] w-[280px] h-full rounded-xl bg-muted/20 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex w-full h-full gap-4 p-4 overflow-x-auto custom-scrollbar">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {PIPELINE_STAGES.map((stage) => {
          const stageBookings = columns[stage] || []
          const totalValue = stageBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0)

          return (
            <KanbanColumn
              key={stage}
              stage={stage}
              bookings={stageBookings}
              totalValue={totalValue}
            />
          )
        })}

        <DragOverlay>
          {activeId && activeBooking ? (
            <div className="opacity-90 scale-105 rotate-2 cursor-grabbing shadow-2xl">
              <KanbanCard booking={activeBooking} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
