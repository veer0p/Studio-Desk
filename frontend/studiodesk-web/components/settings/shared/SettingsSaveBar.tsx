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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-[calc(50%+120px)] z-50 w-[90%] max-w-xl bg-foreground text-background shadow-2xl rounded-md p-4 flex items-center justify-between animate-in slide-in-from-bottom-5 border-t border-white/10">
      <div className="flex flex-col ml-2">
        <span className="text-[11px] font-mono font-bold tracking-widest uppercase">Unsaved changes</span>
        <span className="text-[9px] opacity-70 font-mono font-bold uppercase tracking-widest mt-0.5">Please save to apply</span>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onDiscard} disabled={isSubmitting} className="h-9 hover:bg-white/10 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase text-background/80 hover:text-background">
          Discard
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting} className="h-9 rounded-sm bg-background text-foreground hover:bg-background/90 text-[10px] font-mono font-bold tracking-widest uppercase px-6">
          Save Changes
        </Button>
      </div>
    </div>
  )
}
