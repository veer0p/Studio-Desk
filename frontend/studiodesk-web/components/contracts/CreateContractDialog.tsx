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
import { toast } from "sonner"
import { useSWRConfig } from "swr"
import useSWR from "swr"
import { fetchBookingsList, createContract, BookingSummary } from "@/lib/api"

const contractSchema = z.object({
  booking_id: z.string().uuid("Please select a booking"),
  template_id: z.string().uuid().optional(),
  custom_content: z.string().optional(),
  notes: z.string().max(2000).optional(),
})

export function CreateContractDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { mutate } = useSWRConfig()

  // Fetch bookings for selection
  const { data: bookingsResponse } = useSWR("/api/v1/bookings?limit=50", fetchBookingsList)
  const bookings = bookingsResponse?.list || []

  const form = useForm<z.infer<typeof contractSchema>>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      booking_id: "",
      template_id: undefined,
      custom_content: "",
      notes: ""
    }
  })

  const onSubmit = async (data: z.infer<typeof contractSchema>) => {
    try {
      await createContract(data)
      toast.success("Contract created successfully")
      setOpen(false)
      form.reset()
      mutate((key) => typeof key === 'string' && key.startsWith('/api/v1/contracts'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create contract")
    }
  }

  const selectedBooking = bookings.find((b: BookingSummary) => b.id === form.watch("booking_id"))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Contract</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Booking *</Label>
            <Select onValueChange={(v) => form.setValue("booking_id", v, { shouldValidate: true })}>
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
              <p><span className="font-medium text-foreground">Date:</span> {selectedBooking.date}</p>
              <p><span className="font-medium text-foreground">Amount:</span> ₹{selectedBooking.amount.toLocaleString("en-IN")}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Custom Content</Label>
            <Textarea
              {...form.register("custom_content")}
              placeholder="Custom contract terms, clauses, or full contract body..."
              className="resize-none h-24"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              {...form.register("notes")}
              placeholder="Internal notes about this contract..."
              className="resize-none h-16"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting || !form.watch("booking_id")}>
              {form.formState.isSubmitting ? "Creating..." : "Create Contract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
