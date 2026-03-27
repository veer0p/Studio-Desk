import { cn } from "@/lib/utils"

const stageStyles: Record<string, string> = {
  "Inquiry": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ring-slate-400/20",
  "Proposal Sent": "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 ring-sky-400/20",
  "Confirmed": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 ring-indigo-400/20",
  "In Progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-amber-400/20",
  "Delivered": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-emerald-400/20",
  "Cancelled": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 ring-rose-400/20",
}

interface StatusBadgeProps {
  stage: string;
  className?: string;
}

export function BookingStatusBadge({ stage, className }: StatusBadgeProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        stageStyles[stage] || stageStyles["Inquiry"],
        className
      )}
    >
      {stage}
    </span>
  )
}
