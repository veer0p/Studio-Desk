import { AnalyticsSkeleton } from "./AnalyticsSkeleton"
import { EmptyChart } from "./EmptyChart"
import { ReactNode } from "react"

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  height?: number
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
}

export function ChartCard({ 
  title, subtitle, children, height = 300, 
  isLoading = false, isEmpty = false, emptyMessage 
}: ChartCardProps) {
  
  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm flex flex-col h-full w-full">
      <div className="mb-6">
        <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      
      <div className="relative w-full flex-1 min-h-0" style={{ height: `${height}px` }}>
        {isLoading && <AnalyticsSkeleton />}
        {!isLoading && isEmpty && <EmptyChart message={emptyMessage} />}
        {!isLoading && !isEmpty && children}
      </div>
    </div>
  )
}
