"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const payoutMethodSchema = z.enum(["UPI", "Cash", "Bank Transfer", "Cheque"])

export function CreatePayoutDialog({ children, defaultMember }: { children?: React.ReactNode, defaultMember?: string }) {
  const [open, setOpen] = useState(false)

  // Using strictly inferred integer bounds bypassing basic fractional errors inherently localized logically
  const payoutSchema = z.object({
    memberId: z.string().min(1, "Member is required"),
    shootsCovered: z.array(z.string()).min(1, "Select at least 1 shoot"),
    baseAmount: z.coerce.number().min(1, "Amount must be valid"),
    tdsApplicable: z.boolean(),
    tdsRate: z.coerce.number().min(0).max(100),
    method: payoutMethodSchema,
    upi: z.string().optional(),
    date: z.string(),
    reference: z.string().optional(),
    note: z.string().optional()
  })

  const form = useForm<z.infer<typeof payoutSchema>>({
    resolver: zodResolver(payoutSchema) as any,
    defaultValues: {
      memberId: defaultMember || "", shootsCovered: ["s1", "s2"], // mocked multi-select extraction
      baseAmount: 15000, tdsApplicable: true, tdsRate: 10,
      method: "UPI", upi: "member@okbank", date: new Date().toISOString().split("T")[0],
      reference: "", note: ""
    }
  })

  const { watch, setValue } = form
  const wBase = watch("baseAmount") || 0
  const wTdsApp = watch("tdsApplicable")
  const wTdsRate = watch("tdsRate") || 0
  const wMethod = watch("method")
  
  // Realtime structural math
  const calculatedTds = wTdsApp ? Math.round(wBase * (wTdsRate / 100)) : 0
  const netAmount = wBase - calculatedTds

  const onSubmit = (data: z.infer<typeof payoutSchema>) => {
    console.log("Recording payout:", {
      ...data, parsedTdsAmount: calculatedTds, parsedNetAmount: netAmount
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Record Payout</Button>}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-xl overflow-y-auto max-h-[90vh] custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Record Local Payout</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 pt-4">
          
          <div className="space-y-2">
            <Label>Team Member</Label>
            <Select onValueChange={(val) => setValue("memberId", val)} defaultValue={form.getValues("memberId")}>
              <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="m1">Vikram Singh (₹45,000 Pending)</SelectItem>
                <SelectItem value="m2">Ananya Patel (₹12,500 Pending)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Base Amount (₹)</Label>
              <Input type="number" {...form.register("baseAmount")} />
              <p className="text-[10px] text-muted-foreground mt-1">Sum of selected shoots automatically synced.</p>
            </div>
            <div className="space-y-2">
              <Label>Date of Payout</Label>
              <Input type="date" {...form.register("date")} />
            </div>
          </div>

          {/* Tax Engine */}
          <div className="p-4 rounded-xl border border-border/60 bg-muted/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tax Deducted at Source (TDS)</Label>
                <p className="text-xs text-muted-foreground">Sec 194C / 194J validations.</p>
              </div>
              <Switch checked={wTdsApp} onCheckedChange={(val) => setValue("tdsApplicable", val)} />
            </div>

            {wTdsApp && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in pt-2 border-t border-border/40">
                <div className="space-y-2 flex flex-col justify-end">
                  <Label>TDS Rate (%)</Label>
                  <Select onValueChange={(val) => setValue("tdsRate", Number(val))} defaultValue={String(wTdsRate)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1% (Individual)</SelectItem>
                      <SelectItem value="2">2% (Company)</SelectItem>
                      <SelectItem value="10">10% (Professional/Default)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>TDS Output (₹)</Label>
                  <div className="h-9 px-3 flex items-center bg-background border border-border/60 rounded-md font-mono text-sm text-amber-600 font-bold">
                    - {calculatedTds.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Method</Label>
              <Select onValueChange={(val) => setValue("method", val as any)} defaultValue={wMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer (NEFT/IMPS)</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {wMethod === "UPI" && (
              <div className="space-y-2">
                <Label>UPI Match</Label>
                <Input {...form.register("upi")} />
              </div>
            )}
            {(wMethod === "Bank Transfer" || wMethod === "Cheque") && (
              <div className="space-y-2">
                <Label>Reference Number</Label>
                <Input {...form.register("reference")} placeholder="Txn ID / Cheque No" />
              </div>
            )}
          </div>

          {/* Summary Strip */}
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <span className="font-semibold text-primary">Final Net Amount:</span>
            <span className="text-2xl font-bold tracking-tight text-primary">₹ {netAmount.toLocaleString("en-IN")}</span>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Deploy Payout</Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  )
}
