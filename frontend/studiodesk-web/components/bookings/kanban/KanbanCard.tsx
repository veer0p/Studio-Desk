import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import { EventTypeDot } from "@/components/bookings/shared/EventTypeDot"
import { useRouter, useSearchParams } from "next/navigation"

const eventColors: Record<string, string> = {
  Wedding: "bg-indigo-500",
  Engagement: "bg-rose-500",
  Corporate: "bg-blue-500",
  Birthday: "bg-amber-500",
  "Product Shoot": "bg-teal-500",
  Other: "bg-slate-500",
}

interface KanbanCardProps {
  booking: any;
  isUpdating?: boolean;
}

export function KanbanCard({ booking, isUpdating = false }: KanbanCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentView = searchParams.get("view") || "kanban"

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

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  // Formatting compact INR (e.g. ₹2.4L)
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
        className="h-[140px] w-full rounded-xl bg-muted/60 border-2 border-dashed border-primary/50 opacity-50" 
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => router.push(`/bookings?view=${currentView}&id=${booking.id}`)}
      className={`relative flex flex-col gap-2 p-3 bg-card border border-border/60 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-primary/30 transition-all ${isDragging ? "opacity-50" : ""} ${isUpdating ? "opacity-60 pointer-events-none" : ""}`}
    >
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-xl z-10">
          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
        </div>
      )}
      {/* Absolute Left Color Border */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${eventColors[booking.eventType] || eventColors.Other}`} />
      
      <div className="pl-2">
        <div className="flex justify-between items-start gap-2">
          <span className="font-medium text-sm line-clamp-1">{booking.clientName}</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{booking.date}</span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground line-clamp-1">{booking.venue}</span>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <EventTypeDot type={booking.eventType} className="w-2 h-2" />
          <span className="text-xs text-muted-foreground font-medium">{booking.eventType}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            {booking.team?.slice(0, 3).map((member: any, i: number) => (
              <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium overflow-hidden shrink-0">
                {member.avatar ? (
                  <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  member.name.charAt(0)
                )}
              </div>
            ))}
            {(booking.team?.length || 0) > 3 && (
              <div className="w-6 h-6 rounded-full bg-background border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground z-10 shrink-0">
                +{(booking.team?.length || 0) - 3}
              </div>
            )}
          </div>
          <span className="text-sm font-medium font-mono">{formatAmount(booking.amount)}</span>
        </div>
      </div>
    </div>
  )
}
