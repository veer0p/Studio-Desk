import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GalleryAccessGate } from '@/components/gallery/client/GalleryAccessGate'
import { ClientGallery } from '@/components/gallery/client/ClientGallery'
import { ShareButton } from '@/components/gallery/client/ShareButton'
import { SelfieLookup } from '@/components/gallery/client/SelfieLookup'
import { fetchPublicGallery } from '@/lib/gallery-api'

function GalleryHeader({
  slug,
  galleryData,
}: {
  slug: string
  galleryData: Awaited<ReturnType<typeof fetchPublicGallery>>
}) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">{galleryData.metadata.name}</h1>
          <p className="text-sm text-zinc-500">
            {galleryData.metadata.total_photos} photos · {galleryData.metadata.studio.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SelfieLookupDrawer slug={slug} />
          <ShareButton
            galleryName={galleryData.metadata.name}
            gallerySlug={slug}
            studioName={galleryData.metadata.studio.name}
          />
        </div>
      </div>
    </header>
  )
}

function SelfieLookupDrawer({ slug }: { slug: string }) {
  return (
    <details className="group">
      <summary className="list-none cursor-pointer">
        <div className="w-9 h-9 rounded-md border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        </div>
      </summary>
      <div className="absolute right-2 sm:right-4 top-16 w-80 max-w-[calc(100vw-1.5rem)] bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-4 z-50">
        <SelfieLookup slug={slug} onPhotosFound={() => {}} />
      </div>
    </details>
  )
}

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  try {
    const galleryData = await fetchPublicGallery(slug)
    return {
      title: `${galleryData.metadata.name} — ${galleryData.metadata.studio.name}`,
      description: `View ${galleryData.metadata.total_photos} photos from ${galleryData.metadata.studio.name}`,
      openGraph: {
        title: `${galleryData.metadata.name} — ${galleryData.metadata.studio.name}`,
        description: `View ${galleryData.metadata.total_photos} photos from ${galleryData.metadata.studio.name}`,
        type: 'website',
      },
    }
  } catch {
    return {
      title: 'Gallery',
      description: 'Photo gallery',
    }
  }
}

export default async function PublicGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  try {
    const galleryData = await fetchPublicGallery(slug)

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <GalleryHeader slug={slug} galleryData={galleryData} />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <GalleryAccessGate slug={slug}>
            <ClientGallery
              slug={slug}
              metadata={galleryData.metadata}
              allowDownload
              allowSelection={false}
            />
          </GalleryAccessGate>
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
          Powered by StudioDesk
        </footer>
      </div>
    )
  } catch (error: any) {
    if (error.message?.includes('not found') || error.message?.includes('expired') || error.message?.includes('forbidden')) {
      notFound()
    }
    throw error
  }
}
