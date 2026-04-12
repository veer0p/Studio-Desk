import { cn } from "@/lib/utils"
import { Circle, CheckCircle2, Clock, AlertCircle, XCircle, Send, FileText, Archive } from "lucide-react"

export type StatusVariant =
  | "inquiry"
  | "proposal-sent"
  | "negotiation"
  | "confirmed"
  | "in-progress"
  | "delivered"
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled"
  | "signed"
  | "pending"
  | "ready"
  | "uploading"
  | "archived"
  | "default"

interface StatusBadgeProps {
  variant: StatusVariant | string
  label?: string
  className?: string
  /** Hide icon, show text only */
  textOnly?: boolean
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  inquiry: { color: "bg-blue-500/5 text-blue-600 border-blue-500/20", icon: <Circle className="w-2.5 h-2.5 fill-blue-600" /> },
  "proposal-sent": { color: "bg-amber-500/5 text-amber-600 border-amber-500/20", icon: <Send className="w-2.5 h-2.5 text-amber-600" /> },
  negotiation: { color: "bg-purple-500/5 text-purple-600 border-purple-500/20", icon: <Clock className="w-2.5 h-2.5 text-purple-600" /> },
  confirmed: { color: "bg-emerald-500/5 text-emerald-600 border-emerald-500/20", icon: <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> },
  "in-progress": { color: "bg-emerald-500/5 text-emerald-600 border-emerald-500/20", icon: <Clock className="w-2.5 h-2.5 text-emerald-600" /> },
  delivered: { color: "bg-muted text-muted-foreground border-border/60", icon: <CheckCircle2 className="w-2.5 h-2.5 text-muted-foreground" /> },
  draft: { color: "bg-muted text-muted-foreground border-border/40", icon: <FileText className="w-2.5 h-2.5 text-muted-foreground" /> },
  sent: { color: "bg-blue-500/5 text-blue-600 border-blue-500/20", icon: <Send className="w-2.5 h-2.5 text-blue-600" /> },
  paid: { color: "bg-muted text-emerald-600 border-border/60", icon: <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> },
  overdue: { color: "bg-red-500/5 text-red-600 border-red-500/30", icon: <AlertCircle className="w-2.5 h-2.5 text-red-600" /> },
  cancelled: { color: "bg-muted text-muted-foreground border-border/40 line-through", icon: <XCircle className="w-2.5 h-2.5 text-muted-foreground" /> },
  signed: { color: "bg-emerald-500/5 text-emerald-600 border-emerald-500/20", icon: <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> },
  pending: { color: "bg-muted text-muted-foreground border-border/40", icon: <Clock className="w-2.5 h-2.5 text-muted-foreground" /> },
  ready: { color: "bg-muted text-foreground border-primary/60", icon: <CheckCircle2 className="w-2.5 h-2.5 text-foreground" /> },
  uploading: { color: "bg-muted text-foreground border-primary/20", icon: <Clock className="w-2.5 h-2.5 text-foreground" /> },
  archived: { color: "bg-muted text-muted-foreground border-border/40", icon: <Archive className="w-2.5 h-2.5 text-muted-foreground" /> },
  default: { color: "bg-muted/50 text-muted-foreground border-border/40", icon: <Circle className="w-2.5 h-2.5 fill-muted-foreground" /> },
}

/**
 * Shared status badge component with consistent styling.
 * Supports predefined variants or custom color classes.
 * Includes icons for colorblind accessibility (color + icon + text).
 */
export function StatusBadge({ variant, label, className, textOnly }: StatusBadgeProps) {
  const normalizedVariant = (variant || "default").toLowerCase().replace(/\s+/g, "-")
  const config = statusConfig[normalizedVariant] || statusConfig.default
  const displayLabel = label || variant

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-sm border whitespace-nowrap",
        config.color,
        className
      )}
    >
      {!textOnly && config.icon}
      {displayLabel}
    </span>
  )
}
