import { cn } from "@/lib/utils"

const eventColors: Record<string, string> = {
  Wedding: "bg-indigo-500",
  Engagement: "bg-rose-500",
  Corporate: "bg-blue-500",
  Birthday: "bg-amber-500",
  "Product Shoot": "bg-teal-500",
  Other: "bg-slate-500",
}

interface EventTypeDotProps {
  type: string;
  className?: string;
}

export function EventTypeDot({ type, className }: EventTypeDotProps) {
  return (
    <div
      role="img"
      aria-label={type}
      title={type}
      className={cn(
        "w-2.5 h-2.5 rounded-full shrink-0",
        eventColors[type] || eventColors.Other,
        className
      )}
    />
  )
}
