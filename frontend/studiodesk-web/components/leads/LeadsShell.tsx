"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ROUTES } from "@/lib/constants/routes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutGrid, List as ListIcon, Plus, Search, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NewLeadDialog } from "@/components/leads/NewLeadDialog"

export function LeadsShell({ 
  children, 
  count = 0, 
  searchQuery = "",
  onSearchChange,
  filterOpen,
  onFilterOpenChange,
  overdueCount = 0
}: { 
  children: React.ReactNode
  count?: number
  searchQuery?: string
  onSearchChange?: (val: string) => void
  filterOpen?: boolean
  onFilterOpenChange?: (open: boolean) => void
  overdueCount?: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentView = searchParams.get("view") || "kanban"

  const setView = (view: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", view)
    router.push(`${ROUTES.LEADS}?${params.toString()}`, { scroll: false })
  }

  const handleFilterChange = (stage: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (stage === "all") {
      params.delete("stage")
    } else {
      params.set("stage", stage)
    }
    router.push(`${ROUTES.LEADS}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="sticky top-0 z-30 border-b border-border/40 bg-background/95 backdrop-blur shrink-0 px-6 py-6 md:px-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight uppercase font-mono">Leads</h1>
          <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-muted-foreground mt-2">{count} active inquiries • {count > 0 ? `${overdueCount} overdue` : "All caught up"}</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-9 h-9 rounded-sm font-mono text-xs tracking-wider"
              defaultValue={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>

          <DropdownMenu open={filterOpen} onOpenChange={onFilterOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase border hover:bg-muted/50 hidden md:flex shrink-0">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleFilterChange("all")}>All Leads</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("Inquiry")}>Inquiry</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("Proposal Sent")}>Proposal Sent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("Negotiation")}>Negotiation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center bg-muted/20 p-0.5 rounded-sm border border-border/40 shrink-0">
            <button
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded-sm transition-colors ${currentView === "kanban" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-sm transition-colors ${currentView === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <NewLeadDialog>
            <Button size="sm" className="h-9 rounded-sm bg-foreground text-background hover:bg-foreground/90 text-[10px] font-mono font-bold tracking-widest uppercase px-6 shrink-0 shadow-sm">
              <Plus className="w-3.5 h-3.5 mr-2" />
              Quick Add
            </Button>
          </NewLeadDialog>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-muted/5">
        {children}
      </div>
    </div>
  )
}
