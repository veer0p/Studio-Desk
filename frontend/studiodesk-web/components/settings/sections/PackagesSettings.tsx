"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SettingsSection } from "@/components/settings/shared/SettingsSection"
import { SettingsSaveBar } from "@/components/settings/shared/SettingsSaveBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"

const mockPackages = [
  { id: "p1", name: "Premium Wedding Combo", type: "Photo + Video", duration: "12", price: 150000, active: true, inc: "2 Cinematographers, 2 Photographers, Drone" },
  { id: "p2", name: "Pre-Wedding Shoot", type: "Photography", duration: "8", price: 45000, active: true, inc: "1 Photographer, 4 locations, Wardrobe guidance" },
  { id: "p3", name: "Corporate Event Standard", type: "Photo + Video", duration: "6", price: 65000, active: false, inc: "1 Photo, 1 Video, Same-day edit" }
]

const packageSchema = z.object({
  name: z.string().min(1, "Name required"),
  type: z.string().min(1, "Type required"),
  duration: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
  deposit: z.coerce.number().min(0),
  inclusions: z.string(),
  deliverables: z.string(),
  terms: z.string(),
  active: z.boolean()
})

const defaultSchema = z.object({
  advancePct: z.coerce.number().min(0).max(100),
  gstRate: z.string(),
  terms: z.string()
})

export function PackagesSettings() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingPkg, setEditingPkg] = useState<string | null>(null)

  const defaultForm = useForm<z.infer<typeof defaultSchema>>({
    resolver: zodResolver(defaultSchema) as any,
    defaultValues: {
      advancePct: 50, gstRate: "18%", terms: "50% advance at time of booking to block dates. Balance 7 days before the event."
    }
  })

  const pkgForm = useForm<z.infer<typeof packageSchema>>({
    resolver: zodResolver(packageSchema) as any,
    defaultValues: {
      name: "", type: "Photo + Video", duration: 8, price: 50000, deposit: 25000,
      inclusions: "", deliverables: "", terms: "", active: true
    }
  })

  const handleEdit = (id: string) => {
    setEditingPkg(id)
    // In real app, populate pkgForm with matching mockPackages[id]
    setSheetOpen(true)
  }

  const handleAddNew = () => {
    setEditingPkg(null)
    pkgForm.reset({
      name: "", type: "Photo + Video", duration: 8, price: 50000, deposit: 25000,
      inclusions: "", deliverables: "", terms: "", active: true
    })
    setSheetOpen(true)
  }

  const handleSaveDefaults = (data: any) => {
    console.log("Saving defaults", data)
    defaultForm.reset(data)
  }

  const handleSavePackage = (data: any) => {
    console.log("Saving package", data)
    setSheetOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Standardized Packages</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Define generic bounds injecting natively into quotes.</p>
        </div>
        <Button onClick={handleAddNew}><Plus className="w-4 h-4 mr-2" /> Add Package</Button>
      </div>

      <div className="space-y-3 pb-8">
        {mockPackages.map(pkg => (
          <div key={pkg.id} className="bg-card border border-border/60 rounded-xl p-4 shadow-sm flex items-center justify-between group transition-colors hover:border-border">
            <div className="flex items-center gap-4 flex-1">
              <GripVertical className="w-5 h-5 text-muted-foreground/30 cursor-grab hover:text-foreground transition-colors" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground tracking-tight">{pkg.name}</h4>
                  <span className="px-2 py-0.5 bg-muted rounded-md text-[10px] font-medium text-muted-foreground uppercase">{pkg.type}</span>
                  {!pkg.active && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-md text-[10px] font-bold uppercase">Inactive</span>}
                </div>
                <p className="text-sm text-muted-foreground truncate max-w-[300px] md:max-w-md">{pkg.inc}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-foreground font-mono">₹{pkg.price.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted-foreground">{pkg.duration} Hours</p>
              </div>
              
              <div className="flex items-center gap-2 border-l border-border/60 pl-6">
                <Switch checked={pkg.active} />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(pkg.id)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={defaultForm.handleSubmit(handleSaveDefaults)}>
        <SettingsSection title="Global Package Defaults" description="These settings pre-fill when generating new quotes and invoices.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
             <div className="space-y-2">
              <Label>Default Advance Booking (%)</Label>
              <Input type="number" {...defaultForm.register("advancePct")} />
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <Label>Default India GST Rate</Label>
              <Select onValueChange={(val) => defaultForm.setValue("gstRate", val)} defaultValue={defaultForm.getValues("gstRate")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0%">0% (Exempt)</SelectItem>
                  <SelectItem value="5%">5%</SelectItem>
                  <SelectItem value="12%">12%</SelectItem>
                  <SelectItem value="18%">18% (Standard Photography / SAC 998386)</SelectItem>
                  <SelectItem value="28%">28%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>Default Payment Terms</Label>
              <Textarea className="min-h-[80px]" {...defaultForm.register("terms")} />
            </div>
          </div>
        </SettingsSection>
        <SettingsSaveBar isDirty={defaultForm.formState.isDirty} isSubmitting={defaultForm.formState.isSubmitting} onDiscard={() => defaultForm.reset()} />
      </form>

      {/* Slide-over Package Form */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto custom-scrollbar">
          <SheetHeader>
            <SheetTitle>{editingPkg ? "Edit Package" : "Create New Package"}</SheetTitle>
            <SheetDescription>Configure accurate quotes resolving standard pricing layouts inherently.</SheetDescription>
          </SheetHeader>

          <form onSubmit={pkgForm.handleSubmit(handleSavePackage)} className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>Package Name *</Label>
              <Input {...pkgForm.register("name")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2 flex flex-col justify-end">
                <Label>Event Type *</Label>
                <Select onValueChange={(val) => pkgForm.setValue("type", val)} defaultValue={pkgForm.getValues("type")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Photography">Photography only</SelectItem>
                    <SelectItem value="Videography">Videography only</SelectItem>
                    <SelectItem value="Photo + Video">Photo + Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (Hours)</Label>
                <Input type="number" {...pkgForm.register("duration")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Price (₹) *</Label>
                <Input type="number" {...pkgForm.register("price")} />
              </div>
              <div className="space-y-2">
                <Label>Deposit Required (₹)</Label>
                <Input type="number" {...pkgForm.register("deposit")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Inclusions (What's covered?)</Label>
              <Textarea className="min-h-[80px]" placeholder="e.g. 2 Photographers, 1 Drone Operator..." {...pkgForm.register("inclusions")} />
            </div>

            <div className="space-y-2">
              <Label>Deliverables (What does the client get?)</Label>
              <Textarea className="min-h-[80px]" placeholder="e.g. 500 Edited Photos, 4 Min Cinematic Teaser..." {...pkgForm.register("deliverables")} />
            </div>
            
            <div className="space-y-2">
              <Label>Terms & Notes</Label>
              <Textarea className="min-h-[60px]" {...pkgForm.register("terms")} />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/60 rounded-xl">
              <div>
                <Label className="text-base">Active Status</Label>
                <p className="text-xs text-muted-foreground mt-1">Inactive packages don't appear in new proposals.</p>
              </div>
              <Switch checked={pkgForm.watch("active")} onCheckedChange={(val) => pkgForm.setValue("active", val)} />
            </div>

            <SheetFooter className="pb-8">
              <Button variant="ghost" type="button" onClick={() => setSheetOpen(false)}>Cancel</Button>
              <Button type="submit">Save Package</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

    </div>
  )
}
