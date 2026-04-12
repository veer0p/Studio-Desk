'use client'

import { GalleryPhoto } from '@/lib/gallery-api'

interface ClientPhotoGridProps {
  photos: GalleryPhoto[]
  selectedPhotos: Set<string>
  toggleSelection: (photoId: string) => void
  onPhotoClick?: (index: number) => void
  allowSelection?: boolean
  allowDownload?: boolean
  isLoading?: boolean
}

export function ClientPhotoGrid({
  photos,
  selectedPhotos,
  toggleSelection,
  onPhotoClick,
  allowSelection = false,
  allowDownload = true,
  isLoading = false,
}: ClientPhotoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="aspect-square bg-zinc-800 rounded-sm animate-pulse" />
        ))}
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <p className="text-lg">No photos found</p>
        <p className="text-sm mt-1">Photos may still be processing.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
      {photos.map((photo, index) => {
        const isSelected = selectedPhotos.has(photo.id)
        return (
          <div
            key={photo.id}
            className="relative group aspect-square bg-zinc-800 rounded-sm overflow-hidden cursor-pointer"
            onClick={() => {
              if (allowSelection) {
                toggleSelection(photo.id)
              } else if (onPhotoClick) {
                onPhotoClick(index)
              }
            }}
          >
            {/* Thumbnail */}
            <img
              src={photo.thumb_url}
              alt={photo.filename}
              loading="lazy"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />

            {/* Video indicator */}
            {photo.is_video && (
              <div className="absolute top-2 left-2 bg-black/60 rounded-full p-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            )}

            {/* Selection checkbox */}
            {allowSelection && (
              <div className="absolute top-2 right-2">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-black/40 border-white/60 group-hover:border-white'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            )}

            {/* Download button */}
            {allowDownload && !allowSelection && (
              <a
                href={photo.download_url}
                download
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-2 right-2 bg-black/60 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}
