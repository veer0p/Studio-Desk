"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SettingsSection } from "@/components/settings/shared/SettingsSection"
import { SettingsSaveBar } from "@/components/settings/shared/SettingsSaveBar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Coffee, Car, Plane, Hotel, Eye, EyeOff, Plus, Trash2 } from "lucide-react"

const indianStates = [
  "Maharashtra", "Karnataka", "Delhi", "Gujarat", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"
]

const financeSchema = z.object({
  gstRegistered: z.boolean(),
  // Strict 15 char GST regex validation structurally required natively in India
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN Format").optional(),
  businessName: z.string().optional(),
  stateReg: z.string().optional(),
  sacCode: z.string().min(4, "Min 4 digits for SAC/HSN"),
  defGstRate: z.string(),
  tdsEnabled: z.boolean(),
  defaultTdsRate: z.string().optional(),
  
  accName: z.string().min(1, "Account Name required"),
  bankName: z.string().min(1, "Bank Name required"),
  accNumber: z.string().min(8, "Valid Acct Num required"),
  // Strict 11 char IFSC matching standard bounds
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code. Must be 11 chars, 5th char '0'"),
  branch: z.string().optional(),
  upi: z.string().min(3, "UPI ID required"),

  invPrefix: z.string(),
  startNumber: z.coerce.number().min(1),
  dueDefault: z.string(),
  customDays: z.coerce.number().optional(),
  footerNote: z.string(),
  showBank: z.boolean(),
  showUpi: z.boolean()
})

const expenseCats = [
  { id: "e1", name: "Travel & Cabs", icon: Car },
  { id: "e2", name: "Flights", icon: Plane },
  { id: "e3", name: "Accommodation", icon: Hotel },
  { id: "e4", name: "Meals & Coffee", icon: Coffee },
]

