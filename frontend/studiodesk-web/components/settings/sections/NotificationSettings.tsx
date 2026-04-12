"use client"

import * as React from "react"
import { useSWRConfig } from "swr"
import { AlertCircle, Check } from "lucide-react"

import { SettingsSection } from "@/components/settings/shared/SettingsSection"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NotificationChannel, NotificationType } from "@/lib/api"

type NotificationToggle = {
  id: NotificationType
  label: string
  description: string
}

const NOTIFICATION_TOGGLES: NotificationToggle[] = [
  { id: "booking_created", label: "Booking created", description: "When a new booking is confirmed" },
  { id: "payment_received", label: "Payment received", description: "When a client makes a payment" },
  { id: "gallery_ready", label: "Gallery ready", description: "When gallery is published and ready" },
  { id: "contract_signed", label: "Contract signed", description: "When a client signs a contract" },
  { id: "new_inquiry", label: "New inquiry", description: "When a new lead comes in" },
  { id: "invoice_overdue", label: "Invoice overdue", description: "When an invoice passes its due date" },
  { id: "gallery_viewed", label: "Gallery viewed", description: "When a client views their gallery" },
  { id: "photo_selection_submitted", label: "Photos selected", description: "When a client submits photo selections" },
  { id: "team_invite_accepted", label: "Team invite accepted", description: "When a team member accepts an invite" },
]

type ChannelKey = NotificationChannel

type PreferenceMap = Record<NotificationType, Record<ChannelKey, boolean>>

function buildDefaultPreferences(): PreferenceMap {
  const prefs: Partial<PreferenceMap> = {}
  for (const toggle of NOTIFICATION_TOGGLES) {
    prefs[toggle.id] = {
      in_app: true,
      email: true,
      whatsapp: false,
    }
  }
  return prefs as PreferenceMap
}

