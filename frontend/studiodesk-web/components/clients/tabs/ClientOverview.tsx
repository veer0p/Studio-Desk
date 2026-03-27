"use client"

import { useState } from "react"
import { useSWRConfig } from "swr"
import { updateClientNotes } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Mail, Phone, CalendarDays, ExternalLink, Gift, HeartHandshake } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const formatAmount = (amt: number) => {
  if (!amt) return "₹0"
  if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`
  if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`
  return `₹${amt}`
}

export function ClientOverview({ client }: { client: any }) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [internalNotes, setInternalNotes] = useState(client.notes || "")
  const [isSavingNote, setIsSavingNote] = useState(false)

  const handleNotesBlur = async () => {
    if (internalNotes === client.notes) return // No change
    if (!client.id) return

    setIsSavingNote(true)
    try {
      await updateClientNotes(client.id, internalNotes)
      toast.success("Notes saved")
      mutate(`/api/v1/clients/${client.id}`)
    } catch (error) {
      toast.error("Failed to save notes")
    } finally {
      setIsSavingNote(false)
    }
  }

  const outstandingBalance = (client.totalInvoiced || 0) - (client.totalPaid || 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
      
      {/* LEFT COLUMN */}
      <div className="space-y-6">
        
        {/* Personal Info Card */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <a href={`tel:${client.phone}`} className="font-medium hover:text-primary transition-colors">
                  {client.phone || "No phone"}
                </a>
                {client.whatsapp && client.whatsapp !== client.phone && (
                  <span className="text-xs text-muted-foreground flex items-center mt-1">
                    WA: {client.whatsapp}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              {client.email ? (
                <a href={`mailto:${client.email}`} className="font-medium hover:text-primary transition-colors truncate">
                  {client.email}
                </a>
              ) : (
                <span className="text-muted-foreground">No email provided</span>
              )}
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className={client.city ? "font-medium" : "text-muted-foreground"}>
                {client.city || "No location provided"}
              </span>
            </div>

            {(client.date_of_birth || client.anniversary) && (
              <div className="pt-3 border-t border-border/40 mt-3 grid grid-cols-2 gap-2">
                {client.date_of_birth && (
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">DOB:</span>
                    <span className="font-medium">{client.date_of_birth}</span>
                  </div>
                )}
                {client.anniversary && (
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Anniv:</span>
                    <span className="font-medium">{client.anniversary}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source & Tags Card */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Origin & Labeling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="text-muted-foreground">Source</span>
              <span className="font-medium">{client.source || "Direct"}</span>
            </div>
            
            {client.source === "Referral" && client.referred_by && (
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-muted-foreground">Referred By</span>
                <span className="font-medium text-emerald-600 cursor-pointer hover:underline items-center inline-flex">
                  {client.referred_by} <ExternalLink className="w-3 h-3 ml-1" />
                </span>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="text-muted-foreground">Client Since</span>
              <div className="flex items-center gap-1.5 font-medium">
                <CalendarDays className="w-3 h-3 text-muted-foreground" />
                {client.created_at ? new Date(client.created_at).toLocaleDateString() : "Just now"}
              </div>
            </div>

            <div className="flex flex-col pt-1">
              <span className="text-muted-foreground mb-2">Applied Tags</span>
              {client.tags && client.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag: string, i: number) => (
                    <span key={i} className="px-1.5 py-0.5 rounded-sm bg-muted border border-border/40 text-[9px] font-mono tracking-widest uppercase text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground italic text-xs">No tags applied yet.</span>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-6">

        {/* Quick Stats Card */}
        <Card className="border-border/60 shadow-sm bg-muted/20">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x divide-y divide-border/40 text-sm">
              <div className="p-4 flex flex-col">
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">Total Bookings</span>
                <span className="font-mono tracking-widest text-[11px] uppercase text-foreground">{client.bookingsCount || 0}</span>
              </div>
              <div className="p-4 flex flex-col">
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">Completed</span>
                <span className="font-mono tracking-widest text-[11px] uppercase text-foreground">{client.completedBookings || 0}</span>
              </div>
              <div className="p-4 flex flex-col">
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">Total Paid</span>
                <span className="font-mono tracking-widest text-[11px] uppercase text-foreground">{formatAmount(client.totalPaid || 0)}</span>
              </div>
              <div className="p-4 flex flex-col">
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">Outstanding</span>
                <span className={`font-mono tracking-widest text-[11px] uppercase ${outstandingBalance > 0 ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                  {formatAmount(outstandingBalance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Internal Notes Card */}
        <Card className="border-border/60 shadow-sm flex flex-col">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Internal Notes
            </CardTitle>
            {isSavingNote && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
          </CardHeader>
          <CardContent className="flex-1">
            <Textarea 
              placeholder="Private notes about client preferences, family members, specific requests..."
              className="min-h-[140px] resize-none border-dashed bg-muted/10 focus-visible:ring-1"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              onBlur={handleNotesBlur}
            />
          </CardContent>
        </Card>

        {/* Referrals Card */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Network Effect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-4">
            {client.referred_clients && client.referred_clients.length > 0 ? (
              <div className="flex flex-col space-y-2 text-sm">
                <span className="text-muted-foreground mb-1">
                  Referred <strong className="text-foreground">{client.referred_clients.length}</strong> clients:
                </span>
                {client.referred_clients.map((rc: any) => (
                  <div key={rc.id} className="flex items-center justify-between p-2 rounded-md bg-muted/40 hover:bg-muted/80 transition-colors cursor-pointer" onClick={() => router.push(`/clients/${rc.id}`)}>
                    <span className="font-medium text-foreground">{rc.name}</span>
                    <span className="text-xs text-muted-foreground">{rc.date || "Unknown date"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <HeartHandshake className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                This client hasn't referred anyone yet.
              </div>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
