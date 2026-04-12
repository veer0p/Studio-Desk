'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface VideoPlayerProps {
  /** Video source URL */
  src: string
  /** Cover/thumbnail image URL */
  coverImage: string
  /** Video title */
  title?: string
  /** Duration string (e.g., "4:23") */
  duration?: string
  /** Auto-play when visible */
  autoPlay?: boolean
}

export function ClientVideoPlayer({
  src,
  coverImage,
  title = 'Video',
  duration = '',
  autoPlay = false,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!autoPlay || !containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play().catch(() => {})
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [autoPlay])

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      handlePause()
    } else {
      handlePlay()
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-zinc-900 rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Cover image */}
      {!isPlaying && coverImage && (
        <div className="relative aspect-video">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              onClick={handlePlay}
              className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
            >
              <svg className="w-7 h-7 text-zinc-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
          {/* Duration badge */}
          {duration && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded text-xs text-white font-mono">
              {duration}
            </div>
          )}
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        className={`w-full ${isPlaying ? 'block' : 'hidden'}`}
        onClick={togglePlay}
        onEnded={() => setIsPlaying(false)}
        controls={isPlaying}
        playsInline
        preload="metadata"
      />

      {/* Title */}
      {!isPlaying && (
        <div className="p-3">
          <p className="text-sm text-zinc-300 truncate">{title}</p>
          {duration && (
            <p className="text-xs text-zinc-600 mt-0.5">{duration}</p>
          )}
        </div>
      )}
    </div>
  )
}
