"use client"

import CommandAnalytics from "@/components/analytics/CommandAnalytics"

export default function AnalyticsPage() {
  return (
    <div className="flex-1 w-full h-full bg-[#0f0f0f] text-[#fafaf9] overflow-auto flex flex-col font-sans">
      <CommandAnalytics />
    </div>
  )
}