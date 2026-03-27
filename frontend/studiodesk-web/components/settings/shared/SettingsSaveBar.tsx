"use client"

import { Button } from "@/components/ui/button"

interface Props {
  isDirty: boolean
  onDiscard: () => void
  isSubmitting?: boolean
}

export function SettingsSaveBar({ isDirty, onDiscard, isSubmitting = false }: Props) {
  if (!isDirty) return null
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-[calc(50%+120px)] z-50 w-[90%] max-w-xl bg-card/90 backdrop-blur-xl border border-border/60 shadow-2xl rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-bottom-5">
      <div className="flex flex-col ml-2">
        <span className="text-sm font-bold text-foreground tracking-tight">Unsaved changes</span>
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">Please save to apply</span>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onDiscard} disabled={isSubmitting} className="h-9 hover:bg-muted/50 rounded-xl">
          Discard
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting} className="h-9 rounded-xl shadow-sm">
          Save Changes
        </Button>
      </div>
    </div>
  )
}
