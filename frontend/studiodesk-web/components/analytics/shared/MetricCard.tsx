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
    <div className="bg-card border border-border/60 rounded-md p-5 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-muted-foreground">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground/40" />}
      </div>
      
      <div>
        <div className="flex items-end gap-3 mb-1">
          <span className={`text-2xl font-bold tracking-tight ${color === 'amber' ? 'text-amber-600' : color === 'red' ? 'text-red-500' : 'text-foreground'}`}>
            {value}
          </span>
          
          {delta !== undefined && (
            <div className={`flex items-center gap-0.5 text-[9px] font-mono font-bold mb-1 px-1.5 py-0.5 rounded-sm border ${isPositive ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' : isNegative ? 'bg-red-500/5 text-red-500 border-red-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
              {isPositive && <ArrowUpRight className="w-2.5 h-2.5" />}
              {isNegative && <ArrowDownRight className="w-2.5 h-2.5" />}
              {Math.abs(delta)}%
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/60">{subtext}</span>
          {delta !== undefined && <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground/40">{deltaLabel}</span>}
        </div>
      </div>
    </div>
  )
}
