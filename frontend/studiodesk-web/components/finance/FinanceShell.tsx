"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { FinanceSummaryBar } from "./FinanceSummaryBar"

export function FinanceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "invoices"

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    // Clear sub-filters when switching tabs conceptually
    params.delete("status")
    params.delete("method")
    params.delete("category")
    router.replace(`/finance?${params.toString()}`, { scroll: false })
  }

  const handleKPIFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", "invoices")
    params.set("status", status)
    router.replace(`/finance?${params.toString()}`, { scroll: false })
  }

  const tabs = [
    { id: "invoices", label: "Invoices" },
    { id: "payments", label: "Payments" },
    { id: "expenses", label: "Expenses" },
  ]

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      
      {/* Header Area */}
      <div className="px-4 md:px-8 pt-4 md:pt-8 pb-4 shrink-0 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground mt-1">Manage billing, collect payments, and track studio expenses natively.</p>
        </div>

        <FinanceSummaryBar onFilter={handleKPIFilter} activeFilter={searchParams.get("status") || undefined} />

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
      <div className="flex-1 overflow-auto bg-muted/5 custom-scrollbar relative px-4 md:px-8 py-4 md:py-6">
        {children}
      </div>

    </div>
  )
}
