import * as React from "react"
import { Search, Filter, Image as ImageIcon, Eye, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge, EventBadge } from "@/components/shared/status-badge"

export default function GalleryPage() {
    return (
        <div className="flex flex-col gap-6">
            {/* 9.1 Header area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold">Client Galleries</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage and deliver photos to your clients.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search galleries..."
                            className="h-9 w-full sm:w-64 rounded-full pl-9"
                        />
                    </div>
                    <Button variant="outline" size="sm" className="h-9 rounded-full px-4">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* 9.2 Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Published Gallery */}
                <div className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
                    {/* Cover Area */}
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                        {/* Dummy image outline */}
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />

                        {/* Top-left Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            <StatusBadge status="published" className="shadow-sm" />
                        </div>

                        {/* Bottom-right Pill */}
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                            <ImageIcon className="w-3 h-3" />
                            <span>450 photos</span>
                        </div>

                        {/* Hover overlay actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <Button variant="secondary" size="sm" className="rounded-full h-8">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                            </Button>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <EventBadge type="wedding" />
                            <span className="text-xs text-muted-foreground">15 Mar 2025</span>
                        </div>
                        <h3 className="text-base font-semibold truncate hover:text-[#2A7EC8] transition-colors">Sharma Wedding Day 1</h3>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Eye className="w-3.5 h-3.5" />
                                <span>120 views</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <HardDrive className="w-3.5 h-3.5" />
                                <span>4.2 GB</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Processing Gallery */}
                <div className="group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
                    {/* Cover Area */}
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-500/5 animate-pulse" />
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30 z-10" />

                        {/* Top-left Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                            <StatusBadge status="processing" className="shadow-sm" />
                        </div>

                        {/* Bottom-right Pill */}
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm z-10">
                            <ImageIcon className="w-3 h-3" />
                            <span>120 uploaded</span>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 relative">
                        {/* Loading bar at top of card body */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted overflow-hidden">
                            <div className="h-full bg-amber-500 w-1/3 animate-pulse" />
                        </div>

                        <div className="flex items-center gap-2 mb-2 pt-1">
                            <EventBadge type="corporate" />
                            <span className="text-xs text-muted-foreground">22 Mar 2025</span>
                        </div>
                        <h3 className="text-base font-semibold truncate hover:text-[#2A7EC8] transition-colors">Reliance Annual Gala</h3>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium whitespace-nowrap">
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
                                <span>Processing...</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <HardDrive className="w-3.5 h-3.5" />
                                <span>~1.5 GB</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Not Uploaded Gallery */}
                <div className="group rounded-xl border border-dashed bg-card/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer hover:bg-card">
                    {/* Cover Area */}
                    <div className="aspect-[4/3] bg-transparent relative overflow-hidden flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-[#2A7EC8]">Upload Photos</span>

                        {/* Top-left Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            <StatusBadge status="not_uploaded" className="shadow-sm" />
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 border-t border-dashed">
                        <div className="flex items-center gap-2 mb-2">
                            <EventBadge type="portrait" />
                            <span className="text-xs text-muted-foreground">25 Mar 2025</span>
                        </div>
                        <h3 className="text-base font-semibold truncate hover:text-[#2A7EC8] transition-colors">Maternity Shoot - Patel</h3>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="italic">Awaiting upload</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}