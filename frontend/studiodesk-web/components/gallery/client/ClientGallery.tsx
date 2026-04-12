'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import useSWRInfinite from 'swr/infinite'
import { ClientPhotoGrid } from './ClientPhotoGrid'
import { SelectionPanel } from './SelectionPanel'
import { PhotoLightbox } from './PhotoLightbox'
import { fetchGalleryPhotos, GalleryPhoto, GalleryMetadata } from '@/lib/gallery-api'

interface ClientGalleryProps {
  slug: string
  metadata: GalleryMetadata
  allowDownload?: boolean
  allowSelection?: boolean
  selectionQuota?: number
}

export function ClientGallery({
  slug,
  metadata,
  allowDownload = true,
  allowSelection = false,
  selectionQuota = 0,
}: ClientGalleryProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [activeFilter, setActiveFilter] = useState<'all' | 'photos' | 'videos'>('all')
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Infinite scroll for photos
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.photos.length) return null
    return [slug, pageIndex]
  }

  const fetcher = ([_slug, page]: [string, number]) => fetchGalleryPhotos(_slug, page)

  const { data, error, isLoading, size, setSize } = useSWRInfinite(
    getKey,
    fetcher as any,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  // Flatten all pages
  const allPhotos = data?.flatMap((p) => p.photos) || []

  // Filter
  const filteredPhotos = allPhotos.filter((photo) => {
    if (activeFilter === 'videos' && !photo.is_video) return false
    if (activeFilter === 'photos' && photo.is_video) return false
    return true
  })

  const toggleSelection = useCallback((photoId: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev)
      if (next.has(photoId)) {
        next.delete(photoId)
      } else if (selectionQuota === 0 || next.size < selectionQuota) {
        next.add(photoId)
      }
      return next
    })
  }, [selectionQuota])

  const openLightbox = useCallback((globalIndex: number) => {
    setLightboxIndex(globalIndex)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const navigateLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  // Load more on scroll
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ref = loadMoreRef.current
    if (!ref) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setSize((s) => s + 1)
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(ref)
    return () => observer.disconnect()
  }, [isLoading, setSize])

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">{metadata.name}</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {metadata.total_photos} photos · {metadata.studio.name}
        </p>

        {/* Face cluster filter */}
        {metadata.face_clusters.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={() => setSelectedCluster(null)}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                selectedCluster === null
                  ? 'bg-zinc-700 text-zinc-100 border-zinc-600'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }`}
            >
              All
            </button>
            {metadata.face_clusters.map((cluster) => (
              <button
                key={cluster.label}
                onClick={() => setSelectedCluster(cluster.label)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  selectedCluster === cluster.label
                    ? 'bg-zinc-700 text-zinc-100 border-zinc-600'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {cluster.label}
              </button>
            ))}
          </div>
        )}

        {/* Type filter */}
        <div className="flex gap-2 mt-3">
          {(['all', 'photos', 'videos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
                activeFilter === f
                  ? 'bg-zinc-700 text-zinc-100 border-zinc-600'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Photo grid */}
      {error ? (
        <div className="text-center py-12 text-zinc-500">
          Failed to load photos.
        </div>
      ) : (
        <>
          <ClientPhotoGrid
            photos={filteredPhotos}
            selectedPhotos={selectedPhotos}
            toggleSelection={toggleSelection}
            onPhotoClick={(index) => {
              // Find the global index in allPhotos
              const globalIndex = allPhotos.findIndex((p) => p.id === filteredPhotos[index]?.id)
              if (globalIndex >= 0) openLightbox(globalIndex)
            }}
            allowSelection={allowSelection}
            allowDownload={allowDownload}
            isLoading={isLoading && allPhotos.length === 0}
          />

          {/* Load more sentinel */}
          <div ref={loadMoreRef} className="h-4" />

          {size > 0 && data && data[data.length - 1]?.photos.length > 0 && (
            <div className="flex justify-center py-6">
              <button
                onClick={() => setSize((s) => s + 1)}
                className="px-4 py-2 text-sm bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700"
              >
                Load more photos
              </button>
            </div>
          )}
        </>
      )}

      {/* Selection panel */}
      {allowSelection && selectedPhotos.size > 0 && (
        <SelectionPanel
          selectedCount={selectedPhotos.size}
          quota={selectionQuota}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={allPhotos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
          allowDownload={allowDownload}
        />
      )}
    </div>
  )
}
