'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { GalleryPhoto } from '@/lib/gallery-api'

interface PhotoLightboxProps {
  photos: GalleryPhoto[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
  allowDownload?: boolean
}

export function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
  allowDownload = true,
}: PhotoLightboxProps) {
  const [isLoading, setIsLoading] = useState(true)

  const handlePrev = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1
    onNavigate(newIndex)
    setIsLoading(true)
  }, [currentIndex, photos.length, onNavigate])

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0
    onNavigate(newIndex)
    setIsLoading(true)
  }, [currentIndex, photos.length, onNavigate])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, handlePrev, handleNext])

  const photo = photos[currentIndex]
  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-colors"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 rounded-full px-3 py-1 text-xs text-white">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Photo */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        {photo.is_video ? (
          <video
            src={photo.download_url}
            controls
            autoPlay
            className="max-w-[90vw] max-h-[85vh] rounded-sm"
            onLoadedData={() => setIsLoading(false)}
          />
        ) : (
          <img
            src={photo.download_url}
            alt={photo.filename}
            className={`max-w-[90vw] max-h-[85vh] object-contain rounded-sm transition-opacity ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={(e) => { e.stopPropagation(); handlePrev() }}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-3 transition-colors"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleNext() }}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-3 transition-colors"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Photo info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-4 py-2 text-xs text-white/80 whitespace-nowrap">
        {photo.filename}
        {photo.width > 0 && photo.height > 0 && (
          <span className="ml-2 text-white/50">{photo.width}×{photo.height}</span>
        )}
      </div>

      {/* Download button */}
      {allowDownload && (
        <a
          href={photo.download_url}
          download
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 rounded-full p-2.5 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      )}
    </div>
  )
}
