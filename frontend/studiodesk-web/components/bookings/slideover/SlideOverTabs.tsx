"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { BookingSummary } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect, useRef } from "react"
import { updateBookingNotes } from "@/lib/api"
import { toast } from "sonner"
import { Phone, Calendar as CalendarIcon, MapPin, Receipt, IndianRupee, Link as LinkIcon } from "lucide-react"
import { whatsappUrl } from "@/lib/phone"

export default function SlideOverTabs({ booking }: { booking: BookingSummary }) {
  const [note, setNote] = useState(booking.notes || "")
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local note state when booking prop changes (e.g., after revalidation)
  useEffect(() => {
    setNote(booking.notes || "")
    setHasUnsaved(false)
  }, [booking.notes, booking.id])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  const saveNotes = async (text: string) => {
    if (text === booking.notes) return
    setIsSaving(true)
    try {
      await updateBookingNotes(booking.id, text)
      setHasUnsaved(false)
      toast.success("Note saved")
    } catch {
      toast.error("Failed to save note")
    } finally {
      setIsSaving(false)
    }
  }

  const handleNoteChange = (text: string) => {
    setNote(text)
    setHasUnsaved(true)
    // Debounced auto-save on change (2s)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveNotes(text), 2000)
  }

  const handleNoteBlur = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (hasUnsaved) saveNotes(note)
  }

  const timeline = (booking as any).timeline as Array<{ label: string; date: string; status: string }> | undefined

  return (
    <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col h-full">
      <div className="px-4 border-b border-border/40 shrink-0">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-2 rounded-none overflow-x-auto flex-nowrap">
          <TabsTrigger value="overview" className="px-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent whitespace-nowrap">
            Overview
          </TabsTrigger>
          <TabsTrigger value="timeline" className="px-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent whitespace-nowrap">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="finance" className="px-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent whitespace-nowrap">
            Finance
          </TabsTrigger>
          <TabsTrigger value="files" className="px-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent whitespace-nowrap">
            Files
          </TabsTrigger>
          <TabsTrigger value="notes" className="px-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent whitespace-nowrap">
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
                {(() => {
                  const wa = whatsappUrl(booking.clientPhone)
                  return wa ? (
                    <Button variant="outline" size="sm" className="rounded-sm" asChild>
                      <a href={wa} target="_blank" rel="noreferrer">
                        WhatsApp
                      </a>
                    </Button>
                  ) : null
                })()}
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
                      {member.avatar ? <img src={member.avatar} className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /> : <span>{member.name?.charAt(0) || "U"}</span>}
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
          {timeline && timeline.length > 0 ? (
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-2.5 top-2 bottom-6 w-px bg-border/60" />
              {timeline.map((point: any, i: number) => (
                <div key={i} className={`relative flex flex-col gap-0.5 ${point.status === 'upcoming' ? 'opacity-50' : ''}`}>
                  <div className={`absolute -left-[26px] top-1.5 w-2 h-2 rounded-sm border ${point.status === 'done' ? 'bg-foreground border-foreground' : 'bg-background border-muted-foreground'}`} />
                  <div className="flex justify-between font-medium">
                    <span className={`text-sm ${point.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'}`}>{point.label}</span>
                  </div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">{point.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="font-medium text-foreground mb-1">No timeline activity yet</p>
              <p className="text-sm">Booking milestones will appear here as they happen.</p>
            </div>
          )}
        </TabsContent>

        {/* FINANCE TAB */}
        <TabsContent value="finance" className="m-0 data-[state=inactive]:hidden space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-muted/5 border border-border/60 rounded-md flex flex-col justify-center">
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Package Value</span>
              <span className="font-mono text-sm uppercase tracking-widest mt-1">₹{booking.amount || 0}</span>
            </div>
            <div className="p-3 bg-muted/5 border border-border/60 rounded-md flex flex-col justify-center">
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Paid</span>
              <span className="font-mono text-sm uppercase tracking-widest mt-1">₹{booking.amountPaid || 0}</span>
            </div>
            <div className="p-3 bg-muted/5 border border-border/60 rounded-md flex flex-col justify-center">
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Balance Due</span>
              <span className="font-mono text-sm uppercase tracking-widest mt-1">₹{booking.balanceDue ?? ((booking.amount || 0) - (booking.amountPaid || 0))}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">Payments</h3>
              <Button size="sm" variant="outline" className="rounded-sm text-[11px] font-mono uppercase tracking-widest h-8">
                + Add Payment
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground border border-border/60 rounded-md">
              <Receipt className="w-8 h-8 mb-2 opacity-30" />
              <p className="font-medium text-foreground mb-1">No payments recorded</p>
              <p className="text-sm">Payments will appear here once received.</p>
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
            className="w-full resize-none border-border/60 bg-muted/5 text-sm p-4 min-h-[200px] rounded-md shadow-none focus-visible:ring-1 focus-visible:ring-foreground/50 transition-none"
            placeholder="Add internal notes about this booking. Auto-saves after 2s of inactivity."
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            onBlur={handleNoteBlur}
          />
          <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase text-muted-foreground pt-1">
            <span>
              {isSaving ? "Saving..." : hasUnsaved ? "Unsaved changes" : "All changes saved"}
            </span>
            <span>{note.length} characters</span>
          </div>
        </TabsContent>

      </div>
    </Tabs>
  )
}
