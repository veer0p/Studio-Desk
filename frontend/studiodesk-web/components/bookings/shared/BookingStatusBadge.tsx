import { cn } from "@/lib/utils"

const stageStyles: Record<string, string> = {
  "Inquiry": "bg-muted/30 text-muted-foreground border-border/40",
  "Proposal Sent": "bg-muted/50 text-foreground border-border/60",
  "Confirmed": "bg-foreground text-background border-foreground",
  "In Progress": "bg-muted/80 text-foreground border-muted-foreground/50",
  "Delivered": "bg-transparent text-muted-foreground border-border/40 border-dashed",
  "Cancelled": "bg-destructive/10 text-destructive/80 border-destructive/20 line-through",
}

interface StatusBadgeProps {
  stage: string;
  className?: string;
}

export function BookingStatusBadge({ stage, className }: StatusBadgeProps) {
  const style = stageStyles[stage]
  if (!style) {
    console.warn(`[BookingStatusBadge] Unknown stage: "${stage}". Falling back to neutral style.`)
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase border",
        style || "bg-muted/20 text-muted-foreground border-border/30",
        className
      )}
    >
      {stage}
    </span>
  )
}
