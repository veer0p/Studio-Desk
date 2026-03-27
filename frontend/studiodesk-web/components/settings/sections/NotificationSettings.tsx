"use client"

import { useState } from "react"
import { SettingsSection } from "@/components/settings/shared/SettingsSection"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, AlertCircle } from "lucide-react"

// Real app would likely auto-save toggles or use identical RHF structure.
// Building quick decoupled UI for toggles indicating auto-save functionality seamlessly.
export function NotificationSettings() {
  const [hasWhatsApp] = useState(false)

  const triggers = [
    { id: "newInq", label: "New inquiry received" },
    { id: "bkConf", label: "Booking confirmed" },
    { id: "sgnCont", label: "Contract signed by client" },
    { id: "payRec", label: "Payment received" },
    { id: "invOver", label: "Invoice overdue" },
    { id: "galView", label: "Gallery viewed by client" },
    { id: "photoSel", label: "Client submitted photo selection" },
    { id: "tmInv", label: "Team member accepted invite" },
    { id: "wkSum", label: "Weekly summary report (Monday)" }
  ]

  const clientPings = [
    { title: "Booking confirmation message", immediate: true },
    { title: "Pre-shoot reminder", before: true, options: ["1 Day", "2 Days", "3 Days", "7 Days"], def: "2 Days" },
    { title: "Post-shoot thank you", before: false, options: ["2 Hours", "4 Hours", "24 Hours"], def: "24 Hours" },
    { title: "Gallery ready notification", immediate: true },
    { title: "Payment reminder", before: true, options: ["1 Day", "3 Days", "7 Days"], def: "3 Days" },
    { title: "Review request", before: false, options: ["3 Days", "7 Days", "14 Days"], def: "7 Days" }
  ]

  return (
    <div className="space-y-2">
      <SettingsSection title="Administrator Ping Destinations" description="Determine where to send critical backend alerts tracking operational bottlenecks seamlessly.">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl bg-card border border-border/60 p-6 rounded-xl shadow-sm relative">
           <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold tracking-widest uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
             <CheckCircle2 className="w-3 h-3" /> Auto-saved
           </div>

           <div className="space-y-2">
             <Label>Primary Notification Email *</Label>
             <Input defaultValue="owner@studiodesk.io" />
           </div>
           <div className="space-y-2">
             <Label>CC Email <span className="text-muted-foreground font-normal ml-1">(Optional)</span></Label>
             <Input placeholder="manager@studiodesk.io" />
           </div>
         </div>
      </SettingsSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 max-w-5xl">
        <SettingsSection title="Email Alerts" description="Traditional TCP constraints routing to your exact inbox safely.">
          <div className="space-y-4 max-w-md">
            {triggers.map(t => (
               <div key={`email-${t.id}`} className="flex items-center justify-between gap-4">
                 <Label className="font-normal text-muted-foreground cursor-pointer text-sm">{t.label}</Label>
                 <Switch defaultChecked={['newInq', 'payRec', 'photoSel'].includes(t.id)} />
               </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection title="WhatsApp Alerts" description="Native real-time pinging ensuring high-priority visibility natively.">
          
          {!hasWhatsApp && (
            <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-700/80">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-amber-800">Requires Integration</p>
                <p className="mt-0.5">Connect the official WhatsApp Business REST API inside your Integrations configurations securely before turning on Webhook constraints.</p>
              </div>
            </div>
          )}

          <div className="space-y-4 max-w-md opacity-50 cursor-not-allowed">
            {triggers.map(t => (
               <div key={`wa-${t.id}`} className="flex items-center justify-between gap-4 pointer-events-none">
                 <Label className="font-normal text-muted-foreground text-sm">{t.label}</Label>
                 <Switch disabled />
               </div>
            ))}
          </div>
        </SettingsSection>
      </div>

      <SettingsSection title="Automated Client Drip Sequences" description="Determine what gets sent automatically to clients building native CSAT metrics intelligently.">
        <div className="space-y-4 max-w-3xl">
          {clientPings.map((c, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card border border-border/60 rounded-xl shadow-sm gap-4">
               <div>
                  <h4 className="font-semibold text-sm tracking-tight">{c.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.immediate ? "Dispatched explicitly without delay bounds." : `Calculated ${c.before ? 'prior to' : 'after'} relative event timestamp.`}
                  </p>
               </div>
               
               <div className="flex items-center gap-4 border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0">
                  {c.options && (
                    <Select defaultValue={c.def}>
                      <SelectTrigger className="w-[120px] h-8 bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {c.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {c.immediate && <div className="px-3 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground">Immediate</div>}
                  <Switch defaultChecked={i % 2 === 0} />
               </div>
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  )
}
