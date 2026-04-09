"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { fetchGalleryDetail, updateGallerySettings } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ShieldAlert, DownloadCloud, CheckCircle2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DeliverySettings({ galleryId }: { galleryId: string }) {
  const router = useRouter()
  const { data: gallery, isLoading } = useSWR(`/api/v1/galleries/${galleryId}`, fetchGalleryDetail)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [accessType, setAccessType] = useState("public")
  const [allowDownload, setAllowDownload] = useState(true)
  const [expiryDate, setExpiryDate] = useState("")
  const [galleryName, setGalleryName] = useState("")

  if (gallery) {
    if (!galleryName) setGalleryName(gallery.name || "")
    if (accessType === "public" && gallery.accessType) setAccessType(gallery.accessType === "pin_protected" ? "pin" : "public")
    if (gallery.shootDate && !expiryDate) setExpiryDate("")
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)
    try {
      const updates: Record<string, unknown> = {}
      if (galleryName !== gallery?.name) updates.name = galleryName

      if (Object.keys(updates).length > 0) {
        await updateGallerySettings(galleryId, updates)
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } catch (err) {
      console.error("Failed to save settings:", err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 animate-pulse text-muted-foreground font-mono tracking-widest uppercase text-xs">Loading Settings...</div>
  }

  return (
    <div className="w-full h-full p-8 max-w-4xl mx-auto space-y-8 pb-32">

      {saved && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 p-4 rounded-md border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Settings saved successfully
        </div>
      )}

      <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 bg-muted/20 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Access Control</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Access Type</Label>
            <Select value={accessType} onValueChange={setAccessType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public Link</SelectItem>
                <SelectItem value="pin">PIN Protected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Gallery Name</Label>
            <Input value={galleryName} onChange={(e) => setGalleryName(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 bg-muted/20 flex items-center gap-2">
          <DownloadCloud className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Client Permissions</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Allow Downloads</Label>
              <p className="text-sm text-muted-foreground">Clients can download assets locally.</p>
            </div>
            <Switch checked={allowDownload} onCheckedChange={setAllowDownload} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

    </div>
  )
}
