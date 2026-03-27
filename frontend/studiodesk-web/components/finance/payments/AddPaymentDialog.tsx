"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
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

const paymentSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  invoiceId: z.string().optional(),
  bookingId: z.string().optional(),
  amount: z.number().min(1, "Amount must be greater than 0"),
  method: z.enum(["UPI", "Cash", "Bank Transfer", "Cheque", "Card"]),
  date: z.string().min(1, "Date is required"),
  reference: z.string().optional(),
  note: z.string().optional()
})

export function AddPaymentDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      clientId: "",
      invoiceId: "",
      bookingId: "",
      amount: 0,
      method: "UPI",
      date: new Date().toISOString().split('T')[0],
      reference: "",
      note: ""
    }
  })

  // Mock balance check
  const selectedInvoiceBalance = 140000 

  const handleFillBalance = () => {
    form.setValue("amount", selectedInvoiceBalance)
  }

  const onSubmit = (data: any) => {
    console.log("Recording payment", data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          
          <div className="space-y-2">
            <Label>Client *</Label>
            <Select onValueChange={(v) => form.setValue("clientId", v)}>
              <SelectTrigger><SelectValue placeholder="Search client..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="c-001">Rohan & Priya</SelectItem>
                <SelectItem value="c-002">Neha Sharma</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Invoice (Optional)</Label>
            <Select onValueChange={(v) => form.setValue("invoiceId", v)}>
              <SelectTrigger><SelectValue placeholder="Select unpaid invoice..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INV-2026-001">INV-2026-001 (Balance: ₹1.4L)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">Linking an invoice will automatically reduce its balance due.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (₹) *</Label>
              <Input type="number" {...form.register("amount", { valueAsNumber: true })} />
              {form.watch("invoiceId") && (
                <span onClick={handleFillBalance} className="text-[10px] text-primary hover:underline cursor-pointer font-medium">
                  Full balance (₹1.4L)
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label>Method *</Label>
              <Select onValueChange={(v: any) => form.setValue("method", v)} defaultValue="UPI">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">NEFT/RTGS</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Card">Credit/Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" {...form.register("date")} />
            </div>
            <div className="space-y-2">
              <Label>Reference #</Label>
              <Input {...form.register("reference")} placeholder="TXN ID / Cheque No" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Internal Note</Label>
            <Textarea {...form.register("note")} className="resize-none h-16" placeholder="Optional details..." />
          </div>

          <DialogFooter className="pt-4">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Record Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
