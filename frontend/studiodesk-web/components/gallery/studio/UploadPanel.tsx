"use client"

import { useState, useCallback } from "react"
import { UploadCloud, FileImage, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadFile {
  id: number
  file: File
  name: string
  size: string
  progress: number
  status: "queued" | "uploading" | "done" | "error"
  error?: string
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(",")[1]) // Remove data URI prefix
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function UploadPanel({ galleryId }: { galleryId?: string }) {
  const [isHovering, setIsHovering] = useState(false)
  const [uploads, setUploads] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(f => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE)

    if (validFiles.length === 0) return

    const newUploads: UploadFile[] = validFiles.map((file, i) => ({
      id: Date.now() + i,
      file,
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
      status: "queued",
    }))

    setUploads(prev => [...prev, ...newUploads])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsHovering(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files)
  }, [processFiles])

  const handleUpload = async () => {
    if (!galleryId || uploads.length === 0) return

    const queued = uploads.filter(u => u.status === "queued" || u.status === "error")
    if (queued.length === 0) return

    setIsUploading(true)

    const batchSize = 10
    for (let i = 0; i < queued.length; i += batchSize) {
      const batch = queued.slice(i, i + batchSize)

      try {
        const files = await Promise.all(batch.map(async (u) => ({
          name: u.file.name,
          mimeType: u.file.type,
          size: u.file.size,
          data: await fileToBase64(u.file),
        })))

        setUploads(prev => prev.map(u => batch.some(b => b.id === u.id) ? { ...u, status: "uploading", progress: 50 } : u))

        const res = await fetch(`/api/v1/galleries/${galleryId}/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.error || "Upload failed")
        }

        setUploads(prev => prev.map(u => batch.some(b => b.id === u.id) ? { ...u, status: "done", progress: 100 } : u))
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed"
        setUploads(prev => prev.map(u => batch.some(b => b.id === u.id) ? { ...u, status: "error", error: msg } : u))
      }
    }

    setIsUploading(false)
  }

  const clearDone = () => {
    setUploads(prev => prev.filter(u => u.status !== "done"))
  }

  const removeUpload = (id: number) => {
    setUploads(prev => prev.filter(u => u.id !== id))
  }

  const queuedCount = uploads.filter(u => u.status === "queued" || u.status === "error").length
  const doneCount = uploads.filter(u => u.status === "done").length

  return (
    <div className="w-full h-full flex flex-col bg-card border-l border-border/40 overflow-hidden">
      <div className="p-4 border-b border-border/40 shrink-0">
        <h3 className="font-semibold text-foreground">Upload Panel</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Drag & Drop chunks (50MB max)</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true) }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={handleDrop}
        className={`m-3 sm:m-4 p-6 sm:p-8 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center transition-colors ${isHovering ? 'border-primary bg-primary/5' : 'border-border/60 bg-muted/20'}`}
      >
        <UploadCloud className={`w-8 h-8 mb-3 ${isHovering ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={1.5} />
        <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-foreground">Drop photos here</p>
        <p className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground mt-1 mb-4">Accepts JPG, PNG, RAW</p>
        <label>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
          <Button variant="outline" size="sm" className="h-8 rounded-sm font-mono text-[9px] sm:text-[10px] tracking-widest uppercase cursor-pointer" asChild>
            <span>Browse Files</span>
          </Button>
        </label>
      </div>

      {queuedCount > 0 && galleryId && (
        <div className="px-4 pb-2">
          <Button onClick={handleUpload} disabled={isUploading} size="sm" className="w-full">
            {isUploading ? `Uploading... (${doneCount} done)` : `Upload ${queuedCount} file${queuedCount > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Queue ({uploads.length})</span>
          {doneCount > 0 && <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-widest cursor-pointer" onClick={clearDone}>Clear</span>}
        </div>

        <div className="space-y-2">
          {uploads.map(file => (
            <div key={file.id} className="p-3 bg-background rounded-sm border border-border/60 relative overflow-hidden group">
              {file.status === "uploading" && (
                <div className="absolute left-0 bottom-0 h-0.5 bg-primary/40 transition-all duration-300" style={{ width: `${file.progress}%` }} />
              )}
              {file.status === "error" && (
                <div className="absolute left-0 bottom-0 h-0.5 bg-red-500/40 w-full" />
              )}

              <div className="flex items-center gap-3 relative z-10">
                <FileImage className="w-8 h-8 text-muted-foreground shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-foreground truncate max-w-[120px]" title={file.name}>{file.name}</p>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{file.size}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono font-bold tracking-widest">
                      {file.status === "done" ? "Ready" : file.status === "error" ? file.error : file.status === "uploading" ? `Uploading ${file.progress}%` : "Queued"}
                    </span>
                    {file.status === "done" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <button className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeUpload(file.id)}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {uploads.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground">No active uploads.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
