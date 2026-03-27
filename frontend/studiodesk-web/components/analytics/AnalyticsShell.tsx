"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { PeriodSelector } from "./PeriodSelector"
import { Button } from "@/components/ui/button"
import { Download, IndianRupee, Calendar, Users, Camera, Image as ImageIcon } from "lucide-react"

export function AnalyticsShell() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const currentTab = searchParams.get("tab") || "revenue"

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const tabs = [
    { id: "revenue", label: "Revenue", icon: IndianRupee },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "clients", label: "Clients", icon: Users },
    { id: "team", label: "Team", icon: Camera },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
  ]

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      
      {/* Header */}
      <div className="shrink-0 border-b border-border/40 bg-card px-6 py-4 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium px-2 py-0.5 bg-muted/50 rounded-md inline-block">FY 2025-26 India Basis</p>
        </div>
        
        <div className="flex items-center gap-3">
          <PeriodSelector />
          <Button variant="ghost" className="hidden lg:flex text-primary hover:text-primary"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="shrink-0 px-6 md:px-8 border-b border-border/40 bg-card overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`group flex items-center gap-2 py-3.5 border-b-[3px] transition-colors whitespace-nowrap text-sm font-semibold tracking-tight
                ${currentTab === t.id 
                  ? 'border-primary text-foreground' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
            >
              <t.icon className={`w-4 h-4 ${currentTab === t.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground/80'}`} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Engine Mounting Bounds */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-muted/5 p-4 md:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto pb-24">
          
          {currentTab === "revenue" && <div className="p-12 text-center text-muted-foreground">RevenueAnalytics Module mounting...</div>}
          {currentTab === "bookings" && <div className="p-12 text-center text-muted-foreground">BookingAnalytics Module mounting...</div>}
          {currentTab === "clients" && <div className="p-12 text-center text-muted-foreground">ClientAnalytics Module mounting...</div>}
          {currentTab === "team" && <div className="p-12 text-center text-muted-foreground">TeamAnalytics Module mounting...</div>}
          {currentTab === "gallery" && <div className="p-12 text-center text-muted-foreground">GalleryAnalytics Module mounting...</div>}

        </div>
      </div>
    </div>
  )
}
