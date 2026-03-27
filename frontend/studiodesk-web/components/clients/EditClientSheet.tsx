"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSWRConfig } from "swr"
import { updateClient } from "@/lib/api"
import { toast } from "sonner"
import { editClientSchema } from "@/lib/validations/client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export function EditClientSheet({ children, client }: { children: React.ReactNode; client: any }) {
  const [open, setOpen] = useState(false)
  const { mutate } = useSWRConfig()

  const form = useForm<any>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      fullName: client?.name || "",
      phone: client?.phone || "",
      whatsapp: client?.whatsapp || "",
      email: client?.email || "",
      city: client?.city || "",
      source: client?.source || "",
      referredBy: client?.referred_by || "",
      tags: client?.tags || [],
      notes: client?.notes || "",
      dateOfBirth: client?.date_of_birth || "",
      anniversary: client?.anniversary || ""
    },
  })

  const [sameAsPhone, setSameAsPhone] = useState(
    client?.phone === client?.whatsapp && !!client?.phone
  )

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

  const onSubmit = async (values: any) => {
    try {
      if (!client?.id) return

      await updateClient(client.id, values)
      toast.success("Client details updated")
      setOpen(false)
      
      // Update SWR lists and specific detail route caches
      mutate((key) => typeof key === "string" && key.startsWith("/api/v1/clients"))
    } catch (error) {
      toast.error("Failed to update client")
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto custom-scrollbar">
        <SheetHeader>
          <SheetTitle>Edit Client</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-6">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input {...form.register("fullName")} />
            {form.formState.errors.fullName && (
              <p className="text-xs text-red-500">{form.formState.errors.fullName.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input {...form.register("phone")} onChange={handlePhoneChange} />
              {form.formState.errors.phone && (
                <p className="text-xs text-red-500">{form.formState.errors.phone.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input {...form.register("whatsapp")} disabled={sameAsPhone} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="editSameAsPhone" 
              checked={sameAsPhone}
              onCheckedChange={handleSameAsPhoneToggle}
            />
            <label htmlFor="editSameAsPhone" className="text-sm text-muted-foreground leading-none">
              WhatsApp same as phone
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...form.register("email")} />
            </div>
            <div className="space-y-2">
              <Label>City / State</Label>
              <Input {...form.register("city")} />
            </div>
          </div>

          {/* Additional detail fields in the edit sheet vs modal */}
          <div className="grid grid-cols-2 gap-4 border-t border-border mt-4 pt-4">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" {...form.register("dateOfBirth")} />
            </div>
            <div className="space-y-2">
              <Label>Anniversary</Label>
              <Input type="date" {...form.register("anniversary")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Source</Label>
            <Select 
              value={form.watch("source")}
              onValueChange={(val) => form.setValue("source", val)}
            >
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

          {form.watch("source") === "Referral" && (
            <div className="space-y-2">
              <Label>Referred By</Label>
              <Input {...form.register("referredBy")} placeholder="Search existing client name..." />
            </div>
          )}

          <SheetFooter className="mt-6">
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
