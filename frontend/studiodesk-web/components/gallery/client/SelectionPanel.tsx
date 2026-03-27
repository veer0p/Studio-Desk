"use client"

import { Server, ArrowRight, DownloadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  selectedCount: number
  quota: number
}

export function SelectionPanel({ selectedCount, quota }: Props) {
  const progress = Math.min((selectedCount / quota) * 100, 100)
  const isOver = selectedCount > quota

  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-lg bg-card/90 backdrop-blur-xl border border-border/60 shadow-2xl rounded-md p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-5">
      
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <HeartIndicator isOver={isOver} />
          <div>
            <p className={`text-[11px] font-mono font-bold tracking-widest uppercase ${isOver ? 'text-amber-600' : 'text-foreground'}`}>
              {selectedCount} selected
            </p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold font-mono">
              of {quota} allowed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOver && <span className="text-[9px] font-mono font-bold text-amber-600 uppercase tracking-widest px-2">Limit Exceeded</span>}
          <Button size="sm" className="rounded-sm h-9 font-mono text-[10px] tracking-widest uppercase font-bold" disabled={isOver}>
            Submit <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      <div className="h-1 w-full bg-muted border border-border/40 rounded-sm overflow-hidden">
        <div 
          className={`h-full rounded-sm transition-all duration-500 ease-out ${isOver ? 'bg-amber-500' : 'bg-primary'}`} 
          style={{ width: `${progress}%` }} 
        />
      </div>

    </div>
  )
}

function HeartIndicator({ isOver }: { isOver: boolean }) {
  return (
    <div className={`w-8 h-8 rounded-sm flex items-center justify-center border-2 ${isOver ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' : 'border-primary/30 text-primary bg-primary/10'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    </div>
  )
}
