"use client"

import { Play, Download } from "lucide-react"

export function ClientVideoPlayer() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden relative group border border-border/40 shadow-sm">
        
        {/* Mock Custom Cover */}
        <div className="absolute inset-0 z-10">
          <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button className="w-20 h-20 bg-primary/90 text-primary-foreground backdrop-blur-md rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-2xl">
              <Play className="w-8 h-8 ml-1" fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Real player hidden behind mock for structural representation */}
        <video controls controlsList="nodownload" className="w-full h-full absolute inset-0 z-0">
          <source src="" type="video/mp4" />
        </video>
      </div>

      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-border/60">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">Highlight Reel</span>
          <h3 className="text-xl font-semibold text-foreground">Cinematic Wedding Trailer</h3>
          <p className="text-sm text-muted-foreground mt-1">4 mins 23 secs • 4K UHD</p>
        </div>
        <button className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
          <Download className="w-5 h-5 mb-1.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Save</span>
        </button>
      </div>
    </div>
  )
}
