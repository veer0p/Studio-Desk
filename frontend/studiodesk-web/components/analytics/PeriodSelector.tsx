"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays } from "lucide-react"

export function PeriodSelector() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const currentPeriod = searchParams.get("period") || "this_month"

  const setPeriod = (p: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", p)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Select value={currentPeriod} onValueChange={setPeriod}>
      <SelectTrigger className="w-[180px] sm:w-[240px] h-9 bg-background font-medium">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="this_month">This Month</SelectItem>
        <SelectItem value="last_month">Last Month</SelectItem>
        <SelectItem value="this_quarter">This Quarter</SelectItem>
        <SelectItem value="last_quarter">Last Quarter</SelectItem>
        <SelectItem value="this_fy">This Financial Year (FY 26)</SelectItem>
        <SelectItem value="last_fy">Last Financial Year (FY 25)</SelectItem>
        <SelectItem value="last_12">Last 12 Months</SelectItem>
        <SelectItem value="custom" disabled>Custom Range (Pro)</SelectItem>
      </SelectContent>
    </Select>
  )
}
