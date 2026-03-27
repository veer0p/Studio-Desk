"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step2Schema, Step2Data } from "@/lib/validations/onboarding"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

const LANGUAGES = [
  "Hindi", "English", "Gujarati", "Marathi", "Tamil", "Telugu", "Other"
]

interface Step2Props {
  initialData?: Step2Data;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}

export default function Step2OwnerDetails({ initialData, onNext, onBack }: Step2Props) {
  const [sameAsPhone, setSameAsPhone] = useState(false)

  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: initialData || {
      fullName: "",
      phone: "",
      whatsapp: "",
      designation: "",
    },
  })

  // Sync WhatsApp field if connected
  const phoneValue = form.watch("phone")
  useEffect(() => {
    if (sameAsPhone && phoneValue) {
      form.setValue("whatsapp", phoneValue, { shouldValidate: true })
    }
  }, [sameAsPhone, phoneValue, form])

  const onSubmit = (data: Step2Data) => {
    onNext(data)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight mb-1">About you</h2>
      <p className="text-sm text-muted-foreground mb-6">Your personal profile inside StudioDesk</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Rohan Sharma" {...field} autoFocus />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground text-sm font-medium">
                        +91
                      </div>
                      <Input placeholder="9876543210" className="pl-10" maxLength={10} {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel className="mb-0">WhatsApp Number</FormLabel>
                    <div className="flex items-center space-x-2 mr-1">
                      <Checkbox 
                        id="sameAsPhone" 
                        checked={sameAsPhone} 
                        onCheckedChange={(checked) => setSameAsPhone(checked === true)} 
                      />
                      <label htmlFor="sameAsPhone" className="text-[10px] font-medium leading-none cursor-pointer">
                        Same as phone
                      </label>
                    </div>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground text-sm font-medium">
                        +91
                      </div>
                      <Input placeholder="9876543210" className="pl-10" maxLength={10} {...field} disabled={sameAsPhone} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Founder & Lead Photographer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-8 flex justify-between items-center border-t border-border/40 mt-8">
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button type="submit">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
