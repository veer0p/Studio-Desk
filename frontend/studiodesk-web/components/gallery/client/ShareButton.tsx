'use client'

import { useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'

interface ShareButtonProps {
  galleryName: string
  gallerySlug: string
  studioName: string
}

export function ShareButton({ galleryName, gallerySlug, studioName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/gallery/p/${gallerySlug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${galleryName} — ${studioName}`,
          text: `Check out this photo gallery from ${studioName}`,
          url: shareUrl,
        })
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-green-400" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            Copy Link
          </>
        )}
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share
      </button>
    </div>
  )
}
