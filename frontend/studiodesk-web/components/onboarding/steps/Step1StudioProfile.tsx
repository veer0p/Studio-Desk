"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step1Schema, Step1Data } from "@/lib/validations/onboarding"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", 
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
]

const STUDIO_TYPES = [
  "Photography Only",
  "Videography Only",
  "Photo + Video",
  "Full Production House"
]

interface Step1Props {
  initialData?: Step1Data;
  onNext: (data: Step1Data) => void;
}

export default function Step1StudioProfile({ initialData, onNext }: Step1Props) {
  const form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: initialData || {
      name: "",
      city: "",
      tagline: "",
      type: undefined,
      state: undefined,
      yearsInBusiness: undefined,
    },
  })

  // Watch tagline to show char count
  const taglineValue = form.watch("tagline") || ""

  const onSubmit = (data: any) => {
    onNext(data as Step1Data)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight mb-1">Set up your studio</h2>
      <p className="text-sm text-muted-foreground mb-6">This is what your clients will see</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Studio Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Sharma Photography" {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Studio Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STUDIO_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input placeholder="Surat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDIAN_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="yearsInBusiness"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/2 md:pr-2.5">
                <FormLabel>Years in Business</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={50} placeholder="3" {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tagline"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-end">
                  <FormLabel>Studio Tagline</FormLabel>
                  <span className="text-[10px] text-muted-foreground">{taglineValue.length}/120</span>
                </div>
                <FormControl>
                  <Textarea 
                    placeholder="Capturing your best moments" 
                    className="resize-none" 
                    maxLength={120}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-8 flex justify-end">
            <Button type="submit">Continue</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
