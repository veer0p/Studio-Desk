import { Suspense } from "react"
import { GalleryDetail } from "@/components/gallery/studio/GalleryDetail"

export const metadata = {
  title: "Gallery Management | StudioDesk",
  description: "Internal delivery hub mapping selection matrices.",
}

// Generate Static Params or SSR logic placeholder
export default async function GalleryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading gallery details...</div>}>
        <GalleryDetail galleryId={resolvedParams.id} />
      </Suspense>
    </div>
  )
}