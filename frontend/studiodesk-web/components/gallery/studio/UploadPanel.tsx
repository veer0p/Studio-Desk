"use client"

import { useState } from "react"
import { UploadCloud, FileImage, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function UploadPanel() {
  const [isHovering, setIsHovering] = useState(false)
  const [uploads, setUploads] = useState<any[]>([])

  const mockHandleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsHovering(false)
    // Simulate drop
    setUploads((prev) => [
      ...prev,
      { id: Date.now(), name: "DSC_8932.CR2", size: "24.5 MB", progress: 0, status: 'uploading' },
      { id: Date.now() + 1, name: "DSC_8933.CR2", size: "22.1 MB", progress: 0, status: 'uploading' },
    ])

    // Simulate progress
    setTimeout(() => {
      setUploads(prev => prev.map(u => ({ ...u, progress: 45 })))
    }, 1000)
    setTimeout(() => {
      setUploads(prev => prev.map(u => ({ ...u, progress: 100, status: 'done' })))
    }, 2500)
  }

  return (
    <div className="w-full h-full flex flex-col bg-card border-l border-border/40 overflow-hidden">
      <div className="p-4 border-b border-border/40 shrink-0">
        <h3 className="font-semibold text-foreground">Upload Panel</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Drag & Drop chunks (50MB max)</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true) }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={mockHandleDrop}
        className={`m-3 sm:m-4 p-6 sm:p-8 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center transition-colors ${isHovering ? 'border-primary bg-primary/5' : 'border-border/60 bg-muted/20'}`}
      >
        <UploadCloud className={`w-8 h-8 mb-3 ${isHovering ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={1.5} />
        <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-foreground">Drop photos here</p>
        <p className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground mt-1 mb-4">Accepts JPG, PNG, RAW</p>
        <Button variant="outline" size="sm" className="h-8 rounded-sm font-mono text-[9px] sm:text-[10px] tracking-widest uppercase">Browse Files</Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Queue ({uploads.length})</span>
          {uploads.length > 0 && <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-widest cursor-pointer">Clear</span>}
        </div>

        <div className="space-y-2">
          {uploads.map(file => (
            <div key={file.id} className="p-3 bg-background rounded-sm border border-border/60 relative overflow-hidden group">
              {file.status === 'uploading' && (
                <div 
                  className="absolute left-0 bottom-0 h-0.5 bg-primary/40 transition-all duration-300"
                  style={{ width: `${file.progress}%` }}
                />
              )}
              
              <div className="flex items-center gap-3 relative z-10">
                <FileImage className="w-8 h-8 text-muted-foreground shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-foreground truncate max-w-[120px]">{file.name}</p>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{file.size}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono font-bold tracking-widest">
                      {file.status === 'done' ? 'Ready' : `Uploading ${file.progress}%`}
                    </span>
                    {file.status === 'done' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <button className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
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
