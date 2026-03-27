"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ShieldAlert, DownloadCloud, PenTool, Image as ImageIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DeliverySettings() {
  return (
    <div className="w-full h-full p-8 max-w-4xl mx-auto space-y-8 pb-32">
      
      <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 bg-muted/20 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Access Control & Security</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Access Type</Label>
            <Select defaultValue="pin">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public Link</SelectItem>
                <SelectItem value="pin">PIN Protected</SelectItem>
                <SelectItem value="private">Private (Invite Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>4-Digit PIN</Label>
            <Input defaultValue="1928" maxLength={4} className="font-mono tracking-widest" />
          </div>
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Input type="date" defaultValue="2025-11-12" />
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
            <Select defaultValue="high">
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Resolution (Original)</SelectItem>
                <SelectItem value="web">Web Resolution (2048px)</SelectItem>
                <SelectItem value="none">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <div className="space-y-0.5">
              <Label className="text-base">Photo Selection Mode</Label>
              <p className="text-sm text-muted-foreground">Clients can star photos for album printing.</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <div className="space-y-0.5">
              <Label>Selection Limit</Label>
              <p className="text-sm text-muted-foreground">Maximum photos clients can select.</p>
            </div>
            <Input type="number" defaultValue="100" className="w-[180px]" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 bg-muted/20 flex items-center gap-2">
          <PenTool className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Watermarking</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Watermark</Label>
              <p className="text-sm text-muted-foreground">Apply watermark to web-resolution images.</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40">
            <div className="space-y-2">
              <Label>Watermark Text</Label>
              <Input defaultValue="StudioDesk Photography" />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Select defaultValue="center">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="tiled">Tiled Diagonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Discard Changes</Button>
        <Button>Save Settings</Button>
      </div>

    </div>
  )
}
