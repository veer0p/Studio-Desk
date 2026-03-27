"use client"

import { useState } from "react"
import { Users, ScanFace, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FaceClusterPanel() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isScanning, setIsScanning] = useState(false)

  const mockClusters = [
    { id: "c1", label: "Bride (Priya)", count: 184, img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" },
    { id: "c2", label: "Groom (Rohan)", count: 142, img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" },
    { id: "c3", label: "Person 3", count: 45, img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop" },
    { id: "c4", label: "Person 4", count: 32, img: "https://images.unsplash.com/photo-1552058544-e223a7261bd7?w=100&h=100&fit=crop" },
  ]

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => setIsScanning(false), 2000)
  }

  return (
    <div className="w-full bg-card border-t border-border/40">
      <div 
        className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">People in this gallery</h3>
          <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold">{mockClusters.length} Found</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {isExpanded && (
        <div className="px-6 py-4 bg-background">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-muted-foreground">Click a face to tag them or filter the grid.</p>
            <Button variant="outline" size="sm" onClick={handleScan} disabled={isScanning} className="h-7 text-xs">
              <ScanFace className="w-3.5 h-3.5 mr-1.5" />
              {isScanning ? "Analyzing..." : "Scan for faces"}
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {mockClusters.map(cluster => (
              <div key={cluster.id} className="flex flex-col items-center gap-2 group cursor-pointer w-[72px] shrink-0">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                  <img src={cluster.img} alt={cluster.label} className="w-full h-full object-cover" />
                </div>
                <div className="text-center w-full">
                  <p className="text-[10px] font-semibold text-foreground truncate" title={cluster.label}>{cluster.label}</p>
                  <p className="text-[9px] text-muted-foreground">{cluster.count} photos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
