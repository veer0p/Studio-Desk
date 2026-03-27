"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

const formatAmountCompact = (amt: number) => {
  if (amt === undefined || amt === null) return "₹0"
  if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`
  if (amt >= 1000) return `₹${(amt / 1000).toFixed(1)}K`
  return `₹${amt}`
}

export function FinanceSummaryBar({ summary, onFilter }: { summary: any, onFilter: (key: string) => void }) {
  if (!summary) return null

  const boxes = [
    {
      id: "revenue",
      title: "This Month Revenue",
      value: formatAmountCompact(summary.revenue),
      subValue: summary.revenueGrowth >= 0 ? `↑ ${summary.revenueGrowth}% vs last month` : `↓ ${Math.abs(summary.revenueGrowth)}% vs last month`,
      subColor: summary.revenueGrowth >= 0 ? "text-emerald-500" : "text-red-500",
      icon: summary.revenueGrowth >= 0 ? ArrowUpRight : ArrowDownRight,
      onClick: undefined
    },
    {
      id: "outstanding",
      title: "Outstanding",
      value: formatAmountCompact(summary.outstanding),
      subValue: `across ${summary.outstandingCount || 0} invoices`,
      valueColor: summary.outstanding > 0 ? "text-amber-500" : "text-emerald-500",
      onClick: () => onFilter("unpaid")
    },
    {
      id: "overdue",
      title: "Overdue",
      value: formatAmountCompact(summary.overdue),
      subValue: `${summary.overdueCount || 0} invoices overdue`,
      valueColor: summary.overdue > 0 ? "text-red-500" : "text-emerald-500",
      onClick: () => onFilter("overdue")
    },
    {
      id: "expenses",
      title: "This Month Expenses",
      value: formatAmountCompact(summary.expenses),
      subValue: `${summary.expensesCount || 0} transactions`,
      onClick: undefined
    },
    {
      id: "net",
      title: "Net (Rev - Exp)",
      value: formatAmountCompact(summary.net),
      subValue: "this month",
      valueColor: summary.net >= 0 ? "text-emerald-500" : "text-red-500",
      onClick: undefined
    }
  ]

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex items-center gap-4 min-w-max">
        {boxes.map((box) => (
          <Card 
            key={box.id} 
            className={`w-[240px] shrink-0 border-border/60 rounded-md shadow-sm transition-colors ${box.onClick ? 'cursor-pointer hover:border-primary/40' : ''}`}
            onClick={box.onClick}
          >
            <CardContent className="p-4 flex flex-col justify-center">
              <span className="text-sm font-medium text-muted-foreground mb-1">
                {box.title}
              </span>
              <span className={`text-2xl font-bold font-mono tracking-widest uppercase ${box.valueColor || "text-foreground"}`}>
                {box.value}
              </span>
              <div className="flex items-center mt-1">
                <span className={`text-xs font-medium ${box.subColor || "text-muted-foreground"}`}>
                  {box.subValue}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
