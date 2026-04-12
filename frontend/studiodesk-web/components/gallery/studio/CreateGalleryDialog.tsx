"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import useSWR from "swr"
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
import { createGallery, fetchBookingsList } from "@/lib/api"
import { ROUTES, galleryDetailUrl } from "@/lib/constants/routes"

const gallerySchema = z.object({
  bookingId: z.string().min(1, "Linked Booking required"),
  name: z.string().min(1, "Gallery name required"),
  slug: z.string().min(3, "Slug minimum 3 chars"),
  accessType: z.enum(["public", "pin_protected"]),
  pin: z.string().optional(),
  expiryDate: z.string().optional(),
  selectionQuota: z.coerce.number().min(0).optional(),
  welcomeMessage: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.accessType === "pin_protected" && (!data.pin || data.pin.length !== 4)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "4-digit PIN required",
      path: ["pin"]
    })
  }
})

export function CreateGalleryDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const { data: bookingsData } = useSWR("/api/v1/bookings?pageSize=50", fetchBookingsList, {
    dedupingInterval: 60000,
  })
  const bookings = Array.isArray(bookingsData?.list) ? bookingsData.list : []

  const form = useForm<z.infer<typeof gallerySchema>>({
    resolver: zodResolver(gallerySchema) as any,
    defaultValues: {
      bookingId: "",
      name: "",
      slug: "",
      accessType: "pin_protected",
      pin: "",
      expiryDate: "",
      selectionQuota: 0,
      welcomeMessage: ""
    }
  })

  const handleBookingSelect = (val: string) => {
    form.setValue("bookingId", val)
    const booking = bookings.find(b => b.id === val)
    if (booking) {
      const baseSlug = `${booking.clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${booking.eventType.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
      form.setValue("name", `${booking.clientName} — ${booking.eventType}`)
      form.setValue("slug", baseSlug)
    }
  }

  const onSubmit = async (data: z.infer<typeof gallerySchema>) => {
    setIsSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        booking_id: data.bookingId,
        name: data.name,
        slug: data.slug,
        access_type: data.accessType,
        selection_quota: data.selectionQuota || 0,
      }
      if (data.pin) payload.pin = data.pin
      if (data.expiryDate) payload.expiry_date = data.expiryDate
      if (data.welcomeMessage) payload.welcome_message = data.welcomeMessage

      const result = await createGallery(payload)
      const galleryId = result?.data?.id ?? result?.id
      setOpen(false)
      if (galleryId) {
        router.push(galleryDetailUrl(galleryId), { scroll: false })
      } else {
        router.push(ROUTES.GALLERY, { scroll: false })
      }
    } catch (err) {
      console.error("Failed to create gallery:", err)
      form.setError("root", { message: err instanceof Error ? err.message : "Failed to create gallery" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const accessWatch = form.watch("accessType")
  const slugWatch = form.watch("slug")
  const rootError = form.formState.errors.root?.message

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh] custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Create New Gallery</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          {rootError && (
            <div className="p-3 rounded-md border border-red-500/30 bg-red-500/5 text-red-500 text-sm">
              {rootError}
            </div>
          )}

          <div className="space-y-2">
            <Label>Link to Booking *</Label>
            <Select onValueChange={handleBookingSelect} disabled={bookings.length === 0}>
              <SelectTrigger><SelectValue placeholder={bookings.length === 0 ? "No bookings available" : "Search bookings..."} /></SelectTrigger>
              <SelectContent>
                {bookings.map(booking => (
                  <SelectItem key={booking.id} value={booking.id}>
                    {booking.clientName} — {booking.eventName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Gallery Name *</Label>
            <Input {...form.register("name")} placeholder="Client Name — Event Name" />
          </div>

          <div className="space-y-2">
            <Label>URL Slug *</Label>
            <Input {...form.register("slug")} placeholder="client-event-name" />
            {slugWatch && (
              <p className="text-[10px] text-primary break-all">gallery.studiodesk.com/{slugWatch}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4 mt-2">
            <div className="space-y-2 flex flex-col">
              <Label>Access Control *</Label>
              <Select onValueChange={(v: "public"|"pin_protected") => form.setValue("accessType", v)} value={accessWatch}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public Link</SelectItem>
                  <SelectItem value="pin_protected">PIN Protected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {accessWatch === "pin_protected" && (
              <div className="space-y-2 flex flex-col">
                <Label>4-Digit PIN *</Label>
                <Input {...form.register("pin")} maxLength={4} placeholder="e.g. 1928" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>Client Selection Quota</Label>
              <Input type="number" {...form.register("selectionQuota")} placeholder="Optional limit" />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label>Expiry Date</Label>
              <Input type="date" {...form.register("expiryDate")} />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label>Welcome Message</Label>
            <Textarea {...form.register("welcomeMessage")} placeholder="Shown at the top of the client gallery..." className="resize-none h-16" />
          </div>

          <DialogFooter className="pt-4 mt-2">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Gallery"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
