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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const roles = ["Admin", "Photographer", "Videographer", "Editor", "Drone Operator", "Assistant", "Freelancer"]

const memberSchema = z.object({
  fullName: z.string().min(1, "Name required"),
  phone: z.string().min(10, "10-digit phone required"),
  email: z.string().email().optional().or(z.literal('')),
  appAccess: z.boolean(),
  role: z.string().min(1, "Role required"),
  designation: z.string().optional(),
  city: z.string().optional(),
  fee: z.coerce.number().min(0).optional(),
  upi: z.string().optional(),
  notes: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.appAccess && !data.email) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Email required for App log-in", path: ["email"] })
  }
})

export function InviteMemberDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema) as any,
    defaultValues: {
      fullName: "", phone: "", email: "", appAccess: false,
      role: "Freelancer", designation: "", city: "", fee: 0, upi: "", notes: ""
    }
  })

  // Watch access for email rendering validation constraints
  const watchAccess = form.watch("appAccess")

  const onSubmit = (data: any) => {
    console.log("Inviting member:", data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-y-auto max-h-[85vh] custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border/40 pb-4">
            <div className="space-y-2 flex flex-col justify-center">
              <Label>App Access</Label>
              <p className="text-xs text-muted-foreground mr-4">Send a login link allowing access to StudioDesk.</p>
            </div>
            <div className="flex items-center justify-end">
              <Switch checked={watchAccess} onCheckedChange={(val) => form.setValue("appAccess", val)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input {...form.register("fullName")} placeholder="Client Name" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone *</Label>
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 border-border/60 rounded-l-md bg-muted/30 text-muted-foreground text-sm">+91</span>
                <Input {...form.register("phone")} className="rounded-l-none" placeholder="9876543210" maxLength={10} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input {...form.register("city")} placeholder="e.g. Mumbai" />
            </div>
          </div>

          {watchAccess && (
            <div className="space-y-2 animate-in slide-in-from-top-1 fade-in">
              <Label>Email * <span className="text-muted-foreground font-normal">(Required for access)</span></Label>
              <Input type="email" {...form.register("email")} placeholder="name@domain.com" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>Role *</Label>
              <Select onValueChange={(val) => form.setValue("role", val)} defaultValue="Freelancer">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input {...form.register("designation")} placeholder="e.g. Lead Editor" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label>Default Fee (₹)</Label>
              <Input type="number" {...form.register("fee")} placeholder="Per-shoot config" />
            </div>
            <div className="space-y-2">
              <Label>UPI ID</Label>
              <Input {...form.register("upi")} placeholder="name@bank" />
            </div>
          </div>

          <DialogFooter className="pt-4 mt-2">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">{watchAccess ? "Send Invite" : "Add Member"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
