"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Edit3 } from "lucide-react"

export function EditMemberSheet({ member, trigger }: { member: any, trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  // A simplified validation mapping core updates
  const updateSchema = z.object({
    phone: z.string().min(10).optional(),
    designation: z.string().optional(),
    city: z.string().optional(),
    fee: z.coerce.number().min(0).optional(),
    upi: z.string().optional(),
    appAccess: z.boolean()
  })

  const form = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema) as any,
    defaultValues: {
      phone: member.phone?.replace("+91", "").trim() || "",
      designation: member.designation || "",
      city: member.city || "",
      fee: member.fee || 0,
      upi: member.upi || "",
      appAccess: member.appAccess || false
    }
  })

  const onSubmit = (data: any) => {
    console.log("Updating:", data)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground hover:text-foreground">
            <Edit3 className="w-4 h-4 mr-2" /> Edit Info
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md overflow-y-auto custom-scrollbar">
        <SheetHeader>
          <SheetTitle>Edit Member Profile</SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b border-border/40 pb-2">Profile Basics</h3>
            
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...form.register("phone")} placeholder="10 Digits" />
            </div>
            
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input {...form.register("designation")} />
            </div>
            
            <div className="space-y-2">
              <Label>City</Label>
              <Input {...form.register("city")} />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold border-b border-border/40 pb-2">Financials</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Shoot Fee (₹)</Label>
                <Input type="number" {...form.register("fee")} />
              </div>
              <div className="space-y-2">
                <Label>UPI ID</Label>
                <Input {...form.register("upi")} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/60 rounded-xl mt-4">
            <div className="space-y-0.5">
              <Label>App Access</Label>
              <p className="text-xs text-muted-foreground">Allow login to StudioDesk.</p>
            </div>
            <Switch 
              checked={form.watch("appAccess")} 
              onCheckedChange={(val) => form.setValue("appAccess", val)} 
            />
          </div>

          <SheetFooter className="pt-6">
            <Button variant="outline" type="button" onClick={() => setOpen(false)} className="w-full">Cancel</Button>
            <Button type="submit" className="w-full">Save Changes</Button>
          </SheetFooter>

        </form>
      </SheetContent>
    </Sheet>
  )
}
