"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ExternalLink, Copy, Share2, MoreHorizontal, Download, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { UploadPanel } from "./UploadPanel"
import { FaceClusterPanel } from "./FaceClusterPanel"
import { DeliverySettings } from "./DeliverySettings"

const statusConfig: Record<string, { label: string, color: string }> = {
  "Selection Pending": { label: "Selection Pending", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  "Ready": { label: "Ready", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  "Delivered": { label: "Delivered", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
}

export function GalleryDetail({ galleryId }: { galleryId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "photos"

  const mockGallery = {
    id: galleryId,
    clientName: "Rohan & Priya",
    eventName: "Wedding Highlights",
    slug: "rohan-priya-wedding",
    eventType: "Wedding",
    shootDate: "12 Oct 2025",
    status: "Selection Pending",
  }

  const setTab = (tab: string) => {
    router.replace(`/gallery/${galleryId}?tab=${tab}`)
  }

  const steps = [
    { id: "upload", label: "Upload" },
    { id: "review", label: "Review" },
    { id: "selection", label: "Client Selection" },
    { id: "export", label: "Final Export" },
    { id: "delivered", label: "Delivered" },
  ]
  const currentStepIndex = 2 // "selection" is active mock

  const handleShare = () => {
    const url = `https://gallery.studiodesk.com/${mockGallery.slug}`
    navigator.clipboard.writeText(url)
    // Add toast notification later
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      
      {/* Detail Header */}
      <div className="px-8 pt-8 pb-6 shrink-0 border-b border-border/40">
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground font-medium">
          <span 
            onClick={() => router.push('/gallery')}
            className="hover:text-foreground cursor-pointer transition-colors"
          >
            Galleries
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
          <span className="text-foreground">{mockGallery.eventName}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{mockGallery.clientName}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${statusConfig[mockGallery.status].color}`}>
                {statusConfig[mockGallery.status].label}
              </span>
            </div>
            <p className="text-muted-foreground mt-1.5 font-medium">{mockGallery.eventName} • {mockGallery.shootDate} • {mockGallery.eventType}</p>
            <a 
              href={`/gallery/p/${mockGallery.slug}`} 
              target="_blank" 
              className="inline-flex items-center text-primary text-sm font-medium mt-2 hover:underline"
            >
              gallery.studiodesk.com/{mockGallery.slug} <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} className="bg-background">
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
            <Button size="sm" className="bg-[#25D366] hover:bg-[#25D366]/90 text-white border-0">
              <Share2 className="w-4 h-4 mr-2" /> WhatsApp
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 bg-background">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Details</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Archive Gallery</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600">Delete Permanently</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Step Bar */}
        <div className="mt-8 mb-4">
          <div className="relative">
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-[2px] bg-muted/50 rounded-full" />
            <div 
              className="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {steps.map((step, idx) => {
                const isActive = idx === currentStepIndex
                const isCompleted = idx < currentStepIndex
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 -ml-2 first:ml-0 -mr-2 last:mr-0 z-10 w-24">
                    <div className={`w-5 h-5 flex items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                      isCompleted ? 'bg-primary border-primary text-primary-foreground' :
                      isActive ? 'bg-background border-primary ring-2 ring-primary/20 ring-offset-1' :
                      'bg-background border-muted text-transparent'
                    }`}>
                      {isCompleted && <CheckCircle2 className="w-3 h-3" strokeWidth={3} />}
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold text-center ${
                      isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex sm:space-x-4 overflow-x-auto border-b border-border/40 mt-8 custom-scrollbar">
          {[
            { id: "photos", label: "Photos" },
            { id: "videos", label: "Videos" },
            { id: "selection", label: "Client Selection" },
            { id: "settings", label: "Delivery Settings" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`pb-3 pt-1 px-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2
                ${currentTab === tab.id 
                  ? "border-primary text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Engine mapping deep-linking params */}
      <div className="flex-1 overflow-hidden relative">
        {currentTab === "photos" && (
          <div className="w-full h-full flex items-start gap-px bg-muted/5 relative">
            <div className="flex-1 h-full overflow-y-auto custom-scrollbar flex flex-col relative">
              <div className="p-8 pb-32">
                <div className="w-full h-48 border-2 border-dashed border-border/60 rounded-xl flex items-center justify-center text-muted-foreground flex-col gap-2">
                  <p className="font-medium">Photos Grid offline</p>
                  <p className="text-xs">Drag files to the right panel instead</p>
                </div>
              </div>
              <div className="mt-auto sticky bottom-0 left-0 right-0 z-20">
                <FaceClusterPanel />
              </div>
            </div>
            
            <div className="w-80 shrink-0 h-full relative z-30">
              <UploadPanel />
            </div>
          </div>
        )}

        {currentTab === "videos" && <div className="p-8 text-muted-foreground">Video integration placeholder...</div>}
        
        {currentTab === "selection" && <div className="p-8 text-muted-foreground">Client Selection approval mapping placeholder...</div>}
        
        {currentTab === "settings" && <div className="h-full overflow-y-auto custom-scrollbar bg-muted/5"><DeliverySettings /></div>}
      </div>

    </div>
  )
}
