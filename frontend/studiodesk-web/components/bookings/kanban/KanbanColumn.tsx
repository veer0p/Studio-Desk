import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { KanbanCard } from "./KanbanCard"
import { Plus } from "lucide-react"

interface KanbanColumnProps {
  stage: string;
  bookings: any[];
  totalValue: number;
  updatingId: string | null;
  onAdd?: (stage: string) => void;
}

export function KanbanColumn({ stage, bookings, totalValue, updatingId, onAdd }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: {
      type: "Column",
      stage,
    },
  })

  const formatAmount = (amt: number) => {
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
    if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`;
    return `₹${amt}`;
  }

  const bookingIds = bookings.map(b => b.id)

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] shrink-0 max-h-full h-full pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm whitespace-nowrap">{stage}</h3>
          <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">
            {bookings.length}
          </span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground font-mono whitespace-nowrap">
          {formatAmount(totalValue)}
        </span>
      </div>

      {/* Body / Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto px-1 pb-4 flex flex-col gap-3 custom-scrollbar transition-colors rounded-xl ${isOver ? "bg-muted/30" : ""}`}
      >
        <SortableContext items={bookingIds} strategy={verticalListSortingStrategy}>
          {bookings.map((booking) => (
            <KanbanCard key={booking.id} booking={booking} isUpdating={updatingId === booking.id} />
          ))}
        </SortableContext>

        {onAdd && (
          <button
            onClick={() => onAdd(stage)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium p-2 mt-2 transition-colors rounded-lg hover:bg-muted/20 justify-center w-full border border-dashed border-transparent hover:border-border/60"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        )}
      </div>
    </div>
  )
}
