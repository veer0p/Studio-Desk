import { Suspense } from "react"
import { GalleryDetail } from "@/components/gallery/studio/GalleryDetail"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Gallery Management | StudioDesk",
  description: "Internal delivery hub mapping selection matrices.",
}

// Generate Static Params or SSR logic placeholder
export default async function GalleryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full p-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <GalleryDetail galleryId={resolvedParams.id} />
      </Suspense>
    </div>
  )
}