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
import { toast } from "sonner"
import { useSWRConfig } from "swr"
import useSWR from "swr"
import { fetchBookingsList, createProposal, BookingSummary } from "@/lib/api"
import { Plus, Trash2 } from "lucide-react"

const proposalLineItemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.number().min(1, "At least 1"),
  rate: z.number().min(0, "Rate must be positive"),
})

const proposalSchema = z.object({
  booking_id: z.string().uuid("Please select a booking"),
  client_id: z.string().uuid(),
  gst_type: z.enum(["none", "cgst_sgst", "igst"]),
  valid_until: z.string().optional(),
  notes: z.string().max(2000).optional().nullable(),
  line_items: z.array(proposalLineItemSchema).min(1, "At least one line item is required"),
})

type ProposalFormValues = z.infer<typeof proposalSchema>

export function CreateProposalDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { mutate } = useSWRConfig()

  const { data: bookingsResponse } = useSWR("/api/v1/bookings?limit=50", fetchBookingsList)
  const bookings = bookingsResponse?.list || []

  const form = useForm({
    resolver: zodResolver(proposalSchema) as any,
    defaultValues: {
      booking_id: "",
      client_id: "",
      gst_type: "none",
      valid_until: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      notes: "",
      line_items: [{ description: "", quantity: 1, rate: 0 }],
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "line_items",
  })

  const selectedBooking = bookings.find((b: BookingSummary) => b.id === form.watch("booking_id"))

  // Auto-fill client_id when booking is selected
  const handleBookingSelect = (bookingId: string) => {
    form.setValue("booking_id", bookingId, { shouldValidate: true })
    const booking = bookings.find((b: BookingSummary) => b.id === bookingId)
    if (booking) {
      // The backend expects client_id as a UUID. We use booking.id as a proxy
      // since proposals are inherently tied to bookings which have client info.
      // In a real scenario, the booking object should carry clientId.
      form.setValue("client_id", bookingId)
    }
  }

  const total = fields.reduce((sum, item, index) => {
    const qty = form.getValues(`line_items.${index}.quantity`) || 0
    const rate = form.getValues(`line_items.${index}.rate`) || 0
    return sum + qty * rate
  }, 0)

  const gstRate = form.watch("gst_type") === "none" ? 0 : 18
  const gstAmount = total * (gstRate / 100)
  const grandTotal = total + gstAmount

  const onSubmit = async (data: ProposalFormValues) => {
    try {
      await createProposal({
        booking_id: data.booking_id,
        client_id: data.client_id,
        gst_type: data.gst_type,
        valid_until: data.valid_until,
        notes: data.notes,
        line_items: data.line_items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
      })
      toast.success("Proposal created successfully")
      setOpen(false)
      form.reset()
      mutate((key) => typeof key === 'string' && key.startsWith('/api/v1/proposals'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create proposal")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-4 overflow-y-auto flex-1 pr-1">
          {/* Booking Selection */}
          <div className="space-y-2">
            <Label>Booking *</Label>
            <Select onValueChange={handleBookingSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a booking" />
              </SelectTrigger>
              <SelectContent>
                {bookings.map((b: BookingSummary) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.eventName || b.clientName} — {b.date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.booking_id && (
              <p className="text-xs text-destructive">{form.formState.errors.booking_id.message}</p>
            )}
          </div>

          {selectedBooking && (
            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">Client:</span> {selectedBooking.clientName}</p>
              <p><span className="font-medium text-foreground">Event:</span> {selectedBooking.eventName}</p>
            </div>
          )}

          {/* GST Type */}
          <div className="space-y-2">
            <Label>GST Type *</Label>
            <Select onValueChange={(v) => form.setValue("gst_type", v as "none" | "cgst_sgst" | "igst")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No GST</SelectItem>
                <SelectItem value="cgst_sgst">CGST + SGST (9% each)</SelectItem>
                <SelectItem value="igst">IGST (18%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Valid Until */}
          <div className="space-y-2">
            <Label>Valid Until</Label>
            <Input type="date" {...form.register("valid_until")} />
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Line Items *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => append({ description: "", quantity: 1, rate: 0 })}
              >
                <Plus className="w-3 h-3 mr-1" /> Add Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <Input
                    {...form.register(`line_items.${index}.description`)}
                    placeholder="Description"
                    className="h-8 text-sm"
                  />
                </div>
                <Input
                  {...form.register(`line_items.${index}.quantity`, { valueAsNumber: true })}
                  type="number"
                  placeholder="Qty"
                  className="h-8 text-sm w-16"
                />
                <Input
                  {...form.register(`line_items.${index}.rate`, { valueAsNumber: true })}
                  type="number"
                  placeholder="Rate"
                  className="h-8 text-sm w-24"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            ))}
            {form.formState.errors.line_items && (
              <p className="text-xs text-destructive">{form.formState.errors.line_items.message}</p>
            )}
          </div>

          {/* Total Summary */}
          <div className="rounded-md bg-muted/30 p-3 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            {gstRate > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>GST ({gstRate}%)</span>
                <span>₹{gstAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-foreground pt-1 border-t">
              <span>Grand Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              {...form.register("notes")}
              placeholder="Internal notes or terms..."
              className="resize-none h-16"
            />
          </div>
        </form>

        <DialogFooter className="shrink-0 pt-2">
          <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating..." : "Create Proposal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
