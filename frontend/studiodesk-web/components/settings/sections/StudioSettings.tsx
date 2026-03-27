"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SettingsSection } from "@/components/settings/shared/SettingsSection"
import { SettingsSaveBar } from "@/components/settings/shared/SettingsSaveBar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
]

const studioSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  tagline: z.string().max(120).optional(),
  about: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Must be 6 digits"),
  
  phone: z.string().min(10, "10-digit phone required"),
  whatsappSameAsPhone: z.boolean(),
  whatsapp: z.string().optional(),
  email: z.string().email(),

  workDays: z.array(z.string()),
  startTime: z.string(),
  endTime: z.string()
})

export function StudioSettings() {
  const form = useForm<z.infer<typeof studioSchema>>({
    resolver: zodResolver(studioSchema),
    defaultValues: {
      name: "StudioDesk Defaults", type: "Full Production", tagline: "Capturing eternity.",
      about: "We are a premium wedding and commercial production house based in Mumbai.",
      website: "https://studiodesk.io", instagram: "@studiodesk", facebook: "studiodesk",
      address1: "101, Media Hub", address2: "Andheri West", city: "Mumbai", state: "Maharashtra", pincode: "400053",
      phone: "9876543210", whatsappSameAsPhone: true, whatsapp: "9876543210", email: "hello@studiodesk.io",
      workDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      startTime: "06:00", endTime: "21:00"
    }
  })

  const { register, watch, setValue, formState: { isDirty, isSubmitting }, handleSubmit, reset } = form

  const onSubmit = (data: any) => {
    console.log("Saving studio data:", data)
    reset(data) // Reset form to new values, clearing isDirty
  }

  const wAppSame = watch("whatsappSameAsPhone")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      
      <SettingsSection title="Studio Identity" description="Basic information that represents your brand publicly and on invoices.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Studio Name *</Label>
            <Input {...register("name")} />
          </div>
          <div className="space-y-2 flex flex-col justify-end">
            <Label>Studio Type *</Label>
            <Select onValueChange={(val) => setValue("type", val)} defaultValue={form.getValues("type")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Photography">Photography</SelectItem>
                <SelectItem value="Videography">Videography</SelectItem>
                <SelectItem value="Photo + Video">Photo + Video</SelectItem>
                <SelectItem value="Full Production">Full Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tagline <span className="text-muted-foreground font-normal ml-1">(Max 120 chars)</span></Label>
          <Input {...register("tagline")} />
        </div>

        <div className="space-y-2">
          <Label>About / Bio</Label>
          <Textarea className="min-h-[100px]" {...register("about")} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/40">
          <div className="space-y-2">
            <Label>Website URL</Label>
            <Input {...register("website")} placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label>Instagram Handle</Label>
            <Input {...register("instagram")} placeholder="@handle" />
          </div>
          <div className="space-y-2">
            <Label>Facebook Page</Label>
            <Input {...register("facebook")} />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Location" description="The registered address of your studio. This appears on invoices.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Address Line 1 *</Label>
            <Input {...register("address1")} />
          </div>
          <div className="space-y-2">
            <Label>Address Line 2</Label>
            <Input {...register("address2")} />
          </div>
          <div className="space-y-2">
            <Label>City *</Label>
            <Input {...register("city")} />
          </div>
          <div className="space-y-2 flex flex-col justify-end">
            <Label>State *</Label>
            <Select onValueChange={(val) => setValue("state", val)} defaultValue={form.getValues("state")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {indianStates.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>PIN Code *</Label>
            <Input {...register("pincode")} maxLength={6} />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input disabled value="India" />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Contact Information" description="How clients and StudioDesk platform operations will reach you.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Primary Phone *</Label>
            <div className="flex">
              <span className="flex items-center px-3 border border-r-0 border-border/60 rounded-l-md bg-muted/30 text-muted-foreground text-sm">+91</span>
              <Input {...register("phone")} className="rounded-l-none" maxLength={10} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Support Email</Label>
            <Input type="email" {...register("email")} />
          </div>
        </div>
        
        <div className="p-4 bg-muted/20 border border-border/60 rounded-xl max-w-md mt-4">
          <div className="flex items-center justify-between mb-4">
            <Label>WhatsApp Number</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Same as primary</span>
              <Switch checked={wAppSame} onCheckedChange={(val) => setValue("whatsappSameAsPhone", val)} />
            </div>
          </div>
          {!wAppSame && (
            <div className="flex animate-in fade-in slide-in-from-top-2">
              <span className="flex items-center px-3 border border-r-0 border-border/60 rounded-l-md bg-muted/30 text-muted-foreground text-sm">+91</span>
              <Input {...register("whatsapp")} className="rounded-l-none" maxLength={10} />
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Working Hours" description="Used for scheduling and availability checks against your Team assignments.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 flex flex-col justify-end">
            <Label>Shoot Start Time</Label>
            <Input type="time" {...register("startTime")} />
          </div>
          <div className="space-y-2 flex flex-col justify-end">
            <Label>Shoot End Time</Label>
            <Input type="time" {...register("endTime")} />
          </div>
        </div>
      </SettingsSection>

      <SettingsSaveBar 
        isDirty={isDirty} 
        isSubmitting={isSubmitting} 
        onDiscard={() => reset()} 
      />
    </form>
  )
}