export function NotificationSettings() {
  const [preferences, setPreferences] = React.useState<PreferenceMap>(buildDefaultPreferences)
  const [primaryEmail, setPrimaryEmail] = React.useState("")
  const [ccEmail, setCcEmail] = React.useState("")
  const [saving, setSaving] = React.useState<Record<string, boolean>>({})
  const [savedFlash, setSavedFlash] = React.useState<string | null>(null)
  const [hasWhatsApp] = React.useState(false)

  // In production, load from API on mount:
  // const { data } = useSWR('/api/v1/settings/notifications', fetcher)

  const toggleChannel = React.useCallback(
    (typeId: NotificationType, channel: ChannelKey) => {
      setPreferences((prev) => ({
        ...prev,
        [typeId]: {
          ...prev[typeId],
          [channel]: !prev[typeId]?.[channel],
        },
      }))
      scheduleSave(typeId)
    },
    []
  )

  const scheduleSave = React.useCallback((key: string) => {
    setSaving((prev) => ({ ...prev, [key]: true }))
    // Debounce — in production, POST to /api/v1/settings/notifications
    setTimeout(() => {
      setSavedFlash(key)
      setSaving((prev) => ({ ...prev, [key]: false }))
      setTimeout(() => setSavedFlash(null), 1500)
    }, 400)
  }, [])

  return (
    <div className="space-y-2">
      <SettingsSection
        title="Administrator Ping Destinations"
        description="Determine where to send critical backend alerts tracking operational bottlenecks seamlessly."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl bg-card border border-border/60 p-6 rounded-xl shadow-sm relative">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold tracking-widest uppercase px-2 py-0.5">
            {savedFlash ? (
              <>
                <Check className="h-3 w-3 text-emerald-500" /> Saved
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" /> Auto-saved
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>Primary Notification Email *</Label>
            <Input
              type="email"
              value={primaryEmail}
              onChange={(e) => setPrimaryEmail(e.target.value)}
              placeholder="owner@studiodesk.io"
              className="rounded-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>
              CC Email <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
            </Label>
            <Input
              type="email"
              value={ccEmail}
              onChange={(e) => setCcEmail(e.target.value)}
              placeholder="manager@studiodesk.io"
              className="rounded-sm"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Per-type channel toggles */}
      <SettingsSection
        title="Notification Preferences"
        description="Choose which events trigger notifications and through which channels."
      >
        <div className="space-y-3 max-w-3xl">
          {/* Column headers */}
          <div className="grid grid-cols-12 gap-4 px-4 pb-2 text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
            <div className="col-span-5 sm:col-span-6">Event</div>
            <div className="col-span-2 text-center">In-App</div>
            <div className="col-span-2 text-center">Email</div>
            <div className="col-span-2 text-center">WhatsApp</div>
            <div className="col-span-1" />
          </div>

          {NOTIFICATION_TOGGLES.map((toggle) => {
            const prefs = preferences[toggle.id]
            return (
              <div
                key={toggle.id}
                className="grid grid-cols-12 gap-4 items-center px-4 py-2.5 bg-card border border-border/40 rounded-sm"
              >
                <div className="col-span-5 sm:col-span-6 min-w-0">
                  <p className="text-sm font-medium truncate">{toggle.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{toggle.description}</p>
                </div>

                <div className="col-span-2 flex justify-center">
                  <Switch
                    checked={prefs?.in_app ?? true}
                    onCheckedChange={() => toggleChannel(toggle.id, "in_app")}
                  />
                </div>

                <div className="col-span-2 flex justify-center">
                  <Switch
                    checked={prefs?.email ?? true}
                    onCheckedChange={() => toggleChannel(toggle.id, "email")}
                  />
                </div>

                <div className="col-span-2 flex justify-center">
                  <Switch
                    checked={prefs?.whatsapp ?? false}
                    disabled={!hasWhatsApp}
                    onCheckedChange={() => toggleChannel(toggle.id, "whatsapp")}
                  />
                </div>

                <div className="col-span-1 flex justify-center">
                  {saving[toggle.id] && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </SettingsSection>

      {!hasWhatsApp && (
        <SettingsSection
          title="WhatsApp Alerts"
          description="Native real-time pinging ensuring high-priority visibility natively."
        >
          <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-sm p-4 flex gap-3 text-amber-700/80">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-400">Requires Integration</p>
              <p className="mt-0.5">
                Connect the official WhatsApp Business REST API inside your Integrations configurations before turning on Webhook constraints.
              </p>
            </div>
          </div>
        </SettingsSection>
      )}

      <SettingsSection
        title="Automated Client Drip Sequences"
        description="Determine what gets sent automatically to clients building native CSAT metrics intelligently."
      >
        <div className="space-y-3 max-w-3xl">
          <ClientDripRow title="Booking confirmation" immediate />
          <ClientDripRow title="Pre-shoot reminder" before options={["1 Day", "2 Days", "3 Days", "7 Days"]} def="2 Days" />
          <ClientDripRow title="Post-shoot thank you" after options={["2 Hours", "4 Hours", "24 Hours"]} def="24 Hours" />
          <ClientDripRow title="Gallery ready notification" immediate />
          <ClientDripRow title="Payment reminder" before options={["1 Day", "3 Days", "7 Days"]} def="3 Days" />
          <ClientDripRow title="Review request" after options={["3 Days", "7 Days", "14 Days"]} def="7 Days" />
        </div>
      </SettingsSection>
    </div>
  )
}

function ClientDripRow({
  title,
  immediate,
  before,
  after,
  options,
  def,
}: {
  title: string
  immediate?: boolean
  before?: boolean
  after?: boolean
  options?: string[]
  def?: string
}) {
  const [enabled, setEnabled] = React.useState(Math.random() > 0.5)
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card border border-border/60 rounded-sm shadow-sm gap-4">
      <div>
        <h4 className="font-semibold text-sm tracking-tight">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {immediate
            ? "Dispatched explicitly without delay bounds."
            : `Calculated ${before ? "prior to" : "after"} relative event timestamp.`}
        </p>
      </div>
      <div className="flex items-center gap-4 border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0">
        {options && (
          <Select defaultValue={def}>
            <SelectTrigger className="w-[120px] h-8 bg-background rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {immediate && (
          <div className="px-3 py-1 bg-muted rounded-sm text-xs font-medium text-muted-foreground">
            Immediate
          </div>
        )}
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>
    </div>
  )
}
