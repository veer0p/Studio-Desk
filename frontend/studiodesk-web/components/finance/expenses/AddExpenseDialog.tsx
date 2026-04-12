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
import { Paperclip, Loader2 } from "lucide-react"
import { createExpense } from "@/lib/api"
import { mutate } from "swr"

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  vendor: z.string().optional().default(""),
  bookingId: z.string().optional().nullable(),
  notes: z.string().optional().default(""),
})

const CATEGORIES = [
  { label: "Equipment", value: "equipment" },
  { label: "Travel", value: "travel" },
  { label: "Studio Rent", value: "studio_rent" },
  { label: "Freelancer Fee", value: "freelancer" },
  { label: "Software", value: "software" },
  { label: "Marketing", value: "marketing" },
  { label: "Printing", value: "printing" },
  { label: "Food & Misc", value: "food" },
  { label: "Other", value: "other" },
]

export function AddExpenseDialog({ children, onCreated }: { children: React.ReactNode; onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      description: "",
      category: "",
      amount: undefined as unknown as number,
      date: new Date().toISOString().split('T')[0],
      vendor: "",
      bookingId: null as string | null,
      notes: "",
    }
  })

  const onSubmit = async (data: z.infer<typeof expenseSchema>) => {
    setIsSubmitting(true)
    try {
      await createExpense({
        category: data.category,
        description: data.description,
        amount: data.amount,
        incurred_at: data.date,
        vendor: data.vendor || undefined,
        booking_id: data.bookingId || null,
        notes: data.notes || undefined,
      })
      await mutate("/api/v1/expenses")
      form.reset()
      setOpen(false)
      onCreated?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add expense"
      form.setError("root", { message })
    } finally {
      setIsSubmitting(false)
    }
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
          {form.formState.errors.root && (
            <div className="text-sm text-red-600 bg-red-500/5 border border-red-500/20 rounded-md p-2">
              {form.formState.errors.root.message}
            </div>
          )}

          <div className="space-y-2">
            <Label>Description *</Label>
            <Input {...form.register("description")} placeholder="e.g., Camera lens rental" />
            {form.formState.errors.description && (
              <p className="text-xs text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select onValueChange={(v) => form.setValue("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-xs text-red-600">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className="text-xs text-red-600">{form.formState.errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label>Total Amount (₹) *</Label>
            <Input type="number" {...form.register("amount", { valueAsNumber: true })} />
            {form.formState.errors.amount && (
              <p className="text-xs text-red-600">{form.formState.errors.amount.message}</p>
            )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
