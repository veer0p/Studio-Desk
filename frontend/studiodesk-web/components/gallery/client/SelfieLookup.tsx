'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'

interface SelfieLookupProps {
  slug: string
  onPhotosFound: (photos: any[]) => void
}

export function SelfieLookup({ slug, onPhotosFound }: SelfieLookupProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [found, setFound] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      return
    }

    setFile(selectedFile)
    setError('')
    setFound(false)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(selectedFile)
  }, [])

  const handleSubmit = async () => {
    if (!file) return

    setLoading(true)
    setError('')
    setFound(false)

    try {
      // Convert file to base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          // Remove data URI prefix
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const base64Image = await base64Promise

      const res = await fetch(`/api/v1/gallery/${slug}/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selfie: base64Image }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Lookup failed' }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      const photos = data.data?.matched_photos || []

      if (photos.length === 0) {
        setError('No matching photos found. Try a clearer selfie.')
        return
      }

      setFound(true)
      onPhotosFound(photos)
    } catch (err: any) {
      setError(err.message || 'Failed to process selfie lookup')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview('')
    setError('')
    setFound(false)
    setLoading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <svg className="w-8 h-8 mx-auto text-zinc-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
        <h3 className="text-sm font-medium text-zinc-200">Find Your Photos</h3>
        <p className="text-xs text-zinc-500 mt-1">Take a selfie or upload a photo to find your pictures</p>
      </div>

      {/* Upload area */}
      {!preview && (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center cursor-pointer hover:border-zinc-600 transition-colors"
        >
          <svg className="w-8 h-8 mx-auto text-zinc-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-xs text-zinc-500">Tap to take a selfie or upload</p>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="relative">
          <div className="aspect-square max-w-48 mx-auto relative rounded-lg overflow-hidden bg-zinc-800">
            <Image src={preview} alt="Selfie preview" fill className="object-cover" />
          </div>
          <button
            onClick={reset}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 text-center bg-red-500/10 rounded-md px-3 py-2">{error}</p>
      )}

      {/* Submit button */}
      {preview && !found && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-md py-2.5 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Finding your photos...
            </span>
          ) : (
            'Find My Photos'
          )}
        </button>
      )}

      {/* Success */}
      {found && (
        <div className="text-center">
          <p className="text-xs text-green-400">Photos found! Scroll to see them.</p>
          <button
            onClick={reset}
            className="text-xs text-zinc-500 mt-1 hover:text-zinc-300"
          >
            Try another photo
          </button>
        </div>
      )}

      {/* Privacy note */}
      <p className="text-[10px] text-zinc-600 text-center">
        Your selfie is deleted immediately after processing. We don't store it.
      </p>
    </div>
  )
}
