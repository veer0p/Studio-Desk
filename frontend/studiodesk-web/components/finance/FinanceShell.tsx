"use client"

import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { fetchFinanceSummary } from "@/lib/api"
import { FinanceSummaryBar } from "./FinanceSummaryBar"

export function FinanceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "invoices"

  // Mock standard empty fetch for now until backend is populated
  const { data: summary } = useSWR("/api/v1/finance/summary", fetchFinanceSummary, { 
    fallbackData: {
      revenue: 320000,
      revenueGrowth: 18,
      outstanding: 150000,
      outstandingCount: 3,
      overdue: 45000,
      overdueCount: 1,
      expenses: 85000,
      expensesCount: 12,
      net: 235000
    }
  })

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    // Clear sub-filters when switching tabs conceptually
    params.delete("status")
    params.delete("method")
    params.delete("category")
    router.replace(`/finance?${params.toString()}`)
  }

  const handleKPIFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", "invoices")
    params.set("status", status)
    router.replace(`/finance?${params.toString()}`)
  }

  const tabs = [
    { id: "invoices", label: "Invoices" },
    { id: "payments", label: "Payments" },
    { id: "expenses", label: "Expenses" },
  ]

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      
      {/* Header Area */}
      <div className="px-8 pt-8 pb-4 shrink-0 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground mt-1">Manage billing, collect payments, and track studio expenses natively.</p>
        </div>

        <FinanceSummaryBar summary={summary} onFilter={handleKPIFilter} />

        <div className="flex sm:space-x-4 overflow-x-auto border-b border-border/40 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`pb-3 pt-1 px-4 text-xs font-mono tracking-widest uppercase transition-colors border-b-2
                ${currentTab === tab.id 
                  ? "border-primary text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Renders specific lists based on active tab below */}
      <div className="flex-1 overflow-auto bg-muted/5 custom-scrollbar relative px-8 py-6">
        {children}
      </div>

    </div>
  )
}
