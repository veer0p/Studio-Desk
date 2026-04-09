"use client"

import { useState } from "react"
import useSWR from "swr"
import { FaceCluster, tagFace } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Tag, User } from "lucide-react"

interface FaceClusterPanelProps {
  galleryId: string
  clusters: FaceCluster[]
}

export function FaceClusterPanel({ galleryId, clusters: initialClusters }: FaceClusterPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")

  const clusters = initialClusters ?? []

  const handleTagSubmit = async (clusterId: string) => {
    if (!editingValue.trim()) return
    try {
      await tagFace(galleryId, clusterId, { label: editingValue.trim() })
      setEditingId(null)
      setEditingValue("")
    } catch (err) {
      console.error("Failed to tag face:", err)
    }
  }

  if (!clusters?.length) {
    return (
      <div className="bg-card border-t border-border/60 p-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <User className="w-3.5 h-3.5" /> Face Clusters
        </h4>
        <p className="text-xs text-muted-foreground text-center py-4">
          No face clusters detected. Upload photos to enable face detection.
        </p>
      </div>
    )
  }

  const filtered = clusters.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `person ${c.id}`.includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-card border-t border-border/60 p-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <User className="w-3.5 h-3.5" /> Face Clusters ({clusters.length})
      </h4>

      <div className="relative mb-3">
        <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clusters..."
          className="pl-8 h-8 text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
        {filtered.map((cluster) => {
          const isEditing = editingId === cluster.id
          const label = cluster.name ?? `Person ${cluster.id.slice(-4)}`

          return (
            <div key={cluster.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/20 border border-border/40">
              <div className="w-8 h-8 rounded-sm overflow-hidden border border-border/60 bg-muted shrink-0">
                {cluster.representativeUrl ? (
                  <img src={cluster.representativeUrl} alt={label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleTagSubmit(cluster.id)
                    }}
                  >
                    <Input
                      className="h-7 text-xs"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setEditingId(null)
                      }}
                      placeholder="Enter name..."
                      autoFocus
                    />
                  </form>
                ) : (
                  <>
                    <span className="text-xs font-medium truncate cursor-pointer hover:text-primary">
                      {label}
                    </span>
                    <span className="text-[9px] text-muted-foreground ml-1">{cluster.photoCount} photos</span>
                  </>
                )}
              </div>
              {!isEditing && (
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => {
                  setEditingId(cluster.id)
                  setEditingValue(cluster.name ?? "")
                }}>
                  <Tag className="w-3 h-3 text-muted-foreground" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
