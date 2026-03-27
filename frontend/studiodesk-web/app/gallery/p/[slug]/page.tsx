"use client"

import { use } from "react"
import { GalleryAccessGate } from "@/components/gallery/client/GalleryAccessGate"
import { ClientGallery } from "@/components/gallery/client/ClientGallery"

export default function PublicGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  
  // Mapped isolated layout hiding sidebar explicitly
  // Since it's outside (dashboard), Next.js automatically drops the Admin shell
  
  return (
    <main className="w-full min-h-screen bg-background text-foreground flex flex-col font-sans">
      <GalleryAccessGate slug={resolvedParams.slug}>
        <ClientGallery slug={resolvedParams.slug} />
      </GalleryAccessGate>
    </main>
  )
}
