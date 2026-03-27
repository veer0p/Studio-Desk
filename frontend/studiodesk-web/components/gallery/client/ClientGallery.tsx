"use client"

import { useState } from "react"
import { ClientPhotoGrid } from "./ClientPhotoGrid"
import { SelectionPanel } from "./SelectionPanel"
import { ClientVideoPlayer } from "./ClientVideoPlayer"
import { Image as ImageIcon, Video, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ClientGallery({ slug }: { slug: string }) {
  const [activeTab, setActiveTab] = useState<"photos"|"videos">("photos")
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())

  // Mock payload
  const gallery = {
    title: "Rohan & Priya — Wedding Highlights",
    date: "12 Oct 2025",
    studioName: "StudioDesk Defaults",
    selectionQuota: 100,
    allowDownload: true,
  }

  const toggleSelection = (id: string) => {
    const next = new Set(selectedPhotos)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedPhotos(next)
  }

  return (
    <div className="flex flex-col min-h-screen relative pb-24">
      
      {/* Client Header */}
      <div className="w-full bg-background border-b border-border/40 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono tracking-widest text-primary uppercase mb-1">{gallery.studioName}</p>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{gallery.title}</h1>
            <p className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground mt-1">{gallery.date}</p>
          </div>

          <div className="flex bg-muted/40 p-1 rounded-md border border-border/60">
            <button
              onClick={() => setActiveTab("photos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase transition-colors ${activeTab === 'photos' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Photos
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase transition-colors ${activeTab === 'videos' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Video className="w-3.5 h-3.5" /> Videos
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-6 lg:p-8">
        {activeTab === "photos" && (
          <ClientPhotoGrid 
            selectedPhotos={selectedPhotos} 
            toggleSelection={toggleSelection} 
            allowDownload={gallery.allowDownload}
          />
        )}
        
        {activeTab === "videos" && (
          <div className="py-8">
            <ClientVideoPlayer />
          </div>
        )}
      </div>

      {/* Persistent Selection Bar */}
      {activeTab === "photos" && (
        <SelectionPanel 
          selectedCount={selectedPhotos.size} 
          quota={gallery.selectionQuota} 
        />
      )}
      
      {/* Footer */}
      <div className="py-8 text-center text-[10px] font-mono tracking-widest uppercase text-muted-foreground border-t border-border/20 mt-auto">
        Powered by <span className="font-bold text-foreground">StudioDesk</span>
      </div>

    </div>
  )
}
