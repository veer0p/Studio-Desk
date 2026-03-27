"use client"

import * as React from "react"
import { Calendar, Phone, User, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const EVENT_TYPES = [
    { id: 'wedding', label: 'Wedding' },
    { id: 'pre_wedding', label: 'Pre-Wedding' },
    { id: 'maternity', label: 'Maternity' },
    { id: 'corporate', label: 'Corporate' },
]

export function NewBookingModal({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    const [type, setType] = React.useState('wedding')

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-border/60 bg-background shadow-lg sm:rounded-xl overflow-hidden p-0 gap-0">
                <DialogHeader className="px-6 py-6 border-b border-border/60">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-7 w-7 rounded-sm bg-muted/50 flex items-center justify-center text-foreground border border-border/60">
                            <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight">New Lead Entry</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm font-medium">
                        Capture a new lead in seconds. Only the reference name is required.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 flex flex-col gap-5">
                    {/* Main Field */}
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Reference Name *</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-foreground" />
                            <Input
                                autoFocus
                                placeholder="e.g. Riya IG DM, Rohit Sharma Wedding"
                                className="pl-9 h-11 bg-muted/20 border-border/60 focus-visible:ring-1 focus-visible:ring-foreground/50 focus-visible:border-foreground/50 text-base font-semibold rounded-md shadow-inner transition-none"
                            />
                        </div>
                    </div>

                    {/* Quick Selects */}
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Event Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {EVENT_TYPES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id)}
                                    className={`flex items-center justify-center h-10 rounded-md text-xs font-semibold transition-none border ${type === t.id
                                        ? 'border-foreground bg-foreground text-background shadow-xs'
                                        : 'border-border/60 bg-muted/10 hover:bg-muted/40 text-muted-foreground hover:text-foreground shadow-none'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Client Phone</label>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-foreground" />
                                <Input placeholder="+91" className="pl-9 bg-muted/20 border-border/60 font-mono text-sm rounded-md shadow-inner transition-none focus-visible:ring-1 focus-visible:ring-foreground/50 focus-visible:border-foreground/50" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Est. Date</label>
                            <div className="relative group">
                                <Input type="date" className="bg-muted/20 border-border/60 text-sm text-foreground/80 rounded-md shadow-inner transition-none focus-visible:ring-1 focus-visible:ring-foreground/50 focus-visible:border-foreground/50" />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/10 flex-col sm:flex-row sm:justify-between items-center gap-3 sm:gap-0">
                    <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5 w-full sm:w-auto text-center sm:text-left">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 inline-block"></span> Implicit save enabled
                    </span>
                    <Button
                        onClick={() => setOpen(false)}
                        className="w-full sm:w-auto rounded-md bg-foreground hover:bg-foreground/90 transition-none text-background shadow-xs font-semibold"
                    >
                        Create Lead
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
