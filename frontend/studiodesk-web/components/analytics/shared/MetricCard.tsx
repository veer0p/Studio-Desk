import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string
  subtext: string
  delta?: number
  deltaLabel?: string
  icon?: LucideIcon
  color?: "default" | "amber" | "red" | "green"
}

export function MetricCard({ label, value, subtext, delta, deltaLabel = "vs last period", icon: Icon, color = "default" }: MetricCardProps) {
  
  const isPositive = delta && delta > 0
  const isNegative = delta && delta < 0

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-semibold text-muted-foreground tracking-tight">{label}</span>
        {Icon && <Icon className="w-5 h-5 text-muted-foreground/50" />}
      </div>
      
      <div>
        <div className="flex items-end gap-3 mb-1">
          <span className={`text-2xl font-bold tracking-tight ${color === 'amber' ? 'text-amber-600' : color === 'red' ? 'text-red-500' : 'text-foreground'}`}>
            {value}
          </span>
          
          {delta !== undefined && (
            <div className={`flex items-center gap-0.5 text-xs font-bold mb-1 px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-600' : isNegative ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'}`}>
              {isPositive && <ArrowUpRight className="w-3 h-3" />}
              {isNegative && <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(delta)}%
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground/80 font-medium">{subtext}</span>
          {delta !== undefined && <span className="text-[10px] text-muted-foreground/60">{deltaLabel}</span>}
        </div>
      </div>
    </div>
  )
}
