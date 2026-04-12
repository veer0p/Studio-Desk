"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutGrid, List as ListIcon, Plus, Search, Filter } from "lucide-react"
import { NewBookingDialog } from "@/components/bookings/shared/NewBookingDialog"
import { ROUTES } from "@/lib/constants/routes"
import BookingCountBadge from "@/components/bookings/shared/BookingCountBadge"

export default function BookingsShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentView = searchParams.get("view") || "kanban"
  const searchQuery = searchParams.get("search") || ""
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  const setView = (view: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", view)
    router.push(`${ROUTES.BOOKINGS}?${params.toString()}`, { scroll: false })
  }

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (val) {
        params.set("search", val)
      } else {
        params.delete("search")
      }
      router.replace(`/bookings?${params.toString()}`, { scroll: false })
    }, 300)
  }, [router, searchParams])

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Toolbar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 p-3 sm:p-4 shrink-0 flex flex-col gap-3">

        {/* Top Row: Title & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">Bookings</h1>
            <BookingCountBadge />
          </div>

          <NewBookingDialog>
            <Button size="sm" className="h-9 shrink-0">
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">New Booking</span>
              <span className="sm:hidden">New</span>
            </Button>
          </NewBookingDialog>
        </div>

        {/* Bottom Row / Main Toolbar: Search, Filters, View Toggles */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search client, venue..."
              className="pl-9 h-9"
              defaultValue={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 shrink-0">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("stage", "Inquiry")
                router.push(`${ROUTES.BOOKINGS}?${params.toString()}`, { scroll: false })
              }}>Inquiry</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("stage", "Proposal Sent")
                router.push(`${ROUTES.BOOKINGS}?${params.toString()}`, { scroll: false })
              }}>Proposal Sent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("stage", "Confirmed")
                router.push(`${ROUTES.BOOKINGS}?${params.toString()}`, { scroll: false })
              }}>Confirmed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("stage", "In Progress")
                router.push(`${ROUTES.BOOKINGS}?${params.toString()}`, { scroll: false })
              }}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("stage", "Delivered")
                router.push(`${ROUTES.BOOKINGS}?${params.toString()}`, { scroll: false })
              }}>Delivered</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center bg-muted/50 p-0.5 rounded-lg border border-border/40 shrink-0 ml-auto sm:ml-0">
            <button
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded-md transition-colors ${currentView === "kanban" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-md transition-colors ${currentView === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto relative">
        {children}
      </div>
    </div>
  )
}
