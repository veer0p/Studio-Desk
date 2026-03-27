// components/portal/client-contracts/SignatureCanvas.tsx
"use client"

import { useRef, useState, useEffect } from 'react'

export function SignatureCanvas({ onSign }: { onSign: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Setup Context Limits
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'hsl(var(--foreground))'
  }, [])

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    
    setIsDrawing(true)
    setHasDrawn(true)

    const rect = canvas.getBoundingClientRect()
    // Explicit mouse vs touch parsing
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const endDraw = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas && hasDrawn) {
      onSign(canvas.toDataURL())
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setHasDrawn(false)
      onSign("")
    }
  }

  return (
    <div className="w-full flex flex-col pt-2">
      <div className="relative border-2 border-dashed border-border/80 bg-muted/10 rounded-xl overflow-hidden touch-none group">
        <canvas
          ref={canvasRef}
          width={400}
          height={160}
          className="w-full h-40 cursor-crosshair opacity-90"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/60 tracking-wider text-sm font-medium">
             Draw signature here
          </div>
        )}
      </div>
      <div className="flex justify-end mt-2 h-6">
        {hasDrawn && (
          <button onClick={clearCanvas} className="text-xs text-muted-foreground font-semibold hover:text-red-500 hover:underline">
            Clear Signature
          </button>
        )}
      </div>
    </div>
  )
}
