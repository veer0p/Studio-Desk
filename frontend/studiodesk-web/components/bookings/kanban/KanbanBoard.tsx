"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import type { BookingListResult, BookingSummary } from "@/lib/api"
import { fetchBookingsList, updateBookingStage } from "@/lib/api"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

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

import { KanbanCard } from "./KanbanCard"
import { MemoizedKanbanColumn as KanbanColumn } from "./KanbanColumn"
import BookingsList from "@/components/bookings/list/BookingsList"

// Re-using the ui cmdk components if available. For safety we construct a simple absolute overlay.
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"

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
  const params = new URLSearchParams(searchParams.toString())
  params.delete("id")
  const kanbanQuery = params.toString()

  const { data, isLoading, error, mutate } = useSWR<BookingListResult>(
    `/api/v1/bookings?view=kanban&${kanbanQuery}`,
    fetchBookingsList,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 120000,
      keepPreviousData: true,
    }
  )

  const [isMobile, setIsMobile] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeBooking, setActiveBooking] = useState<BookingSummary | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Setup Cmd+K listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCmdOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
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

  const handleDragOver = (event: DragOverEvent) => { }

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

    // Optimistic Update
    const booking = columns[activeStage]?.find((b) => b.id === bookingId)
    if (booking && data) {
      const updatedList = data.list
        .filter((b) => b.id !== bookingId)
        .concat({ ...booking, stage: newStage })

      mutate({ ...data, list: updatedList, count: data.count ?? updatedList.length }, false)
    }

    setUpdatingId(bookingId)

    try {
      await updateBookingStage(bookingId, newStage)
      toast.success(`Moved to ${newStage}`, { style: { background: '#10b981', color: '#fafaf9', border: 'none' } })
      mutate()
    } catch (err) {
      mutate()
      const msg = err instanceof Error ? err.message : "Invalid transition"
      toast.error(msg, { style: { background: '#f59e0b', color: '#0f0f0f', border: 'none' } })
    } finally {
      setUpdatingId(null)
    }
  }

  // Quick stats calculations
  const totalRevenue = data?.list?.reduce((sum, b) => sum + b.amount, 0) || 0
  const totalPending = data?.list?.filter(b => b.stage === "Inquiry" || b.stage === "Proposal Sent").length || 0

  const formatAmount = (amt: number) => {
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
    if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`;
    return `₹${amt}`;
  }

  return (
    <div className="w-full h-full bg-[#0f0f0f] text-[#fafaf9] flex flex-col font-sans">

      {/* Top Header Command Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#333]">
        <button
          onClick={() => setCmdOpen(true)}
          className="flex items-center gap-3 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-md text-[#78716c] hover:text-[#fafaf9] hover:border-[#555] transition-colors w-64"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Cmd+K to search...</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-6 px-6 py-2 bg-[#1a1a1a] rounded-md border border-[#333]">
            <div className="text-sm">
              <span className="text-[#78716c] mr-2">Rev:</span>
              <span className="font-mono tabular-nums font-semibold text-[#10b981]">{formatAmount(totalRevenue)}</span>
            </div>
            <div className="text-sm border-l border-[#333] pl-6">
              <span className="text-[#78716c] mr-2">Pending:</span>
              <span className="font-mono tabular-nums font-semibold text-[#f59e0b]">{totalPending}</span>
            </div>
          </div>
          <button className="bg-[#f59e0b] hover:bg-[#d97706] text-[#0f0f0f] px-5 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
            + Booking
          </button>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 flex w-full h-full overflow-hidden">

        <div className="flex-1 w-full h-full overflow-x-auto custom-scrollbar p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* Mobile: stacked list, Desktop: kanban columns */}
            <div className="md:hidden flex flex-col gap-6 px-4">
              {PIPELINE_STAGES.map((stage) => {
                const stageBookings = columns[stage] || []
                if (stageBookings.length === 0) return null
                return (
                  <div key={stage} className="space-y-2">
                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{stage}</h3>
                    {stageBookings.map((b) => (
                      <div key={b.id} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                        <p className="text-sm text-zinc-200 font-medium">{b.clientName}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{(b as any).shootDate ? new Date((b as any).shootDate).toLocaleDateString() : 'No date'}</p>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
            <div className="hidden md:flex gap-6 h-full items-start">
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
            </div>

            <DragOverlay>
              {activeId && activeBooking ? (
                <div className="opacity-100 scale-105 rotate-2 cursor-grabbing shadow-2xl z-[100]">
                  <KanbanCard booking={activeBooking} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* 25% Sticky Sidebar for Activity */}
        <div className="hidden xl:block w-80 bg-[#1a1a1a] border-l border-[#333] p-6 shrink-0 overflow-y-auto">
          <h4 className="text-xs font-semibold tracking-widest text-[#78716c] uppercase mb-4">Activity</h4>
          <div className="space-y-4">
            {/* Mocked activity feed matching the prompt request */}
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-[#10b981]" />
              <div>
                <p className="text-sm font-medium text-[#fafaf9]">John Doe paid invoice</p>
                <p className="text-xs text-[#78716c]">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-[#f59e0b]" />
              <div>
                <p className="text-sm font-medium text-[#fafaf9]">Smith moved to Confirmed</p>
                <p className="text-xs text-[#78716c]">5 hours ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-[#78716c]" />
              <div>
                <p className="text-sm font-medium text-[#fafaf9]">New inquiry from Alice</p>
                <p className="text-xs text-[#78716c]">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cmd+K Command Palette Modal */}
      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Type phone number or client name to search/create..." className="font-sans" />
        <CommandList>
          <CommandEmpty>No results found. Hit Enter to create new client limit.</CommandEmpty>
          <CommandGroup heading="Recent Commands">
            <CommandItem>
              <Search className="mr-2 h-4 w-4" />
              <span>Smith Wedding - Nov 05</span>
            </CommandItem>
            <CommandItem>
              <Search className="mr-2 h-4 w-4" />
              <span>Gala '24 - Oct 01</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

    </div>
  )
}
