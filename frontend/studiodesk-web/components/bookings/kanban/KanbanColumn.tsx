"use client"

import { memo } from "react"
import type { BookingSummary } from "@/lib/api"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { KanbanCard } from "./KanbanCard"
import { Plus, Loader2 } from "lucide-react"

interface KanbanColumnProps {
  stage: string;
  bookings: BookingSummary[];
  totalValue: number;
  updatingId: string | null;
  onAdd?: (stage: string) => void;
}

function KanbanColumn({ stage, bookings, totalValue, updatingId, onAdd }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: {
      type: "Column",
      stage,
    },
  })

  // Format amount neatly
  const formatAmount = (amt: number) => {
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
    if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`;
    return `₹${amt}`;
  }

  const bookingIds = bookings.map(b => b.id)
  const isColumnUpdating = updatingId !== null && bookings.some((b) => b.id === updatingId)

  return (
    <div className="flex flex-col min-w-[320px] w-[320px] shrink-0 max-h-full h-full pb-4 relative">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {/* Strict tracking for anti-AI styling and neutral secondary font */}
          <h3 className="font-semibold text-sm tracking-widest uppercase text-[#78716c]">{stage}</h3>
          <span className="text-xs font-medium bg-[#1a1a1a] text-[#78716c] px-2 py-0.5 rounded-full shrink-0 border border-[#333]">
            {bookings.length}
          </span>
        </div>
        <span className="text-xs font-semibold text-[#f59e0b] font-mono whitespace-nowrap tabular-nums">
          {formatAmount(totalValue)}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto px-1 pb-4 flex flex-col gap-4 custom-scrollbar transition-colors rounded-xl relative ${isOver ? "bg-[#1a1a1a]/50" : ""}`}
      >
        <SortableContext items={bookingIds} strategy={verticalListSortingStrategy}>
          {bookings.map((booking) => (
            <KanbanCard key={booking.id} booking={booking} isUpdating={updatingId === booking.id} />
          ))}
        </SortableContext>

        {/* Empty state filling columns lacking bookings with a custom photography outline */}
        {bookings.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#333] rounded-lg mt-2 min-h-[120px] pointer-events-none opacity-40">
            <svg
              className="w-8 h-8 text-[#78716c] mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            <span className="text-xs text-[#78716c] font-medium tracking-wide">Empty Queue</span>
          </div>
        )}

        {isColumnUpdating && (
          <div className="absolute inset-0 bg-[#0f0f0f]/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-20">
            <Loader2 className="w-6 h-6 text-[#f59e0b] animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}

export const MemoizedKanbanColumn = memo(KanbanColumn, (prev, next) => {
  return (
    prev.stage === next.stage &&
    prev.bookings.length === next.bookings.length &&
    prev.totalValue === next.totalValue &&
    prev.updatingId === next.updatingId &&
    prev.bookings.every((b, i) => b.id === next.bookings[i]?.id)
  )
})

MemoizedKanbanColumn.displayName = "MemoizedKanbanColumn"
