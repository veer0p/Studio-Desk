"use client"

import * as React from "react"
import { Calendar, Phone, Mail, MapPin, MoreVertical, FileText, IndianRupee, Image as ImageIcon, Activity, MessageCircle, ArrowUpRight, CheckCircle2, Clock, Plus, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventBadge } from "@/components/shared/status-badge"

const TIMELINE_STEPS = [
    { id: 'lead', label: 'Lead', active: true, completed: true },
    { id: 'quoted', label: 'Quoted', active: true, completed: true },
    { id: 'contracted', label: 'Contracted', active: false, completed: false },
    { id: 'paid', label: 'Paid', active: false, completed: false },
    { id: 'delivered', label: 'Delivered', active: false, completed: false },
]

export function BookingSlideOver({ children, booking }: { children: React.ReactNode, booking: any }) {
    const [open, setOpen] = React.useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>

            {/* w-full on mobile, massively wide on desktop for "Mission Control" feel */}
            <SheetContent className="w-full sm:!max-w-[500px] md:!max-w-[700px] lg:!max-w-[900px] p-0 border-l border-border/60 bg-background sm:rounded-l-2xl overflow-hidden data-[state=open]:duration-300 shadow-2xl">

                {/* --- HEADER --- */}
                <SheetHeader className="px-6 md:px-8 py-6 pb-0 border-b border-border/40 space-y-6 relative z-10 shrink-0">
                    <div className="flex flex-col gap-4 pr-10">
                        <div className="flex flex-col gap-2">
                            <EventBadge type={booking.eventType as any} className="w-fit" />
                            <SheetTitle className="text-2xl font-bold tracking-tight text-foreground/90 leading-tight">
                                {booking.title}
                            </SheetTitle>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium mt-1">
                                <span className="flex items-center gap-1.5 whitespace-nowrap"><Calendar className="w-4 h-4 text-muted-foreground/70" /> {booking.date.replace('\n', ' ')}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5 whitespace-nowrap"><IndianRupee className="w-4 h-4 text-muted-foreground/70" /> {booking.value}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <Button variant="default" className="rounded-md bg-foreground hover:bg-foreground/90 text-background transition-none font-medium px-4 h-9 shadow-xs">
                                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Client
                            </Button>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-md border-border/60 shadow-none hover:bg-muted/50 transition-none">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Timeline Anatomy Array */}
                    <div className="flex items-center justify-between w-full pb-6 pt-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {TIMELINE_STEPS.map((step, idx) => (
                            <React.Fragment key={step.id}>
                                <div className="flex items-center gap-2 relative z-10 shrink-0">
                                    <div className={`w-5 h-5 rounded-sm flex items-center justify-center border transition-none shrink-0 ${step.completed ? 'bg-foreground border-foreground text-background' :
                                        step.active ? 'bg-background border-foreground text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]' :
                                            'bg-muted/30 border-border/60 text-muted-foreground/50'
                                        }`}>
                                        <span className="text-[10px] font-bold">{idx + 1}</span>
                                    </div>
                                    <span className={`text-[11px] font-semibold whitespace-nowrap shrink-0 ${step.active || step.completed ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                                        {step.label}
                                    </span>
                                </div>
                                {idx < TIMELINE_STEPS.length - 1 && (
                                    <div className={`flex-1 h-[1px] mx-4 transition-none min-w-[30px] ${step.completed ? 'bg-foreground' : 'bg-border/60'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </SheetHeader>

                {/* --- BODY (TABS) --- */}
                <div className="flex-1 overflow-hidden flex flex-col pt-4">
                    <Tabs defaultValue="overview" className="flex-1 flex flex-col w-full h-full">
                        <div className="px-6 md:px-8 shrink-0">
                            <TabsList className="bg-muted/10 p-1 rounded-md border border-border/60 inline-flex w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] justify-start shadow-inner">
                                <TabsTrigger value="overview" className="rounded-sm px-5 flex-1 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none transition-none font-medium">Overview</TabsTrigger>
                                <TabsTrigger value="financials" className="rounded-sm px-5 flex-1 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none transition-none font-medium">Financials</TabsTrigger>
                                <TabsTrigger value="documents" className="rounded-sm px-5 flex-1 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none transition-none font-medium">Documents</TabsTrigger>
                                <TabsTrigger value="gallery" className="rounded-sm px-5 flex-1 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none transition-none font-medium">Gallery</TabsTrigger>
                                <TabsTrigger value="activity" className="rounded-sm px-5 flex-1 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none transition-none font-medium">Activity</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 custom-scrollbar content-area">

                            {/* OVERVIEW TAB */}
                            <TabsContent value="overview" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

                                {/* Client Info Card */}
                                <div className="flex flex-col gap-4 p-5 rounded-xl border border-border/60 bg-card shadow-sm">
                                    <h3 className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Client Profile</h3>
                                    <div className="flex items-start gap-4">
                                        <div className={`h-12 w-12 rounded-sm bg-muted flex items-center justify-center text-sm font-bold text-foreground border border-border/60 shrink-0 mt-0.5`}>
                                            {booking.initials}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-base font-bold text-foreground">{booking.client}</span>
                                            <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> +91 98765 43210</span>
                                                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> client@email.com</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Logistics */}
                                <div className="flex flex-col gap-4 p-5 rounded-xl border border-border/60 bg-card shadow-sm">
                                    <h3 className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground flex justify-between items-center">
                                        Logistics <Button variant="link" className="h-0 p-0 text-[10px] text-foreground">Edit</Button>
                                    </h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-medium text-muted-foreground">Venue Focus</span>
                                            <span className="flex items-start gap-2 text-sm font-medium text-foreground"><MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" /> Taj Mahal Palace, Mumbai, Maharashtra</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-medium text-muted-foreground">Internal Notes</span>
                                            <span className="text-sm font-medium text-foreground">Requires drone clearance. Deliver raw dump on same day.</span>
                                        </div>
                                    </div>
                                </div>

                            </TabsContent>

                            {/* STUBS FOR OTHER TABS */}
                            <TabsContent value="financials" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                                {/* Financial Overview Macro */}
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 p-5 rounded-xl border border-border/60 bg-muted/10 flex flex-col justify-center">
                                        <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Total Deal Value</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-mono font-bold tracking-tight text-foreground">₹85,000</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-5 rounded-xl border border-border/60 bg-muted/10 flex flex-col justify-center relative overflow-hidden">
                                        <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Amount Received</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-mono font-bold tracking-tight text-foreground">₹25,000</span>
                                            <span className="text-[10px] font-semibold text-foreground border border-border/80 rounded px-1.5 bg-background">29%</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-5 rounded-xl border border-border/60 bg-muted/10 flex flex-col justify-center">
                                        <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Pending Balance</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-mono font-bold tracking-tight text-foreground">₹60,000</span>
                                        </div>
                                    </div>
                                </div>

                                {/* The Tranche Timeline */}
                                <div className="flex flex-col rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-border/60 bg-muted/20 flex items-center justify-between">
                                        <h3 className="text-sm font-bold tracking-tight">Payment Milestones</h3>
                                        <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-foreground hover:bg-muted/50 rounded-md px-4 transition-none border border-border/60"><Plus className="w-3.5 h-3.5 mr-1" /> Add Tranche</Button>
                                    </div>

                                    <div className="flex flex-col p-6 gap-6 relative bg-background">
                                        <div className="absolute left-[39px] top-6 bottom-6 w-[1px] bg-border/60" />

                                        {/* Tranche 1: Paid */}
                                        <div className="flex items-start gap-5 relative z-10 group">
                                            <div className="w-8 h-8 rounded-sm bg-foreground flex items-center justify-center shrink-0 border-[3px] border-background">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-background" />
                                            </div>
                                            <div className="flex-1 rounded-md border border-border/60 bg-muted/10 p-5 transition-colors group-hover:bg-muted/30">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex flex-col">
                                                        <h4 className="text-sm font-bold text-foreground">Booking Token</h4>
                                                        <span className="text-[11px] font-medium text-foreground mt-0.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Paid on 01 Mar '25</span>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <Input disabled defaultValue="25000" className="w-28 h-8 text-right font-mono font-bold border-transparent bg-transparent outline-none focus-visible:ring-0 px-0 disabled:opacity-100" />
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Locked</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tranche 2: Pending (Current) */}
                                        <div className="flex items-start gap-5 relative z-10 group">
                                            <div className="w-8 h-8 rounded-sm bg-background flex items-center justify-center shrink-0 border-[3px] border-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]">
                                                <Clock className="w-3.5 h-3.5 text-foreground" />
                                            </div>
                                            <div className="flex-1 rounded-md border border-foreground/30 bg-muted/5 p-5 transition-colors group-hover:border-foreground ">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex flex-col">
                                                        <h4 className="text-sm font-bold text-foreground">Event Day Advance</h4>
                                                        <span className="text-[11px] font-medium text-foreground mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Due: 15 Mar '25</span>
                                                    </div>
                                                    <div className="text-right flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-muted-foreground">₹</span>
                                                        <Input defaultValue="30000" className="w-24 h-9 text-right font-mono font-bold bg-muted/30 border-border/60 focus-visible:ring-foreground/50 transition-none" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 pt-4 border-t border-border/40">
                                                    <Button size="sm" className="h-8 rounded-md bg-foreground text-background shadow-xs hover:bg-foreground/90 transition-none text-xs px-4">Generate Link</Button>
                                                    <Button variant="ghost" size="sm" className="h-8 rounded-md text-xs font-medium text-foreground hover:bg-muted/50 transition-none">Mark as Paid</Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tranche 3: Future */}
                                        <div className="flex items-start gap-5 relative z-10 opacity-60 hover:opacity-100 transition-opacity">
                                            <div className="w-8 h-8 rounded-sm bg-muted/50 border-[3px] border-border flex items-center justify-center shrink-0">
                                                <span className="w-1.5 h-1.5 bg-muted-foreground/30" />
                                            </div>
                                            <div className="flex-1 rounded-md border border-border/40 bg-card/50 p-5 transition-none">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex flex-col">
                                                        <h4 className="text-sm font-bold text-muted-foreground">Final Delivery</h4>
                                                        <span className="text-[11px] font-medium text-muted-foreground/60 mt-0.5">Upon gallery upload</span>
                                                    </div>
                                                    <div className="text-right flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-muted-foreground/50">₹</span>
                                                        <Input defaultValue="30000" disabled className="w-24 h-9 text-right font-mono font-bold bg-muted/20 border-border/30 text-muted-foreground/70" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="documents" className="mt-0">
                                <div className="p-12 text-center text-muted-foreground text-sm font-semibold border-2 border-dashed border-border/50 rounded-2xl">
                                    Contract Viewer loading...
                                </div>
                            </TabsContent>
                            <TabsContent value="gallery" className="mt-0">
                                <div className="p-12 text-center text-muted-foreground text-sm font-semibold border-2 border-dashed border-border/50 rounded-2xl">
                                    Immich Integration loading...
                                </div>
                            </TabsContent>
                            <TabsContent value="activity" className="mt-0">
                                <div className="p-12 text-center text-muted-foreground text-sm font-semibold border-2 border-dashed border-border/50 rounded-2xl">
                                    Timeline Activity loading...
                                </div>
                            </TabsContent>

                        </div>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    )
}
