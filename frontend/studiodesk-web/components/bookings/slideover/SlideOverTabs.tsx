"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { updateBookingNotes } from "@/lib/api"
import { toast } from "sonner"
import { Phone, Calendar as CalendarIcon, MapPin, Receipt, IndianRupee, Link as LinkIcon } from "lucide-react"

export default function SlideOverTabs({ booking }: { booking: any }) {
  const [note, setNote] = useState(booking.notes || "")
  const [isSaving, setIsSaving] = useState(false)

  // Quick auto-save simulation for notes
  const handleNoteBlur = async () => {
    if (note === booking.notes) return
    setIsSaving(true)
    try {
      await updateBookingNotes(booking.id, note)
      toast.success("Note saved")
    } catch {
      toast.error("Failed to save note")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col h-full">
      <div className="px-6 border-b border-border/40 shrink-0">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-6 rounded-none">
          <TabsTrigger value="overview" className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">
            Overview
          </TabsTrigger>
          <TabsTrigger value="timeline" className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="finance" className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">
            Finance
          </TabsTrigger>
          <TabsTrigger value="files" className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">
            Files
          </TabsTrigger>
          <TabsTrigger value="notes" className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">
            Notes
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        
        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="m-0 flex flex-col gap-8 data-[state=inactive]:hidden">
          
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Event Details</h3>
            <div className="p-4 bg-muted/10 border border-border/60 rounded-xl space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Date & Time</span>
                  <div className="font-medium flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-muted-foreground" /> {booking.date}</div>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Venue</span>
                  <div className="font-medium flex items-center gap-2 line-clamp-1 truncate"><MapPin className="w-4 h-4 text-muted-foreground" /> {booking.venue}</div>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Package</span>
                  <div className="font-medium">{booking.packageInfo?.name || "Standard Wedding"}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Client Info</h3>
            <div className="p-4 bg-muted/10 border border-border/60 rounded-xl space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground block mb-1">Phone</span>
                  <div className="font-medium">{(booking.clientPhone || "+91 98765 43210")}</div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://wa.me/919876543210`} target="_blank" rel="noreferrer">
                    <Phone className="w-3 h-3 mr-2" /> WhatsApp
                  </a>
                </Button>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Email</span>
                <div className="font-medium">{booking.clientEmail || "client@example.com"}</div>
              </div>
              <button className="text-primary hover:underline font-medium text-left">View full client profile &rarr;</button>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Team Assigned</h3>
            <div className="p-4 bg-muted/10 border border-border/60 rounded-xl flex flex-col gap-3">
              {(booking.team || []).map((member: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {member.avatar ? <img src={member.avatar} /> : <span className="text-xs font-semibold">{member.name.charAt(0)}</span>}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="justify-start mt-2 border border-dashed border-border/60">
                + Assign member
              </Button>
            </div>
          </section>

        </TabsContent>

        {/* TIMELINE TAB */}
        <TabsContent value="timeline" className="m-0 data-[state=inactive]:hidden text-sm">
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-2.5 top-2 bottom-6 w-px bg-border/60" />
            
            {(booking.timeline || [
              { status: 'done', label: 'Booking created', date: '21 Mar, 10:00 AM' },
              { status: 'done', label: 'Proposal sent', date: '22 Mar, 11:30 AM' },
              { status: 'upcoming', label: 'Contract sent', date: 'Pending' },
            ]).map((point: any, i: number) => (
              <div key={i} className={`relative flex flex-col gap-1 ${point.status === 'upcoming' ? 'opacity-50' : ''}`}>
                <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 ${point.status === 'done' ? 'bg-primary border-primary' : 'bg-background border-muted-foreground'}`} />
                <div className="flex justify-between font-medium">
                  <span className={point.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'}>{point.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{point.date}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* FINANCE TAB */}
        <TabsContent value="finance" className="m-0 data-[state=inactive]:hidden space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-muted/10 border border-border/60 rounded-xl flex flex-col justify-center">
              <span className="text-xs text-muted-foreground">Package Value</span>
              <span className="font-semibold mt-1">₹{booking.amount || 0}</span>
            </div>
            <div className="p-3 bg-muted/10 border border-border/60 rounded-xl flex flex-col justify-center text-emerald-600 dark:text-emerald-500">
              <span className="text-xs text-emerald-600/70 dark:text-emerald-500/70">Paid</span>
              <span className="font-semibold mt-1">₹{(booking.amount || 0) * 0.4}</span>
            </div>
            <div className="p-3 bg-muted/10 border border-border/60 rounded-xl flex flex-col justify-center text-amber-600 dark:text-amber-500">
              <span className="text-xs text-amber-600/70 dark:text-amber-500/70">Balance Due</span>
              <span className="font-semibold mt-1">₹{(booking.amount || 0) * 0.6}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Payments</h3>
              <Button size="sm" variant="outline">
                <IndianRupee className="w-3 h-3 mr-1" /> Add Payment
              </Button>
            </div>
            <div className="border border-border/60 rounded-lg overflow-hidden text-sm">
              <div className="grid grid-cols-4 bg-muted/30 p-2 border-b border-border/40 font-medium text-muted-foreground text-xs">
                <div>Date</div>
                <div>Amount</div>
                <div>Method</div>
                <div className="text-right">Status</div>
              </div>
              <div className="grid grid-cols-4 p-3 border-b border-border/40 last:border-0 hover:bg-muted/10 items-center">
                <div className="text-xs">21 Mar 2026</div>
                <div className="font-medium">₹50,000</div>
                <div className="text-xs text-muted-foreground">UPI</div>
                <div className="text-right text-xs text-emerald-500">Credited</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* FILES TAB */}
        <TabsContent value="files" className="m-0 data-[state=inactive]:hidden space-y-8 text-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold uppercase tracking-wider text-xs text-muted-foreground">Deliverables</h3>
              <Button variant="ghost" size="sm" className="h-8">Sync changes</Button>
            </div>
            <div className="p-4 bg-muted/10 border border-border/60 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4 text-muted-foreground" /> Photos Gallery</div>
                <Button variant="link" size="sm" className="h-auto p-0">Not Started</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4 text-muted-foreground" /> Video Link</div>
                <Button variant="link" size="sm" className="h-auto p-0">Not Started</Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold uppercase tracking-wider text-xs text-muted-foreground">Contract & Uploads</h3>
              <Button size="sm" variant="outline" className="h-8">Upload file</Button>
            </div>
            <div className="p-4 border border-dashed border-border/60 rounded-xl text-center text-muted-foreground">
              No files uploaded yet.
            </div>
          </div>
        </TabsContent>

        {/* NOTES TAB */}
        <TabsContent value="notes" className="m-0 data-[state=inactive]:hidden h-full flex flex-col space-y-2">
          <Textarea 
            className="flex-1 w-full resize-none border-border/60 bg-muted/5 text-sm p-4 h-[300px]"
            placeholder="Add internal notes about this booking. Auto-saves on blur."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteBlur}
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{isSaving ? "Saving..." : "Last saved just now"}</span>
            <span>{note.length} characters</span>
          </div>
        </TabsContent>

      </div>
    </Tabs>
  )
}
