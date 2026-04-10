"use client"

import useSWR from "swr"
import { fetchFinanceSummary, FinanceSummary } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown, Check } from "lucide-react"

const formatAmountCompact = (amt: number) => {
  if (amt === undefined || amt === null) return "₹0"
  if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`
  if (amt >= 1000) return `₹${(amt / 1000).toFixed(1)}K`
  return `₹${amt}`
}

export function FinanceSummaryBar({ onFilter, activeFilter }: { onFilter: (key: string) => void; activeFilter?: string }) {
  const { data: summary, isLoading, error } = useSWR("/api/v1/finance/summary", fetchFinanceSummary)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-3 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-[100px] w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (!summary || error) return null

  const boxes = [
    {
      id: "revenue",
      label: "Revenue Collected",
      value: formatAmountCompact(summary.revenue),
      subValue: `${summary.revenueGrowth >= 0 ? '↑' : '↓'} ${Math.abs(summary.revenueGrowth)}%`,
      onClick: () => onFilter("revenue"),
    },
    {
      id: "outstanding",
      label: "Outstanding",
      value: formatAmountCompact(summary.outstanding),
      subValue: `${summary.outstandingCount} pending`,
      onClick: () => onFilter("outstanding"),
    },
    {
      id: "overdue",
      label: "Overdue",
      value: formatAmountCompact(summary.overdue),
      subValue: `${summary.overdueCount} overdue`,
      onClick: () => onFilter("overdue"),
    },
    {
      id: "expenses",
      label: "Expenses",
      value: formatAmountCompact(summary.expenses),
      subValue: `${summary.expensesCount} records`,
      onClick: () => onFilter("expenses"),
    },
    {
      id: "net",
      label: "Net Income",
      value: formatAmountCompact(summary.net),
      subValue: "This period",
      onClick: () => onFilter("net"),
    },
  ]

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-3">
      {boxes.map((box) => {
        const isActive = activeFilter === box.id
        return (
          <Card
            key={box.id}
            className={`cursor-pointer transition-colors border-border/60 shadow-sm ${
              isActive
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "hover:border-primary/50"
            }`}
            onClick={box.onClick}
          >
            <CardContent className="p-4 flex flex-col justify-between h-[100px]">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-muted-foreground">{box.label}</span>
                <div className="flex items-center gap-1">
                  {isActive && (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                  {!isActive && box.subValue.includes('↑') ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  ) : !isActive && box.subValue.includes('↓') ? (
                    <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-mono font-bold tracking-tight text-foreground">{box.value}</span>
                <span className="text-[10px] font-medium text-muted-foreground">{box.subValue}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
