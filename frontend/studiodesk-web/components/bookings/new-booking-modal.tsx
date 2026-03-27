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
import { createBooking } from "@/lib/api"
import { useSWRConfig } from "swr"
import { toast } from "sonner"

const EVENT_TYPES = [
    { id: 'wedding', label: 'Wedding' },
    { id: 'pre_wedding', label: 'Pre-Wedding' },
    { id: 'maternity', label: 'Maternity' },
    { id: 'corporate', label: 'Corporate' },
]

export function NewBookingModal({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    const [type, setType] = React.useState('wedding')
    const [referenceName, setReferenceName] = React.useState("")
    const [clientPhone, setClientPhone] = React.useState("")
    const [estDate, setEstDate] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const { mutate } = useSWRConfig()

    const handleSubmit = async () => {
        if (!referenceName.trim()) {
            toast.error("Reference name is required")
            return
        }
        setIsSubmitting(true)
        try {
            await createBooking({
                client_name: referenceName,
                client_phone: clientPhone || undefined,
                event_date: estDate || undefined,
                event_type: type,
            })
            toast.success("Lead created successfully")
            setOpen(false)
            setReferenceName("")
            setClientPhone("")
            setEstDate("")
            mutate(key => typeof key === 'string' && key.startsWith('/api/v1/bookings'))
            mutate(key => typeof key === 'string' && key.startsWith('/api/v1/dashboard'))
        } catch (error: any) {
            toast.error(error.message || "Failed to create lead")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-border/60 bg-background shadow-lg sm:rounded-md overflow-hidden p-0 gap-0">
                <DialogHeader className="px-6 py-5 border-b border-border/60 bg-muted/5">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded-sm bg-muted/10 flex items-center justify-center text-foreground border border-border/40">
                            <Zap className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <DialogTitle className="text-lg font-bold tracking-tight">New Lead Entry</DialogTitle>
                    </div>
                    <DialogDescription className="text-xs font-medium text-muted-foreground mt-1">
                        Capture a new lead in seconds. Only the reference name is required.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 flex flex-col gap-5">
                    {/* Main Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Reference Name *</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
                            <Input
                                autoFocus
                                value={referenceName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferenceName(e.target.value)}
                                placeholder="e.g. Riya IG DM, Rohit Sharma Wedding"
                                className="pl-9 h-10 bg-muted/5 border-border/60 focus-visible:ring-1 focus-visible:ring-foreground/50 focus-visible:border-foreground/50 text-sm font-medium rounded-sm shadow-none transition-none"
                            />
                        </div>
                    </div>

                    {/* Quick Selects */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Event Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {EVENT_TYPES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id)}
                                    className={`flex items-center justify-center h-9 rounded-sm text-[11px] font-mono tracking-widest uppercase transition-none border ${type === t.id
                                        ? 'border-foreground bg-foreground text-background shadow-none'
                                        : 'border-border/40 bg-muted/5 hover:bg-muted/20 text-muted-foreground hover:text-foreground shadow-none'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Client Phone</label>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors group-focus-within:text-foreground" />
                                <Input 
                                    value={clientPhone}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientPhone(e.target.value)}
                                    placeholder="+91" 
                                    className="pl-9 h-10 bg-muted/5 border-border/60 font-mono text-sm rounded-sm shadow-none transition-none focus-visible:ring-1 focus-visible:ring-foreground/50 focus-visible:border-foreground/50" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Est. Date</label>
                            <div className="relative group">
                                <Input 
                                    type="date" 
                                    value={estDate}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEstDate(e.target.value)}
                                    className="h-10 bg-muted/5 border-border/60 text-sm font-mono tracking-widest uppercase text-foreground/80 rounded-sm shadow-none transition-none focus-visible:ring-1 focus-visible:ring-foreground/50 focus-visible:border-foreground/50" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/5 flex-col sm:flex-row sm:justify-between items-center gap-3 sm:gap-0">
                    <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase flex items-center gap-1.5 w-full sm:w-auto text-center sm:text-left">
                        <span className="w-1.5 h-1.5 rounded-sm bg-muted-foreground/50 inline-block"></span> Draft saves directly
                    </span>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto h-9 rounded-sm bg-foreground hover:bg-foreground/90 transition-none text-background text-[11px] font-mono uppercase tracking-widest shadow-none"
                    >
                        {isSubmitting ? "Creating..." : "Create Lead"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
