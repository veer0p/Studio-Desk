"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SettingsSection } from "@/components/settings/shared/SettingsSection"
import { SettingsSaveBar } from "@/components/settings/shared/SettingsSaveBar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Laptop, Smartphone, Trash2 } from "lucide-react"

const ownerSchema = z.object({
  fullName: z.string().min(1, "Name required"),
  phone: z.string().min(10, "10-digit required"),
  email: z.string().email(),
  dob: z.string().optional(),
  city: z.string().optional(),
  language: z.string()
})

const sessions = [
  { id: "s1", device: "MacBook Pro M3", browser: "Chrome 129", location: "Mumbai, India", lastActive: "Active now", isCurrent: true, type: "desktop" },
  { id: "s2", device: "iPhone 15 Pro", browser: "Safari Mobile", location: "Pune, India", lastActive: "2 hours ago", isCurrent: false, type: "mobile" }
]

export function OwnerSettings() {
  const form = useForm<z.infer<typeof ownerSchema>>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      fullName: "Rahul Sharma", phone: "9876543210", email: "rahul@studiodesk.io",
      dob: "1992-05-14", city: "Mumbai", language: "English"
    }
  })

  const { register, setValue, formState: { isDirty, isSubmitting }, handleSubmit, reset } = form

  const onSubmit = (data: any) => {
    console.log("Saving owner data:", data)
    reset(data)
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit(onSubmit)}>
        <SettingsSection title="Personal Information" description="Your core StudioDesk admin identity.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input {...register("fullName")} />
            </div>
            <div className="space-y-2">
              <Label>Email * (Log-in ID)</Label>
              <Input type="email" {...register("email")} disabled className="bg-muted/50 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground mt-1">Contact support to change your base email.</p>
            </div>
            
            <div className="space-y-2">
              <Label>Phone *</Label>
               <div className="flex">
                <span className="flex items-center px-3 border border-r-0 border-border/60 rounded-l-md bg-muted/30 text-muted-foreground text-sm">+91</span>
                <Input {...register("phone")} className="rounded-l-none" maxLength={10} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>City</Label>
              <Input {...register("city")} />
            </div>

             <div className="space-y-2 flex flex-col justify-end">
              <Label>Preferred Interface Language</Label>
              <Select onValueChange={(val) => setValue("language", val)} defaultValue={form.getValues("language")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="Marathi">Marathi (मराठी)</SelectItem>
                  <SelectItem value="Gujarati">Gujarati (ગુજરાતી)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>
        
        <SettingsSaveBar isDirty={isDirty} isSubmitting={isSubmitting} onDiscard={() => reset()} />
      </form>

      {/* Standalone sections that patch immediately completely separate from top form state bounds */}
      <SettingsSection title="Security Operations" description="Update your password ensuring strict bounds matching standard 8-char validation.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl bg-card p-6 border border-border/60 rounded-xl shadow-sm">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <Label>Current Password *</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>New Password *</Label>
            <Input type="password" placeholder="••••••••" />
            <div className="flex items-center gap-1 mt-2">
              <div className="h-1 flex-1 bg-primary rounded-full" />
              <div className="h-1 flex-1 bg-primary rounded-full" />
              <div className="h-1 flex-1 bg-primary rounded-full" />
              <div className="h-1 flex-1 bg-muted rounded-full" />
            </div>
            <p className="text-[10px] text-muted-foreground">Strong password</p>
          </div>
          <div className="space-y-2 flex flex-col">
            <Label>Confirm Password *</Label>
            <Input type="password" placeholder="••••••••" />
            <Button className="mt-auto self-start bg-zinc-900 text-white hover:bg-zinc-800">Update Password</Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Active Sessions" description="Manage devices currently logged into your StudioDesk administrator panel.">
        <div className="space-y-4 max-w-2xl bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
          <div className="flex flex-col">
            {sessions.map((s, idx) => (
              <div key={s.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-border/40 ${idx !== 0 ? 'border-t' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-muted/50 rounded-lg text-muted-foreground">
                    {s.type === 'desktop' ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground">{s.device}</p>
                      {s.isCurrent && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] uppercase tracking-widest font-bold rounded-full">Current</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.browser} • {s.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <span className="text-xs text-muted-foreground font-medium">{s.lastActive}</span>
                  {!s.isCurrent && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-muted/10 p-3 border-t border-border/40 flex justify-center">
            <Button variant="link" className="text-xs text-muted-foreground hover:text-red-500 transition-colors h-auto py-0">
              Revoke all other sessions
            </Button>
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}
