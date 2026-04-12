"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSWRConfig } from "swr"
import { createClient } from "@/lib/api"
import { toast } from "sonner"
import { newClientSchema, NewClientData } from "@/lib/validations/client"
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
import { clientDetailUrl } from "@/lib/constants/routes"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export function NewClientDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { mutate } = useSWRConfig()
  const router = useRouter()

  const form = useForm<NewClientData>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      whatsapp: "",
      email: "",
      city: "",
      source: "",
      referredBy: "",
      tags: [],
      notes: ""
    },
  })

  // Watch values for conditional rendering
  const source = form.watch("source")
  const [sameAsPhone, setSameAsPhone] = useState(false)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    form.setValue("phone", val)
    if (sameAsPhone) {
      form.setValue("whatsapp", val)
    }
  }

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setSameAsPhone(checked)
    if (checked) {
      form.setValue("whatsapp", form.getValues("phone"))
    }
  }

  const onSubmit = async (values: NewClientData) => {
    try {
      const newClient = await createClient(values)
      toast.success("Client created successfully")
      setOpen(false)
      form.reset()
      setSameAsPhone(false)
      // Invalid cache
      mutate((key) => typeof key === "string" && key.startsWith("/api/v1/clients"))
      
      // Optionally route to profile
      if (newClient?.id) {
        router.push(clientDetailUrl(newClient.id), { scroll: false })
      }
    } catch (error) {
      toast.error("Failed to create client")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] sm:rounded-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 overflow-y-auto custom-scrollbar max-h-[calc(90vh-8rem)]">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input {...form.register("fullName")} placeholder="Rohan Sharma" />
            {form.formState.errors.fullName && (
              <p className="text-xs text-red-500">{form.formState.errors.fullName.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input {...form.register("phone")} onChange={handlePhoneChange} placeholder="+91" />
              {form.formState.errors.phone && (
                <p className="text-xs text-red-500">{form.formState.errors.phone.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input {...form.register("whatsapp")} disabled={sameAsPhone} placeholder="+91" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="sameAsPhone" 
              checked={sameAsPhone}
              onCheckedChange={handleSameAsPhoneToggle}
            />
            <label htmlFor="sameAsPhone" className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              WhatsApp same as phone
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...form.register("email")} placeholder="rohan@example.com" />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input {...form.register("city")} placeholder="Mumbai" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Source</Label>
            <Select onValueChange={(val) => form.setValue("source", val)}>
              <SelectTrigger>
                <SelectValue placeholder="How did they find you?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Google">Google</SelectItem>
                <SelectItem value="Word of mouth">Word of mouth</SelectItem>
                <SelectItem value="Wedding portal">Wedding portal</SelectItem>
                <SelectItem value="Direct">Direct</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {source === "Referral" && (
            <div className="space-y-2">
              <Label>Referred By</Label>
              <Input {...form.register("referredBy")} placeholder="Enter referrer name..." />
              {/* In MVP we allow simple text instead of blocking on complex combobox */}
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea {...form.register("notes")} placeholder="Any initial context..." className="h-20" />
          </div>

          <DialogFooter className="pt-4 drop-shadow-sm">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
