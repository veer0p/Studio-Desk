"use client"

import * as React from "react"
import { Search, Filter, CalendarClock, ArrowRight, AlertCircle, Clock, UploadCloud, CheckCircle2, BellRing, User, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EventBadge } from "@/components/shared/status-badge"
import { NewBookingModal } from "@/components/bookings/new-booking-modal"
import { BookingSlideOver } from "@/components/bookings/booking-slide-over"

type UrgencyState = 'red_alert' | 'awaiting_client' | 'awaiting_us' | 'on_track'

const BOOKINGS = [
    {
        id: "B-1002",
        title: "Sharma Wedding - 2 Days Complete Package",
        client: "Priya Sharma",
        initials: "PS",
        avatarGrad: "from-blue-600 to-indigo-400",
        eventType: "wedding",
        date: "15 Mar '25",
        value: "₹85,000",
        urgency: "red_alert" as UrgencyState,
        urgencyReason: "Contract Unsigned (Shoot in 48 hrs)",
        pulse: true,
        action: "Send Reminder",
    },
    {
        id: "B-1004",
        title: "Kapoor Maternity Session",
        client: "Anjali Kapoor",
        initials: "AK",
        avatarGrad: "from-rose-500 to-pink-400",
        eventType: "maternity",
        date: "10 Mar '25",
        value: "₹25,000",
        urgency: "awaiting_client" as UrgencyState,
        urgencyReason: "Proposal Sent (3 days ago)",
        pulse: false,
        action: "Resend Link",
    },
    {
        id: "B-1001",
        title: "Reliance Tech Summit 2025",
        client: "Rahul Desai",
        initials: "RD",
        avatarGrad: "from-[#2A7EC8] to-cyan-400",
        eventType: "corporate",
        date: "18 Mar '25",
        value: "₹45,000",
        urgency: "awaiting_us" as UrgencyState,
        urgencyReason: "Shoot Completed (Photos pending)",
        pulse: false,
        action: "Upload Gallery",
    },
    {
        id: "B-1005",
        title: "Verma Pre-Wedding Shoot",
        client: "Karan Verma",
        initials: "KV",
        avatarGrad: "from-emerald-500 to-teal-400",
        eventType: "pre_wedding",
        date: "25 Mar '25",
        value: "₹30,000",
        urgency: "on_track" as UrgencyState,
        urgencyReason: "Advance Paid, Scheduled",
        pulse: false,
        action: "View Details",
    }
]

// Priority Groupings mappings
const GROUPS: Record<UrgencyState, { title: string, count: number, icon: any, color: string, border: string, bg: string, ring: string }> = {
    red_alert: {
        title: "Requires Attention", count: 1, icon: AlertCircle,
        color: "text-foreground", border: "border-border/60", bg: "bg-muted/10", ring: "ring-border/40"
    },
    awaiting_client: {
        title: "Waiting on Client", count: 1, icon: Clock,
        color: "text-foreground", border: "border-border/60", bg: "bg-muted/10", ring: "ring-border/40"
    },
    awaiting_us: {
        title: "Waiting on Us", count: 1, icon: UploadCloud,
        color: "text-foreground", border: "border-border/60", bg: "bg-muted/10", ring: "ring-border/40"
    },
    on_track: {
        title: "On Track", count: 1, icon: CheckCircle2,
        color: "text-foreground", border: "border-border/60", bg: "bg-muted/10", ring: "ring-border/40"
    }
}