export function FinanceSettings() {
  const form = useForm<z.infer<typeof financeSchema>>({
    resolver: zodResolver(financeSchema) as any,
    defaultValues: {
      gstRegistered: true, gstin: "27AADCS5408M1ZN", businessName: "StudioDesk Productions LLP",
      stateReg: "Maharashtra", sacCode: "998386", defGstRate: "18%",
      tdsEnabled: false, defaultTdsRate: "10%",
      
      accName: "StudioDesk Productions", bankName: "HDFC Bank", accNumber: "50200012345678",
      ifsc: "HDFC0001234", branch: "Andheri West", upi: "studiodesk@hdfc",

      invPrefix: "INV-", startNumber: 128, dueDefault: "Net 15", footerNote: "Thank you for creating with StudioDesk. Overdue payments incur 1.5% monthly interest.",
      showBank: true, showUpi: true
    }
  })

  const { register, watch, setValue, formState: { isDirty, isSubmitting, errors }, handleSubmit, reset } = form

  const onSubmit = (data: any) => {
    console.log("Saving finance limits:", data)
    reset(data)
  }

  const wGst = watch("gstRegistered")
  const wTds = watch("tdsEnabled")
  const wDue = watch("dueDefault")

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit(onSubmit)}>
        
        <SettingsSection title="GST Configuration" description="Critical parameters enforcing strict compliance with the Indian Goods & Services Tax systems mapping correctly onto generated Invoices.">
          <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/60 rounded-xl mb-4">
            <div>
              <Label className="text-base font-semibold">GST Registered</Label>
              <p className="text-sm text-muted-foreground mt-0.5">Toggle to enable tax generation on invoices automatically.</p>
            </div>
            <Switch checked={wGst} onCheckedChange={(val) => setValue("gstRegistered", val)} />
          </div>

          {wGst && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label>GSTIN Registration Number *</Label>
                <Input {...register("gstin")} placeholder="27XXXXX1234X1ZX" className="uppercase" />
                {errors.gstin && <p className="text-xs text-red-500">{errors.gstin.message}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">15 alphanumeric chars validated structurally.</p>
              </div>
              <div className="space-y-2">
                <Label>Legal Business Name *</Label>
                <Input {...register("businessName")} />
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <Label>State of Registration</Label>
                <Select onValueChange={(val) => setValue("stateReg", val)} defaultValue={form.getValues("stateReg")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {indianStates.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default SAC / HSN Code</Label>
                <Input {...register("sacCode")} />
                <p className="text-[10px] text-muted-foreground mt-1">SAC 998386 is standard for Photography services.</p>
              </div>
            </div>
          )}
        </SettingsSection>

        <SettingsSection title="TDS Configuration" description="Enable automated Tax Deducted at Source calculations for vendor and freelancer payouts.">
          <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/60 rounded-xl mb-4">
            <div>
              <Label className="text-base font-semibold">TDS Tracking Enabled</Label>
              <p className="text-sm text-muted-foreground mt-0.5">Toggle to deduct TDS on freelancer invoices systematically.</p>
            </div>
            <Switch checked={wTds} onCheckedChange={(val) => setValue("tdsEnabled", val)} />
          </div>

          {wTds && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label>Default TDS Rate (%)</Label>
                <Input {...register("defaultTdsRate")} placeholder="10%" />
                <p className="text-[10px] text-muted-foreground mt-1">Standard deduction rate for professional services (Sec 194J).</p>
              </div>
            </div>
          )}
        </SettingsSection>

        <SettingsSection title="Bank Details" description="These details will be injected automatically into the invoice footer allowing direct local transfers natively.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Account Name *</Label>
              <Input {...register("accName")} />
            </div>
            <div className="space-y-2">
              <Label>Bank Name *</Label>
              <Input {...register("bankName")} />
            </div>
            <div className="space-y-2">
              <Label>Account Number *</Label>
              <Input type="password" {...register("accNumber")} />
              {errors.accNumber && <p className="text-xs text-red-500">{errors.accNumber.message}</p>}
              <p className="text-[10px] text-muted-foreground mt-1">Masked for security.</p>
            </div>
            <div className="space-y-2">
              <Label>IFSC Code *</Label>
              <Input {...register("ifsc")} className="uppercase" />
              {errors.ifsc && <p className="text-xs text-red-500">{errors.ifsc.message}</p>}
            </div>
            <div className="space-y-2 relative">
              <Label>UPI ID *</Label>
              <Input {...register("upi")} />
            </div>
            <div className="space-y-2 relative">
              <Label>Branch</Label>
              <Input {...register("branch")} />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Invoice Settings" description="Configure sequential numbering offsets and global layout preferences safely.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Invoice Prefix</Label>
              <Input {...register("invPrefix")} />
            </div>
            <div className="space-y-2">
              <Label>Starting Invoice Number</Label>
              <Input type="number" {...register("startNumber")} />
              <p className="text-xs text-muted-foreground font-mono mt-1 font-semibold text-primary">Next: {form.getValues("invPrefix")}{form.getValues("startNumber")}</p>
            </div>
            
             <div className="space-y-2 flex flex-col justify-end">
              <Label>Default Due Date Term</Label>
              <Select onValueChange={(val) => setValue("dueDefault", val)} defaultValue={form.getValues("dueDefault")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  <SelectItem value="Net 7">Net 7 Days</SelectItem>
                  <SelectItem value="Net 15">Net 15 Days</SelectItem>
                  <SelectItem value="Net 30">Net 30 Days</SelectItem>
                  <SelectItem value="Custom">Custom Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {wDue === "Custom" && (
              <div className="space-y-2 animate-in fade-in">
                <Label>Custom Due Days</Label>
                <Input type="number" {...register("customDays")} />
              </div>
            )}

            <div className="space-y-2 col-span-1 md:col-span-2 pt-2">
              <Label>Automated Footer Note</Label>
              <Textarea className="min-h-[80px]" {...register("footerNote")} />
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-muted/20 border border-border/60 rounded-xl mt-2">
              <div className="flex items-center gap-3">
                <Switch checked={watch("showBank")} onCheckedChange={(val) => setValue("showBank", val)} />
                <Label className="font-normal cursor-pointer">Inject Bank Details on PDF</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={watch("showUpi")} onCheckedChange={(val) => setValue("showUpi", val)} />
                <Label className="font-normal cursor-pointer">Encode UPI Payment QR</Label>
              </div>
            </div>
          </div>
        </SettingsSection>

        <SettingsSaveBar isDirty={isDirty} isSubmitting={isSubmitting} onDiscard={() => reset()} />
      </form>

      <SettingsSection title="Expense Categories" description="Track business outflows by bucketing invoices systematically across the team.">
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden max-w-2xl shadow-sm">
          {expenseCats.map((cat, i) => (
            <div key={cat.id} className={`flex items-center justify-between p-3 px-4 hover:bg-muted/10 transition-colors ${i !== 0 ? 'border-t border-border/40' : ''}`}>
               <div className="flex items-center gap-3">
                <div className="p-1.5 bg-muted/40 rounded border border-border/60">
                 <cat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="font-medium text-sm text-foreground">{cat.name}</span>
               </div>
               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          <div className="p-3 bg-muted/10 border-t border-border/40 flex">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5 h-8 w-full justify-start"><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}
