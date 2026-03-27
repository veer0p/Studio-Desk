import { BarChart2 } from "lucide-react"

export function EmptyChart({ message = "No data for this period" }: { message?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-muted/5 rounded-lg border border-dashed border-border/60">
      <BarChart2 className="w-8 h-8 text-muted-foreground/30 mb-3" />
      <h4 className="text-sm font-semibold text-muted-foreground">{message}</h4>
      <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">Expand your search bounds gathering specific historical data.</p>
    </div>
  )
}
