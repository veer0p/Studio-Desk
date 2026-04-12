"use client"

import { useEffect, useState, useCallback } from "react"
import { Hexagon, ChevronLeft, ChevronRight } from "lucide-react"

interface Photo {
    id: string;
    selected: boolean;
}

interface LightboxProps {
    photos: Photo[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onToggleSelection: (id: string) => void;
}

export default function Lightbox({ photos, initialIndex, isOpen, onClose, onToggleSelection }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    // Sync state if it opens with a new initialIndex
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex)
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
        return () => { document.body.style.overflow = "auto" }
    }, [isOpen, initialIndex])

    const goNext = useCallback(() => {
        setCurrentIndex(prev => (prev < photos.length - 1 ? prev + 1 : prev))
    }, [photos.length])

    const goPrev = useCallback(() => {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev))
    }, [])

    const handleToggle = useCallback(() => {
        const currentPhoto = photos[currentIndex]
        if (currentPhoto) {
            onToggleSelection(currentPhoto.id)
            // Auto advance
            goNext()
        }
    }, [currentIndex, photos, onToggleSelection, goNext])

    // Keyboard native workflow
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            switch (e.key) {
                case "Escape":
                    onClose()
                    break
                case "ArrowRight":
                    goNext()
                    break
                case "ArrowLeft":
                    goPrev()
                    break
                case "s":
                case "S":
                    handleToggle()
                    break
            }
        }

        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown)
        }
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, goNext, goPrev, handleToggle, onClose])

    if (!isOpen || photos.length === 0) return null

    const currentPhoto = photos[currentIndex]

    // Mock EXIF data based on ID
    const mockExif = "85MM  F/1.4  1/200s  ISO 100"

    return (
        <div className="fixed inset-0 z-[100] bg-black text-[#fafaf9] flex flex-col font-sans animate-in fade-in duration-200">

            {/* Top Header */}
            <div className="flex items-center justify-between px-6 py-4 absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={onClose}
                    className="text-[11px] font-bold tracking-widest uppercase text-[#78716c] hover:text-[#fafaf9] transition-colors"
                >
                    [ ESC TO CLOSE ]
                </button>
                <div className="flex gap-4">
                    <button className="text-[11px] font-bold tracking-widest uppercase text-[#78716c] hover:text-[#fafaf9] transition-colors">
                        [ SHARE ]
                    </button>
                    <button className="text-[11px] font-bold tracking-widest uppercase text-[#78716c] hover:text-[#fafaf9] transition-colors">
                        [ DOWNLOAD ]
                    </button>
                </div>
            </div>

            {/* Main Hero Viewer Container */}
            <div className="flex-1 relative flex items-center justify-center p-12">
                {/* Left Control */}
                <button
                    onClick={goPrev}
                    className="absolute left-6 z-10 p-4 opacity-50 hover:opacity-100 transition-opacity disabled:opacity-10"
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft className="w-8 h-8 text-[#fafaf9]" strokeWidth={1} />
                </button>

                {/* The Image (Geometric Placeholder) */}
                <div className="w-full h-full flex flex-col items-center justify-center border border-[#111] bg-[#050505]">
                    <Hexagon className="w-24 h-24 text-[#333] mb-4" strokeWidth={1} />
                    <span className="font-mono text-sm tracking-widest text-[#555] uppercase">{currentPhoto.id}</span>
                </div>

                {/* Right Control */}
                <button
                    onClick={goNext}
                    className="absolute right-6 z-10 p-4 opacity-50 hover:opacity-100 transition-opacity disabled:opacity-10"
                    disabled={currentIndex === photos.length - 1}
                >
                    <ChevronRight className="w-8 h-8 text-[#fafaf9]" strokeWidth={1} />
                </button>
            </div>

            {/* Extreme Bottom EXIF & Selection Overlay */}
            <div className="border-t border-[#222] bg-[#050505] h-14 flex items-center justify-between px-8 relative z-10">

                {/* File & EXIF Logic */}
                <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase text-[#78716c]">
                    <span className="text-[#fafaf9] font-bold">{currentPhoto.id}.CR3</span>
                    <span className="opacity-40">/</span>
                    <span>{mockExif}</span>
                </div>

                {/* Status Culling Marker Toggle */}
                <button
                    onClick={handleToggle}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                    <div className={`w-3.5 h-3.5 flex items-center justify-center border transition-colors ${currentPhoto.selected ? "border-[#10b981] bg-[#10b981]" : "border-[#78716c] bg-transparent"}`}>
                        {currentPhoto.selected && <div className="w-1.5 h-1.5 bg-black" />}
                    </div>
                    <span className={`text-[11px] font-bold tracking-widest uppercase ${currentPhoto.selected ? "text-[#10b981]" : "text-[#78716c]"}`}>
                        SELECT ( S )
                    </span>
                </button>

            </div>

        </div>
    )
}
