"use client"

import { Zap, ChevronRight, MoreHorizontal, Plus } from "lucide-react"
import useSWR from "swr"
import { fetchAddonsList, AddonRecord } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export function AddonList() {
  const { data, isLoading, error } = useSWR("/api/v1/addons", fetchAddonsList)
  const addons = data?.list || []

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Failed to load addons</p>
        <p className="text-sm">{error.message || "Please try again later."}</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {addons.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
          <Zap className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-medium text-foreground mb-1">No service addons yet</p>
          <p className="text-sm">Create addons to offer clients alongside their main package.</p>
        </div>
      ) : (
        addons.map((addon: AddonRecord) => (
          <div key={addon.id} className="group bg-background border border-border/60 p-5 rounded-md flex flex-col justify-between hover:border-foreground/20 transition-all cursor-pointer relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-sm bg-muted/30 border border-border/40 flex items-center justify-center">
                <Zap className="w-5 h-5 text-foreground/70" />
              </div>
              <button className="p-1.5 hover:bg-muted/50 rounded-sm text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded-sm border mb-2 inline-block">
                {addon.category}
              </span>
              <h4 className="text-sm font-bold tracking-tight mb-1">{addon.name}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{addon.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
              <span className="font-mono text-sm font-bold tracking-widest uppercase">Rs{addon.price.toLocaleString("en-IN")}</span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">Update <ChevronRight className="w-3 h-3" /></span>
            </div>

            <div className="absolute top-0 right-0 w-24 h-24 bg-foreground/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
          </div>
        ))
      )}

      <button className="border border-dashed border-border/60 rounded-md p-6 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all gap-2 group">
        <div className="w-10 h-10 rounded-sm bg-muted/10 border border-dashed border-border/40 flex items-center justify-center group-hover:bg-muted/20 transition-colors">
          <Plus className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Add New Service</span>
      </button>
    </div>
  )
}
