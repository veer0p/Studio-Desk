"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Copy, Plus, RefreshCw, Smartphone, AlertCircle } from "lucide-react"

export function IntegrationsSettings() {
  const [rzpConnected, setRzpConnected] = useState(false)
  const [waConnected, setWaConnected] = useState(false)
  const [gcalConnected, setGcalConnected] = useState(true) // Mocked as connected
  
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-lg font-semibold tracking-tight">External Service Integrations</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Wire StudioDesk with global authentication platforms avoiding duplicate data entry globally.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        
        {/* Razorpay Card */}
        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#02042b] rounded-lg flex items-center justify-center text-white font-bold text-xs tracking-tight shadow-sm">
                RZP
              </div>
              <div>
                <h3 className="font-semibold">Razorpay API</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Indian payment gateway processing.</p>
              </div>
            </div>
            {rzpConnected 
              ? <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] tracking-widest uppercase font-bold rounded-full">Connected</span>
              : <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] tracking-widest uppercase font-bold rounded-full">Not Connected</span>
            }
          </div>

          <div className="flex-1 mt-2">
            {!rzpConnected ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Key ID *</Label>
                  <Input placeholder="rzp_live_xxxxxxxx" />
                </div>
                <div className="space-y-2">
                  <Label>Key Secret *</Label>
                  <Input type="password" placeholder="••••••••••••••••" />
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4 bg-muted/20 rounded-xl border border-border/40">
                <div className="space-y-1.5">
                  <Label className="text-xs">Webhook Listener URL</Label>
                  <div className="flex items-center gap-2">
                    <Input readOnly value="https://api.studiodesk.io/v1/webhooks/razorpay" className="h-8 text-xs bg-background font-mono" />
                    <Button variant="outline" size="icon" className="h-8 w-8 shrink-0"><Copy className="w-4 h-4" /></Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><RefreshCw className="w-3 h-3 text-emerald-500" /> Ping received 12 mins ago.</p>
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-border/40 flex items-center justify-between">
            {!rzpConnected ? (
              <Button onClick={() => setRzpConnected(true)}>Connect Razorpay</Button>
            ) : (
              <>
                <Button variant="outline" size="sm">Test Ping</Button>
                <Button variant="link" size="sm" className="text-red-500 hover:text-red-600 p-0" onClick={() => setRzpConnected(false)}>Disconnect</Button>
              </>
            )}
          </div>
        </div>

        {/* WhatsApp Card */}
        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">WhatsApp Business</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Automated client message drips.</p>
              </div>
            </div>
             {waConnected 
              ? <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] tracking-widest uppercase font-bold rounded-full">Connected</span>
              : <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] tracking-widest uppercase font-bold rounded-full">Not Connected</span>
            }
          </div>

          <div className="flex-1 mt-2">
            {!waConnected ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number ID *</Label>
                  <Input placeholder="112233445566" />
                </div>
                <div className="space-y-2">
                  <Label>Access Token *</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center">
                <p className="text-sm text-muted-foreground">Successfully bound to Phone: <strong>+91 98765 43210</strong></p>
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-border/40 flex items-center justify-between">
            {!waConnected ? (
              <Button onClick={() => setWaConnected(true)}>Connect WhatsApp</Button>
            ) : (
              <Button variant="link" size="sm" className="text-red-500 hover:text-red-600 p-0 ml-auto" onClick={() => setWaConnected(false)}>Disconnect</Button>
            )}
          </div>
        </div>

        {/* Google Calendar */}
        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border border-border/60 rounded-lg flex items-center justify-center shadow-sm">
                <div className="w-5 h-5 bg-blue-500 rounded-sm flex items-center justify-center text-[10px] font-bold text-white tracking-tighter">31</div>
              </div>
              <div>
                <h3 className="font-semibold">Google Calendar</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Two-way shoot assignments.</p>
              </div>
            </div>
             {gcalConnected 
              ? <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] tracking-widest uppercase font-bold rounded-full">Connected</span>
              : <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] tracking-widest uppercase font-bold rounded-full">Not Connected</span>
            }
          </div>

          <div className="flex-1 mt-2">
            {gcalConnected && (
              <div className="space-y-4">
                <p className="text-sm">Bound to: <strong className="text-foreground">admin@studiodesk.io</strong></p>
                <div className="flex flex-col gap-3 p-3 bg-muted/20 border border-border/40 rounded-xl">
                  <div className="flex items-center justify-between">
                    <Label className="font-normal text-sm cursor-pointer">Sync Bookings</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between border-t border-border/40 pt-3">
                    <Label className="font-normal text-sm cursor-pointer">Sync Team Availability</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-border/40 flex items-center justify-between">
            {!gcalConnected ? (
              <Button variant="outline" className="w-full">Sign in with Google</Button>
            ) : (
              <Button variant="link" size="sm" className="text-red-500 hover:text-red-600 p-0 ml-auto" onClick={() => setGcalConnected(false)}>Disconnect</Button>
            )}
          </div>
        </div>

        {/* ShootProof Placeholder */}
        <div className="bg-muted/30 border border-border/40 rounded-xl p-6 opacity-70 flex flex-col relative overflow-hidden">
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-muted-foreground/10 text-muted-foreground text-[10px] font-bold rounded-full tracking-widest uppercase">
            Coming Soon
          </div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                SP
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">ShootProof / Pixieset</h3>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Legacy gallery migrations.</p>
              </div>
          </div>
          <div className="flex-1 max-w-[200px]">
            <p className="text-xs text-muted-foreground mt-2">Migrate existing folders tracking legacy clients perfectly inside StudioDesk architecture seamlessly.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
