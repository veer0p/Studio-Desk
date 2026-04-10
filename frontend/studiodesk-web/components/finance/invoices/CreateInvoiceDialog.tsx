"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { createInvoice } from "@/lib/api"
import { toast } from "sonner"
import { useSWRConfig } from "swr"

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  bookingId: z.string().optional(),
  invoiceNumber: z.string().min(1, "Required"),
  issueDate: z.string().min(1, "Required"),
  dueDate: z.string().min(1, "Required"),
  gstType: z.enum(["cgst_sgst", "igst"]),
  items: z.array(z.object({
    description: z.string().min(1, "Required"),
    hsn: z.string(),
    qty: z.number().min(1),
    rate: z.number().min(0),
    gstRate: z.number()
  })).min(1, "At least one item required"),
  paymentTerms: z.string(),
  notes: z.string().optional()
})

const formatINR = (amt: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt)

export function CreateInvoiceDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { mutate } = useSWRConfig()

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: "",
      bookingId: "",
      invoiceNumber: "INV-2026-005",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      gstType: "cgst_sgst",
      items: [
        { description: "Photography Package", hsn: "998386", qty: 1, rate: 0, gstRate: 18 }
      ],
      paymentTerms: "50% advance, balance before delivery.",
      notes: ""
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  })

  const itemsWatch = form.watch("items")
  const gstTypeWatch = form.watch("gstType")

  const subtotal = itemsWatch.reduce((acc, curr) => acc + (curr.qty * curr.rate), 0)

  // Calculate total tax iteratively per line item
  const totalTax = itemsWatch.reduce((acc, curr) => acc + ((curr.qty * curr.rate * curr.gstRate) / 100), 0)
  const total = subtotal + totalTax

  const onSubmit = async (data: z.infer<typeof invoiceSchema>, status: string) => {
    try {
      await createInvoice({
        ...data,
        status
      })
      toast.success("Invoice created successfully")
      setOpen(false)
      form.reset()
      // invalidate SWR invoice queries
      mutate((key) => typeof key === 'string' && key.startsWith('/api/v1/invoices'))
    } catch (error) {
      toast.error("Failed to create invoice")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl overflow-y-auto max-h-[90vh] custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit((d) => onSubmit(d, "draft"))} className="space-y-8 py-4">
          
          {/* Step 1: Basic Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-2">1. Client & Dates</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client *</Label>
                <Select onValueChange={(v) => form.setValue("clientId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c-001">Rohan & Priya</SelectItem>
                    <SelectItem value="c-002">Neha Sharma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Booking (Optional)</Label>
                <Select onValueChange={(v) => form.setValue("bookingId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select booking..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="b-001">Wedding Coverage</SelectItem>
                    <SelectItem value="b-002">Pre-wedding Shoot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Invoice # *</Label>
                <Input {...form.register("invoiceNumber")} />
              </div>
              <div className="space-y-2">
                <Label>GST Type *</Label>
                <Select defaultValue="cgst_sgst" onValueChange={(v: "cgst_sgst"|"igst") => form.setValue("gstType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cgst_sgst">CGST + SGST (Intra-state)</SelectItem>
                    <SelectItem value="igst">IGST (Inter-state)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Issue Date *</Label>
                <Input type="date" {...form.register("issueDate")} />
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input type="date" {...form.register("dueDate")} />
              </div>
            </div>
          </section>

          {/* Step 2: Line Items */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-2">2. Line Items</h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">HSN</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Rate (₹)</div>
                <div className="col-span-2 text-center">GST %</div>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start group">
                  <div className="col-span-5">
                    <Input {...form.register(`items.${index}.description`)} placeholder="Item description" className="h-9" />
                  </div>
                  <div className="col-span-2">
                    <Input {...form.register(`items.${index}.hsn`)} placeholder="HSN" className="h-9" />
                  </div>
                  <div className="col-span-1">
                    <Input type="number" {...form.register(`items.${index}.qty`, { valueAsNumber: true })} className="h-9 text-center p-1" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" {...form.register(`items.${index}.rate`, { valueAsNumber: true })} className="h-9 text-right" />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Select defaultValue="18" onValueChange={(v) => form.setValue(`items.${index}.gstRate`, parseInt(v))}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                        <SelectItem value="28">28%</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => remove(index)}
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => append({ description: "", hsn: "998386", qty: 1, rate: 0, gstRate: 18 })}
                className="mt-2 text-xs border-dashed"
              >
                <Plus className="w-3 h-3 mr-1" /> Add line item
              </Button>
            </div>

            {/* Calculations Box */}
            <div className="w-full flex justify-end pt-4 mt-6 border-t border-border/40">
              <div className="w-1/2 bg-muted/20 p-4 rounded-xl border border-border/60 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatINR(subtotal)}</span>
                </div>
                
                {gstTypeWatch === "cgst_sgst" ? (
                  <>
                    <div className="flex justify-between text-muted-foreground">
                      <span>CGST</span>
                      <span className="font-mono">{formatINR(totalTax / 2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>SGST</span>
                      <span className="font-mono">{formatINR(totalTax / 2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-muted-foreground">
                    <span>IGST</span>
                    <span className="font-mono">{formatINR(totalTax)}</span>
                  </div>
                )}
                
                <div className="w-full h-px bg-border my-2"></div>
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="font-mono tracking-tight text-emerald-600">{formatINR(total)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: Terms & Notes */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-2">3. Payment & Notes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Textarea {...form.register("paymentTerms")} className="resize-none h-24" />
              </div>
              <div className="space-y-2 flex flex-col">
                <Label>Invoice Notes</Label>
                <Textarea {...form.register("notes")} placeholder="Thank you for your business!" className="resize-none h-24" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 bg-muted/40 p-3 rounded-lg border border-border/60">
              <span className="font-semibold block mb-1">Bank Details (Auto-filled)</span>
              HDFC Bank | A/C 50200012345678 | IFSC HDFC0001234 | UPI studiodesk@hdfcbank
            </div>
          </section>

        </form>

        <DialogFooter className="border-t border-border/40 pt-4 mt-4">
          <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" variant="outline">Save as Draft</Button>
          <Button type="button" onClick={form.handleSubmit((d) => onSubmit(d, "sent"))}>Create & Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