export default function BookingsPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-4 md:-m-6 lg:-m-8 relative bg-background">
            {/* Header & Filter Bar */}
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/40 bg-background/95 px-6 py-4 shrink-0 transition-all">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold tracking-tight">Bookings Engine</h1>
                    <div className="hidden md:flex items-center gap-2 border-l border-border/50 pl-4">
                        <Button variant="default" className="rounded-md h-8 px-4 text-xs font-semibold bg-foreground text-background shadow-xs hover:bg-foreground/90 transition-none">
                            All Active
                        </Button>
                        <Button variant="outline" className="rounded-md h-8 px-4 text-xs font-medium border-border/60 shadow-none hover:bg-muted/50 transition-none">Needs Action</Button>
                        <Button variant="outline" className="rounded-md h-8 px-4 text-xs font-medium border-border/60 shadow-none hover:bg-muted/50 transition-none">Delivered</Button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative hidden lg:block group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-[#2A7EC8]" />
                        <Input
                            placeholder="Search by name, phone or ID..."
                            className="h-9 w-64 rounded-md pl-9 text-sm bg-muted/40 border-border/50 focus-visible:ring-1 focus-visible:ring-foreground/50 focus-visible:border-foreground/50 transition-none shadow-inner placeholder:text-muted-foreground/60"
                        />
                    </div>
                    <NewBookingModal>
                        <Button variant="default" size="sm" className="h-9 rounded-md bg-foreground text-background shadow-xs hover:bg-foreground/90 transition-none cursor-pointer">
                            + New Booking
                        </Button>
                    </NewBookingModal>
                </div>
            </div>

            {/* Intelligence Engine - Contextual List View */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 custom-scrollbar z-10">
                <div className="max-w-[72rem] mx-auto flex flex-col gap-12">

                    {(Object.keys(GROUPS) as UrgencyState[]).map((state) => {
                        const group = GROUPS[state];
                        const items = BOOKINGS.filter(b => b.urgency === state);
                        if (items.length === 0) return null;

                        return (
                            <div key={state} className="flex flex-col">
                                {/* Section Header */}
                                <div className="flex items-center gap-3 mb-3 pl-1">
                                    <div className={`p-1 rounded-sm ${group.bg} border-border/40 border`}>
                                        <group.icon className={`h-3.5 w-3.5 text-muted-foreground`} />
                                    </div>
                                    <h2 className={`text-xs font-semibold tracking-wide uppercase text-muted-foreground`}>
                                        {group.title}
                                    </h2>
                                    <span className="text-[10px] font-mono font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-sm">
                                        {items.length}
                                    </span>
                                </div>

                                {/* Section Cards */}
                                <div className="flex flex-col gap-3">
                                    {items.map((booking) => (
                                        <BookingSlideOver key={booking.id} booking={booking}>
                                            <div
                                                className={`group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/20 transition-colors relative overflow-hidden cursor-pointer shadow-sm`}
                                            >

                                                {/* Left: Info */}
                                                <div className="flex items-center gap-5 flex-1 min-w-0 pr-4 pl-2">
                                                    {/* Avatar */}
                                                    <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-foreground border border-border/60 shrink-0`}>
                                                        {booking.initials}
                                                    </div>

                                                    <div className="flex flex-col min-w-0 flex-1 gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-[14px] font-semibold text-foreground truncate">
                                                                {booking.title}
                                                            </h4>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-[12px] text-muted-foreground font-medium">
                                                            <span className="flex items-center gap-1.5 text-foreground/80">
                                                                <User className="h-3.5 w-3.5 text-muted-foreground/70" /> {booking.client}
                                                            </span>
                                                            <span className="text-border">•</span>
                                                            <EventBadge type={booking.eventType as any} className="scale-90 origin-left" />
                                                            <span className="text-border">•</span>
                                                            <span className="flex items-center gap-1 text-muted-foreground/80">
                                                                <CalendarClock className="h-3.5 w-3.5" /> {booking.date}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Triggers & Financials */}
                                                <div className="flex items-center justify-end gap-6 shrink-0 mt-4 md:mt-0 pl-16 md:pl-0">

                                                    {/* Dynamic Urgency Label */}
                                                    <div className="hidden lg:flex flex-col items-end mr-4">
                                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold mb-0.5">Status</span>
                                                        <span className={`text-[12px] font-semibold ${group.color} bg-background px-2 py-0.5 rounded-md border border-border/40 shadow-sm`}>
                                                            {booking.urgencyReason}
                                                        </span>
                                                    </div>

                                                    {/* Value */}
                                                    <div className="flex flex-col items-end w-20">
                                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold mb-0.5">Value</span>
                                                        <span className="text-[14px] font-mono font-bold text-foreground/90 tracking-tight">{booking.value}</span>
                                                    </div>

                                                    {/* Dynamic Action Button */}
                                                    <div className="flex items-center gap-2">
                                                        {booking.urgency === 'red_alert' || booking.urgency === 'awaiting_client' ? (
                                                            <Button size="sm" className="h-8 rounded-md bg-foreground text-background shadow-xs transition-none hover:bg-foreground/90 gap-1.5">
                                                                <MessageCircle className="h-3.5 w-3.5" />
                                                                <span className="text-xs font-semibold">{booking.action}</span>
                                                            </Button>
                                                        ) : (
                                                            <Button variant="outline" size="sm" className="h-8 rounded-md border-border/60 hover:bg-muted/50 text-foreground transition-none shadow-none text-xs font-medium">
                                                                {booking.action}
                                                            </Button>
                                                        )}
                                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-md border-border/60 hover:bg-muted/50 transition-none shadow-none text-muted-foreground mr-2">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </BookingSlideOver>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(150, 150, 150, 0.4); }
      `}} />
        </div>
    )
}