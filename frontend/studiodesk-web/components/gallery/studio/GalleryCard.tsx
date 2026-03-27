"use client"

import { useRouter } from "next/navigation"
import { Lock, Unlock, Image as ImageIcon, Video, Folder, MoreHorizontal, Link as LinkIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const statusConfig: Record<string, { label: string, color: string }> = {
  "Not Started": { label: "Not Started", color: "bg-muted text-muted-foreground border-border/40" },
  "Uploading": { label: "Uploading", color: "bg-muted text-foreground border-primary/20" },
  "Selection Pending": { label: "Selection Pending", color: "bg-muted text-foreground border-primary/40" },
  "Ready": { label: "Ready", color: "bg-muted text-foreground border-primary/60" },
  "Delivered": { label: "Delivered", color: "bg-muted text-foreground border-border/60" },
  "Archived": { label: "Archived", color: "bg-muted text-muted-foreground border-border/40" },
}

export function GalleryCard({ gallery }: { gallery: any }) {
  const router = useRouter()
  const status = statusConfig[gallery.status] || statusConfig["Not Started"]

  const isSelected = gallery.status === "Selection Pending"
  const isDelivered = gallery.status === "Delivered"

  return (
    <div 
      onClick={() => router.push(`/gallery/${gallery.id}`)}
      className="group relative flex flex-col bg-card rounded-md border border-border/60 overflow-hidden shadow-sm hover:border-primary/40 transition-all cursor-pointer"
    >
      {/* Cover Image */}
      <div className="relative h-48 w-full bg-muted/30 overflow-hidden">
        {gallery.coverUrl ? (
          <img src={gallery.coverUrl} alt={gallery.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Folder className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-black/60 backdrop-blur-md text-white border border-white/10 text-[9px] font-mono font-bold tracking-widest uppercase">
          <span className={`w-1.5 h-1.5 rounded-sm ${gallery.eventType === 'Wedding' ? 'bg-amber-400' : 'bg-blue-400'}`}></span>
          {gallery.eventType}
        </div>
        
        <div className="absolute top-3 right-3">
          <div className={`px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold tracking-widest uppercase border backdrop-blur-md ${status.color}`}>
            {status.label}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground truncate">{gallery.clientName}</h3>
        <p className="text-sm text-muted-foreground truncate">{gallery.name}</p>
        <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-1 mb-4">{gallery.shootDate}</p>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-[11px] font-mono tracking-widest uppercase text-muted-foreground border-t border-border/40 pt-4 mb-4">
          <div className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> {gallery.photoCount}</div>
          <div className="flex items-center gap-1"><Video className="w-3.5 h-3.5" /> {gallery.videoCount}</div>
          <div className="ml-auto">{gallery.sizeGb} GB</div>
        </div>

        {/* Progress Logic */}
        <div className="mt-auto space-y-1.5">
          {isSelected ? (
            <>
              <div className="flex justify-between text-[9px] font-mono font-bold text-foreground uppercase tracking-widest">
                <span>Client selected {gallery.selectedCount}/{gallery.selectionQuota}</span>
                <span>{Math.round((gallery.selectedCount / gallery.selectionQuota) * 100)}%</span>
              </div>
              <div className="h-1 w-full bg-muted border border-border/40 rounded-sm overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min((gallery.selectedCount / gallery.selectionQuota) * 100, 100)}%` }}></div>
              </div>
            </>
          ) : isDelivered ? (
            <>
              <div className="flex justify-between text-[9px] font-mono font-bold text-foreground uppercase tracking-widest">
                <span>Fully Delivered</span>
              </div>
              <div className="h-1 w-full bg-muted border border-border/40 rounded-sm overflow-hidden">
                <div className="h-full bg-primary w-full"></div>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-[9px] font-mono font-bold text-foreground uppercase tracking-widest">
                <span>{gallery.uploadProgress}% Uploaded</span>
              </div>
              <div className="h-1 w-full bg-muted border border-border/40 rounded-sm overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${gallery.uploadProgress}%` }}></div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-muted/30 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2" title={gallery.accessType === "PIN Protected" ? "PIN Protected" : "Public Link"}>
          {gallery.accessType === "PIN Protected" ? <Lock className="w-3 h-3 text-muted-foreground" /> : <Unlock className="w-3 h-3 text-muted-foreground" />}
          {gallery.expiryDate && <span className="text-[10px] font-mono tracking-widest uppercase">Exp {gallery.expiryDate}</span>}
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-foreground group-hover:underline">View</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 hover:bg-muted/50">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => window.open(`/gallery/p/client-${gallery.slug}`, "_blank")}>
                <LinkIcon className="w-4 h-4 mr-2" /> View Public Link ↗
              </DropdownMenuItem>
              <DropdownMenuItem>Copy Gallery PIN</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Archive Gallery</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

    </div>
  )
}
