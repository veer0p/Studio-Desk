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
            <h3 className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Event Details</h3>
            <div className="p-4 bg-muted/5 border border-border/60 rounded-md space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground block mb-1">Date & Time</span>
                  <div className="font-medium flex items-center gap-2 text-foreground"><CalendarIcon className="w-4 h-4 text-muted-foreground" /> <span className="font-mono text-sm tracking-widest uppercase">{booking.date}</span></div>
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground block mb-1">Venue</span>
                  <div className="font-medium flex items-center gap-2 line-clamp-1 truncate text-foreground"><MapPin className="w-4 h-4 text-muted-foreground" /> {booking.venue}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground block mb-1">Package</span>
                  <div className="font-medium text-foreground">{booking.packageInfo?.name || "Standard Wedding"}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Client Info</h3>
            <div className="p-4 bg-muted/5 border border-border/60 rounded-md space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground block mb-1">Phone</span>
                  <div className="font-mono tracking-widest text-sm text-foreground">{(booking.clientPhone || "No Phone")}</div>
                </div>
                {booking.clientPhone && (
                  <Button variant="outline" size="sm" className="rounded-sm" asChild>
                    <a href={`https://wa.me/${booking.clientPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  </Button>
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground block mb-1">Email</span>
                <div className="font-mono tracking-widest text-[11px] text-foreground">{booking.clientEmail || "client@example.com"}</div>
              </div>
              <button className="text-[11px] font-mono tracking-widest uppercase text-foreground hover:underline transition-colors mt-2">View full client profile &rarr;</button>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Team Assigned</h3>
            <div className="p-4 bg-muted/5 border border-border/60 rounded-md flex flex-col gap-3">
              {(booking.team || []).map((member: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border/40 text-[10px] font-mono tracking-widest uppercase">
                      {member.avatar ? <img src={member.avatar} className="object-cover w-full h-full" /> : <span>{member.name.charAt(0)}</span>}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-0.5">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="justify-start mt-2 border border-dashed border-border/60 rounded-sm text-[11px] font-mono tracking-widest uppercase text-muted-foreground">
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
              <div key={i} className={`relative flex flex-col gap-0.5 ${point.status === 'upcoming' ? 'opacity-50' : ''}`}>
                <div className={`absolute -left-[26px] top-1.5 w-2 h-2 rounded-sm border ${point.status === 'done' ? 'bg-foreground border-foreground' : 'bg-background border-muted-foreground'}`} />
                <div className="flex justify-between font-medium">
                  <span className={`text-sm ${point.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'}`}>{point.label}</span>
                </div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">{point.date}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* FINANCE TAB */}
        <TabsContent value="finance" className="m-0 data-[state=inactive]:hidden space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-muted/5 border border-border/60 rounded-md flex flex-col justify-center">
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Package Value</span>
              <span className="font-mono text-sm uppercase tracking-widest mt-1">₹{booking.amount || 0}</span>
            </div>
            <div className="p-3 bg-muted/5 border border-border/60 rounded-md flex flex-col justify-center">
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Paid</span>
              <span className="font-mono text-sm uppercase tracking-widest mt-1">₹{(booking.amount || 0) * 0.4}</span>
            </div>
            <div className="p-3 bg-muted/5 border border-border/60 rounded-md flex flex-col justify-center">
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Balance Due</span>
              <span className="font-mono text-sm uppercase tracking-widest mt-1">₹{(booking.amount || 0) * 0.6}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Payments</h3>
              <Button size="sm" variant="outline" className="rounded-sm text-[11px] font-mono uppercase tracking-widest h-8">
                + Add Payment
              </Button>
            </div>
            <div className="border border-border/60 rounded-md overflow-hidden text-sm">
              <div className="grid grid-cols-4 bg-muted/5 p-2 border-b border-border/60 text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                <div>Date</div>
                <div>Amount</div>
                <div>Method</div>
                <div className="text-right">Status</div>
              </div>
              <div className="grid grid-cols-4 p-3 border-b border-border/40 last:border-0 hover:bg-muted/10 items-center">
                <div className="text-[11px] font-mono tracking-widest uppercase">21 Mar 2026</div>
                <div className="font-mono text-sm tracking-widest uppercase">₹50,000</div>
                <div className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">UPI</div>
                <div className="text-right text-[11px] font-mono tracking-widest uppercase text-foreground">Credited</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* FILES TAB */}
        <TabsContent value="files" className="m-0 data-[state=inactive]:hidden space-y-8 text-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Deliverables</h3>
              <Button variant="ghost" size="sm" className="h-8 rounded-sm text-[10px] font-mono uppercase tracking-widest">Sync changes</Button>
            </div>
            <div className="p-4 bg-muted/5 border border-border/60 rounded-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5 text-muted-foreground" /> Photos Gallery</div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Not Started</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5 text-muted-foreground" /> Video Link</div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Not Started</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Contract & Uploads</h3>
              <Button size="sm" variant="outline" className="h-8 rounded-sm text-[10px] font-mono uppercase tracking-widest">Upload file</Button>
            </div>
            <div className="p-4 border border-dashed border-border/60 rounded-md text-center text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              No files uploaded yet.
            </div>
          </div>
        </TabsContent>

        {/* NOTES TAB */}
        <TabsContent value="notes" className="m-0 data-[state=inactive]:hidden h-full flex flex-col space-y-2">
          <Textarea 
            className="flex-1 w-full resize-none border-border/60 bg-muted/5 text-sm p-4 h-[300px] rounded-md shadow-none focus-visible:ring-1 focus-visible:ring-foreground/50 transition-none"
            placeholder="Add internal notes about this booking. Auto-saves on blur."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteBlur}
          />
          <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase text-muted-foreground pt-1">
            <span>{isSaving ? "Saving..." : "Last saved just now"}</span>
            <span>{note.length} characters</span>
          </div>
        </TabsContent>

      </div>
    </Tabs>
  )
}
