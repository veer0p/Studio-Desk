"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ExternalLink, Copy, Share2, MoreHorizontal, Download, ArrowRight, CheckCircle2 } from "lucide-react"
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
import useSWR from "swr"
import { fetchGalleryDetail, GalleryDetail as GalleryDetailType } from "@/lib/api"

const statusConfig: Record<string, { label: string, color: string }> = {
  "Selection Pending": { label: "Selection Pending", color: "bg-muted text-foreground border-primary/40" },
  "Ready": { label: "Ready", color: "bg-muted text-foreground border-primary/60" },
  "Delivered": { label: "Delivered", color: "bg-muted text-foreground border-border/60" },
  "Uploading": { label: "Uploading", color: "bg-muted text-foreground border-border/60" },
}

export function GalleryDetail({ galleryId }: { galleryId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "photos"

  const { data: gallery, isLoading, error } = useSWR(`/api/v1/galleries/${galleryId}`, fetchGalleryDetail)

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Failed to load gallery</p>
        <p className="text-sm">{error.message || "Please try again later."}</p>
        <Button onClick={() => router.push("/gallery")} className="mt-4">Back to Galleries</Button>
      </div>
    )
  }

  if (isLoading || !gallery) return <div className="p-8 animate-pulse text-muted-foreground font-mono tracking-widest uppercase text-xs">Loading Gallery Details...</div>

  const setTab = (tab: string) => {
    router.replace(`/gallery/${galleryId}?tab=${tab}`)
  }

  const steps = [
    { id: "upload", label: "Upload" },
    { id: "review", label: "Review" },
    { id: "selection", label: "Selection" },
    { id: "export", label: "Export" },
    { id: "delivered", label: "Delivered" },
  ]

  const statusToStepIndex: Record<string, number> = {
    "Uploading": 0,
    "Uploaded": 1,
    "Selection Pending": 2,
    "Ready": 3,
    "Delivered": 4,
  }
  const currentStepIndex = statusToStepIndex[gallery.status] ?? 0

  const handleShare = () => {
    const url = `${window.location.origin}/gallery/p/${gallery.slug}`
    navigator.clipboard.writeText(url)
  }

  const cfg = statusConfig[gallery.status] || statusConfig["Selection Pending"]

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">

      {/* Detail Header */}
      <div className="px-8 pt-8 pb-6 shrink-0 border-b border-border/40">
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground font-medium">
          <Link href="/gallery" className="hover:text-foreground transition-colors">
            Galleries
          </Link>
          <ArrowRight className="w-3.5 h-3.5" />
          <span className="text-foreground">{gallery.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{gallery.clientName}</h1>
              <span className={`px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold tracking-widest uppercase border ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
            <p className="text-muted-foreground mt-1.5 text-[10px] font-mono tracking-widest uppercase">{gallery.name} • {gallery.shootDate} • {gallery.eventType}</p>
            <a
              href={`/gallery/p/${gallery.slug}`}
              target="_blank"
              className="inline-flex items-center text-primary text-sm font-medium mt-2 hover:underline"
            >
              /gallery/p/{gallery.slug} <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} className="bg-background">
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
            <Button variant="outline" size="sm" className="bg-background">
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
                    <div className={`w-3 h-3 flex items-center justify-center rounded-sm border-2 transition-colors duration-300 ${
                      isCompleted ? "bg-primary border-primary text-primary-foreground" :
                      isActive ? "bg-background border-primary" :
                      "bg-background border-muted text-transparent"
                    }`}>
                      {isCompleted && <CheckCircle2 className="w-2 h-2" strokeWidth={4} />}
                      {isActive && <div className="w-1 h-1 rounded-sm bg-primary" />}
                    </div>
                    <span className={`text-[9px] font-mono tracking-wide uppercase font-bold text-center ${
                      isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
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
              className={`pb-3 pt-1 px-4 text-xs font-mono tracking-widest uppercase transition-colors border-b-2
                ${currentTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Engine */}
      <div className="flex-1 overflow-hidden relative">
        {currentTab === "photos" && (
          <div className="w-full h-full flex items-start gap-px bg-muted/5 relative">
            <div className="flex-1 h-full overflow-y-auto custom-scrollbar flex flex-col relative">
              <div className="p-8 pb-32">
                {gallery.photos && gallery.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {gallery.photos.map((photo) => (
                      <div key={photo.id} className="aspect-square rounded-md overflow-hidden border border-border/40 bg-muted/20">
                        <img src={photo.url} alt={photo.id} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed border-border/60 rounded-md flex items-center justify-center text-muted-foreground flex-col gap-2">
                    <p className="font-mono text-[10px] tracking-widest uppercase font-bold">No photos uploaded yet</p>
                    <p className="text-[9px] font-mono tracking-widest uppercase">Use the upload panel to add photos</p>
                  </div>
                )}
              </div>
              <div className="mt-auto">
                <FaceClusterPanel galleryId={galleryId} clusters={gallery.faceClusters || []} />
              </div>
            </div>

            <div className="hidden lg:block w-80 shrink-0 h-full relative z-30">
              <UploadPanel />
            </div>
          </div>
        )}

        {currentTab === "videos" && <div className="p-8 text-muted-foreground">Video integration — upload and manage video deliverables here.</div>}

        {currentTab === "selection" && <div className="p-8 text-muted-foreground">Client Selection approval — let clients pick their favorites.</div>}

        {currentTab === "settings" && <div className="h-full overflow-y-auto custom-scrollbar bg-muted/5"><DeliverySettings /></div>}
      </div>

    </div>
  )
}
