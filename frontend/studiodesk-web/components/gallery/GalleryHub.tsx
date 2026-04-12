"use client"

import { useState } from "react"
import { UploadCloud, Hexagon, Send } from "lucide-react"
import Lightbox from "@/components/gallery/Lightbox"
import ClientProofingOverlay from "@/components/gallery/ClientProofingOverlay"

// Pure random mock geometry for masonry lengths
const mockPhotos = Array.from({ length: 48 }).map((_, i) => ({
    id: `img_${i}`,
    // Provide variable aspect ratios for simulated masonry layout scaling
    aspect: i % 3 === 0 ? "aspect-square" : i % 5 === 0 ? "aspect-[4/3]" : "aspect-[3/4]",
    selected: false
}))

const TABS = ["ALL", "PRE-WEDDING", "HALDI", "SANGEET", "WEDDING", "RECEPTION"]

export default function GalleryHub() {
    const [activeTab, setActiveTab] = useState("ALL")
    const [photos, setPhotos] = useState(mockPhotos)
    const [isDragging, setIsDragging] = useState(false)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [proofingOpen, setProofingOpen] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState(0)

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setPhotos(prev => prev.map(p => p.id === id ? { ...p, selected: !p.selected } : p))
    }

    return (
        <div
            className="relative flex flex-col h-full bg-black text-[#fafaf9] font-sans"
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); console.log("Files dropped"); }}
        >

            {/* Global Drag Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-[#f59e0b]/10 backdrop-blur-sm border-4 border-dashed border-[#f59e0b] flex flex-col items-center justify-center font-mono uppercase tracking-widest pointer-events-none">
                    <UploadCloud className="w-16 h-16 text-[#f59e0b] mb-4" />
                    <h2 className="text-xl font-bold text-[#fafaf9] mb-2">Drop Folders Anywhere</h2>
                    <p className="text-sm text-[#f59e0b]">Uploading straight to: {activeTab}</p>
                </div>
            )}

            {/* Sticky Top Nav */}
            <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-[#333]">
                <div className="flex items-center justify-between px-8 py-5">
                    <div className="flex items-center gap-4">
                        <h1 className="font-serif text-xl font-bold tracking-wide uppercase" style={{ fontFamily: '"Playfair Display", serif' }}>
                            JOHN DOE WEDDING
                        </h1>
                        <span className="font-mono text-xs text-[#78716c] tracking-widest uppercase">
                            [ {photos.length.toLocaleString()} PHOTOS ]
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setProofingOpen(true)}
                            className="px-6 py-2 bg-[#fafaf9] text-black font-bold text-[11px] uppercase tracking-widest rounded-sm hover:bg-[#fafaf9]/90 transition-colors flex items-center gap-2"
                        >
                            <Send className="w-3.5 h-3.5" />
                            Deliver
                        </button>
                        <button className="px-6 py-2 bg-transparent border border-transparent hover:border-[#555] text-[#fafaf9] font-bold text-[11px] uppercase tracking-widest rounded-sm transition-colors flex items-center gap-2">
                            <UploadCloud className="w-4 h-4 text-[#78716c]" />
                            + Upload
                        </button>
                    </div>
                </div>

                {/* Tab Layout */}
                <div className="flex items-center gap-8 px-8 border-t border-[#111]">
                    {TABS.map(tab => {
                        const isActive = tab === activeTab
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 text-[10px] uppercase tracking-widest font-bold transition-all relative ${isActive ? "text-[#fafaf9]" : "text-[#78716c] hover:text-[#bbb]"}`}
                            >
                                {tab}
                                {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#fafaf9]" />}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Masonry Layout Strict Geometry */}
            <div className="flex-1 overflow-y-auto w-full h-full p-1 custom-scrollbar">
                {/* We use standard flex wrapping rendering since purely native CSS masonry isn't available without columns. Using gap-1 for tight 4px bounds */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1 auto-rows-max">
                    {photos.map((photo, i) => (
                        <div
                            key={photo.id}
                            onDoubleClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                            className={`relative group bg-[#111] overflow-hidden cursor-pointer ${photo.aspect} ${photo.selected ? "border-2 border-[#10b981]" : "border-2 border-transparent hover:border-[#f59e0b]"}`}
                        >
                            {/* Fake Image Data Render */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                                <Hexagon className="w-8 h-8 text-[#78716c]" strokeWidth={1} />
                                <span className="font-mono text-[8px] text-[#78716c] mt-2">{photo.id.toUpperCase()}</span>
                            </div>

                            {/* Hover Artisan Overlay */}
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${photo.selected ? "opacity-100 bg-black/60" : ""}`}>
                                <button
                                    onClick={(e) => toggleSelect(photo.id, e)}
                                    className={`px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest rounded-sm border transition-colors ${photo.selected ? "bg-[#10b981] border-[#10b981] text-black" : "bg-black border-[#fafaf9] text-[#fafaf9] hover:bg-[#fafaf9] hover:text-black"}`}
                                >
                                    {photo.selected ? "SELECTED" : "SELECT"}
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            <Lightbox
                photos={photos}
                initialIndex={lightboxIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                onToggleSelection={(id) => toggleSelect(id, { stopPropagation: () => { } } as any)}
            />

            <ClientProofingOverlay
                isOpen={proofingOpen}
                onClose={() => setProofingOpen(false)}
            />

        </div>
    )
}
