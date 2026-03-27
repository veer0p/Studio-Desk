"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
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

const gallerySchema = z.object({
  bookingId: z.string().min(1, "Linked Booking required"),
  name: z.string().min(1, "Gallery name required"),
  slug: z.string().min(3, "Slug minimum 3 chars"),
  accessType: z.enum(["Public", "PIN Protected"]),
  pin: z.string().optional(),
  expiryDate: z.string().optional(),
  selectionQuota: z.coerce.number().min(0).optional(),
  welcomeMessage: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.accessType === "PIN Protected" && (!data.pin || data.pin.length !== 4)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "4-digit PIN required",
      path: ["pin"]
    })
  }
})

export function CreateGalleryDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof gallerySchema>>({
    resolver: zodResolver(gallerySchema) as any,
    defaultValues: {
      bookingId: "",
      name: "",
      slug: "",
      accessType: "PIN Protected",
      pin: "",
      expiryDate: "",
      selectionQuota: 0,
      welcomeMessage: ""
    }
  })

  // Mock booking selection to auto-fill
  const handleBookingSelect = (val: string) => {
    form.setValue("bookingId", val)
    if (val === "b-001") {
      form.setValue("name", "Rohan & Priya — Wedding Highlights")
      form.setValue("slug", "rohan-priya-wedding")
    }
  }

  const onSubmit = (data: any) => {
    console.log("Creating gallery", data)
    setOpen(false)
    // Route to detail page tab photos
    router.push(`/gallery/gal-2938?tab=photos`)
  }

  const accessWatch = form.watch("accessType")
  const slugWatch = form.watch("slug")

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
          
          <div className="space-y-2">
            <Label>Link to Booking *</Label>
            <Select onValueChange={handleBookingSelect}>
              <SelectTrigger><SelectValue placeholder="Search bookings..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="b-001">Wedding: Rohan & Priya</SelectItem>
                <SelectItem value="b-002">Pre-Wedding: Neha Sharma</SelectItem>
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
              <Select onValueChange={(v: "Public"|"PIN Protected") => form.setValue("accessType", v)} defaultValue="PIN Protected">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public Link</SelectItem>
                  <SelectItem value="PIN Protected">PIN Protected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {accessWatch === "PIN Protected" && (
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
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Create Gallery</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
