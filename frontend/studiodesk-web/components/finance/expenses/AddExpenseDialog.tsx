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
import { Paperclip } from "lucide-react"

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  gstInput: z.number().optional(),
  date: z.string().min(1, "Date is required"),
  vendor: z.string().optional(),
  bookingId: z.string().optional(),
  notes: z.string().optional()
})

const CATEGORIES = [
  "Equipment", "Travel", "Studio Rent", "Freelancer Fee", 
  "Software", "Marketing", "Printing", "Food & Misc", "Other"
]

export function AddExpenseDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      category: "",
      amount: 0,
      gstInput: 0,
      date: new Date().toISOString().split('T')[0],
      vendor: "",
      bookingId: "",
      notes: ""
    }
  })

  const onSubmit = (data: any) => {
    console.log("Adding expense", data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          
          <div className="space-y-2">
            <Label>Description *</Label>
            <Input {...form.register("description")} placeholder="e.g., Camera lens rental" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select onValueChange={(v) => form.setValue("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" {...form.register("date")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>Total Amount (₹) *</Label>
              <Input type="number" {...form.register("amount", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label>GST Input Credit (₹)</Label>
              <Input type="number" {...form.register("gstInput", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vendor Name</Label>
            <Input {...form.register("vendor")} placeholder="Amazon, Canon India, etc." />
          </div>

          <div className="space-y-2">
            <Label>Linked Booking</Label>
            <Select onValueChange={(v) => form.setValue("bookingId", v)}>
              <SelectTrigger><SelectValue placeholder="Optional: map to job" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="b-001">Wedding Coverage</SelectItem>
                <SelectItem value="b-002">Pre-wedding Shoot</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">Linking expenses maps profitability algorithms to jobs.</p>
          </div>

          <div className="space-y-2">
            <Label>Receipt</Label>
            <div className="flex items-center gap-2 border border-border/60 rounded-md bg-muted/20 px-3 py-2 cursor-pointer hover:bg-muted transition-colors">
              <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">Upload image or PDF...</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea {...form.register("notes")} className="resize-none h-16" placeholder="Additional details..." />
          </div>

          <DialogFooter className="pt-4 border-t border-border/40">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Add Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
