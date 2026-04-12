"use client"

import type { BookingSummary } from "@/lib/api"
import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import { useRouter, useSearchParams } from "next/navigation"
import { ROUTES } from "@/lib/constants/routes"
import { EventTypeDot } from "@/components/bookings/shared/EventTypeDot"
import { FileText, MessageSquare, CalendarClock } from "lucide-react"

// Anti-AI styling mandate palettes
const statusColorBorder: Record<string, string> = {
  "Inquiry": "bg-[#f59e0b]",
  "Proposal Sent": "bg-[#f59e0b]",
  "Confirmed": "bg-[#10b981]",
  "In Progress": "bg-[#10b981]",
  "Delivered": "bg-[#78716c]",
}

interface KanbanCardProps {
  booking: BookingSummary;
  isUpdating?: boolean;
}

export function KanbanCard({ booking, isUpdating = false }: KanbanCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentView = searchParams.get("view") || "kanban"
  const selectedId = searchParams.get("id") || undefined
  const isSelected = booking.id === selectedId

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: booking.id,
    data: {
      type: "Booking",
      booking,
    },
  })

  // Smooth out dropping transforms
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  const formatAmount = (amt: number) => {
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
    if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`;
    return `₹${amt}`;
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[140px] w-full rounded-lg bg-[#1a1a1a] border border-dashed border-[#f59e0b] opacity-40"
      />
    )
  }

  const defaultBorder = statusColorBorder[booking.stage] || "bg-[#78716c]"

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("id", booking.id)
        router.push(`${ROUTES.BOOKINGS}?${params.toString()}`, { scroll: false })
      }}
      className={`group relative flex flex-col p-4 overflow-hidden rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-all ${isSelected
          ? "border-[#f59e0b] ring-1 ring-[#f59e0b] bg-[#1a1a1a]"
          : "border-[#333333] hover:border-[#555] bg-[#1a1a1a]"
        } border ${isDragging ? "opacity-50" : ""} ${isUpdating ? "opacity-30 pointer-events-none" : ""}`}
    >
      {/* 1% opacity noise grain pattern trick (simulated via subtle repeating svg) */}
      <div
        className="absolute inset-0 opacity-[0.01] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f]/80 z-10 transition-opacity">
          <div className="w-4 h-4 border-2 border-[#1a1a1a] border-t-[#f59e0b] rounded-full animate-spin" />
        </div>
      )}

      {/* Vertical Status Pill replacing plain colors */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${defaultBorder}`} />

      {/* Quick Actions overlay triggering on group hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-[#1a1a1a]/90 px-1 py-1 rounded">
        <button onClick={(e) => { e.stopPropagation(); console.log("Invoice clicked"); }} className="p-1 hover:bg-[#333] rounded transition-colors text-[#78716c] hover:text-[#fafaf9]">
          <FileText className="w-4 h-4" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/something`); }} className="p-1 hover:bg-[#333] rounded transition-colors text-[#78716c] hover:text-[#fafaf9]">
          <MessageSquare className="w-4 h-4" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); console.log("Reschedule clicked"); }} className="p-1 hover:bg-[#333] rounded transition-colors text-[#78716c] hover:text-[#fafaf9]">
          <CalendarClock className="w-4 h-4" />
        </button>
      </div>

      <div className="pl-1 flex flex-col h-full z-0 font-sans text-sm">
        <div className="font-serif text-[#fafaf9] text-base mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
          {booking.clientName}
        </div>

        <div className="flex items-center justify-between text-[#78716c]">
          <span className="truncate pr-4 leading-tight">{booking.venue}</span>
          <span className="shrink-0">{booking.date}</span>
        </div>

        <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#333]">
          <div className="flex items-center gap-1.5 text-[#f59e0b]">
            <EventTypeDot type={booking.eventType} className="w-2 h-2 opacity-80 mix-blend-screen" />
            <span className="text-xs font-semibold">{booking.eventType}</span>
          </div>
          <span className="font-medium font-mono tabular-nums text-[#fafaf9]">{formatAmount(booking.amount)}</span>
        </div>
      </div>
    </div>
  )
}
