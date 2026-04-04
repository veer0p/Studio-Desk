import { Suspense } from "react"
import { GalleryList } from "@/components/gallery/studio/GalleryList"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Galleries | StudioDesk",
  description: "Manage client photo and video deliverables.",
}

export default function GalleryPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse font-mono tracking-widest uppercase text-[10px]">Loading Asset Clusters...</div>}>
        <GalleryList />
      </Suspense>
    </div>
  )
}