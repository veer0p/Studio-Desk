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
import { NewClientDialog } from "@/components/clients/NewClientDialog"
import { ROUTES } from "@/lib/constants/routes"

export default function ClientsShell({ children, totalCount }: { children: React.ReactNode; totalCount?: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentView = searchParams.get("view") || "list"
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
    router.push(`${ROUTES.CLIENTS}?${params.toString()}`, { scroll: false })
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
      router.replace(`${ROUTES.CLIENTS}?${params.toString()}`, { scroll: false })
    }, 300)
  }, [router, searchParams])

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header Toolbar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 p-4 shrink-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Clients</h1>
          {totalCount !== undefined && (
            <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded-full text-muted-foreground hidden sm:inline-block">
              {totalCount} clients
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, phone, city..."
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push(`${ROUTES.CLIENTS}?tag=Wedding`, { scroll: false })}>Wedding</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`${ROUTES.CLIENTS}?tag=Corporate`, { scroll: false })}>Corporate</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`${ROUTES.CLIENTS}?tag=Pre-Wedding`, { scroll: false })}>Pre-Wedding</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center bg-muted/50 p-0.5 rounded-lg border border-border/40 shrink-0">
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-md transition-colors ${currentView === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-md transition-colors ${currentView === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <NewClientDialog>
            <Button size="sm" className="h-9 shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              New Client
            </Button>
          </NewClientDialog>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto relative">
        {children}
      </div>
    </div>
  )
}
