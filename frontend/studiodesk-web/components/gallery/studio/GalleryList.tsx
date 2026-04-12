"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus, Search, Filter, Folder } from "lucide-react"
import { ROUTES } from "@/lib/constants/routes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GalleryCard } from "./GalleryCard"
import { CreateGalleryDialog } from "./CreateGalleryDialog"
import useSWR from "swr"
import { fetchGalleriesList } from "@/lib/api"

export function GalleryList() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const router = useRouter()

  // SWR mock data tracking local assets mapping multiple views
  const { data: galleries = [], isLoading } = useSWR("/api/v1/galleries", fetchGalleriesList)

  // Apply search filtering
  const filteredGalleries = galleries.filter(gal =>
    gal.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gal.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gal.id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Apply status filter from URL
  const statusFilter = searchParams.get("status")
  const finalGalleries = statusFilter === "pending" 
    ? filteredGalleries.filter(gal => gal.status === "pending")
    : filteredGalleries

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      
      {/* Header Toolbar */}
      <div className="px-8 pt-8 pb-6 shrink-0 space-y-4 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Galleries</h1>
              <span className="px-2 py-0.5 rounded-sm bg-muted text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{finalGalleries.length} total</span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">Organize and share deliverables directly with clients.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search event, client..."
                className="pl-9 w-[200px] lg:w-[280px] bg-muted/40 border-border/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-background border-border/60">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete("status")
                  router.push(`${ROUTES.GALLERY}?${params.toString()}`, { scroll: false })
                }}>All Galleries</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set("status", "pending")
                  router.push(`${ROUTES.GALLERY}?${params.toString()}`, { scroll: false })
                }}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set("status", "delivered")
                  router.push(`${ROUTES.GALLERY}?${params.toString()}`, { scroll: false })
                }}>Delivered</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <CreateGalleryDialog>
              <Button className="shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                New Gallery
              </Button>
            </CreateGalleryDialog>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar bg-muted/5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-md" />
            ))
          ) : (
            finalGalleries.map(gal => (
              <GalleryCard key={gal.id} gallery={gal} />
            ))
          )}
        </div>

        {finalGalleries.length === 0 && (
          <div className="flex flex-col items-center justify-center p-24 text-center text-muted-foreground bg-white border border-border/40 rounded-xl mt-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Folder className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-medium text-foreground mb-1">No galleries mapped</p>
            <p className="text-sm">Create your first isolated gallery container delivering high-res files.</p>
          </div>
        )}
      </div>

    </div>
  )
}
