"use client"

import React, { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts"
import { fetchExpensesListTyped } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3 } from "lucide-react"

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#64748b']

export function FinanceCharts() {
  const { data: expensesData, isLoading } = useSWR("/api/v1/expenses", fetchExpensesListTyped)
  const [containerWidth, setContainerWidth] = useState(0)
  const [mounted, setMounted] = useState(false)
  const pieRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
    const updateWidth = () => {
      if (pieRef.current) {
        setContainerWidth(pieRef.current.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const pieInnerRadius = Math.max(40, Math.min(65, containerWidth * 0.18))
  const pieOuterRadius = Math.max(60, Math.min(85, containerWidth * 0.24))

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-[380px] w-full rounded-xl" />
        </div>
        <Skeleton className="h-[380px] w-full rounded-xl" />
      </div>
    )
  }

  if (!expensesData?.list?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground mt-8 bg-card border border-border/40 rounded-xl">
        <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
        <p className="font-medium text-foreground mb-1">No financial data to chart yet</p>
        <p className="text-sm">Charts will appear once expenses and revenue data are recorded.</p>
      </div>
    )
  }

  // Aggregate expenses by category for pie chart
  const categoryMap = new Map<string, number>()
  expensesData.list.forEach((exp) => {
    const cat = exp.category || "Other"
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + Number(exp.amount ?? 0))
  })
  const expenseData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))

  // Use month labels from actual expense dates
  const monthMap = new Map<string, { expenses: number }>()
  expensesData.list.forEach((exp) => {
    const monthLabel = exp.date ? new Date(exp.date).toLocaleString("en-IN", { month: "short" }) : "Unknown"
    const existing = monthMap.get(monthLabel) ?? { expenses: 0 }
    existing.expenses += Number(exp.amount ?? 0)
    monthMap.set(monthLabel, existing)
  })
  const monthlyData = Array.from(monthMap.entries()).map(([name, d]) => ({
    name,
    expenses: d.expenses,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

      {/* Expenses Bar Chart */}
      <div className="lg:col-span-2 bg-card rounded-xl border border-border/60 p-4 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="font-semibold text-foreground tracking-tight text-sm sm:text-base">Expense Overview</h3>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">By Month</span>
        </div>
        {monthlyData.length > 0 ? (
          <div className="h-[250px] sm:h-[300px] w-full" style={{ minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No monthly data to chart.</div>
        )}
      </div>

      {/* Expense Breakdown Donut Chart */}
      <div className="bg-card rounded-xl border border-border/60 p-6 shadow-sm">
        <h3 className="font-semibold text-foreground tracking-tight mb-2">Expense Distribution</h3>
        <p className="text-xs text-muted-foreground mb-6">By Category</p>

        {expenseData.length > 0 ? (
          <>
            <div className="h-[220px] w-full relative" ref={pieRef}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={pieInnerRadius}
                    outerRadius={pieOuterRadius}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Total</span>
                <span className="font-bold text-foreground text-lg">₹{(expensesData.totalExp / 100000).toFixed(1)}L</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {expenseData.slice(0, 4).map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No expense categories.</div>
        )}
      </div>

    </div>
  )
}
