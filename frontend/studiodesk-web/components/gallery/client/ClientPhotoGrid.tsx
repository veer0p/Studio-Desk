"use client"

import { useState } from "react"
import { Heart, Download, X, ChevronLeft, ChevronRight } from "lucide-react"

// Pure CSS Masonry configuration mapping independent columns securely isolated from external packages.
const mockPhotos = Array.from({ length: 24 }).map((_, i) => ({
  id: `p-${i}`,
  url: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?auto=format&fit=crop&w=600&q=80`,
  // randomize height simulation
  aspectRatio: i % 3 === 0 ? "aspect-square" : i % 2 === 0 ? "aspect-video" : "aspect-[3/4]"
}))

interface Props {
  selectedPhotos: Set<string>
  toggleSelection: (id: string) => void
  allowDownload: boolean
}

export function ClientPhotoGrid({ selectedPhotos, toggleSelection, allowDownload }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (idx: number) => setLightboxIndex(idx)
  const closeLightbox = () => setLightboxIndex(null)
  
  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (lightboxIndex !== null && lightboxIndex < mockPhotos.length - 1) {
      setLightboxIndex(lightboxIndex + 1)
    }
  }

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1)
    }
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
        {mockPhotos.map((photo, idx) => {
          const isSelected = selectedPhotos.has(photo.id)
          
          return (
            <div 
              key={photo.id} 
              className={`relative group overflow-hidden rounded-md break-inside-avoid bg-muted/30 cursor-pointer ${photo.aspectRatio} ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              onClick={() => openLightbox(idx)}
            >
              <img 
                src={photo.url} 
                alt="" 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              
              {/* Interaction Overlay */}
              <div className={`absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 ${isSelected ? 'opacity-100 bg-black/10' : ''}`}>
                <div className="flex justify-end gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSelection(photo.id) }}
                      className={`p-2 rounded-sm backdrop-blur-md transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-black/30 hover:bg-black/50 text-white border border-white/10'}`}
                    >
                      <Heart className="w-4 h-4" fill={isSelected ? "currentColor" : "none"} />
                    </button>
                </div>
                
                {allowDownload && (
                  <div className="flex justify-start">
                    <button 
                      onClick={(e) => e.stopPropagation()} 
                      className="p-1.5 rounded-sm bg-black/30 hover:bg-black/50 backdrop-blur-md text-white border border-white/10 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center overscroll-none touch-none">
          <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
            <span className="text-white/60 text-[10px] font-mono font-bold tracking-widest uppercase">{lightboxIndex + 1} / {mockPhotos.length}</span>
            <button onClick={closeLightbox} className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-sm border border-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={prevPhoto}
            disabled={lightboxIndex === 0}
            className="absolute left-2 sm:left-4 p-2 sm:p-3 text-white/50 hover:text-white disabled:opacity-20 transition-colors z-50"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          <img
            src={mockPhotos[lightboxIndex].url}
            className="max-h-[90vh] max-w-[90vw] object-contain select-none"
            alt=""
          />

          <button
            onClick={nextPhoto}
            disabled={lightboxIndex === mockPhotos.length - 1}
            className="absolute right-2 sm:right-4 p-2 sm:p-3 text-white/50 hover:text-white disabled:opacity-20 transition-colors z-50"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* Lightbox Actions */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-md z-50">
            <button 
              onClick={() => toggleSelection(mockPhotos[lightboxIndex].id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase transition-colors ${
                selectedPhotos.has(mockPhotos[lightboxIndex].id) 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Heart className="w-3.5 h-3.5" fill={selectedPhotos.has(mockPhotos[lightboxIndex].id) ? "currentColor" : "none"} />
              {selectedPhotos.has(mockPhotos[lightboxIndex].id) ? 'Selected' : 'Select'}
            </button>
            
            {allowDownload && (
              <button className="flex items-center gap-2 px-4 py-2 rounded-sm bg-white/10 text-white hover:bg-white/20 text-[10px] font-mono font-bold tracking-widest uppercase transition-colors">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
