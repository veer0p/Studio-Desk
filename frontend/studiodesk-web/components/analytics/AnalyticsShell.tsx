"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { PeriodSelector } from "./PeriodSelector"
import { RevenueAnalytics } from "./tabs/RevenueAnalytics"
import { BookingAnalytics } from "./tabs/BookingAnalytics"
import { ClientAnalytics } from "./tabs/ClientAnalytics"
import { TeamAnalytics } from "./tabs/TeamAnalytics"
import { GalleryAnalytics } from "./tabs/GalleryAnalytics"
import { Button } from "@/components/ui/button"
import { Download, IndianRupee, Calendar, Users, Camera, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { fetchAnalyticsRevenue, fetchAnalyticsBookings, fetchAnalyticsPerformance } from "@/lib/api"

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function AnalyticsShell() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [exporting, setExporting] = useState(false)

  const currentTab = searchParams.get("tab") || "revenue"
  const currentPeriod = searchParams.get("period") || "this_month"

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      let csvContent = ""
      const periodLabel = currentPeriod.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      const timestamp = new Date().toISOString().split("T")[0]
      const filename = `analytics_${currentTab}_${timestamp}.csv`

      switch (currentTab) {
        case "revenue": {
          const data = await fetchAnalyticsRevenue(currentPeriod)
          csvContent = "Month,Collected Revenue,Pending Amount,Overdue Amount,Booking Count\n"
          if (data?.chart_data && Array.isArray(data.chart_data)) {
            data.chart_data.forEach((row) => {
              csvContent += `${escapeCSV(row.month)},${row.collected},${row.pending},${row.overdue},${row.booking_count}\n`
            })
          }
          if (data?.growth_pct !== undefined) {
            csvContent += `\nGrowth Percentage,${data.growth_pct}%\n`
          }
          break
        }
        case "bookings": {
          const data = await fetchAnalyticsBookings(currentPeriod)
          csvContent = "Metric,Value\n"
          csvContent += `Total Bookings,${data.total_bookings}\n`
          csvContent += `Confirmed Rate,${(data.confirmed_rate * 100).toFixed(1)}%\n`
          csvContent += `Cancellation Rate,${(data.cancellation_rate * 100).toFixed(1)}%\n`
          csvContent += `Avg Lead Time,${data.avg_lead_time} Days\n`
          if (data.chart_data && Array.isArray(data.chart_data)) {
            csvContent += "\nMonth,Inquiries,Confirmed,Cancelled,Conversion (%)\n"
            data.chart_data.forEach((row) => {
              csvContent += `${escapeCSV(row.month)},${row.inquiries},${row.confirmed},${row.cancelled},${row.conversion.toFixed(1)}\n`
            })
          }
          break
        }
        case "clients": {
          const data = await fetchAnalyticsPerformance(currentPeriod)
          csvContent = "Metric,Value\n"
          csvContent += `Total Active Clients,${data.total_clients}\n`
          csvContent += `New Acquisitions,${data.new_acquisitions}\n`
          csvContent += `Repeat Rate,${(data.repeat_rate * 100).toFixed(1)}%\n`
          csvContent += `Lifetime Value (LTV),₹${data.lifetime_value.toLocaleString("en-IN")}\n`
          break
        }
        case "team": {
          const data = await fetchAnalyticsPerformance(currentPeriod)
          csvContent = "Metric,Value\n"
          csvContent += `Total Covered Shoots,${data.team_covered_shoots}\n`
          csvContent += `Total Payouts,₹${data.total_payouts.toLocaleString("en-IN")}\n`
          csvContent += `Pending Payouts,₹${data.pending_payouts.toLocaleString("en-IN")}\n`
          csvContent += `Avg Per/Shoot Fee,₹${data.avg_per_shoot_fee.toLocaleString("en-IN")}\n`
          break
        }
        case "gallery": {
          const data = await fetchAnalyticsPerformance(currentPeriod)
          csvContent = "Metric,Value\n"
          csvContent += `Galleries Dispatched,${data.galleries_dispatched}\n`
          csvContent += `Avg Turnaround,${data.avg_turnaround_days} Days\n`
          csvContent += `Selection Hit Rate,${(data.selection_hit_rate * 100).toFixed(1)}%\n`
          csvContent += `Storage Used,${data.storage_used_gb} GB\n`
          break
        }
        default:
          toast.error("Unknown tab for export")
          return
      }

      downloadCSV(csvContent, filename)
      toast.success(`${filename} downloaded`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export CSV")
    } finally {
      setExporting(false)
    }
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
          <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-muted-foreground mt-1 px-2 py-1 bg-muted border border-border/60 rounded-sm inline-block">Performance Insights</p>
        </div>

        <div className="flex items-center gap-3">
          <PeriodSelector />
          <Button
            variant="ghost"
            className="hidden lg:flex text-primary hover:text-primary"
            onClick={handleExportCSV}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-2" /> {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="shrink-0 px-6 md:px-8 border-b border-border/40 bg-card overflow-x-auto custom-scrollbar [&::-webkit-scrollbar]:hidden scrollbar-width-none">
        <div className="flex items-center gap-4 md:gap-6 min-w-max">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`group flex items-center gap-2 py-3.5 border-b-2 transition-colors whitespace-nowrap text-[10px] font-mono font-bold tracking-widest uppercase
                ${currentTab === t.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
            >
              <t.icon className={`w-3.5 h-3.5 ${currentTab === t.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground/80'}`} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Engine */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-muted/5 p-4 md:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto pb-24">
          {currentTab === "revenue" && <RevenueAnalytics />}
          {currentTab === "bookings" && <BookingAnalytics />}
          {currentTab === "clients" && <ClientAnalytics />}
          {currentTab === "team" && <TeamAnalytics />}
          {currentTab === "gallery" && <GalleryAnalytics />}
        </div>
      </div>
    </div>
  )
}
