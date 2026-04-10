"use client"

import Link from "next/link"
import Image from "next/image"
import { usePortalAuth } from "@/lib/portal-auth"
import { fetchClientGalleries, ClientPortalGallery } from "@/lib/api"
import { ArrowRight, Lock, Image as ImageIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from "swr"

export default function PortalGalleriesClient({ studioSlug }: { studioSlug: string }) {
  const { user } = usePortalAuth()
  const { data: galleries, isLoading, error } = useSWR(
    user?.token ? `/api/v1/portal/${user.token}/gallery` : null,
    fetchClientGalleries
  )

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Media Galleries</h1>
          <p className="text-sm text-muted-foreground mt-1">Access, download, and select your favorite event memories securely.</p>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-card border border-border/40 rounded-xl">
          <p className="font-medium text-foreground mb-1">Failed to load galleries</p>
          <p className="text-sm">{error.message || "Please try again later."}</p>
        </div>
      </div>
    )
  }

  if (!galleries?.length) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Media Galleries</h1>
          <p className="text-sm text-muted-foreground mt-1">Access, download, and select your favorite event memories securely.</p>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-card border border-border/40 rounded-xl">
          <ImageIcon className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-medium text-foreground mb-1">No galleries yet</p>
          <p className="text-sm">Your photo galleries will appear here once published by the studio.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Media Galleries</h1>
        <p className="text-sm text-muted-foreground mt-1">Access, download, and select your favorite event memories securely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {galleries.map((gallery: ClientPortalGallery) => {
          const isPublished = gallery.status?.toLowerCase() === "published"
          return isPublished ? (
            <Link key={gallery.id} href={`/portal/${studioSlug}/gallery/${gallery.id}`} className="block group">
              <div className="bg-card border border-border/60 hover:border-[hsl(var(--portal-primary))/40] rounded-xl overflow-hidden shadow-sm transition-all h-full">
                <div className="w-full h-48 bg-muted relative overflow-hidden">
                  {gallery.cover_url && (
                    <Image
                      src={gallery.cover_url}
                      alt={gallery.name}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-2 py-0.5 rounded shadow">Unlocked</span>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-[hsl(var(--portal-primary))] tracking-tight">{gallery.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{gallery.photo_count} Photos</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground group-hover:bg-[hsl(var(--portal-primary))] group-hover:text-white transition-colors shrink-0">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div key={gallery.id} className="bg-muted/10 border border-border/40 rounded-xl overflow-hidden shadow-sm h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-muted-foreground tracking-tight">{gallery.name}</h3>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-2 bg-muted px-3 py-1 rounded-full">Processing</p>
            </div>
          )
        })}
      </div>

    </div>
  )
}
